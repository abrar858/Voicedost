"""Background music made by scripts/make_music.py (royalty-free, ours)."""

from dataclasses import dataclass
from pathlib import Path

MUSIC_DIR = Path(__file__).resolve().parents[1] / "assets" / "music"


@dataclass(frozen=True)
class Track:
    id: str
    name: str
    mood: str


TRACKS = [
    Track("calm", "Soft Morning", "Calm"),
    Track("uplifting", "Rise Up", "Motivational"),
    Track("cinematic", "Epic Story", "Cinematic"),
    Track("lofi", "Chill Study", "Lo-fi"),
    Track("kids", "Happy Play", "Kids"),
    Track("tech", "Bright Tech", "Tech & business"),
]
TRACKS_BY_ID = {t.id: t for t in TRACKS}
