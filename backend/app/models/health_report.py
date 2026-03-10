"""
Health Report Model
Stores generated health risk reports and recommendations
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class HealthReport(Base):
    __tablename__ = "health_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Risk Assessment
    risk_score = Column(Float, nullable=False)  # 0-100
    risk_level = Column(String, nullable=False)  # low/medium/high
    
    # Contributing Factors
    environmental_risk = Column(Float, nullable=True)
    lifestyle_risk = Column(Float, nullable=True)
    combined_risk = Column(Float, nullable=True)
    
    # Analysis Results
    contributing_factors = Column(JSON, nullable=True)  # List of key risk factors
    health_recommendations = Column(JSON, nullable=True)  # Personalized recommendations
    
    # Report Details
    report_summary = Column(Text, nullable=True)
    environmental_summary = Column(Text, nullable=True)
    lifestyle_summary = Column(Text, nullable=True)
    
    # Feature Vector for ML (future use)
    feature_vector = Column(JSON, nullable=True)  # Numeric features for ML models
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    version = Column(String, default="1.0")  # Report generation version
    
    # Payment status
    is_paid = Column(Integer, default=0) # 0 for unpaid, 1 for paid
    stripe_session_id = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="health_reports")
    
    def __repr__(self):
        return f"<HealthReport id={self.id} risk_level={self.risk_level}>"
