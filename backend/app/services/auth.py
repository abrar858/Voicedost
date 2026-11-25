"""Accounts – placeholder.

[ACCOUNTS] Verify the Supabase JWT sent by the website in the
Authorization header and return the user. Until then every request is
anonymous and the studio is open for testing.
"""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import Header


@dataclass
class CurrentUser:
    id: str
    email: str
    plan: str
    is_admin: bool = False


async def get_current_user(authorization: str | None = Header(default=None)) -> CurrentUser | None:
    """FastAPI dependency. Returns None while accounts are switched off."""
    return None
