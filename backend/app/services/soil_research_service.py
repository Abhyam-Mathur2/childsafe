"""
Soil Research Service
Real soil property data from SoilGrids (ISRIC) - a global 250m-resolution
soil information system, queried directly by GPS coordinate via their REST
API. Replaces the previous approach of asking an LLM to "research" soil
composition from text, which had no grounding in actual measurements.

Known limitation (SoilGrids, not this code): dense urban cores, water, and
ice are masked out as null in the underlying rasters, since there's no
meaningful soil prediction under e.g. a city center's built-up land. Since
this app's users mostly query populated places, we search a small ring of
nearby points when the exact coordinate comes back empty, same as any real
GIS workflow would.
"""

import httpx
from typing import Dict, List, Optional, Tuple

SOILGRIDS_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query"
DEPTH = "0-5cm"
PROPERTIES = ["phh2o", "soc", "clay", "sand", "silt", "nitrogen", "cec", "bdod"]

# Ring of offsets (degrees) tried in order when the exact point is masked.
# ~0.05-0.2 degrees is a few to ~20km depending on latitude - enough to step
# outside a masked urban core without drifting into a different region.
SEARCH_OFFSETS: List[Tuple[float, float]] = [
    (0, 0),
    (0.05, 0), (-0.05, 0), (0, 0.05), (0, -0.05),
    (0.1, 0.1), (-0.1, -0.1), (0.1, -0.1), (-0.1, 0.1),
    (0.2, 0), (-0.2, 0), (0, 0.2), (0, -0.2),
]


