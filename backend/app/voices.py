"""Voice catalogue shown to users. Each entry maps to a Kokoro voice id."""

from dataclasses import dataclass, asdict


@dataclass(frozen=True)
class Voice:
    id: str          # public id used by the website
    name: str        # display name
    language: str    # display language
    gender: str
    kokoro_voice: str
    kokoro_lang: str  # espeak language code used by Kokoro

    def public(self) -> dict:
        d = asdict(self)
        d.pop("kokoro_voice")
        d.pop("kokoro_lang")
        return d


VOICES = [
    Voice("george", "George", "British English", "male", "bm_george", "en-gb"),
    Voice("emma", "Emma", "British English", "female", "bf_emma", "en-gb"),
    Voice("michael", "Michael", "American English", "male", "am_michael", "en-us"),
    Voice("hindi-female", "Hindi · Female", "Hindi", "female", "hf_alpha", "hi"),
    Voice("hindi-male", "Hindi · Male", "Hindi", "male", "hm_omega", "hi"),
]

VOICES_BY_ID = {v.id: v for v in VOICES}
