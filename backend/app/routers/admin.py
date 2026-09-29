"""
Admin CMS Router
Read-only browsing of the database (users, lifestyle data, health reports).
Restricted to the single configured admin email via `require_admin`.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.health_report import HealthReport
from app.models.lifestyle_data import LifestyleData
from app.models.user import User
from app.schemas.admin import (
    AdminHealthReportList,
    AdminHealthReportOut,
    AdminLifestyleList,
    AdminLifestyleOut,
    AdminStats,
    AdminUserList,
    AdminUserOut,
)
from app.services.auth_service import require_admin

router = APIRouter()


def _iso(dt):
    return (dt.isoformat() + "Z") if dt else None


@router.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    return AdminStats(
        total_users=db.query(User).count(),
        total_lifestyle_records=db.query(LifestyleData).count(),
        total_reports=db.query(HealthReport).count(),
        paid_reports=db.query(HealthReport).filter(HealthReport.is_paid == 1).count(),
    )


@router.get("/admin/users", response_model=AdminUserList)
async def list_users(
    limit: int = Query(50, le=200, ge=1),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    total = db.query(User).count()
    users = db.query(User).order_by(User.created_at.desc()).offset(offset).limit(limit).all()

    report_counts = dict(
        db.query(HealthReport.user_id, func.count(HealthReport.id))
        .filter(HealthReport.user_id.isnot(None))
        .group_by(HealthReport.user_id)
        .all()
    )

    return AdminUserList(
        total=total,
        items=[
            AdminUserOut(
                id=u.id,
                email=u.email,
                username=u.username,
                auth_provider=u.auth_provider,
                picture_url=u.picture_url,
                is_active=bool(u.is_active),
                created_at=_iso(u.created_at),
                report_count=report_counts.get(u.id, 0),
            )
            for u in users
        ],
    )


@router.get("/admin/lifestyle", response_model=AdminLifestyleList)
async def list_lifestyle_records(
    limit: int = Query(50, le=200, ge=1),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    total = db.query(LifestyleData).count()
    records = (
        db.query(LifestyleData)
        .order_by(LifestyleData.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    user_emails = dict(db.query(User.id, User.email).all())

    return AdminLifestyleList(
        total=total,
        items=[
            AdminLifestyleOut(
                id=r.id,
                user_id=r.user_id,
                user_email=user_emails.get(r.user_id) if r.user_id else None,
                name=r.name,
                age_range=r.age_range,
                gender=r.gender,
                smoking_status=r.smoking_status,
                activity_level=r.activity_level,
                work_environment=r.work_environment,
                created_at=_iso(r.created_at),
            )
            for r in records
        ],
    )


@router.get("/admin/health-reports", response_model=AdminHealthReportList)
async def list_all_health_reports(
    limit: int = Query(50, le=200, ge=1),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    total = db.query(HealthReport).count()
    reports = (
        db.query(HealthReport)
        .order_by(HealthReport.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    user_emails = dict(db.query(User.id, User.email).all())

    return AdminHealthReportList(
        total=total,
        items=[
            AdminHealthReportOut(
                report_id=r.id,
                user_id=r.user_id,
                user_email=user_emails.get(r.user_id) if r.user_id else None,
                risk_score=r.risk_score,
                risk_level=r.risk_level,
                location_name=r.location_name,
                is_paid=r.is_paid,
                created_at=_iso(r.created_at),
                has_full_data=bool(r.full_report_data),
            )
            for r in reports
        ],
    )
