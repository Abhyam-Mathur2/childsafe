"""
Soil Data Service
Business logic for soil and environmental data
"""

import random
from typing import List
from app.schemas.soil import SoilProperties, SoilDataResponse


class SoilService:
    """Service for fetching and analyzing soil data"""
    
    SOIL_TYPES = ["clay", "sandy", "loam", "silt"]
    
    def get_soil_data(self, latitude: float, longitude: float) -> SoilDataResponse:
        """
        Get soil data for location
        Currently returns mock data - replace with real API in production
        """
        # Generate mock soil properties
        properties = self._generate_mock_soil_properties(latitude, longitude)
        
        # Analyze health impacts
        health_impacts = self._analyze_health_impacts(properties)
        
        # Determine risk level
        risk_level = self._calculate_soil_risk(properties)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(properties, risk_level)
        
        # Get location name
        location_name = self._get_location_name(latitude, longitude)
        
        return SoilDataResponse(
            latitude=latitude,
            longitude=longitude,
            location_name=location_name,
            properties=properties,
            health_impacts=health_impacts,
            risk_level=risk_level,
            recommendations=recommendations,
            data_source="mock"
        )
    
    def _generate_mock_soil_properties(self, lat: float, lon: float) -> SoilProperties:
        """Generate realistic mock soil properties"""
        seed = int((abs(lat) + abs(lon)) * 1000)
        random.seed(seed)
        
        soil_type = random.choice(self.SOIL_TYPES)
        ph = round(random.uniform(5.5, 8.0), 1)
        organic_matter = round(random.uniform(1.0, 6.0), 1)
        
        # Determine contamination risk based on location
        # Higher risk near urban centers (simplified)
        urban_proximity = abs(lat - 40.7) + abs(lon + 74)  # Distance from NYC
        if urban_proximity < 1:
            contamination_risk = random.choice(["medium", "high"])
        else:
            contamination_risk = random.choice(["low", "medium"])
        
        return SoilProperties(
            soil_type=soil_type,
            ph=ph,
            organic_matter=organic_matter,
            contamination_risk=contamination_risk
        )
    
    def _analyze_health_impacts(self, properties: SoilProperties) -> List[str]:
        """Analyze health impacts based on soil properties"""
        impacts = []
        
        # pH impacts
        if 6.0 <= properties.ph <= 7.5:
            impacts.append("Balanced pH supports healthy vegetation and reduces heavy metal mobility")
        elif properties.ph < 6.0:
            impacts.append("Acidic soil may increase heavy metal availability")
        else:
            impacts.append("Alkaline soil may affect nutrient availability")
        
        # Soil type impacts
        soil_impacts = {
            "loam": "Good drainage reduces mosquito breeding and waterborne pathogens",
            "clay": "Poor drainage may increase standing water and vector-borne disease risk",
            "sandy": "Excellent drainage but low nutrient retention",
            "silt": "Moderate drainage with good nutrient retention"
        }
        impacts.append(soil_impacts.get(properties.soil_type, ""))
        
        # Contamination risk
        if properties.contamination_risk == "low":
            impacts.append("Low contamination risk supports safe urban gardening")
        elif properties.contamination_risk == "medium":
            impacts.append("Moderate contamination risk - soil testing recommended before gardening")
        else:
            impacts.append("Elevated contamination risk - professional assessment needed")
        
        return impacts
    
    def _calculate_soil_risk(self, properties: SoilProperties) -> str:
        """Calculate overall soil-related health risk"""
        if properties.contamination_risk == "high":
            return "high"
        elif properties.contamination_risk == "medium" or properties.ph < 5.5:
            return "medium"
        else:
            return "low"
    
    def _generate_recommendations(self, properties: SoilProperties, risk_level: str) -> List[str]:
        """Generate soil-based health recommendations"""
        recommendations = []
        
        if risk_level == "low":
            recommendations.append("Safe for gardening with standard precautions")
            recommendations.append("Wash hands thoroughly after soil contact")
        elif risk_level == "medium":
            recommendations.append("Conduct soil testing before starting edible gardens")
            recommendations.append("Use raised beds with imported soil for food production")
            recommendations.append("Wear gloves when handling soil")
        else:
            recommendations.append("Avoid direct soil contact without protection")
            recommendations.append("Professional remediation assessment recommended")
            recommendations.append("Do not grow edible plants without professional testing")
        
        # pH-specific recommendations
        if properties.ph < 6.0:
            recommendations.append("Consider lime application to reduce acidity if gardening")
        
        return recommendations
    
    def _get_location_name(self, lat: float, lon: float) -> str:
        """Get location name - mock implementation"""
        if 40 <= lat <= 41 and -75 <= lon <= -73:
            return "New York, NY"
        elif 34 <= lat <= 35 and -119 <= lon <= -117:
            return "Los Angeles, CA"
        else:
            return f"Location ({lat:.2f}, {lon:.2f})"


# Singleton instance
soil_service = SoilService()
