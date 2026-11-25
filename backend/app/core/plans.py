"""Plan limits. Keep in step with frontend/src/content/plans.ts."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Plan:
    id: str
    minutes_per_month: int
    price_gbp: float
    allows_wav: bool
    commercial_use: bool  # monetised videos allowed
    rollover: bool = False  # plan minutes reset each month


PLANS = {
    "free": Plan("free", 10, 0.0, allows_wav=False, commercial_use=True),
    "starter": Plan("starter", 60, 3.0, allows_wav=True, commercial_use=True),
    "creator": Plan("creator", 180, 5.0, allows_wav=True, commercial_use=True),
}

TOPUP_MINUTES = 30
TOPUP_PRICE_GBP = 1.0
TOPUP_EXPIRES = False  # top-up minutes never expire; used after plan minutes
