"""
Google Earth Engine Service
Real, GPS-queryable global water data:
  - JRC Global Surface Water (occurrence/seasonality/recurrence history of
    surface water - rivers, lakes, ponds - at 30m resolution since 1984)
  - WRI Aqueduct (basin-level water stress, drought risk, groundwater
    decline, seasonal variability)

Requires a Google Earth Engine-enabled service account. Without one
configured, `is_available()` returns False and callers should fall back to
their own mock/estimate path - this service never fabricates data.
"""

import json
from functools import lru_cache
from typing import Any, Dict, Optional

from app.config import get_settings

settings = get_settings()

JRC_SURFACE_WATER_ASSET = "JRC/GSW1_4/GlobalSurfaceWater"
AQUEDUCT_ASSET = "WRI/Aqueduct_Water_Risk/V4/baseline_annual"

_initialized = False
_init_failed = False


def _initialize() -> bool:
    """Lazily authenticate with Earth Engine using the configured service account. Cached after first attempt."""
    global _initialized, _init_failed
    if _initialized:
        return True
    if _init_failed:
        return False

    try:
        import ee
    except ImportError:
        print("[EarthEngine] earthengine-api not installed")
        _init_failed = True
        return False

    key_json = settings.GEE_SERVICE_ACCOUNT_KEY_JSON
    key_file = settings.GEE_SERVICE_ACCOUNT_KEY_FILE
    account_email = settings.GEE_SERVICE_ACCOUNT_EMAIL

    if not account_email or not (key_json or key_file):
        # Not configured - this is expected until a service account is set up.
        _init_failed = True
        return False

    try:
        if key_json:
            key_data = json.loads(key_json)
            credentials = ee.ServiceAccountCredentials(account_email, key_data=json.dumps(key_data))
        else:
            credentials = ee.ServiceAccountCredentials(account_email, key_file=key_file)
        # Current Earth Engine API requires the backing Cloud project explicitly.
        ee.Initialize(credentials, project=settings.GEE_PROJECT_ID or None)
        _initialized = True
        print("[EarthEngine] Initialized successfully")
        return True
    except Exception as e:
        print(f"[EarthEngine] Initialization failed: {e}")
        _init_failed = True
        return False


def is_available() -> bool:
    return _initialize()


def get_surface_water_history(latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
    """
    Real surface-water presence/history at a point since 1984, from JRC's
    Global Surface Water dataset. Returns None if EE isn't configured or the
    point has no data (open ocean is masked out).
    """
    if not _initialize():
        return None

    import ee

    try:
        point = ee.Geometry.Point([longitude, latitude])
        image = ee.Image(JRC_SURFACE_WATER_ASSET)
        sample = image.sample(point, scale=30).first()
        info = sample.getInfo() if sample else None
    except Exception as e:
        print(f"[EarthEngine] JRC surface water query failed: {e}")
        return None

    if not info or not info.get("properties"):
        return None

    props = info["properties"]
    return {
        "occurrence_pct": props.get("occurrence"),      # % of time water was present (1984-2021)
        "seasonality_months": props.get("seasonality"), # months/year water is typically present
        "recurrence_pct": props.get("recurrence"),       # % of years water recurred
        "change_pct": props.get("change_abs"),           # change in occurrence, recent vs historical
        "max_extent": bool(props.get("max_extent")) if props.get("max_extent") is not None else None,
    }


def get_water_risk(latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
    """
    Real basin-level water risk from WRI Aqueduct v4 (baseline stress,
    drought risk, groundwater table decline, seasonal variability).
    Returns None if EE isn't configured or the point falls outside every
    mapped basin (e.g. open ocean, remote polar regions).
    """
    if not _initialize():
        return None

    import ee

    try:
        point = ee.Geometry.Point([longitude, latitude])
        fc = ee.FeatureCollection(AQUEDUCT_ASSET)
        feature = fc.filterBounds(point).first()
        info = feature.getInfo() if feature else None
    except Exception as e:
        print(f"[EarthEngine] Aqueduct query failed: {e}")
        return None

    if not info or not info.get("properties"):
        return None

    p = info["properties"]
    return {
        "water_stress_score": p.get("bws_score"),
        "water_stress_category": p.get("bws_label"),
        "water_depletion_category": p.get("bwd_label"),
        "drought_risk_category": p.get("drr_label"),
        "groundwater_decline_category": p.get("gtd_label"),
        "seasonal_variability_category": p.get("sev_label"),
        "interannual_variability_category": p.get("iav_label"),
    }
