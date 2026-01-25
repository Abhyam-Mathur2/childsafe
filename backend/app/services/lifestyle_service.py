"""
Lifestyle Service
Business logic for lifestyle data analysis
"""

from typing import List, Tuple
from app.schemas.lifestyle import LifestyleInput


class LifestyleService:
    """Service for analyzing lifestyle data and calculating health risks"""
    
    # Risk scoring weights
    SMOKING_SCORES = {
        "never": 0,
        "former": 15,
        "current": 40
    }
    
    ACTIVITY_SCORES = {
        "active": 0,
        "moderate": 10,
        "sedentary": 25
    }
    
    WORK_ENV_SCORES = {
        "outdoor": 5,  # Higher exposure to environmental factors
        "mixed": 3,
        "indoor": 0
    }
    
    STRESS_SCORES = {
        "low": 0,
        "medium": 10,
        "high": 20
    }
    
    def calculate_lifestyle_risk(self, lifestyle: LifestyleInput) -> Tuple[float, List[str], List[str]]:
        """
        Calculate lifestyle-based health risk score
        Returns: (risk_score, risk_factors, positive_factors)
        """
        risk_score = 0
        risk_factors = []
        positive_factors = []
        
        # Smoking assessment
        smoking_risk = self.SMOKING_SCORES.get(lifestyle.smoking_status.value, 0)
        risk_score += smoking_risk
        if smoking_risk == 0:
            positive_factors.append("Non-smoker - excellent respiratory health foundation")
        elif smoking_risk > 30:
            risk_factors.append("Current smoker - significant health risk factor")
        else:
            risk_factors.append("Former smoker - reduced but present health impact")
        
        # Activity level assessment
        activity_risk = self.ACTIVITY_SCORES.get(lifestyle.activity_level.value, 0)
        risk_score += activity_risk
        if activity_risk == 0:
            positive_factors.append("Active lifestyle - strong cardiovascular protection")
        elif activity_risk > 20:
            risk_factors.append("Sedentary lifestyle - increases multiple health risks")
        else:
            positive_factors.append("Moderate activity level - good health maintenance")
        
        # Work environment assessment
        work_risk = self.WORK_ENV_SCORES.get(lifestyle.work_environment.value, 0)
        risk_score += work_risk
        if work_risk > 0:
            risk_factors.append(f"{lifestyle.work_environment.value.capitalize()} work environment - increased environmental exposure")
        
        # Optional factors
        if lifestyle.stress_level:
            stress_risk = self.STRESS_SCORES.get(lifestyle.stress_level, 0)
            risk_score += stress_risk
            if stress_risk > 15:
                risk_factors.append("High stress level - impacts immune system and overall health")
            elif stress_risk > 0:
                risk_factors.append("Moderate stress level - manageable with interventions")
        
        if lifestyle.diet_quality:
            if lifestyle.diet_quality == "good":
                positive_factors.append("Good diet quality - supports immune function")
            elif lifestyle.diet_quality == "poor":
                risk_score += 15
                risk_factors.append("Poor diet quality - affects overall health resilience")
        
        if lifestyle.sleep_hours:
            if lifestyle.sleep_hours == "6-8":
                positive_factors.append("Adequate sleep - supports recovery and immune function")
            elif lifestyle.sleep_hours == "<6":
                risk_score += 15
                risk_factors.append("Insufficient sleep - weakens immune response")
        
        # Age adjustment (older = slightly higher baseline risk)
        age_multiplier = self._get_age_multiplier(lifestyle.age_range.value)
        risk_score *= age_multiplier
        
        return (min(risk_score, 100), risk_factors, positive_factors)
    
    def _get_age_multiplier(self, age_range: str) -> float:
        """Get age-based risk multiplier"""
        multipliers = {
            "13-17": 0.8,
            "18-25": 0.9,
            "26-35": 1.0,
            "36-50": 1.1,
            "51-65": 1.2,
            "65+": 1.3
        }
        return multipliers.get(age_range, 1.0)
    
    def generate_lifestyle_recommendations(
        self,
        lifestyle: LifestyleInput,
        risk_factors: List[str]
    ) -> List[str]:
        """Generate personalized lifestyle recommendations"""
        recommendations = []
        
        if lifestyle.smoking_status.value == "current":
            recommendations.append("Consider smoking cessation programs - single most impactful health improvement")
        
        if lifestyle.activity_level.value in ["sedentary", "moderate"]:
            recommendations.append("Increase physical activity to 150+ minutes weekly - reduces environmental health risks")
        
        if lifestyle.stress_level == "high":
            recommendations.append("Practice stress management techniques - meditation, yoga, or counseling")
        
        if lifestyle.diet_quality == "poor":
            recommendations.append("Improve diet with more fruits, vegetables, and whole grains")
        
        if lifestyle.sleep_hours == "<6":
            recommendations.append("Aim for 7-9 hours of sleep nightly for optimal health")
        
        return recommendations


# Singleton instance
lifestyle_service = LifestyleService()
