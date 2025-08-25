from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from app.db import crud

oauth2_scheme = HTTPBearer()  # still using Bearer token

def verify_token(token: str = Depends(oauth2_scheme)):
    """
    Verify that the provided token matches a supabase_uid in the local users table.
    The token is a simple string equal to supabase_uid.
    """
    supabase_uid = token.credentials  # token is directly the supabase_uid

    # Check user exists in local DB
    user = crud.get_user_by_uid(supabase_uid)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token or user not found")

    return user
