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

# Accounts (Supabase). Leave SUPABASE_URL empty to keep accounts switched off:
# then the studio is open to everyone and nothing is counted.
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
# Publishable key (sb_publishable_...). Public, not a secret: the server acts
# with each user's own login token, so no secret key is needed.
SUPABASE_KEY = os.environ.get("SUPABASE_PUBLISHABLE_KEY", "")
ACCOUNTS_ON = bool(SUPABASE_URL and SUPABASE_KEY)

# Free "try it" box: generations allowed per visitor (IP) per hour.
TRY_PER_HOUR = _int("VOICEDOST_TRY_PER_HOUR", 10)

# Soft launch: let visitors use the full studio without an account.
# Signed-in users are still counted. Set VOICEDOST_OPEN_STUDIO=0 to require login.
OPEN_STUDIO = os.environ.get("VOICEDOST_OPEN_STUDIO", "1") == "1"
# Minutes of audio each visitor (IP) may make per day (UTC) while the studio is open.
OPEN_STUDIO_MINUTES_PER_DAY = _int("VOICEDOST_OPEN_STUDIO_MINUTES_PER_DAY", 30)