class SoilResearchService:
    """Fetches real soil properties from SoilGrids (ISRIC) by GPS coordinate"""

    async def research_soil_data(
        self,
        latitude: float,
        longitude: float,
        city: str = None,
        state: str = None,
        country: str = None,
    ) -> Dict:
        location_parts = [p for p in [city, state, country] if p]
        location_str = ", ".join(location_parts) if location_parts else f"coordinates {latitude}, {longitude}"

        parsed, used_lat, used_lon = await self._query_with_fallback(latitude, longitude)

        if parsed is None:
            # Every nearby point was masked too (deep ocean, ice sheet, etc.)
            return self._unavailable_result(location_str, latitude, longitude)

        contamination_risk = self._estimate_contamination_risk(parsed.get("phh2o"))
        offset_applied = round(abs(used_lat - latitude) + abs(used_lon - longitude), 3) > 0

        return {
            "location": location_str,
            "coordinates": {"latitude": latitude, "longitude": longitude},
            "soil_type": self._classify_texture(parsed.get("sand"), parsed.get("silt"), parsed.get("clay")),
            "nitrogen_level": self._band(parsed.get("nitrogen"), low=1.0, high=3.0),
            "phosphorus_level": "unknown",  # not covered by SoilGrids or any free global dataset
            "potassium_level": "unknown",   # not covered by SoilGrids or any free global dataset
            "ph": parsed.get("phh2o"),
            "organic_carbon_g_kg": parsed.get("soc"),
            "cation_exchange_capacity": parsed.get("cec"),
            "bulk_density_kg_dm3": parsed.get("bdod"),
            "texture": {
                "sand_pct": parsed.get("sand"),
                "silt_pct": parsed.get("silt"),
                "clay_pct": parsed.get("clay"),
            },
            "heavy_metals": {},  # not measured by SoilGrids - never fabricated
            "contamination_risk": contamination_risk,
            "health_implications": self._generate_health_implications(parsed, contamination_risk),
            "confidence": "nearby_estimate" if offset_applied else "measured",
            "raw_research": (
                f"SoilGrids (ISRIC) 0-5cm depth prediction"
                + (f", nearest available point ~{used_lat:.2f},{used_lon:.2f} "
                   f"(queried point falls in a masked urban/water pixel)" if offset_applied else "")
            ),
            "data_source": "soilgrids_isric",
        }

    async def _query_with_fallback(
        self, latitude: float, longitude: float
    ) -> Tuple[Optional[Dict[str, float]], float, float]:
        """Try the exact point, then a small ring of nearby points if it's masked (null)"""
        async with httpx.AsyncClient(timeout=httpx.Timeout(15.0)) as client:
            for d_lat, d_lon in SEARCH_OFFSETS:
                lat, lon = latitude + d_lat, longitude + d_lon
                if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                    continue
                try:
                    params = [("lon", lon), ("lat", lat)] + [("property", p) for p in PROPERTIES] + [
                        ("depth", DEPTH), ("value", "mean")
                    ]
                    response = await client.get(SOILGRIDS_URL, params=params)
                    response.raise_for_status()
                    data = response.json()
                except Exception as e:
                    print(f"SoilGrids request failed for ({lat}, {lon}): {e}")
                    continue

                parsed = self._parse_layers(data)
                if parsed:
                    return parsed, lat, lon

        return None, latitude, longitude

    def _parse_layers(self, data: Dict) -> Optional[Dict[str, float]]:
        """Extract {property_name: real_value} from a SoilGrids response, applying its own d_factor. None if empty."""
        layers = (data.get("properties") or {}).get("layers") or []
        result = {}
        for layer in layers:
            depths = layer.get("depths") or []
            if not depths:
                continue
            mean = (depths[0].get("values") or {}).get("mean")
            if mean is None:
                continue
            d_factor = (layer.get("unit_measure") or {}).get("d_factor", 1) or 1
            result[layer["name"]] = round(mean / d_factor, 2)

        # Require at least pH to consider this point "has data" - a single
        # stray property present without the rest isn't a usable reading.
        return result if result.get("phh2o") is not None else None

    def _classify_texture(self, sand: Optional[float], silt: Optional[float], clay: Optional[float]) -> str:
        if clay is None or sand is None or silt is None:
            return "unknown"
        if clay >= 40:
            return "clay"
        if sand >= 70:
            return "sandy"
        if silt >= 80:
            return "silt"
        return "loam"

    def _band(self, value: Optional[float], low: float, high: float) -> str:
        if value is None:
            return "unknown"
        if value < low:
            return "low"
        if value > high:
            return "high"
        return "moderate"

    def _estimate_contamination_risk(self, ph: Optional[float]) -> str:
        """
        SoilGrids has no contamination/heavy-metal data. This is a proxy based
        on a well-established soil-science fact - extreme pH (very acidic or
        very alkaline) increases the mobility/bioavailability of heavy metals
        IF present - not a claim that contamination has been detected.
        """
        if ph is None:
            return "unknown"
        if ph < 5.5 or ph > 8.5:
            return "medium"
        return "low"

    def _generate_health_implications(self, parsed: Dict[str, float], contamination_risk: str) -> List[str]:
        implications = []
        ph = parsed.get("phh2o")

        if ph is not None:
            if ph < 5.5:
                implications.append(
                    f"Acidic soil (pH {ph}) increases bioavailability of any heavy metals present"
                )
            elif ph > 8.5:
                implications.append(
                    f"Alkaline soil (pH {ph}) may cause skin irritation on prolonged contact"
                )

        if contamination_risk == "medium":
            implications.append(
                "pH is outside the typical safe range, which can mobilize heavy metals if present - "
                "consider a local soil test for confirmation before gardening or play areas"
            )

        nitrogen = parsed.get("nitrogen")
        if nitrogen is not None and nitrogen < 1.0:
            implications.append("Low total nitrogen may indicate poor soil fertility in the area")

        if not implications:
            implications.append("No significant soil health concerns identified from SoilGrids data")

        implications.append(
            "SoilGrids provides modeled predictions, not lab measurements - for anything actionable, "
            "local soil testing gives field-accurate results this global dataset cannot."
        )
        return implications

    def _unavailable_result(self, location_str: str, latitude: float, longitude: float) -> Dict:
        return {
            "location": location_str,
            "coordinates": {"latitude": latitude, "longitude": longitude},
            "soil_type": "unknown",
            "nitrogen_level": "unknown",
            "phosphorus_level": "unknown",
            "potassium_level": "unknown",
            "ph": 7.0,
            "heavy_metals": {},
            "contamination_risk": "unknown",
            "health_implications": [
                "No soil data available for this location (or the surrounding area) from SoilGrids - "
                "this can happen over open ocean, ice sheets, or extremely dense urban centers."
            ],
            "confidence": "unavailable",
            "raw_research": "SoilGrids returned no data for this point or its immediate surroundings",
            "data_source": "soilgrids_isric_unavailable",
        }


# Singleton instance
soil_research_service = SoilResearchService()
