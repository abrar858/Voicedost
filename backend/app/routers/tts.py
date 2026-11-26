"""Text-to-speech endpoints.

- POST /jobs            start a studio voiceover (long scripts), returns a job id
- GET  /jobs/{id}       progress: queued / running (line x of y) / done / error
- GET  /jobs/{id}/audio the finished MP3 or WAV
- GET  /jobs/{id}/srt   subtitles for the finished voiceover
- POST /tts             short studio voiceover in one request (kept for simple use)
- POST /try             landing-page try box (200 characters, no account)
"""

from __future__ import annotations

import asyncio
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import PlainTextResponse, Response
from pydantic import BaseModel, Field

from ..core import config
from ..core.voices import VOICES_BY_ID, Voice
from ..services import jobs, ratelimit, supabase, tts, usage
from ..services.auth import CurrentUser, get_current_user

router = APIRouter(tags=["tts"])
_slots = asyncio.Semaphore(config.MAX_CONCURRENT_JOBS)


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1)
    voice: str = "george"
    speed: float = Field(1.0, ge=0.5, le=2.0)
    pause_ms: int = Field(350, ge=0, le=3000)
    format: Literal["mp3", "wav"] = "mp3"


async def _check(req: TTSRequest, max_chars: int, user: CurrentUser | None,
                 visitor_ip: str | None) -> tuple[str, Voice]:
    """Validates the request and the caller's allowance. Returns (text, voice)."""
    text = req.text.strip()
    if not text:
        raise HTTPException(400, "Script is empty.")
    if len(text) > max_chars:
        raise HTTPException(413, f"Script is too long ({len(text):,} characters). The limit is {max_chars:,}.")
    voice = VOICES_BY_ID.get(req.voice)
    if voice is None:
        raise HTTPException(404, f"Unknown voice '{req.voice}'.")
    estimate = tts.estimate_seconds(text, req.speed)
    try:
        await usage.check_minutes(user, estimate / 60, req.format)
    except usage.NotEnoughMinutes as e:
        raise HTTPException(402, str(e))
    except usage.NotOnPlan as e:
        raise HTTPException(403, str(e))
    except supabase.SupabaseError as e:
        raise HTTPException(503, str(e))
    if visitor_ip is not None:
        ratelimit.check_open_studio_limit(visitor_ip, estimate)
    return text, voice


async def _settle(user: CurrentUser | None, visitor_ip: str | None, audio: tts.Audio,
                  voice: Voice, chars: int) -> float | None:
    """Counts the minutes used. Returns minutes left, if known."""
    if visitor_ip is not None:
        return ratelimit.record_open_studio(visitor_ip, audio.seconds)
    try:
        return await usage.record_usage(user, round(audio.seconds / 60, 3), voice.id, chars)
    except supabase.SupabaseError:
        return None  # the user already has their audio; don't fail


def _caller(request: Request, user: CurrentUser | None) -> str | None:
    """Visitor IP when an anonymous visitor uses the open studio, else None."""
    if user is not None:
        return None
    if config.OPEN_STUDIO:
        return ratelimit.client_ip(request)
    if config.ACCOUNTS_ON:
        raise HTTPException(401, "Please log in to use the studio. It's free to sign up.")
    return None


def _encode(audio: tts.Audio, fmt: str) -> bytes:
    return tts.to_mp3(audio) if fmt == "mp3" else tts.to_wav(audio)


# ---------------------------------------------------------------- jobs (studio)

@router.post("/jobs")
async def start_job(req: TTSRequest, request: Request, user: CurrentUser | None = Depends(get_current_user)):
    visitor_ip = _caller(request, user)
    text, voice = await _check(req, config.MAX_CHARS, user, visitor_ip)
    if jobs.active_count() >= config.MAX_QUEUED_JOBS:
        raise HTTPException(503, "The studio is very busy right now. Please try again in a few minutes.")
    job = jobs.create(total=len(tts.split_lines(text)), fmt=req.format, voice=voice.id)

    async def run():
        try:
            async with _slots:
                job.status = "running"
                audio = await asyncio.to_thread(
                    tts.synthesise, text, voice, req.speed, req.pause_ms,
                    lambda done, total: setattr(job, "done", done))
                job.data = await asyncio.to_thread(_encode, audio, req.format)
                job.srt = tts.to_srt(audio)
            job.seconds = audio.seconds
            job.minutes_left = await _settle(user, visitor_ip, audio, voice, len(text))
            job.status = "done"
        except tts.EngineUnavailable as e:
            job.fail(str(e))
        except Exception as e:  # noqa: BLE001 - report any failure to the user
            job.fail(str(e) if isinstance(e, ValueError) else "Something went wrong while making the voice.")

    jobs.spawn(run())
    return job.public()


@router.get("/jobs/{job_id}")
async def job_status(job_id: str):
    return _job(job_id).public()


@router.get("/jobs/{job_id}/audio")
async def job_audio(job_id: str):
    job = _job(job_id, need_done=True)
    return Response(content=job.data, media_type="audio/mpeg" if job.fmt == "mp3" else "audio/wav",
                    headers={"Content-Disposition": f'attachment; filename="voicedost-{job.voice}.{job.fmt}"'})


@router.get("/jobs/{job_id}/srt")
async def job_srt(job_id: str):
    job = _job(job_id, need_done=True)
    return PlainTextResponse(job.srt or "", media_type="application/x-subrip",
                             headers={"Content-Disposition": f'attachment; filename="voicedost-{job.voice}.srt"'})


def _job(job_id: str, need_done: bool = False) -> jobs.Job:
    job = jobs.get(job_id)
    if job is None:
        raise HTTPException(404, "This voiceover has expired. Please generate it again.")
    if need_done and job.status != "done":
        raise HTTPException(409, "This voiceover is not ready yet.")
    return job


# ------------------------------------------------------- single request (short)

async def _generate(req: TTSRequest, max_chars: int, user: CurrentUser | None,
                    visitor_ip: str | None = None) -> Response:
    text, voice = await _check(req, max_chars, user, visitor_ip)
    async with _slots:
        try:
            audio = await asyncio.to_thread(tts.synthesise, text, voice, req.speed, req.pause_ms)
            data = await asyncio.to_thread(_encode, audio, req.format)
        except tts.EngineUnavailable as e:
            raise HTTPException(503, str(e))
        except ValueError as e:
            raise HTTPException(400, str(e))
    left = await _settle(user, visitor_ip, audio, voice, len(text))
    extra = {"X-Minutes-Left": f"{left:.2f}"} if left is not None else {}
    return Response(
        content=data,
        media_type="audio/mpeg" if req.format == "mp3" else "audio/wav",
        headers={
            "X-Audio-Seconds": f"{audio.seconds:.2f}",
            "X-Minutes-Used": str(round(audio.seconds / 60, 3)),
            "X-Lines": str(len(tts.split_lines(text))),
            "Content-Disposition": f'attachment; filename="voicedost-{voice.id}.{req.format}"',
            **extra,
        },
    )


@router.post("/tts")
async def generate(req: TTSRequest, request: Request, user: CurrentUser | None = Depends(get_current_user)):
    visitor_ip = _caller(request, user)
    return await _generate(req, config.SHORT_MAX_CHARS, user, visitor_ip)


@router.post("/try")
async def try_it(req: TTSRequest, request: Request):
    ratelimit.check_try_limit(request)
    req.format = "mp3"
    return await _generate(req, config.TRY_MAX_CHARS, None)
