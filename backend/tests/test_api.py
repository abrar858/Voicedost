import pytest
from fastapi.testclient import TestClient

from app import config, tts
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
