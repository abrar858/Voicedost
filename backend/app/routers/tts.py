"""Text-to-speech endpoints: /tts (studio) and /try (landing-page box)."""

from __future__ import annotations

import asyncio
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel, Field

from ..core import config
from ..core.voices import VOICES_BY_ID
from ..services import ratelimit, supabase, tts, usage
from ..services.auth import CurrentUser, get_current_user

router = APIRouter(tags=["tts"])
_jobs = asyncio.Semaphore(config.MAX_CONCURRENT_JOBS)


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1)
    voice: str = "george"
    speed: float = Field(1.0, ge=0.5, le=2.0)
    pause_ms: int = Field(350, ge=0, le=3000)
    format: Literal["mp3", "wav"] = "mp3"


async def _generate(req: TTSRequest, max_chars: int, user: CurrentUser | None) -> Response:
    text = req.text.strip()
    if not text:
        raise HTTPException(400, "Script is empty.")
    if len(text) > max_chars:
        raise HTTPException(413, f"Script is too long ({len(text)} characters). The limit is {max_chars}.")
    voice = VOICES_BY_ID.get(req.voice)
    if voice is None:
        raise HTTPException(404, f"Unknown voice '{req.voice}'.")
    try:
        await usage.check_minutes(user, tts.estimate_seconds(text, req.speed) / 60, req.format)
    except usage.NotEnoughMinutes as e:
        raise HTTPException(402, str(e))
    except usage.NotOnPlan as e:
        raise HTTPException(403, str(e))
    except supabase.SupabaseError as e:
        raise HTTPException(503, str(e))

    async with _jobs:
        try:
            audio = await asyncio.to_thread(tts.synthesise, text, voice, req.speed, req.pause_ms)
            data = await asyncio.to_thread(tts.to_mp3 if req.format == "mp3" else tts.to_wav, audio)
        except tts.EngineUnavailable as e:
            raise HTTPException(503, str(e))
        except ValueError as e:
            raise HTTPException(400, str(e))

    minutes = round(audio.seconds / 60, 3)
    left = None
    try:
        left = await usage.record_usage(user, minutes, voice.id, len(text))
    except supabase.SupabaseError:
        pass  # the user already has their audio; don't fail the request
    extra = {"X-Minutes-Left": f"{left:.2f}"} if left is not None else {}
    return Response(
        content=data,
        media_type="audio/mpeg" if req.format == "mp3" else "audio/wav",
        headers={
            "X-Audio-Seconds": f"{audio.seconds:.2f}",
            "X-Minutes-Used": str(minutes),
            "X-Lines": str(len(tts.split_lines(text))),
            "Content-Disposition": f'attachment; filename="voicedost-{voice.id}.{req.format}"',
            **extra,
        },
    )


@router.post("/tts")
async def generate(req: TTSRequest, request: Request, user: CurrentUser | None = Depends(get_current_user)):
    if user is None:
        if config.OPEN_STUDIO:
            ratelimit.check_open_studio_limit(request)
        elif config.ACCOUNTS_ON:
            raise HTTPException(401, "Please log in to use the studio. It's free to sign up.")
    return await _generate(req, config.MAX_CHARS, user)


@router.post("/try")
async def try_it(req: TTSRequest, request: Request):
    ratelimit.check_try_limit(request)
    req.format = "mp3"
    return await _generate(req, config.TRY_MAX_CHARS, None)
