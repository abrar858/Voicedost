"""Makes VoiceDost's royalty-free background music, entirely in code.

Every sound here is synthesised from scratch (no samples), so the tracks are
ours to use and give away. Run once; it writes app/assets/music/*.ogg.

    python scripts/make_music.py
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

SR = 24000
OUT = Path(__file__).resolve().parents[1] / "app" / "assets" / "music"
rng = np.random.default_rng(7)


# ---------------------------------------------------------------- helpers

def hz(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def env(n: int, a: float, d: float, s: float, r: float) -> np.ndarray:
    """ADSR envelope over n samples (times in seconds, s = sustain level)."""
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    s_n = max(n - a_n - d_n - r_n, 0)
    e = np.concatenate([
        np.linspace(0, 1, max(a_n, 1), endpoint=False),
        np.linspace(1, s, max(d_n, 1), endpoint=False),
        np.full(s_n, s),
        np.linspace(s, 0, max(r_n, 1)),
    ])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


def lowpass(x: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, cutoff, "low", fs=SR, output="sos"), x)


def highpass(x: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, cutoff, "high", fs=SR, output="sos"), x)


def bandpass(x: np.ndarray, lo: float, hi: float) -> np.ndarray:
    return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)


def saw(f: float, n: int, detune: float = 0.0) -> np.ndarray:
    """Band-limited sawtooth by adding harmonics."""
    t = np.arange(n) / SR
    out = np.zeros(n)
    k = 1
    while f * k < SR / 2.2 and k < 16:
        out += np.sin(2 * np.pi * f * k * (1 + detune) * t + rng.uniform(0, 6.28)) / k
        k += 1
    return out * 0.5


def pad(midis: list[int], dur: float, bright: float = 1800) -> np.ndarray:
    n = int(dur * SR)
    out = np.zeros(n)
    for m in midis:
        f = hz(m)
        out += saw(f, n, -0.004) + saw(f, n, 0.004)
    out = lowpass(out, bright, 4) * env(n, dur * 0.35, 0.2, 0.85, dur * 0.4)
    return out / max(len(midis), 1) * 0.35


def pluck(midi: int, dur: float, decay: float = 0.996, bright: float = 0.5) -> np.ndarray:
    """Karplus-Strong plucked string (harp / guitar)."""
    f = hz(midi)
    n = int(dur * SR)
    period = max(int(SR / f), 2)
    buf = lowpass(rng.uniform(-1, 1, period), SR * 0.45 * bright + 300) if period > 12 else rng.uniform(-1, 1, period)
    out = np.zeros(n)
    b = buf.copy()
    for i in range(n):
        j = i % period
        out[i] = b[j]
        b[j] = decay * 0.5 * (b[j] + b[(j + 1) % period])
    return out * env(n, 0.002, 0.0, 1.0, min(0.08, dur * 0.3)) * 0.6


def keys(midi: int, dur: float, decay: float = 2.2) -> np.ndarray:
    """Soft piano / electric piano: harmonics that fade at different speeds."""
    f = hz(midi)
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k, amp in enumerate([1.0, 0.45, 0.22, 0.12, 0.06], start=1):
        out += amp * np.sin(2 * np.pi * f * k * t) * np.exp(-t * decay * k * 0.8)
    return out * env(n, 0.004, 0.0, 1.0, 0.12) * 0.3


def marimba(midi: int, dur: float) -> np.ndarray:
    f = hz(midi)
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.sin(2 * np.pi * f * t) * np.exp(-t * 5) + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 18)
    return out * env(n, 0.001, 0.0, 1.0, 0.05) * 0.35


def kick(level: float = 1.0) -> np.ndarray:
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 45 + 80 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.9 * level


def snare(level: float = 1.0) -> np.ndarray:
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    noise = bandpass(rng.uniform(-1, 1, n), 1200, 7000) * np.exp(-t * 18)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25)
    return (noise * 0.6 + tone * 0.3) * level


def hat(level: float = 1.0) -> np.ndarray:
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    return highpass(rng.uniform(-1, 1, n), 7000) * np.exp(-t * 70) * 0.25 * level


def tom(level: float = 1.0) -> np.ndarray:
    """Deep timpani-like hit."""
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    f = 55 + 30 * np.exp(-t * 6)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    return (body + lowpass(rng.uniform(-1, 1, n), 400) * np.exp(-t * 12) * 0.3) * 0.8 * level


def reverb(x: np.ndarray, seconds: float = 2.2, mix: float = 0.3) -> np.ndarray:
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = rng.normal(0, 1, n) * np.exp(-t * 6.9 / seconds)
    ir = lowpass(ir, 5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    wet = fftconvolve(x, ir)[: len(x)]
    return x * (1 - mix) + wet * mix


class Track:
    def __init__(self, bpm: float, bars: int):
        self.beat = 60.0 / bpm
        self.bar = self.beat * 4
        self.length = bars * self.bar
        self.buf = np.zeros(int((self.length + 4) * SR))  # + tail, wrapped later

    def add(self, sound: np.ndarray, at_beats: float, gain: float = 1.0) -> None:
        i = int(at_beats * self.beat * SR)
        j = min(i + len(sound), len(self.buf))
        self.buf[i:j] += sound[: j - i] * gain

    def finish(self, name: str, title: str) -> None:
        loop_n = int(self.length * SR)
        out = self.buf[:loop_n].copy()
        tail = self.buf[loop_n:]
        out[: len(tail)] += tail  # wrap the tail so the loop is seamless
        out = highpass(out, 35)
        out /= np.max(np.abs(out)) + 1e-9
        out *= 0.7
        OUT.mkdir(parents=True, exist_ok=True)
        sf.write(OUT / f"{name}.ogg", out.astype(np.float32), SR, format="OGG", subtype="VORBIS")
        print(f"{name:10} {title:16} {self.length:5.1f}s")


# ------------------------------------------------------------------ tracks

def chord(root: int, kind: str) -> list[int]:
    shapes = {"maj": [0, 4, 7], "min": [0, 3, 7], "maj7": [0, 4, 7, 11], "min7": [0, 3, 7, 10], "6": [0, 4, 7, 9]}
    return [root + i for i in shapes[kind]]


def calm():
    t = Track(70, 16)
    prog = [(60, "maj7"), (57, "min7"), (53, "maj7"), (55, "6")]
    for bar in range(16):
        root, kind = prog[bar % 4]
        notes = chord(root, kind)
        t.add(pad(notes, t.bar * 1.15, 1400), bar * 4, 0.9)
        t.add(pad([root - 24], t.bar * 1.1, 400), bar * 4, 0.7)
        if True:
            for k, beat in enumerate([0, 1.5, 2.5, 3.25]):
                t.add(pluck(notes[k % len(notes)] + 12, 2.5, 0.997, 0.4), bar * 4 + beat, 0.5)
    t.buf = reverb(t.buf, 3.0, 0.45)
    t.finish("calm", "Soft Morning")


def uplifting():
    t = Track(100, 24)
    prog = [(55, "maj"), (50, "maj"), (52, "min"), (48, "maj")]
    for bar in range(24):
        root, kind = prog[bar % 4]
        notes = chord(root, kind)
        t.add(pad(notes, t.bar * 1.05, 1600), bar * 4, 0.45)
        t.add(keys(root - 12, t.bar, 1.2), bar * 4, 0.9)
        arp = [notes[0], notes[1], notes[2], notes[1] + 12, notes[2] + 12, notes[1] + 12, notes[2], notes[1]]
        for k, m in enumerate(arp):
            t.add(keys(m + 12, 1.4, 2.6), bar * 4 + k * 0.5, 0.7)
        if True:
            for b in (0, 2):
                t.add(kick(0.8), bar * 4 + b)
        if True:
            for b in (1, 3):
                t.add(snare(0.45), bar * 4 + b)
            for k in range(8):
                t.add(hat(0.6 if k % 2 else 0.35), bar * 4 + k * 0.5)
    t.buf = reverb(t.buf, 1.8, 0.25)
    t.finish("uplifting", "Rise Up")


def cinematic():
    t = Track(80, 16)
    prog = [(50, "min"), (46, "maj"), (53, "maj"), (48, "maj")]
    for bar in range(16):
        root, kind = prog[bar % 4]
        notes = chord(root, kind)
        lift = 300 + (bar % 4) * 150
        t.add(pad(notes + [notes[0] + 12], t.bar * 1.2, 900 + lift), bar * 4, 0.9)
        t.add(pad([root - 24, root - 12], t.bar * 1.2, 300), bar * 4, 0.9)
        t.add(tom(0.9 if bar % 2 == 0 else 0.6), bar * 4)
        if bar >= 8:
            t.add(tom(0.5), bar * 4 + 2.5)
            for k in range(4):
                t.add(pluck(notes[k % 3] + 24, 1.5, 0.995, 0.6), bar * 4 + k, 0.35)
    t.buf = reverb(t.buf, 3.5, 0.4)
    t.finish("cinematic", "Epic Story")


def lofi():
    t = Track(78, 16)
    prog = [(53, "maj7"), (52, "min7"), (50, "min7"), (48, "maj7")]
    swing = 0.12
    for bar in range(16):
        root, kind = prog[bar % 4]
        notes = chord(root, kind)
        for m in notes:
            t.add(keys(m, t.bar * 0.95, 0.9), bar * 4, 0.55)
            t.add(keys(m, t.bar * 0.45, 1.3), bar * 4 + 2.5, 0.3)
        t.add(keys(root - 12, t.bar, 0.8), bar * 4, 0.8)
        t.add(kick(0.75), bar * 4)
        t.add(kick(0.55), bar * 4 + 2.5)
        t.add(snare(0.35), bar * 4 + 1)
        t.add(snare(0.35), bar * 4 + 3)
        for k in range(8):
            t.add(hat(0.45 if k % 2 == 0 else 0.3), bar * 4 + k * 0.5 + (swing if k % 2 else 0))
    n = len(t.buf)
    crackle = np.zeros(n)
    idx = rng.integers(0, n, n // 900)
    crackle[idx] = rng.uniform(-0.25, 0.25, len(idx))
    t.buf += lowpass(crackle, 3000) + lowpass(rng.normal(0, 0.004, n), 1200)
    t.buf = lowpass(t.buf, 6500)
    t.buf = reverb(t.buf, 1.5, 0.2)
    t.finish("lofi", "Chill Study")


def kids():
    t = Track(120, 16)
    prog = [60, 65, 67, 60]
    melody = [72, 74, 76, 79, 76, 74, 72, 74, 76, 76, 74, 72, 69, 72, 74, 72]
    for bar in range(16):
        root = prog[bar % 4]
        notes = chord(root, "maj")
        t.add(marimba(root - 12, 0.8), bar * 4, 1.0)
        t.add(marimba(root - 5, 0.8), bar * 4 + 2, 0.8)
        for k in (1, 3):
            for m in notes:
                t.add(marimba(m, 0.4), bar * 4 + k, 0.35)
        if True:
            for k in range(4):
                t.add(marimba(melody[(bar * 4 + k) % 16], 0.5), bar * 4 + k, 0.7)
        for k in range(8):
            t.add(hat(0.35), bar * 4 + k * 0.5)
    t.buf = reverb(t.buf, 1.2, 0.2)
    t.finish("kids", "Happy Play")


def tech():
    t = Track(110, 16)
    prog = [(57, "min"), (53, "maj"), (48, "maj"), (55, "maj")]
    for bar in range(16):
        root, kind = prog[bar % 4]
        notes = chord(root, kind)
        t.add(pad(notes, t.bar * 1.05, 2200), bar * 4, 0.4)
        t.add(pluck(root - 12, t.bar, 0.998, 0.3), bar * 4, 0.7)
        seq = [0, 1, 2, 1, 2, 0, 1, 2]
        for k in range(16):
            m = notes[seq[k % 8]] + 12 + (12 if k % 8 == 6 else 0)
            t.add(pluck(m, 0.6, 0.992, 0.7), bar * 4 + k * 0.25, 0.35)
        if True:
            for b in range(4):
                t.add(kick(0.6), bar * 4 + b)
            for k in range(4):
                t.add(hat(0.5), bar * 4 + k + 0.5)
    t.buf = reverb(t.buf, 1.6, 0.25)
    t.finish("tech", "Bright Tech")


if __name__ == "__main__":
    for make in (calm, uplifting, cinematic, lofi, kids, tech):
        make()
