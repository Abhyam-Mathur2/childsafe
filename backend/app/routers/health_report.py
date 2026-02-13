"""
Health Report Router
API endpoints for generating health risk reports
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.schemas.health_report import HealthReportRequest, HealthReportResponse
from app.schemas.lifestyle import LifestyleInput
from app.services.health_report_service import health_report_service
from app.database import get_db
from app.models.health_report import HealthReport
from app.models.lifestyle_data import LifestyleData

router = APIRouter()


@router.post("/health-report", response_model=HealthReportResponse)
async def generate_health_report(
    request: HealthReportRequest,
    db: Session = Depends(get_db)
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
            medical_history=lifestyle_record.medical_history
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
        
        if lifestyle_record and hasattr(lifestyle_record, 'user_id'):
            health_report.user_id = lifestyle_record.user_id
            
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

    # Build response
    return HealthReportResponse(
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
        name=lifestyle_record.name if lifestyle_record else None,
        years_at_location=lifestyle_record.years_at_location if lifestyle_record else None,
        sleep_hours=lifestyle_record.sleep_hours if lifestyle_record else None,
        stress_level=lifestyle_record.stress_level if lifestyle_record else None,
        activity_level=get_enum_value(lifestyle_record, 'activity_level') or get_enum_value(lifestyle_data, 'activity_level'),
        age_range=get_enum_value(lifestyle_record, 'age_range') or get_enum_value(lifestyle_data, 'age_range'),
        vulnerability_multiplier=report_data.get("vulnerability_multiplier", 1.0),
        is_paid=is_paid
    )


@router.get("/health-report/{report_id}")
async def get_health_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve previously generated health report"""
    report = db.query(HealthReport).filter(HealthReport.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Health report not found")
    
    return report
