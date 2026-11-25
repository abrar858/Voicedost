"""Settings read from environment variables, with safe defaults for local use."""

import os
from pathlib import Path


def _int(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name, default))
    except ValueError:
        return default


MODELS_DIR = Path(os.environ.get("VOICEDOST_MODELS_DIR", Path(__file__).resolve().parents[2] / "models"))
KOKORO_MODEL = MODELS_DIR / "kokoro-v1.0.onnx"
KOKORO_VOICES = MODELS_DIR / "voices-v1.0.bin"

# Longest script accepted in one request (characters).
MAX_CHARS = _int("VOICEDOST_MAX_CHARS", 5000)
# Anonymous "try it" box limit on the landing page.
TRY_MAX_CHARS = _int("VOICEDOST_TRY_MAX_CHARS", 200)
# How many generations may run at once on this server.
MAX_CONCURRENT_JOBS = _int("VOICEDOST_MAX_CONCURRENT_JOBS", 2)

# Comma-separated list of website origins allowed to call the API.
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get(
    "VOICEDOST_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",") if o.strip()]
