"""Plan limits. Keep in step with frontend/src/content/plans.ts."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Plan:
    id: str
    minutes_per_month: int
    price_gbp: float
    allows_wav: bool
    commercial_use: bool  # [CONFIRM IN TERMS]


PLANS = {
    "free": Plan("free", 10, 0.0, allows_wav=False, commercial_use=False),
    "starter": Plan("starter", 60, 3.0, allows_wav=True, commercial_use=True),
    "creator": Plan("creator", 180, 5.0, allows_wav=True, commercial_use=True),
}

TOPUP_MINUTES = 30
TOPUP_PRICE_GBP = 1.0
