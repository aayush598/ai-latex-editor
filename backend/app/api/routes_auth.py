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
        "options": {
            "redirect_to": redirect_to,
            "query_params": {"prompt": "select_account"}
            }
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

    # ✅ Redirect to frontend with supabase_uid in query string
    redirect_url = f"{FRONTEND_URL}?supabase_uid={local_user['supabase_uid']}"
    return RedirectResponse(url=redirect_url)
