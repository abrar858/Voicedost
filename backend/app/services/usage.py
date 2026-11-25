"""Minute balances – placeholder.

[ACCOUNTS] Read and write the usage_events table (see docs/DATA-MODEL.md):
check a user has enough minutes before generating, then record what was
used. While accounts are off, nothing is limited or recorded.
"""

from __future__ import annotations

from .auth import CurrentUser


class NotEnoughMinutes(Exception):
    pass


def minutes_left(user: CurrentUser | None) -> float | None:
    """None means unlimited (accounts switched off)."""
    return None


def check_minutes(user: CurrentUser | None, estimated_minutes: float) -> None:
    left = minutes_left(user)
    if left is not None and estimated_minutes > left:
        raise NotEnoughMinutes(f"You have {left:.1f} minutes left; this needs about {estimated_minutes:.1f}.")


def record_usage(user: CurrentUser | None, minutes: float, voice: str, characters: int) -> None:
    """[ACCOUNTS] insert into usage_events."""
    return None
