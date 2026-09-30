"""
Authentication Service
Verifies Google ID tokens, manages users, and issues/validates JWT session tokens
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models.user import User

settings = get_settings()
security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


def verify_google_token(credential: str) -> dict:
    """Validate a Google ID token and return its decoded payload"""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google sign-in is not configured on the server",
        )

    try:
        idinfo = id_token.verify_oauth2_token(
            credential, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token"
        )

    if idinfo.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token issuer"
        )

    return idinfo


def get_or_create_google_user(db: Session, idinfo: dict) -> User:
    """Look up the user tied to this Google account, linking or creating one as needed"""
    google_id = idinfo["sub"]
    email = idinfo["email"]

    user = db.query(User).filter(User.google_id == google_id).first()
    if user:
        return user

    # Link an existing local account with the same email
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.google_id = google_id
        user.auth_provider = "google"
        if idinfo.get("picture"):
            user.picture_url = idinfo["picture"]
        db.commit()
        db.refresh(user)
        return user

    base_username = email.split("@")[0]
    username = base_username
    suffix = 1
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}{suffix}"
        suffix += 1

    user = User(
        email=email,
        username=username,
        hashed_password=None,
        google_id=google_id,
        picture_url=idinfo.get("picture"),
        auth_provider="google",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_access_token(user: User) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_EXPIRE_DAYS)
    payload = {"sub": str(user.id), "email": user.email, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """FastAPI dependency that resolves the caller's User from a bearer JWT"""
    try:
        payload = jwt.decode(credentials.credentials, settings.JWT_SECRET, algorithms=["HS256"])
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Like get_current_user, but returns None instead of raising when no/invalid token is present"""
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, settings.JWT_SECRET, algorithms=["HS256"])
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None
    return db.query(User).filter(User.id == user_id).first()


def create_report_pdf_token(report_id: int, days_valid: int = 30) -> str:
    """
    Signed, login-independent token that authorizes fetching one report's PDF.
    Used for the "View Report" link in emails, which must work without the
    recipient's browser holding a session JWT (e.g. opened on another device).
    """
    expire = datetime.now(timezone.utc) + timedelta(days=days_valid)
    payload = {"report_id": report_id, "purpose": "report_pdf", "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def verify_report_pdf_token(token: str) -> Optional[int]:
    """Returns the report_id a PDF download token authorizes, or None if invalid/expired/wrong purpose"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
    if payload.get("purpose") != "report_pdf":
        return None
    try:
        return int(payload["report_id"])
    except (KeyError, ValueError, TypeError):
        return None


def is_admin_user(user: Optional[User]) -> bool:
    return bool(user and user.email.lower() == settings.ADMIN_EMAIL.lower())


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """FastAPI dependency that only allows the configured admin email through"""
    if not is_admin_user(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access only")
    return current_user
