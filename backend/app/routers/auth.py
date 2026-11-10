"""
Authentication Router
Google sign-in and current-user endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import GoogleAuthRequest, TokenResponse, UserOut
from app.services.auth_service import (
    create_access_token,
    get_current_user,
    get_or_create_google_user,
    verify_google_token,
)

router = APIRouter()


@router.post("/auth/google", response_model=TokenResponse)
async def google_login(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Exchange a Google ID token for an app session (JWT)"""
    try:
        idinfo = verify_google_token(payload.credential)
        user = get_or_create_google_user(db, idinfo)
        token = create_access_token(user)
    except HTTPException:
        raise
    except Exception as e:
        # verify_google_token's signature check only catches ValueError, but it
        # also makes a live network call to fetch Google's signing certs - a
        # transport/connection error there (or anything else unexpected in the
        # DB upsert / token signing below) would otherwise propagate as an
        # unhandled exception. Starlette's CORSMiddleware doesn't attach CORS
        # headers to those, so the browser reports it as a CORS failure instead
        # of the real 500 - masking the actual problem. Surfacing it as a
        # proper HTTPException keeps the CORS headers intact and gives the
        # frontend (and these logs) the real reason.
        print(f"[auth/google] Unexpected error during sign-in: {e!r}")
        raise HTTPException(
            status_code=502,
            detail="Could not complete Google sign-in right now. Please try again.",
        )
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/auth/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
