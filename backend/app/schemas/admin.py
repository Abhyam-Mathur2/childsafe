"""
Admin CMS Schemas
Read-only views over the users / lifestyle_data / health_reports tables
"""

from typing import List, Optional
from pydantic import BaseModel


class AdminUserOut(BaseModel):
    id: int
    email: str
    username: str
    auth_provider: str
    picture_url: Optional[str] = None
    is_active: bool
    created_at: Optional[str] = None
    report_count: int = 0


class AdminUserList(BaseModel):
    total: int
    items: List[AdminUserOut]


class AdminLifestyleOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    name: Optional[str] = None
    age_range: Optional[str] = None
    gender: Optional[str] = None
    smoking_status: Optional[str] = None
    activity_level: Optional[str] = None
    work_environment: Optional[str] = None
    created_at: Optional[str] = None


class AdminLifestyleList(BaseModel):
    total: int
    items: List[AdminLifestyleOut]


class AdminHealthReportOut(BaseModel):
    report_id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    risk_score: float
    risk_level: str
    location_name: Optional[str] = None
    is_paid: int = 0
    created_at: Optional[str] = None
    has_full_data: bool = False


class AdminHealthReportList(BaseModel):
    total: int
    items: List[AdminHealthReportOut]


class AdminStats(BaseModel):
    total_users: int
    total_lifestyle_records: int
    total_reports: int
    paid_reports: int
