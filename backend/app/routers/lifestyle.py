"""
Lifestyle Router
API endpoints for lifestyle data collection
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.lifestyle import LifestyleInput, LifestyleResponse
from app.services.lifestyle_service import lifestyle_service
from app.database import get_db
from app.models.lifestyle_data import LifestyleData

router = APIRouter()


@router.post("/lifestyle", response_model=LifestyleResponse)
async def submit_lifestyle_data(
    lifestyle: LifestyleInput,
    db: Session = Depends(get_db)
):
    """
    Submit lifestyle data from gamified quiz
    
    Accepts user lifestyle information including age, smoking status,
    activity level, work environment, and optional health behaviors.
    
    Returns calculated lifestyle risk score and personalized feedback.
    """
    # Calculate risk score
    risk_score, risk_factors, positive_factors = lifestyle_service.calculate_lifestyle_risk(lifestyle)
    
    water_src = lifestyle.water_source
    uv_idx = lifestyle.uv_index
    act_dur = lifestyle.activity_duration

    if lifestyle.home_environment:
        if not water_src and 'water_source' in lifestyle.home_environment:
            water_src = lifestyle.home_environment['water_source']
        if uv_idx is None and 'uv_index' in lifestyle.home_environment:
            uv_idx = lifestyle.home_environment['uv_index']
        if not act_dur and 'activity_duration' in lifestyle.home_environment:
            act_dur = lifestyle.home_environment['activity_duration']
            
    # Store lifestyle data in database
    lifestyle_data = LifestyleData(
        name=lifestyle.name,
        years_at_location=lifestyle.years_at_location,
        age_range=lifestyle.age_range.value,
        gender=lifestyle.gender,
        smoking_status=lifestyle.smoking_status.value,
        activity_level=lifestyle.activity_level.value,
        activity_duration=act_dur,
        work_environment=lifestyle.work_environment.value,
        diet_quality=lifestyle.diet_quality,
        sleep_hours=lifestyle.sleep_hours,
        stress_level=lifestyle.stress_level,
        water_source=water_src,
        uv_index=uv_idx,
        medical_history=lifestyle.medical_history,
        home_environment=lifestyle.home_environment,
        quiz_responses=lifestyle.quiz_responses
    )
    
    db.add(lifestyle_data)
    db.commit()
    db.refresh(lifestyle_data)
    
    return LifestyleResponse(
        id=lifestyle_data.id,
        message="Lifestyle data saved successfully",
        lifestyle_risk_score=risk_score,
        risk_factors=risk_factors,
        positive_factors=positive_factors
    )


@router.get("/lifestyle/{lifestyle_id}")
async def get_lifestyle_data(
    lifestyle_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve stored lifestyle data by ID"""
    lifestyle_data = db.query(LifestyleData).filter(LifestyleData.id == lifestyle_id).first()
    
    if not lifestyle_data:
        raise HTTPException(status_code=404, detail="Lifestyle data not found")
    
    return lifestyle_data
