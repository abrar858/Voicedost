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
from typing import Callable

import numpy as np

from ..core import config
from ..core.voices import Voice

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


_SENTENCE_END = re.compile(r"(?<=[۔؟])\s*(?=\S)|(?<=[.!?।])\s+")
_URDU = re.compile(r"[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]")


def lang_for(line: str, voice: Voice) -> str:
    """Urdu script is read with Urdu pronunciation rules (sounds like Hindi)."""
    if len(_URDU.findall(line)) >= max(2, len(line.replace(" ", "")) // 3):
        return "ur"
    return voice.kokoro_lang


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
class Cue:
    start: float  # seconds
    end: float
    text: str


@dataclass
class Audio:
    samples: np.ndarray  # float32 mono, -1..1
    sample_rate: int = SAMPLE_RATE
    cues: list[Cue] | None = None  # one per spoken line, for subtitles

    @property
    def seconds(self) -> float:
        return len(self.samples) / self.sample_rate


def synthesise(script: str, voice: Voice, speed: float = 1.0, pause_ms: int = 350,
               on_progress: Callable[[int, int], None] | None = None) -> Audio:
    lines = split_lines(script)
    if not lines:
        raise ValueError("Script is empty.")
    engine = get_engine()
    gap = np.zeros(int(SAMPLE_RATE * pause_ms / 1000), dtype=np.float32)
    parts: list[np.ndarray] = []
    cues: list[Cue] = []
    t = 0.0
    for i, line in enumerate(lines):
        samples, sr = engine.create(line, voice=voice.kokoro_voice, speed=speed, lang=lang_for(line, voice))
        if sr != SAMPLE_RATE:
            raise RuntimeError(f"Unexpected sample rate {sr}")
        arr = np.asarray(samples, dtype=np.float32)
        parts.append(arr)
        dur = len(arr) / SAMPLE_RATE
        cues.append(Cue(t, t + dur, line))
        t += dur
        if i < len(lines) - 1:
            parts.append(gap)
            t += len(gap) / SAMPLE_RATE
        if on_progress:
            on_progress(i + 1, len(lines))
    return Audio(np.concatenate(parts), cues=cues)


def _chunks(text: str, max_chars: int = 84) -> list[str]:
    """Break a long line into subtitle-sized pieces on word boundaries."""
    words, out, cur = text.split(), [], ""
    for w in words:
        if cur and len(cur) + 1 + len(w) > max_chars:
            out.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}" if cur else w
    if cur:
        out.append(cur)
    return out or [text]


def _wrap(text: str, width: int = 42) -> str:
    """Two subtitle rows at most: split near the middle on a space."""
    if len(text) <= width:
        return text
    mid = len(text) // 2
    left, right = text.rfind(" ", 0, mid + 1), text.find(" ", mid)
    cut = left if left != -1 and (right == -1 or mid - left <= right - mid) else right
    return text if cut == -1 else text[:cut] + "\n" + text[cut + 1:]


def _ts(sec: float) -> str:
    ms = int(round(sec * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def to_srt(audio: Audio) -> str:
    """SubRip subtitles: one cue per line, long lines split by time share."""
    out, n = [], 0
    for cue in audio.cues or []:
        pieces = _chunks(cue.text)
        total = sum(len(p) for p in pieces) or 1
        start = cue.start
        for p in pieces:
            end = start + (cue.end - cue.start) * len(p) / total
            n += 1
            out.append(f"{n}\n{_ts(start)} --> {_ts(end)}\n{_wrap(p)}\n")
            start = end
    return "\n".join(out)


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
