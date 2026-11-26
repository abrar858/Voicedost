"""Simple in-memory limit for the free "try it" box (per visitor IP, per hour)."""

from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

from ..core import config

_hits: dict[str, deque[float]] = defaultdict(deque)
_studio_hits: dict[str, deque[float]] = defaultdict(deque)
WINDOW = 3600.0


def client_ip(request: Request) -> str:
    # Caddy puts the real visitor address last in X-Forwarded-For.
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"


def check_try_limit(request: Request) -> None:
    _check(request, _hits, config.TRY_PER_HOUR,
           "You've used the free try box a lot this hour. Please try again a bit later.")


def check_open_studio_limit(request: Request) -> None:
    _check(request, _studio_hits, config.OPEN_STUDIO_PER_HOUR,
           "You've made a lot of voiceovers this hour. Please try again in a little while.")


def _check(request: Request, hits: dict[str, deque[float]], limit: int, message: str) -> None:
    if limit <= 0:
        return
    now = time.monotonic()
    q = hits[client_ip(request)]
    while q and q[0] < now - WINDOW:
        q.popleft()
    if len(q) >= limit:
        raise HTTPException(429, message)
    q.append(now)
    if len(hits) > 20000:  # keep memory bounded
        for ip in [ip for ip, d in hits.items() if not d or d[-1] < now - WINDOW]:
            del hits[ip]
