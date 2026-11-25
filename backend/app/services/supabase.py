"""Small Supabase client: check a user's login token and call database
functions as that user (only the public publishable key is needed)."""

from __future__ import annotations

import time

import httpx

from ..core import config


class SupabaseError(Exception):
    pass


_client: httpx.AsyncClient | None = None
# token -> (expires_at, user json); avoids asking Supabase on every request
_token_cache: dict[str, tuple[float, dict]] = {}
_TOKEN_TTL = 60.0


def _http() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(base_url=config.SUPABASE_URL, timeout=10.0)
    return _client


def _headers(token: str) -> dict[str, str]:
    return {"apikey": config.SUPABASE_KEY, "Authorization": f"Bearer {token}", "Content-Type": "application/json"}


async def user_from_token(token: str) -> dict | None:
    """Returns the Supabase user for a login token, or None if it is not valid."""
    now = time.monotonic()
    hit = _token_cache.get(token)
    if hit and hit[0] > now:
        return hit[1]
    try:
        r = await _http().get("/auth/v1/user", headers=_headers(token))
    except httpx.HTTPError as e:
        raise SupabaseError("Could not reach the account service.") from e
    if r.status_code in (401, 403):
        return None
    if r.status_code != 200:
        raise SupabaseError(f"Account service error {r.status_code}.")
    user = r.json()
    if len(_token_cache) > 5000:
        _token_cache.clear()
    _token_cache[token] = (now + _TOKEN_TTL, user)
    return user


async def rpc(token: str, name: str, **params) -> object:
    """Calls a database function as the signed-in user."""
    try:
        r = await _http().post(f"/rest/v1/rpc/{name}", headers=_headers(token), json=params)
    except httpx.HTTPError as e:
        raise SupabaseError("Could not reach the account service.") from e
    if r.status_code >= 300:
        raise SupabaseError(f"Account service error {r.status_code}: {r.text[:200]}")
    return r.json()
