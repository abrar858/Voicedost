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
    limit = config.TRY_PER_HOUR
    if limit <= 0:
        return
    now = time.monotonic()
    q = _hits[client_ip(request)]
    while q and q[0] < now - WINDOW:
        q.popleft()
    if len(q) >= limit:
        raise HTTPException(429, "You've used the free try box a lot this hour. "
                                 "Create a free account for 10 minutes a month.")
    q.append(now)
    if len(_hits) > 20000:  # keep memory bounded
        for ip in [ip for ip, d in _hits.items() if not d or d[-1] < now - WINDOW]:
            del _hits[ip]
