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
    if request.lifestyle_data_id:
        # Fetch from database
        lifestyle_record = db.query(LifestyleData).filter(
            LifestyleData.id == request.lifestyle_data_id
        ).first()
        
        if not lifestyle_record:
            raise HTTPException(status_code=404, detail="Lifestyle data not found")
        
        # Convert to LifestyleInput for service
        lifestyle_data = LifestyleInput(
            age_range=lifestyle_record.age_range,
            gender=lifestyle_record.gender,
            smoking_status=lifestyle_record.smoking_status,
            activity_level=lifestyle_record.activity_level,
            work_environment=lifestyle_record.work_environment,
            diet_quality=lifestyle_record.diet_quality,
            sleep_hours=lifestyle_record.sleep_hours,
            stress_level=lifestyle_record.stress_level
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
    report_data = health_report_service.generate_report(
        latitude=request.latitude,
        longitude=request.longitude,
        lifestyle_data=lifestyle_data
    )
    
    # Store report in database
    health_report = HealthReport(
        risk_score=report_data["risk_score"],
        risk_level=report_data["risk_level"],
        environmental_risk=report_data["environmental_risk"],
        lifestyle_risk=report_data["lifestyle_risk"],
        combined_risk=report_data["risk_score"],
        contributing_factors=[factor.dict() for factor in report_data["contributing_factors"]],
        health_recommendations=[rec.dict() for rec in report_data["health_recommendations"]],
        report_summary=report_data["report_summary"],
        feature_vector=report_data["feature_vector"],
        version="1.0"
    )
    
    db.add(health_report)
    db.commit()
    db.refresh(health_report)
    
    # Build response
    return HealthReportResponse(
        report_id=health_report.id,
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
        feature_vector=report_data["feature_vector"]
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
