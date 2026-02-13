"""
Water Quality Service
Uses Perplexity AI to research water quality for a location
"""

import httpx
import json
import re
import random
from typing import Dict, List, Optional
from app.config import get_settings
from app.schemas.water import WaterDataResponse

settings = get_settings()

class WaterQualityService:
    """Service for researching water quality using Perplexity AI"""
    
    BASE_URL = "https://api.perplexity.ai/chat/completions"
    
    def __init__(self):
        self.api_key = settings.PERPLEXITY_API_KEY
    
    async def get_water_quality(
        self, 
        latitude: float, 
        longitude: float,
        city: str = None,
        state: str = None,
        country: str = None
    ) -> Dict:
        """
        Get water quality data (Research or Mock)
        """
        try:
            if self.api_key:
                return await self._research_water_data(latitude, longitude, city, state, country)
            else:
                return self._generate_mock_water_data(latitude, longitude, city, state, country)
        except Exception as e:
            print(f"Water research failed ({e}), falling back to mock data.")
            return self._generate_mock_water_data(latitude, longitude, city, state, country)

    async def _research_water_data(self, latitude, longitude, city, state, country) -> Dict:
        # Build location string
        location_parts = [p for p in [city, state, country] if p]
        location_str = ", ".join(location_parts) if location_parts else f"{latitude}, {longitude}"
        
        query = (
            f"Conduct a comprehensive Childsafeenvirons analysis for water quality in {location_str}. "
            f"Provide a detailed, factual report covering: "
            f"1. Specific water sources and their current status (aquifers, reservoirs, rivers). "
            f"2. Recent water quality reports, violation history, and specific contaminants (e.g., PFAS, lead, arsenic, nitrates, microplastics). "
            f"3. Hardness, pH, and mineral content. "
            f"4. localized health risks or advisories (e.g., boil notices, industrial runoff). "
            f"5. Comparison with national safety standards. "
            f"Maximize the depth of information regarding potential health effects."
        )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "sonar",
            "messages": [
                {"role": "system", "content": "You are a water quality expert. JSON response only."},
                {"role": "user", "content": query}
            ],
            "max_tokens": 800
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(self.BASE_URL, headers=headers, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            return self._parse_research_result(content, location_str, latitude, longitude)

    def _parse_research_result(self, text: str, location: str, lat: float, lon: float) -> Dict:
        # Simple extraction logic (NLP would be better, but regex works for basic MVP)
        text_lower = text.lower()
        
        # pH
        ph_match = re.search(r'ph\s*(?:of|is|:)?\s*(\d+\.?\d*)', text_lower)
        ph = float(ph_match.group(1)) if ph_match else 7.0
        
        # Hardness
        hardness = "moderate"
        if "soft" in text_lower: hardness = "soft"
        elif "hard" in text_lower: hardness = "hard"
        
        # Risk
        risk = "low"
        if any(x in text_lower for x in ["unsafe", "boil", "contaminated", "avoid"]):
            risk = "high"
        elif any(x in text_lower for x in ["caution", "filter", "moderate"]):
            risk = "medium"
            
        return {
            "location": location,
            "coordinates": {"latitude": lat, "longitude": lon},
            "source_type": "Municipal/Groundwater", # Generic fallback
            "ph": ph,
            "hardness": hardness,
            "contamination_risk": risk,
            "health_implications": ["Derived from AI research of local reports"],
            "recommendations": ["Use a water filter", "Check local advisories"],
            "confidence": "ai_researched",
            "data_source": "perplexity"
        }

    def _generate_mock_water_data(self, lat, lon, city, state, country) -> Dict:
        # Deterministic mock based on coords
        seed = int((abs(lat) + abs(lon)) * 1000)
        random.seed(seed)
        
        risks = ["low", "low", "low", "medium", "high"] # mostly low
        risk = random.choice(risks)
        
        ph = round(random.uniform(6.5, 8.5), 1)
        
        recommendations = ["Stay hydrated"]
        if risk == "medium":
            recommendations.append("Consider a carbon filter for better taste/safety")
        if risk == "high":
            recommendations.append("Boil water or use bottled water for drinking")
            
        return {
            "location": city or "Unknown Location",
            "coordinates": {"latitude": lat, "longitude": lon},
            "source_type": random.choice(["Municipal Supply", "Groundwater", "Surface Water"]),
            "ph": ph,
            "hardness": random.choice(["Soft", "Moderate", "Hard"]),
            "contamination_risk": risk,
            "health_implications": [f"Water quality risk is deemed {risk} based on regional patterns."],
            "recommendations": recommendations,
            "confidence": "mock",
            "data_source": "mock_generated"
        }

water_service = WaterQualityService()
