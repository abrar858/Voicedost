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


# ------------------------------------------------------------ script reader
#
#   Grace: Hello and welcome!          -> this line (and the next ones) in Grace's voice
#   Let's begin. [pause 2s] Ready?     -> two seconds of silence in the middle
#   Pronunciation fixes ("VoiceDost" -> "Voice Dost") change the audio, not subtitles.

_PAUSE = re.compile(r"\[\s*pause(?:\s+(\d+(?:\.\d+)?)\s*(ms|s)?)?\s*\]", re.IGNORECASE)
_SPEAKER = re.compile(r"^\s*([A-Za-z][A-Za-z\- ]{1,20})\s*[:：]\s*(.*)$")
MAX_PAUSE = 10.0


@dataclass
class Segment:
    kind: str           # "speech" or "pause"
    text: str = ""      # what the subtitles show
    say: str = ""       # what is spoken (after pronunciation fixes)
    voice: Voice | None = None
    seconds: float = 0.0


def _pause_seconds(m: re.Match) -> float:
    if not m.group(1):
        return 1.0
    value = float(m.group(1))
    return min(value / 1000 if (m.group(2) or "s").lower() == "ms" else value, MAX_PAUSE)


def _apply_lexicon(text: str, lexicon: list[tuple[str, str]]) -> str:
    for word, say in lexicon:
        if not word.strip():
            continue
        if re.fullmatch(r"[\w'-]+", word, re.ASCII):
            text = re.sub(rf"(?<![\w]){re.escape(word)}(?![\w])", say, text, flags=re.IGNORECASE)
        else:
            text = text.replace(word, say)
    return text


def parse_script(script: str, default: Voice, voices: dict[str, Voice] | None = None,
                 lexicon: list[tuple[str, str]] | None = None) -> list[Segment]:
    """Turns a script into speech and pause segments, following speaker names."""
    by_name = {}
    for v in (voices or {}).values():
        by_name[v.name.lower()] = v
        by_name[v.id.lower()] = v
    lexicon = lexicon or []
    current = default
    segments: list[Segment] = []
    for block in script.replace("\r\n", "\n").split("\n"):
        m = _SPEAKER.match(block)
        if m and m.group(1).strip().lower() in by_name:
            current = by_name[m.group(1).strip().lower()]
            block = m.group(2)
        pos = 0
        pieces: list[tuple[str, float]] = []
        for pm in _PAUSE.finditer(block):
            pieces.append((block[pos:pm.start()], 0.0))
            pieces.append(("", _pause_seconds(pm)))
            pos = pm.end()
        pieces.append((block[pos:], 0.0))
        for text, pause in pieces:
            if pause:
                segments.append(Segment("pause", seconds=pause))
                continue
            for sentence in _SENTENCE_END.split(text.strip()):
                sentence = sentence.strip()
                if sentence and re.search(r"\w", sentence):
                    segments.append(Segment("speech", sentence, _apply_lexicon(sentence, lexicon), current))
    return segments


def count_speech(segments: list[Segment]) -> int:
    return sum(1 for s in segments if s.kind == "speech")


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
               on_progress: Callable[[int, int], None] | None = None,
               lexicon: list[tuple[str, str]] | None = None) -> Audio:
    from ..core.voices import VOICES_BY_ID

    segments = parse_script(script, voice, VOICES_BY_ID, lexicon)
    total = count_speech(segments)
    if not total:
        raise ValueError("Script is empty.")
    engine = get_engine()
    gap = np.zeros(int(SAMPLE_RATE * pause_ms / 1000), dtype=np.float32)
    parts: list[np.ndarray] = []
    cues: list[Cue] = []
    t, done, prev_speech = 0.0, 0, False
    for seg in segments:
        if seg.kind == "pause":
            silence = np.zeros(int(SAMPLE_RATE * seg.seconds), dtype=np.float32)
            parts.append(silence)
            t += len(silence) / SAMPLE_RATE
            prev_speech = False
            continue
        if prev_speech:
            parts.append(gap)
            t += len(gap) / SAMPLE_RATE
        v = seg.voice or voice
        samples, sr = engine.create(seg.say, voice=v.kokoro_voice, speed=speed, lang=lang_for(seg.say, v))
        if sr != SAMPLE_RATE:
            raise RuntimeError(f"Unexpected sample rate {sr}")
        arr = np.asarray(samples, dtype=np.float32)
        parts.append(arr)
        dur = len(arr) / SAMPLE_RATE
        cues.append(Cue(t, t + dur, seg.text))
        t += dur
        prev_speech = True
        done += 1
        if on_progress:
            on_progress(done, total)
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


