"""
Health Report Service
Combines environmental and lifestyle data to generate comprehensive health reports
"""

from typing import List, Dict, Optional
from datetime import datetime
from app.schemas.health_report import (
    ContributingFactor,
    HealthRecommendation,
    HealthReportResponse
)
from app.schemas.air_quality import AirQualityResponse
from app.schemas.soil import SoilDataResponse
from app.schemas.water import WaterDataResponse
from app.schemas.lifestyle import LifestyleInput
from app.services.air_quality_service import air_quality_service
from app.services.perplexity_soil_service import perplexity_soil_service as soil_service
from app.services.water_service import water_service
from app.services.lifestyle_service import lifestyle_service


class HealthReportService:
    """Service for generating comprehensive health risk reports"""
    
    async def generate_report(
        self,
        latitude: float,
        longitude: float,
        lifestyle_data: Optional[LifestyleInput] = None
    ) -> Dict:
        """
        Generate comprehensive health report combining all data sources
        """
        # Fetch environmental data
        # Note: In a real async app, we'd gather these concurrently
        # Get location details first for better research context
        # Fetch environmental data with error handling
        # Note: In a real async app, we'd gather these concurrently
        
        # 1. Air Quality
        try:
            air_quality = await air_quality_service.get_air_quality(latitude, longitude)
        except Exception as e:
            print(f"Air Quality Service Failed: {e}")
            # Mock Fallback
            from app.schemas.air_quality import AirQualityResponse, AirQualityData
            air_quality = AirQualityResponse(
                latitude=latitude,
                longitude=longitude,
                location_name="Unknown Location",
                data=AirQualityData(
                    aqi=50,
                    pm25=12.0,
                    pm10=20.0,
                    no2=10.0,
                    so2=5.0,
                    co=2.0,
                    o3=30.0,
                    pm_2_5=12.0 # Alias handling if needed, but schema uses pm25
                ),
                primary_pollutant="PM2.5",
                risk_level="low",
                health_interpretation="Air quality is acceptable.",
                data_source="mock_fallback"
            )

        # Parallel fetch for Soil and Water using Perplexity
        # Both invoke Perplexity API so parallel execution is better
        import asyncio
        
        # Define wrapper functions to handle individual failures in gather
        async def safe_soil_research():
            try:
                return await soil_service.research_soil_data(
                    latitude, longitude, 
                    city=air_quality.location_name.split(',')[0] if air_quality.location_name else None
                )
            except Exception as e:
                print(f"Soil Service Failed: {e}")
                return {
                    "location": "Unknown",
                    "soil_type": "Unknown",
                    "ph": 7.0,
                    "contamination_risk": "low",
                    "health_implications": ["Data unavailable"],
                    "confidence": "low",
                    "data_source": "mock_fallback"
                }

        async def safe_water_quality():
            try:
                return await water_service.get_water_quality(latitude, longitude, city=air_quality.location_name.split(',')[0] if air_quality.location_name else None)
            except Exception as e:
                print(f"Water Service Failed: {e}")
                return {
                    "location": "Unknown",
                    "coordinates": {"latitude": latitude, "longitude": longitude},
                    "source_type": "Unknown",
                    "ph": 7.0,
                    "hardness": "moderate",
                    "lead_risk": "low",
                    "contamination_risk": "low",
                    "health_implications": ["Data unavailable"],
                    "recommendations": ["Use standard water filters"],
                    "confidence": "low",
                    "data_source": "mock_fallback"
                }

        soil_task = safe_soil_research()
        water_task = safe_water_quality()
        
        soil_data_dict, water_data = await asyncio.gather(soil_task, water_task)
        
        # Convert dicts to Pydantic models
        water_response = WaterDataResponse(**water_data)
        # Handle Soil Data (which is now a dict from PerplexityService, need to adapt to SoilDataResponse)
        # The SoilDataResponse expects `properties` sub-object, but PerplexityService returns a flat dict with some keys.
        # We need a small adapter here or update the schema.
        # Let's adapt it to the existing SoilDataResponse structure to avoid breaking schemas.
        from app.schemas.soil import SoilProperties
        
        soil_response = SoilDataResponse(
            latitude=latitude,
            longitude=longitude,
            location_name=soil_data_dict.get("location", "Unknown"),
            properties=SoilProperties(
                soil_type=soil_data_dict.get("soil_type", "unknown"),
                ph=soil_data_dict.get("ph", 7.0) if isinstance(soil_data_dict.get("ph"), (int, float)) else 7.0,
                organic_matter=0.0, # Estimation not provided by Perplexity usually
                contamination_risk=soil_data_dict.get("contamination_risk", "unknown")
            ),
            health_impacts=soil_data_dict.get("health_implications", []),
            risk_level=soil_data_dict.get("contamination_risk", "low"), # Simplified mapping
            recommendations=["Follow local soil safety guidelines"], # Generic fallback
            data_source="perplexity_ai"
        )
        
        # Placeholder for Noise and Radiation (Future integrations)
        noise_data = {"level": 55, "risk_score": 10, "source": "Traffic (Est.)"}
        radiation_data = {"level": "Low", "risk_score": 5, "source": "Background"}

        # Calculate environmental risk score
        env_risk_base = self._calculate_environmental_risk(air_quality, soil_response, water_response)
        
        # Calculate lifestyle risk score
        lifestyle_risk = 0
        lifestyle_risk_factors = []
        lifestyle_positive_factors = []
        vulnerability_multiplier = 1.0
        
        if lifestyle_data:
            lifestyle_risk, lifestyle_risk_factors, lifestyle_positive_factors = \
                lifestyle_service.calculate_lifestyle_risk(lifestyle_data)
            
            # Calculate personal vulnerability multiplier
            vulnerability_multiplier = self._calculate_vulnerability_multiplier(lifestyle_data)

        # Apply multiplier to environmental risk (vulnerable people suffer more from environment)
        env_risk = min(env_risk_base * vulnerability_multiplier, 100)

        # Calculate combined risk score
        # Weight: 60% environmental (adjusted), 40% lifestyle
        combined_risk = (env_risk * 0.6) + (lifestyle_risk * 0.4)
        
        # Determine overall risk level
        risk_level = self._get_risk_level(combined_risk)
        
        # Generate contributing factors
        contributing_factors = self._generate_contributing_factors(
            air_quality, soil_response, water_response, lifestyle_risk_factors, lifestyle_positive_factors, lifestyle_data
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            air_quality, soil_response, water_response, lifestyle_data, risk_level
        )
        
        # Generate report summary
        report_summary = self._generate_report_summary(
            combined_risk, risk_level, env_risk, lifestyle_risk
        )
        
        # Create feature vector for future ML
        feature_vector = self._create_feature_vector(
            air_quality, soil_response, water_response, lifestyle_data
        )
        
        return {
            "environmental_risk": env_risk,
            "lifestyle_risk": lifestyle_risk,
            "risk_score": combined_risk,
            "risk_level": risk_level,
            "report_summary": report_summary,
            "contributing_factors": contributing_factors,
            "health_recommendations": recommendations,
            "latitude": latitude,
            "longitude": longitude,
            "location_name": air_quality.location_name,
            "feature_vector": feature_vector,
            "noise_data": noise_data,
            "radiation_data": radiation_data,
            "vulnerability_multiplier": vulnerability_multiplier
        }
    
    def _calculate_vulnerability_multiplier(self, data: LifestyleInput) -> float:
        """Calculate a multiplier (e.g., 1.0 to 2.0) based on health status"""
        multiplier = 1.0
        
        # Age Factor
        age_value = data.age_range.value if hasattr(data.age_range, 'value') else data.age_range
        
        if age_value in ["51-65", "65+"]:
            multiplier += 0.2
        elif age_value in ["13-17"]:
            multiplier += 0.1 # Developing bodies
            
        # Respiratory Issues (High impact on Air Quality risk)
        if data.medical_history:
            for condition in data.medical_history:
                condition_lower = condition.lower()
                if any(x in condition_lower for x in ["asthma", "copd", "bronchitis", "lung"]):
                    multiplier += 0.4
                elif "heart" in condition_lower or "cardio" in condition_lower:
                    multiplier += 0.3
                elif "allergy" in condition_lower:
                    multiplier += 0.1
                    
        # Pregnancy
        if data.gender and data.gender.lower() == "female" and data.medical_history:
             if any("pregnan" in c.lower() for c in data.medical_history):
                 multiplier += 0.4

        return round(multiplier, 2)

    def _calculate_environmental_risk(
        self,
        air_quality: AirQualityResponse,
        soil_data: SoilDataResponse,
        water_data: WaterDataResponse
    ) -> float:
        """Calculate environmental risk score (0-100)"""
        # Air: 50%, Soil: 25%, Water: 25%
        air_risk = min((air_quality.data.aqi / 500) * 100, 100)
        
        soil_risk_map = {"low": 10, "medium": 40, "high": 80}
        soil_risk_val = soil_data.properties.contamination_risk.lower() if soil_data.properties.contamination_risk else "low"
        soil_risk = soil_risk_map.get(soil_risk_val, 20)
        
        water_risk_map = {"low": 10, "medium": 45, "high": 85}
        water_risk_val = water_data.contamination_risk.lower() if water_data.contamination_risk else "low"
        water_risk = water_risk_map.get(water_risk_val, 20)
        
        return (air_risk * 0.5) + (soil_risk * 0.25) + (water_risk * 0.25)
    
    def _get_risk_level(self, risk_score: float) -> str:
        """Convert risk score to categorical level"""
        if risk_score < 35:
            return "low"
        elif risk_score < 65:
            return "medium"
        else:
            return "high"
    
    def _generate_contributing_factors(
        self,
        air_quality: AirQualityResponse,
        soil_data: SoilDataResponse,
        water_data: WaterDataResponse,
        lifestyle_risk_factors: List[str],
        lifestyle_positive_factors: List[str],
        lifestyle_data: Optional[LifestyleInput] = None
    ) -> List[ContributingFactor]:
        """Generate list of contributing factors including synergistic risks"""
        factors = []
        
        # Synergistic/Interaction Risks
        if lifestyle_data and air_quality.data.aqi > 100:
            if lifestyle_data.smoking_status.value == "current":
                factors.append(ContributingFactor(
                    category="interaction",
                    factor="CRITICAL INTERACTION: Smoking + High Air Pollution dramatically increases cardiovascular risk.",
                    impact="negative",
                    severity="high"
                ))
            if lifestyle_data.medical_history and any("asthma" in c.lower() for c in lifestyle_data.medical_history):
                factors.append(ContributingFactor(
                    category="interaction",
                    factor="CRITICAL INTERACTION: Asthma + High Air Pollution",
                    impact="negative",
                    severity="high"
                ))
        
        # Air quality factors
        if air_quality.data.aqi > 100:
            factors.append(ContributingFactor(
                category="environmental",
                factor=f"High AQI ({air_quality.data.aqi}) - Primary pollutant: {air_quality.primary_pollutant}",
                impact="negative",
                severity="high"
            ))
        elif air_quality.data.aqi > 50:
            factors.append(ContributingFactor(
                category="environmental",
                factor=f"Moderate AQI ({air_quality.data.aqi})",
                impact="negative",
                severity="medium"
            ))
        
        # Water factors
        if water_data.contamination_risk and water_data.contamination_risk.lower() != "low":
            risk_val = water_data.contamination_risk.lower()
            factors.append(ContributingFactor(
                category="environmental",
                factor=f"{water_data.contamination_risk.capitalize()} water contamination risk",
                impact="negative",
                severity=risk_val if risk_val in ["low", "medium", "high"] else "medium"
            ))
        
        # Soil contamination
        soil_risk_val = soil_data.properties.contamination_risk.lower() if soil_data.properties.contamination_risk else "low"
        if soil_risk_val != "low":
            factors.append(ContributingFactor(
                category="environmental",
                factor=f"{soil_data.properties.contamination_risk.capitalize()} soil contamination risk",
                impact="negative",
                severity=soil_risk_val if soil_risk_val in ["low", "medium", "high"] else "medium"
            ))
        
        # Lifestyle negative factors
        for risk_factor in lifestyle_risk_factors[:3]:  # Top 3
            factors.append(ContributingFactor(
                category="lifestyle",
                factor=risk_factor,
                impact="negative",
                severity="medium"
            ))
        
        # Lifestyle positive factors
        for positive_factor in lifestyle_positive_factors[:3]:  # Top 3
            factors.append(ContributingFactor(
                category="lifestyle",
                factor=positive_factor,
                impact="positive",
                severity="medium"
            ))
        
        return factors
    
    def _generate_recommendations(
        self,
        air_quality: AirQualityResponse,
        soil_data: SoilDataResponse,
        water_data: WaterDataResponse,
        lifestyle_data: Optional[LifestyleInput],
        risk_level: str
    ) -> List[HealthRecommendation]:
        """Generate personalized health recommendations"""
        recommendations = []
        
        # Air quality recommendations
        if air_quality.data.aqi > 100:
            recommendations.append(HealthRecommendation(
                category="environmental",
                title="Monitor Air Quality Daily",
                description="Check AQI before outdoor activities. Limit exertion when AQI exceeds 100.",
                priority="high"
            ))
        
        # Water recommendations
        if water_data.contamination_risk in ["medium", "high"]:
            recommendations.append(HealthRecommendation(
                category="environmental",
                title="Water Safety",
                description="Consider using a certified water filter or drinking bottled water.",
                priority="high" if water_data.contamination_risk == "high" else "medium"
            ))
        elif water_data.hardness == "hard":
             recommendations.append(HealthRecommendation(
                category="environmental",
                title="Hard Water Care",
                description="Your water is hard. Use moisturizers to prevent skin dryness.",
                priority="low"
            ))
            
        # Soil recommendations
        if soil_data.properties.contamination_risk in ["medium", "high"]:
            recommendations.append(HealthRecommendation(
                category="environmental",
                title="Soil Safety Precautions",
                description="Wash hands thoroughly after gardening or outdoor activities.",
                priority="medium"
            ))
        
        # Lifestyle recommendations
        if lifestyle_data:
            lifestyle_recs = lifestyle_service.generate_lifestyle_recommendations(
                lifestyle_data,
                []
            )
            for rec in lifestyle_recs[:2]:  # Top 2
                recommendations.append(HealthRecommendation(
                    category="lifestyle",
                    title="Lifestyle Improvement",
                    description=rec,
                    priority="medium"
                ))
        
        return recommendations
    
    def _generate_report_summary(
        self,
        combined_risk: float,
        risk_level: str,
        env_risk: float,
        lifestyle_risk: float
    ) -> str:
        """Generate human-readable report summary"""
        summaries = {
            "low": "Your overall health risk is low. ",
            "medium": "Your health risk is moderate. ",
            "high": "Your health risk is elevated. "
        }
        
        summary = summaries.get(risk_level, "")
        
        if env_risk > lifestyle_risk * 1.5:
            summary += "Environmental factors (Air/Water/Soil) are the primary concern. "
        elif lifestyle_risk > env_risk * 1.5:
            summary += "Lifestyle factors are the primary concern. "
        else:
            summary += "Both environmental and lifestyle factors contribute to your risk. "
            
        return summary
    
    def _create_feature_vector(
        self,
        air_quality: AirQualityResponse,
        soil_data: SoilDataResponse,
        water_data: WaterDataResponse,
        lifestyle_data: Optional[LifestyleInput]
    ) -> Dict[str, float]:
        """Create numeric feature vector for future ML models"""
        features = {
            "aqi": float(air_quality.data.aqi),
            "soil_ph": soil_data.properties.ph,
            "water_ph": water_data.ph,
            "water_risk": {"low": 1, "medium": 2, "high": 3}.get(water_data.contamination_risk, 1)
        }
        
        if lifestyle_data:
            features["smoking"] = 1 if lifestyle_data.smoking_status.value != "never" else 0
            
        return features


# Singleton instance
health_report_service = HealthReportService()