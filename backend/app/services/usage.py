"""Minute balances, stored in Supabase (see supabase/migrations/).

Plan minutes reset each month; top-up minutes never expire. Plan minutes are
spent first. While accounts are off, nothing is limited or recorded.
"""

from __future__ import annotations

from dataclasses import dataclass

from ..core import config
from . import supabase
from .auth import CurrentUser


class NotEnoughMinutes(Exception):
    pass


@dataclass
class Summary:
    plan: str
    plan_minutes: float
    plan_left: float
    topup_left: float
    minutes_left: float
    period_end: str
    is_admin: bool

    def public(self) -> dict:
        return {k: (round(v, 2) if isinstance(v, float) else v) for k, v in self.__dict__.items()}


async def summary(user: CurrentUser) -> Summary:
    rows = await supabase.rpc(user.token, "account_summary")
    if not rows:
        raise supabase.SupabaseError("Your account is still being set up. Please try again in a moment.")
    r = rows[0]
    return Summary(
        plan=r["plan"], plan_minutes=float(r["plan_minutes"]), plan_left=float(r["plan_left"]),
        topup_left=float(r["topup_left"]), minutes_left=float(r["minutes_left"]),
        period_end=r["period_end"], is_admin=bool(r["is_admin"]),
    )


class NotOnPlan(Exception):
    pass


async def check_minutes(user: CurrentUser | None, estimated_minutes: float, fmt: str = "mp3") -> None:
    if user is None or not config.ACCOUNTS_ON:
        return
    s = await summary(user)
    if fmt == "wav" and s.plan == "free":
        raise NotOnPlan("WAV downloads come with Starter and Creator. Choose MP3, or upgrade.")
    left = s.minutes_left
    if estimated_minutes > left + 0.01:
        if left <= 0:
            raise NotEnoughMinutes("You have used all your minutes. Upgrade or add a £1 top-up to keep going.")
        raise NotEnoughMinutes(
            f"You have {left:.1f} minutes left and this script needs about {estimated_minutes:.1f}. "
            "Shorten it, or upgrade for more minutes.")


async def record_usage(user: CurrentUser | None, minutes: float, voice: str, characters: int) -> float | None:
    """Returns minutes left after this generation (None when not counted)."""
    if user is None or not config.ACCOUNTS_ON:
        return None
    left = await supabase.rpc(user.token, "record_usage", p_minutes=max(minutes, 0.001),
                              p_characters=characters, p_voice=voice)
    return float(left)
