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
from app.schemas.lifestyle import LifestyleInput
from app.services.air_quality_service import air_quality_service
from app.services.soil_service import soil_service
from app.services.lifestyle_service import lifestyle_service


class HealthReportService:
    """Service for generating comprehensive health risk reports"""
    
    def generate_report(
        self,
        latitude: float,
        longitude: float,
        lifestyle_data: Optional[LifestyleInput] = None
    ) -> Dict:
        """
        Generate comprehensive health report combining all data sources
        """
        # Fetch environmental data
        air_quality = air_quality_service.get_air_quality(latitude, longitude)
        soil_data = soil_service.get_soil_data(latitude, longitude)
        
        # Calculate environmental risk score
        env_risk = self._calculate_environmental_risk(air_quality, soil_data)
        
        # Calculate lifestyle risk score
        lifestyle_risk = 0
        lifestyle_risk_factors = []
        lifestyle_positive_factors = []
        
        if lifestyle_data:
            lifestyle_risk, lifestyle_risk_factors, lifestyle_positive_factors = \
                lifestyle_service.calculate_lifestyle_risk(lifestyle_data)
        
        # Calculate combined risk score
        # Weight: 60% environmental, 40% lifestyle
        combined_risk = (env_risk * 0.6) + (lifestyle_risk * 0.4)
        
        # Determine overall risk level
        risk_level = self._get_risk_level(combined_risk)
        
        # Generate contributing factors
        contributing_factors = self._generate_contributing_factors(
            air_quality, soil_data, lifestyle_risk_factors, lifestyle_positive_factors
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            air_quality, soil_data, lifestyle_data, risk_level
        )
        
        # Generate report summary
        report_summary = self._generate_report_summary(
            combined_risk, risk_level, env_risk, lifestyle_risk
        )
        
        # Create feature vector for future ML
        feature_vector = self._create_feature_vector(
            air_quality, soil_data, lifestyle_data
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
            "feature_vector": feature_vector
        }
    
    def _calculate_environmental_risk(
        self,
        air_quality: AirQualityResponse,
        soil_data: SoilDataResponse
    ) -> float:
        """Calculate environmental risk score (0-100)"""
        # Air quality contributes 70% of environmental risk
        air_risk = min((air_quality.data.aqi / 500) * 100, 100)
        
        # Soil contamination contributes 30%
        soil_risk_map = {"low": 10, "medium": 40, "high": 80}
        soil_risk = soil_risk_map.get(soil_data.properties.contamination_risk, 20)
        
        return (air_risk * 0.7) + (soil_risk * 0.3)
    
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
        lifestyle_risk_factors: List[str],
        lifestyle_positive_factors: List[str]
    ) -> List[ContributingFactor]:
        """Generate list of contributing factors"""
        factors = []
        
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
        
        # PM2.5 specific
        if air_quality.data.pm25 > 35:
            factors.append(ContributingFactor(
                category="environmental",
                factor=f"Elevated PM2.5 levels ({air_quality.data.pm25} μg/m³)",
                impact="negative",
                severity="medium"
            ))
        
        # Soil contamination
        if soil_data.properties.contamination_risk != "low":
            factors.append(ContributingFactor(
                category="environmental",
                factor=f"{soil_data.properties.contamination_risk.capitalize()} soil contamination risk",
                impact="negative",
                severity=soil_data.properties.contamination_risk
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
                description="Check AQI before outdoor activities. Limit exertion when AQI exceeds 100. Consider air purifiers indoors.",
                priority="high"
            ))
        elif air_quality.data.aqi > 50:
            recommendations.append(HealthRecommendation(
                category="environmental",
                title="Air Quality Awareness",
                description="Monitor daily air quality and adjust outdoor activities accordingly. Sensitive individuals should be cautious.",
                priority="medium"
            ))
        
        # PM2.5 specific
        if air_quality.data.pm25 > 25:
            recommendations.append(HealthRecommendation(
                category="environmental",
                title="Reduce PM2.5 Exposure",
                description="Wear N95 masks during high pollution days. Keep windows closed when outdoor AQI is elevated.",
                priority="high"
            ))
        
        # Soil recommendations
        if soil_data.properties.contamination_risk in ["medium", "high"]:
            recommendations.append(HealthRecommendation(
                category="environmental",
                title="Soil Safety Precautions",
                description=soil_data.recommendations[0] if soil_data.recommendations else "Test soil before gardening",
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
        
        # General recommendation
        recommendations.append(HealthRecommendation(
            category="general",
            title="Regular Health Checkups",
            description="Schedule annual checkups to monitor impact of environmental exposures on your health.",
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
            "high": "Your health risk is elevated and requires attention. "
        }
        
        summary = summaries.get(risk_level, "")
        
        # Add primary driver
        if env_risk > lifestyle_risk * 1.5:
            summary += "Environmental factors are the primary concern. "
        elif lifestyle_risk > env_risk * 1.5:
            summary += "Lifestyle factors are the primary concern. "
        else:
            summary += "Both environmental and lifestyle factors contribute to your risk. "
        
        # Add positive note if applicable
        if lifestyle_risk < 30:
            summary += "Your healthy lifestyle choices help mitigate environmental risks."
        elif env_risk < 30:
            summary += "Good environmental conditions support your health despite lifestyle considerations."
        
        return summary
    
    def _create_feature_vector(
        self,
        air_quality: AirQualityResponse,
        soil_data: SoilDataResponse,
        lifestyle_data: Optional[LifestyleInput]
    ) -> Dict[str, float]:
        """Create numeric feature vector for future ML models"""
        features = {
            # Environmental features
            "aqi": float(air_quality.data.aqi),
            "pm25": air_quality.data.pm25,
            "pm10": air_quality.data.pm10,
            "co": air_quality.data.co,
            "no2": air_quality.data.no2,
            "so2": air_quality.data.so2,
            "o3": air_quality.data.o3,
            "soil_ph": soil_data.properties.ph,
            "soil_contamination": {"low": 1, "medium": 2, "high": 3}.get(
                soil_data.properties.contamination_risk, 1
            )
        }
        
        # Lifestyle features (if available)
        if lifestyle_data:
            features.update({
                "smoking": {"never": 0, "former": 1, "current": 2}.get(
                    lifestyle_data.smoking_status.value, 0
                ),
                "activity": {"active": 2, "moderate": 1, "sedentary": 0}.get(
                    lifestyle_data.activity_level.value, 1
                ),
                "work_outdoor_exposure": {"outdoor": 2, "mixed": 1, "indoor": 0}.get(
                    lifestyle_data.work_environment.value, 0
                )
            })
        
        return features


# Singleton instance
health_report_service = HealthReportService()
