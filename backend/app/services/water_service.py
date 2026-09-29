"""
Water Quality Service
Real, GPS-queryable water data via Google Earth Engine:
  - JRC Global Surface Water: is there a river/lake/pond here, and how
    reliably, since 1984 (used to infer likely source type)
  - WRI Aqueduct: basin-level water stress, drought risk, groundwater
    table decline, seasonal reliability

Neither dataset measures water CHEMISTRY (pH, hardness, lead, PFAS, etc.) -
no free global dataset does. Those fields stay honestly "unknown" rather
than being fabricated by an LLM, matching how soil_research_service.py
handles heavy metals it can't measure either.
"""

import random
from typing import Dict, Optional

from app.services import earth_engine_service

# WRI Aqueduct's baseline water stress label -> our low/medium/high scale.
# This reflects water STRESS/SCARCITY risk (real, measured), not chemical
# contamination (which nothing here measures).
_STRESS_LABEL_MAP = {
    "low": "low",
    "low - medium": "low",
    "medium - high": "medium",
    "high": "medium",
    "extremely high": "high",
}


class WaterQualityService:
    """Service for fetching real water context data by GPS coordinate"""

    async def get_water_quality(
        self,
        latitude: float,
        longitude: float,
        city: str = None,
        state: str = None,
        country: str = None,
    ) -> Dict:
        location_parts = [p for p in [city, state, country] if p]
        location_str = ", ".join(location_parts) if location_parts else f"{latitude}, {longitude}"

        if not earth_engine_service.is_available():
            return self._generate_mock_water_data(latitude, longitude, location_str)

        surface_water = earth_engine_service.get_surface_water_history(latitude, longitude)
        water_risk = earth_engine_service.get_water_risk(latitude, longitude)

        if surface_water is None and water_risk is None:
            # EE is configured but returned nothing for this point (rare - open ocean, poles)
            return self._generate_mock_water_data(latitude, longitude, location_str)

        source_type = self._infer_source_type(surface_water)
        contamination_risk = self._stress_to_risk_level(water_risk)
        health_implications = self._build_health_implications(surface_water, water_risk, contamination_risk)

        return {
            "location": location_str,
            "coordinates": {"latitude": latitude, "longitude": longitude},
            "source_type": source_type,
            "ph": None,
            "hardness": None,
            "lead_risk": None,
            "contamination_risk": contamination_risk,
            "health_implications": health_implications,
            "recommendations": self._build_recommendations(contamination_risk, water_risk),
            "confidence": "measured",
            "data_source": "gee_jrc_aqueduct",
            "surface_water": surface_water,
            "water_risk": water_risk,
        }

    def _infer_source_type(self, surface_water: Optional[Dict]) -> str:
        if not surface_water or surface_water.get("occurrence_pct") is None:
            return "Groundwater/Municipal (no significant surface water detected nearby)"
        occurrence = surface_water["occurrence_pct"]
        if occurrence >= 50:
            return "Surface water nearby (permanent river/lake/reservoir)"
        if occurrence >= 10:
            return "Surface water nearby (seasonal river/lake)"
        return "Groundwater/Municipal (minimal surface water detected nearby)"

    def _stress_to_risk_level(self, water_risk: Optional[Dict]) -> str:
        if not water_risk:
            return "unknown"
        raw = (water_risk.get("water_stress_category") or "").strip().lower()
        # Real Aqueduct labels include a percentage range, e.g. "Extremely High
        # (>80%)" - strip that suffix before matching against the plain category.
        category = raw.split("(")[0].strip()
        return _STRESS_LABEL_MAP.get(category, "unknown")

    def _build_health_implications(self, surface_water, water_risk, contamination_risk) -> list:
        implications = []

        if water_risk:
            stress_label = water_risk.get("water_stress_category")
            if stress_label:
                implications.append(
                    f"Baseline water stress in this basin is classified '{stress_label}' (WRI Aqueduct) - "
                    "this reflects supply/demand pressure, not water chemistry"
                )
            drought = water_risk.get("drought_risk_category")
            if drought and drought.lower() not in ("low", "low - medium"):
                implications.append(f"Drought risk for this basin is '{drought}'")
            gtd = water_risk.get("groundwater_decline_category")
            if gtd and gtd.lower() not in ("low", "low - medium"):
                implications.append(f"Groundwater table decline trend is '{gtd}' - a signal for well/borewell reliability")

        if surface_water and surface_water.get("occurrence_pct") is not None:
            implications.append(
                f"Surface water has been present {surface_water['occurrence_pct']:.0f}% of the time at this "
                f"location since 1984 (JRC satellite record)"
            )

        implications.append(
            "No free global dataset measures water chemistry (pH, hardness, lead, PFAS, bacteria) - "
            "for actual water safety, a local lab test or municipal quality report is required"
        )
        return implications

    def _build_recommendations(self, contamination_risk: str, water_risk: Optional[Dict]) -> list:
        recs = ["Get water tested locally for pH, hardness, and contaminants - no global dataset covers this"]
        if contamination_risk in ("medium", "high"):
            recs.append("Given elevated water stress in this basin, keep a backup water storage/filtration plan")
        if water_risk and (water_risk.get("groundwater_decline_category") or "").lower() not in ("low", "low - medium", ""):
            recs.append("If relying on a well/borewell, monitor water table trends locally - regional decline detected")
        return recs

    def _generate_mock_water_data(self, lat, lon, location_str) -> Dict:
        """Used only when Earth Engine isn't configured, or returns nothing for this point"""
        seed = int((abs(lat) + abs(lon)) * 1000)
        random.seed(seed)

        return {
            "location": location_str,
            "coordinates": {"latitude": lat, "longitude": lon},
            "source_type": "Unknown (Earth Engine not configured)",
            "ph": None,
            "hardness": None,
            "lead_risk": None,
            "contamination_risk": "unknown",
            "health_implications": [
                "Real water data requires Google Earth Engine to be configured on the server "
                "(GEE_SERVICE_ACCOUNT_EMAIL + GEE_SERVICE_ACCOUNT_KEY_JSON/FILE) - showing no data rather than a guess"
            ],
            "recommendations": ["Get water tested locally for pH, hardness, and contaminants"],
            "confidence": "unavailable",
            "data_source": "unavailable_gee_not_configured",
        }


water_service = WaterQualityService()
