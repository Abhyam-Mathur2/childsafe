"""
Authentication Router
Google sign-in and current-user endpoints
"""

from fastapi import APIRouter, Depends
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
    idinfo = verify_google_token(payload.credential)
    user = get_or_create_google_user(db, idinfo)
    token = create_access_token(user)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/auth/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
