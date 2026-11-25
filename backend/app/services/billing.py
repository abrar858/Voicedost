"""Payments – placeholder.

[PAYMENTS] Handle Stripe webhooks (checkout.session.completed,
invoice.paid, customer.subscription.deleted) and update the
subscriptions / minute_grants tables. Local methods (JazzCash, Easypaisa,
crypto) add their own webhook handlers that grant minutes the same way.
"""

from __future__ import annotations


def grant_minutes(user_id: str, minutes: int, source: str, reference: str) -> None:
    """Add minutes to a user's balance (plan renewal, 30-day pack or top-up)."""
    raise NotImplementedError("Payments are not enabled yet.")
