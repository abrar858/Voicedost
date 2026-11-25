"""Signed-in user's plan and minute balance."""

from fastapi import APIRouter, Depends, HTTPException

from ..services import supabase, usage
from ..services.auth import CurrentUser, require_user

router = APIRouter(tags=["account"])


@router.get("/me")
async def me(user: CurrentUser = Depends(require_user)):
    try:
        s = await usage.summary(user)
    except supabase.SupabaseError as e:
        raise HTTPException(503, str(e))
    return {"id": user.id, "email": user.email, **s.public()}
