"""
Health Report Service
Combines environmental and lifestyle data to generate comprehensive health reports
"""

from typing import List, Dict, Optional, Any
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
            vulnerability_multiplier = self._calculate_vulnerability_multiplier(
                lifestyle_data, air_quality.data.aqi
            )

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
        
        # Generate detailed sections
        detailed_sections = self._generate_detailed_sections(
            lifestyle_data, air_quality, None,
            lifestyle_data.uv_index if lifestyle_data else None
        )
        
        # Generate report summary
        report_summary = self._generate_report_summary(
            combined_risk, risk_level, env_risk, lifestyle_risk, lifestyle_data
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
            "vulnerability_multiplier": vulnerability_multiplier,
            "short_term_considerations": detailed_sections.get("short_term"),
            "medium_term_considerations": detailed_sections.get("medium_term"),
            "long_term_considerations": detailed_sections.get("long_term"),
            "seasonal_awareness": detailed_sections.get("seasonal_awareness"),
            "daily_pattern_suggestion": detailed_sections.get("daily_pattern"),
            "health_professional_guide": detailed_sections.get("health_professional_guide"),
            "support_resources": detailed_sections.get("support_resources"),
        }
    
    def _calculate_vulnerability_multiplier(self, data: LifestyleInput, aqi: float = 50) -> float:
        """Calculate a multiplier based on age, health, environment, and history"""
        # Start with age-based multiplier
        age_value = data.age_range.value if hasattr(data.age_range, 'value') else data.age_range
        age_multipliers = {
            "0-1": 2.5,    # Newborns - extremely vulnerable
            "1-3": 2.2,    # Infants
            "3-12": 1.8,   # Children - developing systems
            "13-17": 1.3,  # Teens
            "18-25": 1.0,
            "26-35": 1.0,
            "36-50": 1.1,
            "51-65": 1.3,
            "65+": 1.5
        }
        multiplier = age_multipliers.get(age_value, 1.0)
            
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

        # Mental health conditions: +0.15 per condition
        if data.mental_health_conditions:
            multiplier += len(data.mental_health_conditions) * 0.15

        # UV index > 6: +0.2
        if data.uv_index and data.uv_index > 6:
            multiplier += 0.2

        # Water source risk
        if data.water_source:
            ws = data.water_source.lower()
            if ws == "well":
                multiplier += 0.15
            elif ws == "tap":
                multiplier += 0.05

        # High activity in bad air: +0.25
        if data.activity_duration and "90" in str(data.activity_duration) and aqi > 100:
            multiplier += 0.25

        # Chronic exposure years: +0.1 per 5 years, capped at +0.4
        if data.chronic_exposure_years and data.chronic_exposure_years > 5:
            exposure_bonus = min((data.chronic_exposure_years // 5) * 0.1, 0.4)
            multiplier += exposure_bonus

        # Past health reports: if any previous risk_level was "high", add +0.2
        if data.past_health_reports:
            for past_report in data.past_health_reports:
                if isinstance(past_report, dict) and past_report.get("risk_level", "").lower() == "high":
                    multiplier += 0.2
                    break

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
    
    def _generate_detailed_sections(
        self,
        lifestyle_data: Optional[LifestyleInput],
        air_quality: Any,
        weather: Any,
        uv_index: Optional[float]
    ) -> Dict[str, Any]:
        """Generate all new detailed report sections"""
        aqi = air_quality.data.aqi if air_quality else 50
        age_value = ""
        if lifestyle_data:
            age_value = lifestyle_data.age_range.value if hasattr(lifestyle_data.age_range, 'value') else str(lifestyle_data.age_range)

        # Short-term considerations
        short_term = [
            f"Check today's AQI (currently {aqi}) before any outdoor activity",
            "Keep windows closed during peak traffic hours (8-10 AM, 6-8 PM)",
            "Ensure children drink at least 6-8 glasses of filtered water today",
            "Apply SPF 30+ sunscreen if UV index exceeds 3",
        ]
        if aqi > 100:
            short_term.append("AQI is elevated — limit outdoor playtime to under 30 minutes")
            short_term.append("Use N95 masks if outdoor exposure is unavoidable")
        if uv_index and uv_index > 6:
            short_term.append(f"UV index is {uv_index} (High) — avoid direct sun exposure between 11 AM and 3 PM")

        # Medium-term considerations
        medium_term = [
            "Schedule a pediatric check-up to discuss environmental exposure risks",
            "Test home water quality if using tap or well water",
            "Establish a daily indoor air quality monitoring routine",
            "Review and improve home ventilation — check air filters and seals",
        ]
        if lifestyle_data and lifestyle_data.water_source and lifestyle_data.water_source.lower() == "well":
            medium_term.append("Get well water tested for heavy metals and bacterial contamination this month")

        # Long-term considerations
        long_term = [
            "Invest in a HEPA air purifier for the child's bedroom and play area",
            "Consider relocating outdoor activities to lower-pollution zones (parks, green belts)",
            "Build a seasonal health calendar tracking AQI, UV, and pollen patterns",
            "Plan annual comprehensive environmental health assessments",
        ]
        if lifestyle_data and lifestyle_data.chronic_exposure_years and lifestyle_data.chronic_exposure_years > 5:
            long_term.append(f"With {lifestyle_data.chronic_exposure_years} years of exposure, consider a specialist consultation on cumulative environmental impact")

        # Seasonal awareness based on current month
        month = datetime.now().month
        if month in [12, 1, 2]:
            season_name = "Winter"
            season_risks = ["Winter smog and temperature inversions trap pollutants near ground level", "Indoor air quality degrades due to sealed windows and heater use", "Heater fumes (kerosene, wood) release CO and particulate matter"]
            season_tips = ["Use electric heaters instead of fuel-burning ones", "Run air purifiers indoors and ventilate briefly during midday", "Monitor CO levels if using gas heating"]
        elif month in [3, 4, 5]:
            season_name = "Spring"
            season_risks = ["Rising pollen counts trigger allergies and asthma", "UV index begins climbing — skin damage risk increases", "Dust storms possible in arid regions"]
            season_tips = ["Start antihistamines before peak pollen season", "Begin daily sunscreen application routine", "Keep windows closed on high-pollen days"]
        elif month in [6, 7, 8]:
            season_name = "Summer"
            season_risks = ["Heat stress and dehydration — dangerous for children under 5", "Peak UV radiation — highest skin cancer risk", "Ground-level ozone peaks in hot weather"]
            season_tips = ["Schedule outdoor activities before 8 AM or after 6 PM", "Ensure 8+ glasses of water for children daily", "Use UPF-rated clothing and broad-spectrum sunscreen"]
        else:
            season_name = "Autumn"
            season_risks = ["Crop/harvest burning causes severe air quality drops", "Transition weather increases respiratory infection risk", "Falling temperatures may lead to early heater use"]
            season_tips = ["Track regional burning schedules and AQI forecasts", "Boost vitamin D intake as sunlight decreases", "Service heating systems before heavy use"]

        seasonal_awareness = {
            "season": season_name,
            "risks": season_risks,
            "tips": season_tips
        }

        # Daily pattern suggestion
        daily_pattern = {
            "morning": "Best outdoor time 6-8 AM — AQI typically lowest, UV minimal",
            "afternoon": "Avoid outdoor exertion 12-4 PM — peak heat, UV, and ozone levels",
            "evening": "Window ventilation 7-9 PM if AQI < 50; light outdoor walk acceptable"
        }
        if aqi > 100:
            daily_pattern["morning"] = "Even morning outdoor time should be limited — AQI is elevated"
            daily_pattern["evening"] = "Keep windows closed — AQI too high for natural ventilation"

        # Health professional guide
        health_professional_guide = [
            f"Share current AQI level of {aqi} and ask about safe thresholds for your child",
            f"Discuss UV index of {uv_index or 'N/A'} and appropriate skin/eye protection for age group {age_value}",
            "Review the child's respiratory health in context of local air quality patterns",
            "Ask about recommended indoor air quality monitors for your home",
            "Discuss whether current water source requires additional filtration",
        ]
        if lifestyle_data and lifestyle_data.mental_health_conditions:
            health_professional_guide.append(
                f"Discuss how environmental stressors may interact with: {', '.join(lifestyle_data.mental_health_conditions)}"
            )
        if lifestyle_data and lifestyle_data.medical_history:
            health_professional_guide.append(
                f"Review environmental triggers for existing conditions: {', '.join(lifestyle_data.medical_history[:3])}"
            )

        # Support resources
        support_resources = [
            "WHO Air Quality Guidelines: who.int/air-quality",
            "IQAir Real-Time Maps: iqair.com",
            "EPA Indoor Air Quality Guide: epa.gov/indoor-air-quality-iaq",
            "Skin Cancer Foundation UV Guide: skincancer.org",
            "National Institute of Mental Health: nimh.nih.gov",
            "American Academy of Pediatrics: aap.org",
        ]

        return {
            "short_term": short_term,
            "medium_term": medium_term,
            "long_term": long_term,
            "seasonal_awareness": seasonal_awareness,
            "daily_pattern": daily_pattern,
            "health_professional_guide": health_professional_guide,
            "support_resources": support_resources,
        }

    def _generate_report_summary(
        self,
        combined_risk: float,
        risk_level: str,
        env_risk: float,
        lifestyle_risk: float,
        lifestyle_data: Optional[LifestyleInput] = None
    ) -> str:
        """Generate human-readable report summary with age-specific warnings"""
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

        # Age-specific vulnerability warning
        if lifestyle_data:
            age_value = lifestyle_data.age_range.value if hasattr(lifestyle_data.age_range, 'value') else str(lifestyle_data.age_range)
            if age_value in ["0-1", "1-3", "3-12"]:
                summary += "Children under 12 are 2\u20133x more sensitive to environmental pollutants as their organs are still developing. Extra precaution is strongly advised."
            
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