# ---------------------------------------------------------- background music

_music_cache: dict[str, np.ndarray] = {}
MUSIC_LEAD_IN = 0.8   # seconds of music before the voice starts
MUSIC_TAIL = 2.0      # seconds of music after the voice ends (fades out)


def _load_music(track_id: str) -> np.ndarray:
    if track_id not in _music_cache:
        import soundfile as sf

        from ..core.music import MUSIC_DIR
        data, sr = sf.read(MUSIC_DIR / f"{track_id}.ogg", dtype="float32")
        if data.ndim > 1:
            data = data.mean(axis=1)
        if sr != SAMPLE_RATE:
            raise RuntimeError(f"Music must be {SAMPLE_RATE} Hz")
        _music_cache[track_id] = data
    return _music_cache[track_id]


def _loop(music: np.ndarray, n: int, fade: int = int(0.05 * SAMPLE_RATE)) -> np.ndarray:
    """Repeats a track to n samples with short crossfades at each join."""
    out = np.zeros(n, dtype=np.float32)
    ramp = np.linspace(0, 1, fade, dtype=np.float32)
    pos, step = 0, len(music) - fade
    while pos < n:
        seg = music[: min(len(music), n - pos)].copy()
        if pos > 0:
            k = min(fade, len(seg))
            seg[:k] *= ramp[:k]
            out[pos:pos + k] *= 1 - ramp[:k]
        out[pos:pos + len(seg)] += seg
        pos += step
    return out


def _smooth(x: np.ndarray, attack: float, release: float) -> np.ndarray:
    """Envelope follower (fast up, slow down), done in blocks for speed."""
    block = 240  # 10 ms
    nb = int(np.ceil(len(x) / block))
    peaks = np.pad(np.abs(x), (0, nb * block - len(x))).reshape(nb, block).max(axis=1)
    a = np.exp(-block / (attack * SAMPLE_RATE))
    r = np.exp(-block / (release * SAMPLE_RATE))
    env, level = np.empty(nb, dtype=np.float32), 0.0
    for i, p in enumerate(peaks):
        level = a * level + (1 - a) * p if p > level else r * level + (1 - r) * p
        env[i] = level
    return np.repeat(env, block)[: len(x)]


def add_music(audio: Audio, track_id: str, volume: float = 0.5) -> Audio:
    """Mixes a background track under the voice, dipping it while someone speaks."""
    music = _load_music(track_id)
    lead, tail = int(MUSIC_LEAD_IN * SAMPLE_RATE), int(MUSIC_TAIL * SAMPLE_RATE)
    voice = np.concatenate([np.zeros(lead, np.float32), audio.samples.astype(np.float32), np.zeros(tail, np.float32)])
    bed = _loop(music, len(voice))
    base = 10 ** ((-28 + 18 * float(np.clip(volume, 0, 1))) / 20)  # -28 dB .. -10 dB
    speaking = np.clip(_smooth(voice, 0.05, 0.45) / 0.08, 0, 1)
    gain = base * (1 - 0.6 * speaking)
    fade = np.ones(len(voice), np.float32)
    fade[: lead // 2] = np.linspace(0, 1, lead // 2)
    fade[-tail:] = np.linspace(1, 0, tail)
    mixed = voice + bed / (np.max(np.abs(bed)) + 1e-9) * gain * fade
    peak = np.max(np.abs(mixed))
    if peak > 0.98:
        mixed *= 0.98 / peak
    cues = [Cue(c.start + MUSIC_LEAD_IN, c.end + MUSIC_LEAD_IN, c.text) for c in (audio.cues or [])]
    return Audio(mixed.astype(np.float32), audio.sample_rate, cues)
