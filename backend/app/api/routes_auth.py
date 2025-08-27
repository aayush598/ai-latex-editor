from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from supabase import create_client, Client
import os
from app.db import crud
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])

SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_KEY = settings.SUPABASE_ANON_KEY
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://ai-latex-editor.vercel.app")
BACKEND_URL = os.getenv("BACKEND_URL", "https://ai-latex-editor.onrender.com")

supabase: Client = create_client(supabase_url=SUPABASE_URL, supabase_key=SUPABASE_KEY)

@router.get("/signin/{provider}")
def signin(provider: str, request: Request):
    # Always redirect back to backend callback
    redirect_to = f"{BACKEND_URL}/auth/callback"
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

    # Exchange code for session
    res = supabase.auth.exchange_code_for_session({"auth_code": code})
    session = res.session
    user = session.user

    # Store user in local DB
    local_user = crud.get_or_create_user(
        supabase_uid=user.id,
        email=user.email,
        provider=user.app_metadata.get("provider", "oauth")
    )

    # (Optional) Save session in DB if you need it
    # crud.save_session(
    #     user_id=local_user["id"],
    #     access_token=session.access_token,
    #     refresh_token=session.refresh_token,
    #     expires_at=str(session.expires_at)
    # )

    # Instead of passing code back, redirect only with supabase_uid
    redirect_url = f"{FRONTEND_URL}?supabase_uid={local_user['supabase_uid']}"
    response = RedirectResponse(redirect_url)

    # Also set cookie for frontend usage (if desired)
    response.set_cookie(
        key="supabase_uid",
        value=local_user["supabase_uid"],
        httponly=False,  # JS can read it
        max_age=60*60*24*7,  # 7 days
        samesite="lax",
        secure=True,  # should be True in production with HTTPS
    )
    return response
