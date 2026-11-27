"""In-memory voiceover jobs for the studio.

Long scripts take minutes to make, so the website starts a job, polls its
progress and then downloads the audio and subtitles. Finished jobs are kept
for JOB_TTL_SECONDS, then dropped. Jobs live in this one server process
(uvicorn runs with --workers 1), so a restart clears them.
"""

from __future__ import annotations

import asyncio
import secrets
import time
from dataclasses import dataclass, field


JOB_TTL_SECONDS = 60 * 60


@dataclass
class Job:
    id: str
    total: int
    fmt: str
    voice: str
    status: str = "queued"  # queued | running | done | error
    done: int = 0
    error: str = ""
    seconds: float = 0.0
    minutes_left: float | None = None
    data: bytes = b""
    srt: str = ""
    voice_name: str = ""
    excerpt: str = ""
    music: str | None = None
    share_id: str = ""
    created: float = field(default_factory=time.monotonic)

    def fail(self, message: str) -> None:
        self.status = "error"
        self.error = message
        self.data = b""

    def public(self) -> dict:
        return {
            "id": self.id, "status": self.status, "done": self.done, "total": self.total,
            "error": self.error or None, "seconds": round(self.seconds, 2),
            "minutes": round(self.seconds / 60, 3),
            "minutes_left": None if self.minutes_left is None else round(self.minutes_left, 2),
            "format": self.fmt,
        }


_jobs: dict[str, Job] = {}
_tasks: set[asyncio.Task] = set()


def _cleanup() -> None:
    cutoff = time.monotonic() - JOB_TTL_SECONDS
    for jid in [j.id for j in _jobs.values() if j.created < cutoff and j.status in ("done", "error")]:
        del _jobs[jid]


def create(total: int, fmt: str, voice: str) -> Job:
    _cleanup()
    job = Job(id=secrets.token_urlsafe(16), total=total, fmt=fmt, voice=voice)
    _jobs[job.id] = job
    return job


def get(job_id: str) -> Job | None:
    return _jobs.get(job_id)


def active_count() -> int:
    return sum(1 for j in _jobs.values() if j.status in ("queued", "running"))


def spawn(coro) -> None:
    task = asyncio.get_running_loop().create_task(coro)
    _tasks.add(task)
    task.add_done_callback(_tasks.discard)

