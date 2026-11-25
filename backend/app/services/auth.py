"""Accounts: the website sends the Supabase login token as
`Authorization: Bearer <token>`; this checks it and returns the user."""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import Header, HTTPException

from ..core import config
from . import supabase


@dataclass
class CurrentUser:
    id: str
    email: str
    token: str = ""


async def get_current_user(authorization: str | None = Header(default=None)) -> CurrentUser | None:
    """FastAPI dependency. None means "nobody signed in" (or accounts are off)."""
    if not config.ACCOUNTS_ON or not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None
    try:
        user = await supabase.user_from_token(token)
    except supabase.SupabaseError as e:
        raise HTTPException(503, str(e))
    if not user or not user.get("id"):
        return None
    return CurrentUser(id=user["id"], email=user.get("email") or "", token=token)


async def require_user(authorization: str | None = Header(default=None)) -> CurrentUser:
    user = await get_current_user(authorization)
    if user is None:
        raise HTTPException(401, "Please log in to use the studio.")
    return user
