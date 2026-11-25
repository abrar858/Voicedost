"""VoiceDost voice API.

Layout
- core/      settings, voice catalogue, plan limits
- services/  text-to-speech engine; auth, usage and billing (placeholders)
- routers/   HTTP endpoints

See docs/ARCHITECTURE.md for how accounts and payments plug in.
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .core import config
from .routers import account, health, tts, voices

app = FastAPI(title="VoiceDost API", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    expose_headers=["X-Audio-Seconds", "X-Minutes-Used", "X-Minutes-Left", "X-Lines"],
)

app.include_router(health.router)
app.include_router(voices.router)
app.include_router(tts.router)
app.include_router(account.router)

_WEB = Path(__file__).resolve().parents[2] / "web" / "index.html"


@app.get("/", include_in_schema=False)
def studio():
    """Serves the simple test studio during development."""
    if _WEB.exists():
        return FileResponse(_WEB)
    return {"message": "VoiceDost API is running. See /docs."}
