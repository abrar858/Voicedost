"""VoiceDost voice API.

Endpoints
- GET  /health          server and model status
- GET  /voices          list of voices
- POST /tts             generate speech for a script (returns MP3 or WAV)
- POST /try             landing-page "try it" box (short text only)

Accounts, plans and minute balances are added in the next milestone
(Supabase); /tts already reports the minutes each request used so the
website can charge them.
"""

from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field

from . import config, tts
from .voices import VOICES, VOICES_BY_ID

app = FastAPI(title="VoiceDost API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    expose_headers=["X-Audio-Seconds", "X-Minutes-Used", "X-Lines"],
)

_jobs = asyncio.Semaphore(config.MAX_CONCURRENT_JOBS)


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1)
    voice: str = "george"
    speed: float = Field(1.0, ge=0.5, le=2.0)
    pause_ms: int = Field(350, ge=0, le=3000)
    format: Literal["mp3", "wav"] = "mp3"


@app.get("/health")
def health():
    ready = config.KOKORO_MODEL.exists() and config.KOKORO_VOICES.exists()
    return {"status": "ok", "models_ready": ready, "voices": len(VOICES)}


@app.get("/voices")
def voices():
    return [v.public() for v in VOICES]


async def _generate(req: TTSRequest, max_chars: int) -> Response:
    text = req.text.strip()
    if not text:
        raise HTTPException(400, "Script is empty.")
    if len(text) > max_chars:
        raise HTTPException(413, f"Script is too long ({len(text)} characters). The limit is {max_chars}.")
    voice = VOICES_BY_ID.get(req.voice)
    if voice is None:
        raise HTTPException(404, f"Unknown voice '{req.voice}'.")

    async with _jobs:
        try:
            audio = await asyncio.to_thread(tts.synthesise, text, voice, req.speed, req.pause_ms)
            data = await asyncio.to_thread(tts.to_mp3 if req.format == "mp3" else tts.to_wav, audio)
        except tts.EngineUnavailable as e:
            raise HTTPException(503, str(e))
        except ValueError as e:
            raise HTTPException(400, str(e))

    minutes = round(audio.seconds / 60, 3)
    return Response(
        content=data,
        media_type="audio/mpeg" if req.format == "mp3" else "audio/wav",
        headers={
            "X-Audio-Seconds": f"{audio.seconds:.2f}",
            "X-Minutes-Used": str(minutes),
            "X-Lines": str(len(tts.split_lines(text))),
            "Content-Disposition": f'attachment; filename="voicedost-{voice.id}.{req.format}"',
        },
    )


@app.post("/tts")
async def generate(req: TTSRequest):
    return await _generate(req, config.MAX_CHARS)


@app.post("/try")
async def try_it(req: TTSRequest):
    req.format = "mp3"
    return await _generate(req, config.TRY_MAX_CHARS)


_WEB = Path(__file__).resolve().parents[2] / "web" / "index.html"


@app.get("/")
def studio():
    """Serves the simple test studio during development."""
    if _WEB.exists():
        return FileResponse(_WEB)
    return {"message": "VoiceDost API is running. See /docs."}
