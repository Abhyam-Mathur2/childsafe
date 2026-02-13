"""
Water Quality Schemas
"""

from pydantic import BaseModel
from typing import List, Optional, Dict

class WaterDataRequest(BaseModel):
    latitude: float
    longitude: float

class WaterDataResponse(BaseModel):
    location: str
    coordinates: Dict[str, float]
    
    # Water Properties
    source_type: Optional[str] = None  # Tap, Well, River, etc.
    ph: Optional[float] = None
    hardness: Optional[str] = None # Soft, Moderate, Hard
    lead_risk: Optional[str] = None # Low, Medium, High
    contamination_risk: Optional[str] = None
    
    # Analysis
    health_implications: List[str] = []
    recommendations: List[str] = []
    
    # Metadata
    confidence: str
    data_source: str
