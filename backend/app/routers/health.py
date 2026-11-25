from fastapi import APIRouter

from ..core import config
from ..core.voices import VOICES

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    ready = config.KOKORO_MODEL.exists() and config.KOKORO_VOICES.exists()
    return {"status": "ok", "models_ready": ready, "voices": len(VOICES), "accounts": config.ACCOUNTS_ON}
