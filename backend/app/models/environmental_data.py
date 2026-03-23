"""
Environmental Data Model
Stores air quality and soil data for locations
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class EnvironmentalData(Base):
    __tablename__ = "environmental_data"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Location data
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String, nullable=True)
    
    # Air Quality Data
    aqi = Column(Integer, nullable=True)
    pm25 = Column(Float, nullable=True)  # PM2.5
    pm10 = Column(Float, nullable=True)  # PM10
    co = Column(Float, nullable=True)    # Carbon Monoxide
    no2 = Column(Float, nullable=True)   # Nitrogen Dioxide
    so2 = Column(Float, nullable=True)   # Sulfur Dioxide
    o3 = Column(Float, nullable=True)    # Ozone
    
    # Soil Data
    soil_type = Column(String, nullable=True)
    soil_ph = Column(Float, nullable=True)
    contamination_risk = Column(String, nullable=True)  # low/medium/high
    
    # Metadata
    data_source = Column(String, default="mock")  # mock/api
    raw_data = Column(JSON, nullable=True)  # Store original API response
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="environmental_data")
    
    def __repr__(self):
        return f"<EnvironmentalData {self.latitude},{self.longitude}>"
