"""Text-to-speech endpoints.

- POST /jobs            start a studio voiceover (long scripts), returns a job id
- GET  /jobs/{id}       progress: queued / running (line x of y) / done / error
- GET  /jobs/{id}/audio the finished MP3 or WAV
- GET  /jobs/{id}/srt   subtitles for the finished voiceover
- POST /jobs/{id}/share make a public link for a finished voiceover
- GET  /shares/{id}     shared voiceover details; /shares/{id}/audio plays it
- GET  /stats           site-wide counter; GET /music lists background tracks
- POST /tts             short studio voiceover in one request (kept for simple use)
- POST /try             landing-page try box (200 characters, no account)
"""

from __future__ import annotations

import asyncio
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse, PlainTextResponse, Response
from pydantic import BaseModel, Field

from ..core import config
from ..core.music import TRACKS, TRACKS_BY_ID
from ..core.voices import VOICES_BY_ID, Voice
from ..services import jobs, ratelimit, store, supabase, tts, usage
from ..services.auth import CurrentUser, get_current_user

router = APIRouter(tags=["tts"])
_slots = asyncio.Semaphore(config.MAX_CONCURRENT_JOBS)


class Pronunciation(BaseModel):
    word: str = Field(..., min_length=1, max_length=60)
    say: str = Field(..., min_length=1, max_length=60)


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1)
    voice: str = "george"
    speed: float = Field(1.0, ge=0.5, le=2.0)
    pause_ms: int = Field(350, ge=0, le=3000)
    format: Literal["mp3", "wav"] = "mp3"
    music: str | None = None  # background track id, or None for voice only
    music_volume: float = Field(0.5, ge=0, le=1)
    pronunciations: list[Pronunciation] = Field(default_factory=list, max_length=50)

    def lexicon(self) -> list[tuple[str, str]]:
        return [(p.word, p.say) for p in self.pronunciations]


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
    if req.music and req.music not in TRACKS_BY_ID:
        raise HTTPException(404, f"Unknown music track '{req.music}'.")
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
    try:
        store.count_voiceover(audio.seconds)
    except OSError:
        pass
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


def _render(text: str, voice: Voice, req: TTSRequest, on_progress=None) -> tts.Audio:
    audio = tts.synthesise(text, voice, req.speed, req.pause_ms, on_progress, req.lexicon())
    if req.music:
        audio = tts.add_music(audio, req.music, req.music_volume)
    return audio


# ---------------------------------------------------------------- jobs (studio)

@router.post("/jobs")
async def start_job(req: TTSRequest, request: Request, user: CurrentUser | None = Depends(get_current_user)):
    visitor_ip = _caller(request, user)
    text, voice = await _check(req, config.MAX_CHARS, user, visitor_ip)
    if jobs.active_count() >= config.MAX_QUEUED_JOBS:
        raise HTTPException(503, "The studio is very busy right now. Please try again in a few minutes.")
    segments = tts.parse_script(text, voice, VOICES_BY_ID, req.lexicon())
    job = jobs.create(total=tts.count_speech(segments), fmt=req.format, voice=voice.id)
    job.voice_name, job.excerpt, job.music = voice.name, text[:160], req.music

    async def run():
        try:
            async with _slots:
                job.status = "running"
                audio = await asyncio.to_thread(
                    _render, text, voice, req, lambda done, total: setattr(job, "done", done))
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


@router.post("/jobs/{job_id}/share")
async def share_job(job_id: str):
    job = _job(job_id, need_done=True)
    if job.share_id:
        return {"id": job.share_id}
    mp3 = job.data
    if job.fmt != "mp3":
        import io

        import soundfile as sf
        samples, _ = sf.read(io.BytesIO(job.data), dtype="float32")
        mp3 = await asyncio.to_thread(tts.to_mp3, tts.Audio(samples))
    job.share_id = await asyncio.to_thread(store.save_share, mp3, {
        "voice": job.voice, "voice_name": job.voice_name, "seconds": round(job.seconds, 2),
        "excerpt": job.excerpt, "music": job.music,
    })
    return {"id": job.share_id}


@router.get("/shares/{share_id}")
async def get_share(share_id: str):
    meta = store.get_share(share_id)
    if meta is None:
        raise HTTPException(404, "This voiceover link has expired or does not exist.")
    return meta


@router.get("/shares/{share_id}/audio")
async def share_audio(share_id: str):
    path = store.share_audio_path(share_id)
    if path is None:
        raise HTTPException(404, "This voiceover link has expired or does not exist.")
    return FileResponse(path, media_type="audio/mpeg", headers={"Cache-Control": "public, max-age=86400"})


@router.get("/stats")
async def site_stats():
    return store.stats()


@router.get("/music")
async def music_tracks():
    return [{"id": t.id, "name": t.name, "mood": t.mood} for t in TRACKS]


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
            audio = await asyncio.to_thread(_render, text, voice, req)
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
            "X-Lines": str(tts.count_speech(tts.parse_script(text, voice, VOICES_BY_ID))),
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
    req.music = None
    req.pronunciations = []
    return await _generate(req, config.TRY_MAX_CHARS, None)
