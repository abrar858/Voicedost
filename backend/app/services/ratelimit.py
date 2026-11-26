"""Simple in-memory limit for the free "try it" box (per visitor IP, per hour)."""

from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

from ..core import config

_hits: dict[str, deque[float]] = defaultdict(deque)
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


# Open studio: minutes of audio per visitor per day. ip -> (utc day, seconds used)
_daily: dict[str, tuple[str, float]] = {}


def _today() -> str:
    return time.strftime("%Y-%m-%d", time.gmtime())


def open_studio_seconds_left(ip: str) -> float:
    day, used = _daily.get(ip, ("", 0.0))
    if day != _today():
        used = 0.0
    return max(config.OPEN_STUDIO_MINUTES_PER_DAY * 60 - used, 0.0)


def check_open_studio_limit(ip: str, estimated_seconds: float) -> None:
    left = open_studio_seconds_left(ip)
    if left <= 0:
        raise HTTPException(429, f"You've used today's {config.OPEN_STUDIO_MINUTES_PER_DAY} free minutes. "
                                 "Come back tomorrow for more.")
    if estimated_seconds > left + 5:
        raise HTTPException(429, f"You have about {left / 60:.1f} free minutes left today and this script "
                                 f"needs about {estimated_seconds / 60:.1f}. Please shorten it.")


def record_open_studio(ip: str, seconds: float) -> float:
    """Adds seconds to today's total; returns minutes left today."""
    today = _today()
    day, used = _daily.get(ip, (today, 0.0))
    if day != today:
        used = 0.0
    _daily[ip] = (today, used + seconds)
    if len(_daily) > 50000:  # drop earlier days to keep memory bounded
        for k in [k for k, (d, _) in _daily.items() if d != today]:
            del _daily[k]
    return open_studio_seconds_left(ip) / 60


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
