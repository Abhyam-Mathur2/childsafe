"""
Health Report Router
API endpoints for generating health risk reports
"""

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends, Response, Request
from sqlalchemy.orm import Session
from datetime import datetime
from app.schemas.health_report import HealthReportRequest, HealthReportResponse, HealthReportSummary
from app.schemas.lifestyle import LifestyleInput
from app.services.health_report_service import health_report_service
from app.services.email_service import email_service
from app.services.pdf_service import generate_report_pdf
from app.services.auth_service import (
    get_current_user,
    get_current_user_optional,
    is_admin_user,
    create_report_pdf_token,
    verify_report_pdf_token,
)
from app.routers.payments import BYPASS_EMAILS
from app.database import get_db
from app.config import get_settings
from app.models.health_report import HealthReport
from app.models.lifestyle_data import LifestyleData
from app.models.user import User

router = APIRouter()
settings = get_settings()


@router.post("/health-report", response_model=HealthReportResponse)
async def generate_health_report(
    request: HealthReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """
    Generate comprehensive health risk report
    
    Combines environmental data (air quality, soil) with lifestyle data
    to produce a personalized health risk assessment with recommendations.
    
    Parameters:
    - latitude, longitude: Location coordinates
    - lifestyle_data_id: Reference to previously stored lifestyle data (optional)
    - age_range, smoking_status, etc.: Direct lifestyle inputs (alternative to ID)
    """
    # Validate coordinates
    if not -90 <= request.latitude <= 90:
        raise HTTPException(status_code=400, detail="Invalid latitude")
    if not -180 <= request.longitude <= 180:
        raise HTTPException(status_code=400, detail="Invalid longitude")
    
    # Get lifestyle data
    lifestyle_data = None
    lifestyle_record = None
    
    if request.lifestyle_data_id:
        # Fetch from database
        lifestyle_record = db.query(LifestyleData).filter(
            LifestyleData.id == request.lifestyle_data_id
        ).first()
        
        if not lifestyle_record:
            raise HTTPException(status_code=404, detail="Lifestyle data not found")
        
        # Convert to LifestyleInput for service
        lifestyle_data = LifestyleInput(
            name=lifestyle_record.name,
            years_at_location=lifestyle_record.years_at_location,
            age_range=lifestyle_record.age_range,
            gender=lifestyle_record.gender,
            smoking_status=lifestyle_record.smoking_status,
            activity_level=lifestyle_record.activity_level,
            work_environment=lifestyle_record.work_environment,
            diet_quality=lifestyle_record.diet_quality,
            sleep_hours=lifestyle_record.sleep_hours,
            stress_level=lifestyle_record.stress_level,
            medical_history=lifestyle_record.medical_history,
            water_source=lifestyle_record.water_source,
            uv_index=lifestyle_record.uv_index,
            activity_duration=lifestyle_record.activity_duration,
            mental_health_conditions=lifestyle_record.mental_health_conditions,
            past_health_reports=lifestyle_record.past_health_reports,
            chronic_exposure_years=lifestyle_record.chronic_exposure_years,
            family_history=lifestyle_record.family_history,
            home_environment=lifestyle_record.home_environment,
        )
    elif request.age_range and request.smoking_status:
        # Use direct inputs
        lifestyle_data = LifestyleInput(
            age_range=request.age_range,
            smoking_status=request.smoking_status,
            activity_level=request.activity_level or "moderate",
            work_environment=request.work_environment or "indoor"
        )
    
    # Generate report
    try:
        report_data = await health_report_service.generate_report(
            latitude=request.latitude,
            longitude=request.longitude,
            lifestyle_data=lifestyle_data
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Report generation service failed: {str(e)}")
    
    # Database storage variables
    report_id = 0
    is_paid = 0
    
    try:
        # Store report in database
        health_report = HealthReport(
            risk_score=report_data["risk_score"],
            risk_level=report_data["risk_level"],
            environmental_risk=report_data["environmental_risk"],
            lifestyle_risk=report_data["lifestyle_risk"],
            combined_risk=report_data["risk_score"],
            contributing_factors=[factor.dict() if hasattr(factor, 'dict') else factor for factor in report_data["contributing_factors"]],
            health_recommendations=[rec.dict() if hasattr(rec, 'dict') else rec for rec in report_data["health_recommendations"]],
            report_summary=report_data["report_summary"],
            feature_vector=report_data["feature_vector"],
            version="1.0"
        )
        
        if current_user:
            health_report.user_id = current_user.id
        elif lifestyle_record and hasattr(lifestyle_record, 'user_id'):
            health_report.user_id = lifestyle_record.user_id

        health_report.latitude = request.latitude
        health_report.longitude = request.longitude
        health_report.location_name = report_data["location_name"]

        db.add(health_report)
        db.commit()
        db.refresh(health_report)
        report_id = health_report.id
        is_paid = health_report.is_paid
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"ERROR SAVING REPORT: {e}")
        db.rollback()
        # Fallback: report_id remains 0, which frontend should handle
    
    # Safe data extraction for response
    def get_enum_value(obj, attr):
        val = getattr(obj, attr) if obj and hasattr(obj, attr) else None
        return val.value if val and hasattr(val, 'value') else val

    # Pull the deep-dive AI sections (present, possibly as fallback stubs,
    # in both the AI-success and static-fallback paths of generate_report)
    # and derive the legacy flat fields Section 8-12 of the report template
    # expects from them, since generate_report never returns those flat
    # keys directly.
    ai_report_data = {k: v for k, v in report_data.items() if k.startswith("ai_")}
    ai_action_plan = report_data.get("ai_action_plan") or {}
    ai_seasonal = report_data.get("ai_seasonal_daily_guide") or {}
    ai_doctor = report_data.get("ai_doctor_guide") or {}
    ai_mental = report_data.get("ai_mental_health") or {}

    support_resources = None
    mental_resources = ai_mental.get("support_resources")
    if mental_resources:
        support_resources = [
            f"{r.get('resource', 'Resource')}: {r.get('url', '')}" if isinstance(r, dict) else str(r)
            for r in mental_resources
        ]

    # Build response
    response = HealthReportResponse(
        report_id=report_id,
        risk_score=report_data["risk_score"],
        risk_level=report_data["risk_level"],
        environmental_risk=report_data["environmental_risk"],
        lifestyle_risk=report_data["lifestyle_risk"],
        report_summary=report_data["report_summary"],
        contributing_factors=report_data["contributing_factors"],
        health_recommendations=report_data["health_recommendations"],
        latitude=request.latitude,
        longitude=request.longitude,
        location_name=report_data["location_name"],
        generated_at=datetime.utcnow().isoformat() + "Z",
        version="1.0",
        feature_vector=report_data["feature_vector"],
        noise_data=report_data.get("noise_data"),
        radiation_data=report_data.get("radiation_data"),
        emergency_contacts=report_data.get("emergency_contacts"),
        name=lifestyle_record.name if lifestyle_record else None,
        years_at_location=lifestyle_record.years_at_location if lifestyle_record else None,
        sleep_hours=lifestyle_record.sleep_hours if lifestyle_record else None,
        stress_level=lifestyle_record.stress_level if lifestyle_record else None,
        activity_level=get_enum_value(lifestyle_record, 'activity_level') or get_enum_value(lifestyle_data, 'activity_level'),
        age_range=get_enum_value(lifestyle_record, 'age_range') or get_enum_value(lifestyle_data, 'age_range'),
        vulnerability_multiplier=report_data.get("vulnerability_multiplier", 1.0),
        is_paid=is_paid,
        water_source=lifestyle_record.water_source if lifestyle_record else None,
        uv_index=lifestyle_record.uv_index if lifestyle_record else None,
        activity_duration=lifestyle_record.activity_duration if lifestyle_record else None,
        mental_health_conditions=lifestyle_record.mental_health_conditions if lifestyle_record else None,
        past_health_reports=lifestyle_record.past_health_reports if lifestyle_record else None,
        chronic_exposure_years=lifestyle_record.chronic_exposure_years if lifestyle_record else None,
        family_history=lifestyle_record.family_history if lifestyle_record else None,
        home_environment=lifestyle_record.home_environment if lifestyle_record else None,
        short_term_considerations=ai_action_plan.get("this_week", {}).get("critical_today"),
        medium_term_considerations=ai_action_plan.get("this_month", {}).get("home_improvements"),
        long_term_considerations=ai_action_plan.get("this_year", {}).get("long_term_exposure_reduction"),
        seasonal_awareness=ai_seasonal.get("current_season"),
        daily_pattern_suggestion=ai_seasonal.get("daily_schedule"),
        health_professional_guide=ai_doctor.get("priority_questions"),
        support_resources=support_resources,
        ai_report=ai_report_data,
    )

    # Persist the full response so this exact report/PDF can be reopened later
    # without re-running the (geolocation-dependent) generation pipeline
    if report_id:
        try:
            health_report = db.query(HealthReport).filter(HealthReport.id == report_id).first()
            if health_report:
                health_report.full_report_data = response.model_dump(mode="json")
                db.commit()
        except Exception as e:
            print(f"ERROR SAVING FULL REPORT DATA: {e}")
            db.rollback()

    return response


@router.get("/health-reports/mine", response_model=List[HealthReportSummary])
async def get_my_health_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List the current user's previously generated reports, newest first"""
    reports = (
        db.query(HealthReport)
        .filter(HealthReport.user_id == current_user.id)
        .order_by(HealthReport.created_at.desc())
        .all()
    )

    return [
        HealthReportSummary(
            report_id=r.id,
            risk_score=r.risk_score,
            risk_level=r.risk_level,
            location_name=r.location_name,
            created_at=(r.created_at.isoformat() + "Z") if r.created_at else "",
            is_paid=r.is_paid,
        )
        for r in reports
    ]


@router.get("/health-report/{report_id}", response_model=HealthReportResponse)
async def get_health_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reopen a previously generated health report (and its PDF) without regenerating it"""
    report = db.query(HealthReport).filter(HealthReport.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Health report not found")

    if report.user_id != current_user.id and not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="You do not have access to this report")

    if not report.full_report_data:
        raise HTTPException(status_code=404, detail="This report was generated before history support was added and can no longer be reopened")

    # full_report_data is a snapshot taken when the report was first generated,
    # so it still has whatever is_paid value was true at creation time (almost
    # always unpaid). The live is_paid column is what Airpay's callback actually
    # updates - sync it in here, or a paid report keeps showing as locked forever.
    report_data = dict(report.full_report_data)
    report_data["is_paid"] = report.is_paid
    return HealthReportResponse(**report_data)


@router.post("/health-report/{report_id}/email")
async def email_health_report(
    report_id: int,
    http_request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Email the current user's own copy of a previously generated report to themselves, as a PDF"""
    report = db.query(HealthReport).filter(HealthReport.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Health report not found")

    if report.user_id != current_user.id and not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="You do not have access to this report")

    if not report.full_report_data:
        raise HTTPException(status_code=404, detail="This report was generated before history support was added and can no longer be emailed")

    is_bypass = current_user.email.lower() in BYPASS_EMAILS
    if not report.is_paid and not is_bypass and not is_admin_user(current_user):
        raise HTTPException(status_code=402, detail="Unlock this report before emailing it")

    try:
        pdf_bytes = generate_report_pdf(report.full_report_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {e}")

    pdf_token = create_report_pdf_token(report_id)
    api_base = str(http_request.base_url).rstrip("/")
    pdf_url = f"{api_base}/api/health-report/{report_id}/pdf?token={pdf_token}"

    try:
        await email_service.send_health_report_email(
            to_email=current_user.email,
            to_name=current_user.username,
            report=report.full_report_data,
            pdf_url=pdf_url,
            pdf_bytes=pdf_bytes,
            pdf_filename=f"ChildSafeEnviro_Report_{report_id}.pdf",
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to send email: {e}")

    return {"success": True, "sent_to": current_user.email}


@router.get("/health-report/{report_id}/pdf")
async def get_health_report_pdf(
    report_id: int,
    token: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Serve a report as a PDF - either to its logged-in owner/admin, or via a
    signed, login-independent `token` (used by the "View PDF Report" link in
    emails, which must work without a session in that browser).
    """
    report = db.query(HealthReport).filter(HealthReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Health report not found")

    authorized = False
    if current_user and (report.user_id == current_user.id or is_admin_user(current_user)):
        authorized = True
    elif token and verify_report_pdf_token(token) == report_id:
        authorized = True

    if not authorized:
        raise HTTPException(status_code=403, detail="You do not have access to this report")

    if not report.full_report_data:
        raise HTTPException(status_code=404, detail="This report was generated before history support was added and can no longer be rendered")

    pdf_bytes = generate_report_pdf(report.full_report_data)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="ChildSafeEnviro_Report_{report_id}.pdf"'},
    )
