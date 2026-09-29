"""
Authentication Schemas
Request/response models for Google sign-in and JWT sessions
"""

from pydantic import BaseModel, EmailStr
from typing import Optional


class GoogleAuthRequest(BaseModel):
    """ID token returned by Google Identity Services on the frontend"""
    credential: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str
    picture_url: Optional[str] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
