"""
Health Report Service
Combines environmental and lifestyle data to generate comprehensive health reports
"""

import asyncio
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
from app.services.ai_health_report_service import ai_health_report_service


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

        # ── 1. Air Quality ─────────────────────────────────────────
        try:
            air_quality = await air_quality_service.get_air_quality(latitude, longitude)
        except Exception as e:
            print(f"Air Quality Service Failed: {e}")
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
                    pm_2_5=12.0
                ),
                primary_pollutant="PM2.5",
                risk_level="low",
                health_interpretation="Air quality is acceptable.",
                data_source="mock_fallback"
            )

        # ── 2. Soil & Water (parallel) ─────────────────────────────
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
                return await water_service.get_water_quality(
                    latitude, longitude,
                    city=air_quality.location_name.split(',')[0] if air_quality.location_name else None
                )
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

        soil_data_dict, water_data = await asyncio.gather(
            safe_soil_research(), safe_water_quality()
        )

        # ── 3. Convert dicts → Pydantic models ────────────────────
        water_response = WaterDataResponse(**water_data)

        from app.schemas.soil import SoilProperties
        soil_response = SoilDataResponse(
            latitude=latitude,
            longitude=longitude,
            location_name=soil_data_dict.get("location", "Unknown"),
            properties=SoilProperties(
                soil_type=soil_data_dict.get("soil_type", "unknown"),
                ph=soil_data_dict.get("ph", 7.0) if isinstance(soil_data_dict.get("ph"), (int, float)) else 7.0,
                organic_matter=0.0,
                contamination_risk=soil_data_dict.get("contamination_risk", "unknown")
            ),
            health_impacts=soil_data_dict.get("health_implications", []),
            risk_level=soil_data_dict.get("contamination_risk", "low"),
            recommendations=["Follow local soil safety guidelines"],
            data_source="perplexity_ai"
        )

        # ── 4. Placeholder ambient data ────────────────────────────
        noise_data     = {"level": 55, "risk_score": 10, "source": "Traffic (Est.)"}
        radiation_data = {"level": "Low", "risk_score": 5, "source": "Background"}

        # ── 5. Risk score calculations ─────────────────────────────
        env_risk_base = self._calculate_environmental_risk(air_quality, soil_response, water_response)

        lifestyle_risk          = 0.0
        lifestyle_risk_factors  = []
        lifestyle_positive_factors = []
        vulnerability_multiplier = 1.0

        if lifestyle_data:
            lifestyle_risk, lifestyle_risk_factors, lifestyle_positive_factors = \
                lifestyle_service.calculate_lifestyle_risk(lifestyle_data)
            vulnerability_multiplier = self._calculate_vulnerability_multiplier(
                lifestyle_data, air_quality.data.aqi
            )

        env_risk      = min(env_risk_base * vulnerability_multiplier, 100)
        combined_risk = (env_risk * 0.6) + (lifestyle_risk * 0.4)
        risk_level    = self._get_risk_level(combined_risk)

        # ── 6. Contributing factors & recommendations ──────────────
        contributing_factors = self._generate_contributing_factors(
            air_quality, soil_response, water_response,
            lifestyle_risk_factors, lifestyle_positive_factors, lifestyle_data
        )
        recommendations = self._generate_recommendations(
            air_quality, soil_response, water_response, lifestyle_data, risk_level
        )

        # ── 7. Report summary & feature vector ────────────────────
        report_summary = self._generate_report_summary(
            combined_risk, risk_level, env_risk, lifestyle_risk, lifestyle_data
        )
        feature_vector = self._create_feature_vector(
            air_quality, soil_response, water_response, lifestyle_data
        )

        # ── 8. AI-generated sections (all 12 concurrently) ─────────
        ai_sections = {}
        try:
            ai_sections = await ai_health_report_service.generate(
                air_quality              = air_quality,
                soil_data                = soil_response,
                water_data               = water_response,
                lifestyle_data           = lifestyle_data,
                env_risk                 = env_risk,
                lifestyle_risk           = lifestyle_risk,
                combined_risk            = combined_risk,
                risk_level               = risk_level,
                vulnerability_multiplier = vulnerability_multiplier,
                noise_data               = noise_data,
                radiation_data           = radiation_data,
            )
        except Exception as e:
            print(f"[Health Report] AI generation failed — falling back to static sections: {e}")
            # Graceful fallback: generate static sections so the report still works
            static = self._generate_detailed_sections(
                lifestyle_data, air_quality, None,
                lifestyle_data.uv_index if lifestyle_data else None
            )
            ai_sections = {
                "ai_executive_summary":      {"fallback": True, "overall_narrative": report_summary},
                "ai_air_quality_analysis":   {"fallback": True},
                "ai_water_quality_analysis": {"fallback": True},
                "ai_soil_analysis":          {"fallback": True},
                "ai_personal_vulnerability": {"fallback": True},
                "ai_medical_conditions":     {"fallback": True},
                "ai_noise_radiation":        {"fallback": True},
                "ai_action_plan": {
                    "fallback": True,
                    "this_week":  {"critical_today": static.get("short_term", [])},
                    "this_month": {"home_improvements": static.get("medium_term", [])},
                    "this_year":  {"long_term_exposure_reduction": static.get("long_term", [])},
                },
                "ai_seasonal_daily_guide": {
                    "fallback": True,
                    "current_season": static.get("seasonal_awareness", {}),
                    "daily_schedule": static.get("daily_pattern", {}),
                },
                "ai_doctor_guide": {
                    "fallback": True,
                    "priority_questions": static.get("health_professional_guide", []),
                },
                "ai_mental_health":    {"fallback": True},
                "ai_children_family":  {"fallback": True},
                "ai_meta": {"model": "static_fallback", "sections": 0},
            }

        # ── 9. Build & return final response ───────────────────────
        return {
            # ── Core scores ──────────────────────────────────────
            "environmental_risk":     env_risk,
            "lifestyle_risk":         lifestyle_risk,
            "risk_score":             combined_risk,
            "risk_level":             risk_level,
            "vulnerability_multiplier": vulnerability_multiplier,

            # ── Location ─────────────────────────────────────────
            "latitude":     latitude,
            "longitude":    longitude,
            "location_name": air_quality.location_name,

            # ── Summary & factors ─────────────────────────────────
            "report_summary":         report_summary,
            "contributing_factors":   contributing_factors,
            "health_recommendations": recommendations,

            # ── Ambient ──────────────────────────────────────────
            "noise_data":      noise_data,
            "radiation_data":  radiation_data,

            # ── ML feature vector ─────────────────────────────────
            "feature_vector":  feature_vector,

            # ── AI-generated sections (12 keys) ───────────────────
            **ai_sections,
        }

    # ══════════════════════════════════════════════════════════════
    #  HELPER METHODS  (unchanged from original)
    # ══════════════════════════════════════════════════════════════

    def _calculate_vulnerability_multiplier(self, data: LifestyleInput, aqi: float = 50) -> float:
        age_value = data.age_range.value if hasattr(data.age_range, 'value') else data.age_range
        age_multipliers = {
            "0-1": 2.5, "1-3": 2.2, "3-12": 1.8, "13-17": 1.3,
            "18-25": 1.0, "26-35": 1.0, "36-50": 1.1, "51-65": 1.3, "65+": 1.5
        }
        multiplier = age_multipliers.get(age_value, 1.0)

        if data.medical_history:
            for condition in data.medical_history:
                cl = condition.lower()
                if any(x in cl for x in ["asthma", "copd", "bronchitis", "lung"]):
                    multiplier += 0.4
                elif "heart" in cl or "cardio" in cl:
                    multiplier += 0.3
                elif "allergy" in cl:
                    multiplier += 0.1

        if data.gender and data.gender.lower() == "female" and data.medical_history:
            if any("pregnan" in c.lower() for c in data.medical_history):
                multiplier += 0.4

        if data.mental_health_conditions:
            multiplier += len(data.mental_health_conditions) * 0.15

        if data.uv_index and data.uv_index > 6:
            multiplier += 0.2

        if data.water_source:
            ws = data.water_source.lower()
            if ws == "well":
                multiplier += 0.15
            elif ws == "tap":
                multiplier += 0.05

        if data.activity_duration and "90" in str(data.activity_duration) and aqi > 100:
            multiplier += 0.25

        if data.chronic_exposure_years and data.chronic_exposure_years > 5:
            multiplier += min((data.chronic_exposure_years // 5) * 0.1, 0.4)

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
        air_risk  = min((air_quality.data.aqi / 500) * 100, 100)
        soil_risk = {"low": 10, "medium": 40, "high": 80}.get(
            (soil_data.properties.contamination_risk or "low").lower(), 20
        )
        water_risk = {"low": 10, "medium": 45, "high": 85}.get(
            (water_data.contamination_risk or "low").lower(), 20
        )
        return (air_risk * 0.5) + (soil_risk * 0.25) + (water_risk * 0.25)

    def _get_risk_level(self, risk_score: float) -> str:
        if risk_score < 35:
            return "low"
        elif risk_score < 65:
            return "medium"
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
        factors = []

        if lifestyle_data and air_quality.data.aqi > 100:
            if lifestyle_data.smoking_status.value == "current":
                factors.append(ContributingFactor(
                    category="interaction",
                    factor="CRITICAL INTERACTION: Smoking + High Air Pollution dramatically increases cardiovascular risk.",
                    impact="negative", severity="high"
                ))
            if lifestyle_data.medical_history and any("asthma" in c.lower() for c in lifestyle_data.medical_history):
                factors.append(ContributingFactor(
                    category="interaction",
                    factor="CRITICAL INTERACTION: Asthma + High Air Pollution",
                    impact="negative", severity="high"
                ))

        if air_quality.data.aqi > 100:
            factors.append(ContributingFactor(
                category="environmental",
                factor=f"High AQI ({air_quality.data.aqi}) - Primary pollutant: {air_quality.primary_pollutant}",
                impact="negative", severity="high"
            ))
        elif air_quality.data.aqi > 50:
            factors.append(ContributingFactor(
                category="environmental",
                factor=f"Moderate AQI ({air_quality.data.aqi})",
                impact="negative", severity="medium"
            ))

        if water_data.contamination_risk and water_data.contamination_risk.lower() != "low":
            rv = water_data.contamination_risk.lower()
            factors.append(ContributingFactor(
                category="environmental",
                factor=f"{water_data.contamination_risk.capitalize()} water contamination risk",
                impact="negative",
                severity=rv if rv in ["low", "medium", "high"] else "medium"
            ))

        soil_rv = (soil_data.properties.contamination_risk or "low").lower()
        if soil_rv != "low":
            factors.append(ContributingFactor(
                category="environmental",
                factor=f"{soil_data.properties.contamination_risk.capitalize()} soil contamination risk",
                impact="negative",
                severity=soil_rv if soil_rv in ["low", "medium", "high"] else "medium"
            ))

        for rf in lifestyle_risk_factors[:3]:
            factors.append(ContributingFactor(category="lifestyle", factor=rf, impact="negative", severity="medium"))

        for pf in lifestyle_positive_factors[:3]:
            factors.append(ContributingFactor(category="lifestyle", factor=pf, impact="positive", severity="medium"))

        return factors

    def _generate_recommendations(
        self,
        air_quality: AirQualityResponse,
        soil_data: SoilDataResponse,
        water_data: WaterDataResponse,
        lifestyle_data: Optional[LifestyleInput],
        risk_level: str
    ) -> List[HealthRecommendation]:
        recommendations = []

        if air_quality.data.aqi > 100:
            recommendations.append(HealthRecommendation(
                category="environmental",
                title="Monitor Air Quality Daily",
                description="Check AQI before outdoor activities. Limit exertion when AQI exceeds 100.",
                priority="high"
            ))

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

        if soil_data.properties.contamination_risk in ["medium", "high"]:
            recommendations.append(HealthRecommendation(
                category="environmental",
                title="Soil Safety Precautions",
                description="Wash hands thoroughly after gardening or outdoor activities.",
                priority="medium"
            ))

        if lifestyle_data:
            for rec in lifestyle_service.generate_lifestyle_recommendations(lifestyle_data, [])[:2]:
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
        lifestyle_risk: float,
        lifestyle_data: Optional[LifestyleInput] = None
    ) -> str:
        summary = {
            "low":    "Your overall health risk is low. ",
            "medium": "Your health risk is moderate. ",
            "high":   "Your health risk is elevated. ",
        }.get(risk_level, "")

        if env_risk > lifestyle_risk * 1.5:
            summary += "Environmental factors (Air/Water/Soil) are the primary concern. "
        elif lifestyle_risk > env_risk * 1.5:
            summary += "Lifestyle factors are the primary concern. "
        else:
            summary += "Both environmental and lifestyle factors contribute to your risk. "

        if lifestyle_data:
            age_value = lifestyle_data.age_range.value if hasattr(lifestyle_data.age_range, 'value') else str(lifestyle_data.age_range)
            if age_value in ["0-1", "1-3", "3-12"]:
                summary += "Children under 12 are 2–3x more sensitive to environmental pollutants as their organs are still developing. Extra precaution is strongly advised."

        return summary

    def _create_feature_vector(
        self,
        air_quality: AirQualityResponse,
        soil_data: SoilDataResponse,
        water_data: WaterDataResponse,
        lifestyle_data: Optional[LifestyleInput]
    ) -> Dict[str, float]:
        features = {
            "aqi":        float(air_quality.data.aqi),
            "soil_ph":    soil_data.properties.ph,
            "water_ph":   water_data.ph,
            "water_risk": {"low": 1, "medium": 2, "high": 3}.get(water_data.contamination_risk, 1),
        }
        if lifestyle_data:
            features["smoking"] = 1 if lifestyle_data.smoking_status.value != "never" else 0
        return features

    def _generate_detailed_sections(
        self,
        lifestyle_data: Optional[LifestyleInput],
        air_quality: Any,
        weather: Any,
        uv_index: Optional[float]
    ) -> Dict[str, Any]:
        """
        Static fallback sections used only when the AI service is unavailable.
        """
        aqi = air_quality.data.aqi if air_quality else 50
        age_value = ""
        if lifestyle_data:
            age_value = lifestyle_data.age_range.value if hasattr(lifestyle_data.age_range, 'value') else str(lifestyle_data.age_range)

        short_term = [
            f"Check today's AQI (currently {aqi}) before any outdoor activity",
            "Keep windows closed during peak traffic hours (8-10 AM, 6-8 PM)",
            "Ensure children drink at least 6-8 glasses of filtered water today",
            "Apply SPF 30+ sunscreen if UV index exceeds 3",
        ]
        if aqi > 100:
            short_term += [
                "AQI is elevated — limit outdoor playtime to under 30 minutes",
                "Use N95 masks if outdoor exposure is unavoidable",
            ]
        if uv_index and uv_index > 6:
            short_term.append(f"UV index is {uv_index} (High) — avoid direct sun between 11 AM and 3 PM")

        medium_term = [
            "Schedule a check-up to discuss environmental exposure risks",
            "Test home water quality if using tap or well water",
            "Establish a daily indoor air quality monitoring routine",
            "Review and improve home ventilation",
        ]
        if lifestyle_data and lifestyle_data.water_source and lifestyle_data.water_source.lower() == "well":
            medium_term.append("Get well water tested for heavy metals and bacterial contamination this month")

        long_term = [
            "Invest in a HEPA air purifier for the bedroom and play area",
            "Consider relocating outdoor activities to lower-pollution zones",
            "Build a seasonal health calendar tracking AQI, UV, and pollen patterns",
            "Plan annual comprehensive environmental health assessments",
        ]
        if lifestyle_data and lifestyle_data.chronic_exposure_years and lifestyle_data.chronic_exposure_years > 5:
            long_term.append(
                f"With {lifestyle_data.chronic_exposure_years} years of exposure, consider a specialist consultation"
            )

        month = datetime.now().month
        season_map = {
            (12, 1, 2): ("Winter",
                ["Winter smog traps pollutants at ground level", "Indoor air degrades with sealed windows"],
                ["Use electric heaters", "Ventilate briefly at midday"]),
            (3, 4, 5):  ("Spring",
                ["Rising pollen counts trigger allergies", "UV index begins climbing"],
                ["Start antihistamines before peak pollen", "Begin daily sunscreen routine"]),
            (6, 7, 8):  ("Summer",
                ["Heat stress — dangerous for children under 5", "Peak UV radiation"],
                ["Schedule outdoor activities before 8 AM or after 6 PM", "8+ glasses of water daily"]),
        }
        season_name, season_risks, season_tips = "Autumn", \
            ["Crop burning causes severe AQI drops", "Transition weather raises infection risk"], \
            ["Track burning schedules and AQI forecasts", "Boost vitamin D intake"]

        for months, data in season_map.items():
            if month in months:
                season_name, season_risks, season_tips = data
                break

        daily_pattern = {
            "morning":   "Best outdoor time 6-8 AM — AQI typically lowest, UV minimal",
            "afternoon": "Avoid outdoor exertion 12-4 PM — peak heat, UV, and ozone",
            "evening":   "Window ventilation 7-9 PM if AQI < 50; light outdoor walk acceptable",
        }
        if aqi > 100:
            daily_pattern["morning"] = "Even morning outdoor time should be limited — AQI is elevated"
            daily_pattern["evening"] = "Keep windows closed — AQI too high for natural ventilation"

        health_professional_guide = [
            f"Share current AQI level of {aqi} and ask about safe thresholds",
            f"Discuss UV index of {uv_index or 'N/A'} and appropriate protection for age group {age_value}",
            "Review respiratory health in context of local air quality patterns",
            "Ask about recommended indoor air quality monitors for your home",
            "Discuss whether current water source requires additional filtration",
        ]
        if lifestyle_data and lifestyle_data.mental_health_conditions:
            health_professional_guide.append(
                f"Discuss how environmental stressors may interact with: {', '.join(lifestyle_data.mental_health_conditions)}"
            )
        if lifestyle_data and lifestyle_data.medical_history:
            health_professional_guide.append(
                f"Review environmental triggers for: {', '.join(lifestyle_data.medical_history[:3])}"
            )

        return {
            "short_term": short_term,
            "medium_term": medium_term,
            "long_term": long_term,
            "seasonal_awareness": {"season": season_name, "risks": season_risks, "tips": season_tips},
            "daily_pattern": daily_pattern,
            "health_professional_guide": health_professional_guide,
            "support_resources": [
                "WHO Air Quality Guidelines: who.int/air-quality",
                "IQAir Real-Time Maps: iqair.com",
                "EPA Indoor Air Quality Guide: epa.gov/indoor-air-quality-iaq",
                "Skin Cancer Foundation UV Guide: skincancer.org",
                "National Institute of Mental Health: nimh.nih.gov",
                "American Academy of Pediatrics: aap.org",
            ],
        }


# Singleton instance
health_report_service = HealthReportService()