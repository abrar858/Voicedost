import pytest
from fastapi.testclient import TestClient

from app.core import config
from app.services import tts
from app.main import app

client = TestClient(app)
models_ready = config.KOKORO_MODEL.exists() and config.KOKORO_VOICES.exists()


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_voices_hide_engine_ids():
    r = client.get("/voices")
    assert r.status_code == 200
    ids = {v["id"] for v in r.json()}
    assert {"george", "emma", "michael", "hindi-female", "hindi-male"} <= ids
    assert all("kokoro_voice" not in v for v in r.json())


def test_split_lines():
    assert tts.split_lines("Hello there. How are you?\n\nFine!") == ["Hello there.", "How are you?", "Fine!"]
    assert tts.split_lines("नमस्ते। आप कैसे हैं?") == ["नमस्ते।", "आप कैसे हैं?"]
    assert tts.split_lines("   \n  ") == []


def test_rejects_unknown_voice():
    r = client.post("/tts", json={"text": "Hi", "voice": "nobody"})
    assert r.status_code == 404


def test_rejects_too_long_try():
    r = client.post("/try", json={"text": "a" * (config.TRY_MAX_CHARS + 1)})
    assert r.status_code == 413


def test_rejects_bad_speed():
    r = client.post("/tts", json={"text": "Hi", "speed": 5})
    assert r.status_code == 422


@pytest.mark.skipif(not models_ready, reason="voice models not downloaded")
@pytest.mark.parametrize("voice,fmt", [("george", "mp3"), ("hindi-female", "wav")])
def test_generates_audio(voice, fmt):
    text = "Hello and welcome." if voice == "george" else "नमस्ते दोस्तों।"
    r = client.post("/tts", json={"text": text, "voice": voice, "format": fmt})
    assert r.status_code == 200, r.text
    assert float(r.headers["X-Audio-Seconds"]) > 0.3
    assert len(r.content) > 1000
    if fmt == "wav":
        assert r.content[:4] == b"RIFF"


def test_plans_match_site():
    from app.core.plans import PLANS
    assert PLANS["free"].minutes_per_month == 10
    assert PLANS["starter"].minutes_per_month == 60
    assert PLANS["creator"].minutes_per_month == 180


def test_usage_is_unlimited_while_accounts_off():
    import asyncio
    from app.services import usage
    asyncio.run(usage.check_minutes(None, 999))  # must not raise
    assert asyncio.run(usage.record_usage(None, 1, "george", 10)) is None


def test_try_rate_limit(monkeypatch):
    from app.core import config
    from app.services import ratelimit
    monkeypatch.setattr(config, "TRY_PER_HOUR", 2)
    ratelimit._hits.clear()
    for _ in range(2):
        client.post("/try", json={"text": "Hi", "voice": "nobody"}, headers={"x-forwarded-for": "9.9.9.9"})
    r = client.post("/try", json={"text": "Hi", "voice": "george"}, headers={"x-forwarded-for": "9.9.9.9"})
    assert r.status_code == 429
    ratelimit._hits.clear()


def test_accounts_on_requires_login(monkeypatch):
    from app.core import config
    monkeypatch.setattr(config, "ACCOUNTS_ON", True)
    r = client.post("/tts", json={"text": "Hello", "voice": "george"})
    assert r.status_code == 401
    assert client.get("/me").status_code == 401


def test_accounts_counts_minutes(monkeypatch):
    from app.core import config
    from app.services import supabase
    monkeypatch.setattr(config, "ACCOUNTS_ON", True)
    calls = []

    async def fake_user(token):
        return {"id": "u1", "email": "a@b.c"} if token == "good" else None

    async def fake_rpc(token, name, **params):
        calls.append(name)
        if name == "account_summary":
            return [{"plan": "free", "plan_minutes": 10, "plan_left": 0.01, "topup_left": 0,
                     "minutes_left": 0.01, "period_end": "2026-12-01T00:00:00Z", "is_admin": False}]
        return 0

    monkeypatch.setattr(supabase, "user_from_token", fake_user)
    monkeypatch.setattr(supabase, "rpc", fake_rpc)
    h = {"Authorization": "Bearer good"}
    assert client.get("/me", headers=h).json()["plan"] == "free"
    r = client.post("/tts", json={"text": "Hello there. " * 40, "voice": "george"}, headers=h)
    assert r.status_code == 402
