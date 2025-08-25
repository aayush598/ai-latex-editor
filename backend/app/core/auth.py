import os
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
from app.db import crud

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
oauth2_scheme = HTTPBearer()

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token.credentials, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        uid: str = payload.get("sub")
        email: str = payload.get("email")
        provider: str = payload.get("provider", "oauth")

        if uid is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Ensure user exists locally
        user = crud.get_or_create_user(uid, email, provider)
        return user

    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid credentials")
