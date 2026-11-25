"""Text-to-speech engine wrapper around Kokoro (ONNX).

Splits a script into lines, synthesises each line, joins them with a
configurable pause and encodes the result as WAV or MP3.
"""

from __future__ import annotations

import io
import re
import subprocess
import threading
import wave
from dataclasses import dataclass

import numpy as np

from . import config
from .voices import Voice

SAMPLE_RATE = 24000

_engine = None
_engine_lock = threading.Lock()


class EngineUnavailable(RuntimeError):
    pass


def get_engine():
    """Load the Kokoro model once (it is large) and reuse it."""
    global _engine
    if _engine is None:
        with _engine_lock:
            if _engine is None:
                if not config.KOKORO_MODEL.exists() or not config.KOKORO_VOICES.exists():
                    raise EngineUnavailable(
                        f"Voice model files missing in {config.MODELS_DIR}. "
                        "Run backend/scripts/download_models.sh first.")
                from kokoro_onnx import Kokoro
                _engine = Kokoro(str(config.KOKORO_MODEL), str(config.KOKORO_VOICES))
    return _engine


_SENTENCE_END = re.compile(r"(?<=[.!?।])\s+")


def split_lines(script: str) -> list[str]:
    """Split a script into speakable lines: by line breaks, then sentences."""
    lines: list[str] = []
    for block in script.replace("\r\n", "\n").split("\n"):
        block = block.strip()
        if not block:
            continue
        for sentence in _SENTENCE_END.split(block):
            sentence = sentence.strip()
            if sentence:
                lines.append(sentence)
    return lines


def estimate_seconds(text: str, speed: float = 1.0) -> float:
    """Rough audio length before generating (about 1,070 characters a minute at 1.0x)."""
    return len(text) / 1070 * 60 / max(speed, 0.1)


@dataclass
class Audio:
    samples: np.ndarray  # float32 mono, -1..1
    sample_rate: int = SAMPLE_RATE

    @property
    def seconds(self) -> float:
        return len(self.samples) / self.sample_rate


def synthesise(script: str, voice: Voice, speed: float = 1.0, pause_ms: int = 350) -> Audio:
    lines = split_lines(script)
    if not lines:
        raise ValueError("Script is empty.")
    engine = get_engine()
    gap = np.zeros(int(SAMPLE_RATE * pause_ms / 1000), dtype=np.float32)
    parts: list[np.ndarray] = []
    for i, line in enumerate(lines):
        samples, sr = engine.create(line, voice=voice.kokoro_voice, speed=speed, lang=voice.kokoro_lang)
        if sr != SAMPLE_RATE:
            raise RuntimeError(f"Unexpected sample rate {sr}")
        parts.append(np.asarray(samples, dtype=np.float32))
        if i < len(lines) - 1:
            parts.append(gap)
    return Audio(np.concatenate(parts))


def to_wav(audio: Audio) -> bytes:
    pcm = (np.clip(audio.samples, -1, 1) * 32767).astype("<i2").tobytes()
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(audio.sample_rate)
        w.writeframes(pcm)
    return buf.getvalue()


def to_mp3(audio: Audio, bitrate: str = "128k") -> bytes:
    """Encode with ffmpeg (must be installed on the server)."""
    proc = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-f", "wav", "-i", "pipe:0",
         "-codec:a", "libmp3lame", "-b:a", bitrate, "-f", "mp3", "pipe:1"],
        input=to_wav(audio), capture_output=True, check=False)
    if proc.returncode != 0:
        raise RuntimeError("MP3 encoding failed: " + proc.stderr.decode(errors="ignore")[:300])
    return proc.stdout
