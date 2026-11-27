"""Small on-disk store: shared voiceovers and the site-wide counter.

Files live in DATA_DIR (default /var/lib/voicedost on the server):
  shares/<id>.mp3 + shares/<id>.json   voiceovers people chose to share
  stats.json                            total voiceovers and minutes made
"""

from __future__ import annotations

import json
import os
import re
import secrets
import threading
import time
from pathlib import Path

from ..core import config

_lock = threading.Lock()
_ID = re.compile(r"^[A-Za-z0-9_-]{6,32}$")


def _dir(*parts: str) -> Path:
    p = config.DATA_DIR.joinpath(*parts)
    p.mkdir(parents=True, exist_ok=True)
    return p


def _write_json(path: Path, data: dict) -> None:
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False))
    os.replace(tmp, path)


# ------------------------------------------------------------------- stats

def count_voiceover(seconds: float) -> None:
    with _lock:
        path = _dir() / "stats.json"
        try:
            s = json.loads(path.read_text())
        except (FileNotFoundError, ValueError):
            s = {"voiceovers": 0, "seconds": 0.0}
        s["voiceovers"] += 1
        s["seconds"] += float(seconds)
        _write_json(path, s)


def stats() -> dict:
    try:
        s = json.loads((_dir() / "stats.json").read_text())
    except (FileNotFoundError, ValueError):
        s = {"voiceovers": 0, "seconds": 0.0}
    return {"voiceovers": int(s["voiceovers"]), "minutes": int(s["seconds"] // 60)}


# ------------------------------------------------------------------ shares

def save_share(mp3: bytes, meta: dict) -> str:
    share_id = secrets.token_urlsafe(8)
    folder = _dir("shares")
    (folder / f"{share_id}.mp3").write_bytes(mp3)
    _write_json(folder / f"{share_id}.json", {**meta, "id": share_id, "created": int(time.time())})
    _cleanup_shares()
    return share_id


def get_share(share_id: str) -> dict | None:
    if not _ID.match(share_id):
        return None
    try:
        meta = json.loads((_dir("shares") / f"{share_id}.json").read_text())
    except (FileNotFoundError, ValueError):
        return None
    if time.time() - meta.get("created", 0) > config.SHARE_DAYS * 86400:
        return None
    return meta


def share_audio_path(share_id: str) -> Path | None:
    if get_share(share_id) is None:
        return None
    path = _dir("shares") / f"{share_id}.mp3"
    return path if path.exists() else None


_last_cleanup = 0.0


def _cleanup_shares() -> None:
    global _last_cleanup
    if time.time() - _last_cleanup < 3600:
        return
    _last_cleanup = time.time()
    cutoff = time.time() - config.SHARE_DAYS * 86400
    for f in _dir("shares").glob("*.json"):
        try:
            if json.loads(f.read_text()).get("created", 0) < cutoff:
                f.unlink(missing_ok=True)
                f.with_suffix(".mp3").unlink(missing_ok=True)
        except (OSError, ValueError):
            pass
