"""
Lifestyle Data Model
Stores user lifestyle and health behavior information
"""

from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class LifestyleData(Base):
    __tablename__ = "lifestyle_data"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Demographics
    name = Column(String, nullable=True)
    years_at_location = Column(Integer, nullable=True)
    age_range = Column(String, nullable=False)  # 18-25, 26-35, etc.
    gender = Column(String, nullable=True)
    
    # Health Behaviors
    smoking_status = Column(String, nullable=False)  # never/former/current
    activity_level = Column(String, nullable=False)  # sedentary/moderate/active
    work_environment = Column(String, nullable=False)  # indoor/outdoor/mixed
    
    # Additional Lifestyle Factors
    diet_quality = Column(String, nullable=True)  # poor/average/good
    sleep_hours = Column(String, nullable=True)  # <6, 6-8, >8
    stress_level = Column(String, nullable=True)  # low/medium/high

    # Comprehensive Questionnaire Data
    medical_history = Column(JSON, nullable=True)  # List of conditions (asthma, diabetes, etc.)
    medications = Column(JSON, nullable=True)  # List of current medications
    family_history = Column(JSON, nullable=True)  # Family history of diseases
    
    home_environment = Column(JSON, nullable=True)  # floor_level, cooking_method, ventilation, etc.
    occupational_details = Column(JSON, nullable=True)  # Specific job type, hours, chemical exposure
    
    # Metadata
    quiz_responses = Column(JSON, nullable=True)  # Store all quiz answers
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="lifestyle_data")
    
    def __repr__(self):
        return f"<LifestyleData user_id={self.user_id}>"
