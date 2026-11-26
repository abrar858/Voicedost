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
    Voice("grace", "Grace", "American English", "female", "af_heart", "en-us"),
    Voice("bella", "Bella", "American English", "female", "af_bella", "en-us"),
    Voice("ryan", "Ryan", "American English", "male", "am_fenrir", "en-us"),
    Voice("jake", "Jake", "American English", "male", "am_puck", "en-us"),
    Voice("isabella", "Isabella", "British English", "female", "bf_isabella", "en-gb"),
    Voice("oliver", "Oliver", "British English", "male", "bm_fable", "en-gb"),
    Voice("hindi-female", "Priya", "Hindi", "female", "hf_alpha", "hi"),
    Voice("hindi-male", "Arjun", "Hindi", "male", "hm_omega", "hi"),
    Voice("anaya", "Anaya", "Hindi", "female", "hf_beta", "hi"),
    Voice("rohan", "Rohan", "Hindi", "male", "hm_psi", "hi"),
]

VOICES_BY_ID = {v.id: v for v in VOICES}
