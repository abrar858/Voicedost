from fastapi import APIRouter

from ..core.voices import VOICES

router = APIRouter(tags=["voices"])


@router.get("/voices")
def list_voices():
    return [v.public() for v in VOICES]
