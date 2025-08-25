from fastapi import APIRouter, Request, Depends
from fastapi.responses import RedirectResponse
from supabase import create_client, Client
import os
from app.db import crud
from app.core.auth import verify_token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])

SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_KEY = settings.SUPABASE_ANON_KEY

supabase: Client = create_client(supabase_url=SUPABASE_URL, supabase_key=SUPABASE_KEY)

@router.get("/signin/{provider}")
def signin(provider: str, request: Request):
    # provider = "github" | "google" | "facebook"
    redirect_to = str(request.base_url) + "auth/callback"
    res = supabase.auth.sign_in_with_oauth({
        "provider": provider,
        "options": {"redirect_to": redirect_to}
    })
    return RedirectResponse(res.url)

@router.get("/callback")
def callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        return {"error": "No auth code provided"}

    res = supabase.auth.exchange_code_for_session({"auth_code": code})
    session = res.session
    user = session.user

    # Store user locally
    local_user = crud.get_or_create_user(
        supabase_uid=user.id,
        email=user.email,
        provider=user.app_metadata.get("provider", "oauth")
    )

    # Store session
    crud.save_session(
        user_id=local_user["id"],
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        expires_at=str(session.expires_at)
    )

    return {"message": "Login successful", "user": local_user}

@router.get("/me")
def me(user=Depends(verify_token)):
    return {"user": user}
