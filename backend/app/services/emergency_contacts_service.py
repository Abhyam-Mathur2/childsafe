"""
Emergency Contacts Service
Returns verified, hardcoded emergency/health helpline numbers for a location.

Deliberately NOT AI-generated: a wrong phone number in a health emergency
context is a real safety risk, so these come from a small, manually curated
table instead of being left to an LLM to recall (and potentially hallucinate).
"""

from typing import Dict, Optional

# Countries with a specific, verified entry. ISO 3166-1 alpha-2 country codes
# (as returned by OpenWeather's `sys.country`).
_COUNTRY_TABLE: Dict[str, Dict[str, str]] = {
    "IN": {
        "country_name": "India",
        "emergency": "112",
        "ambulance": "108",
        "poison_control": "1800-116-117 (AIIMS National Poison Information Centre)",
        "note": "112 reaches police, fire and ambulance nationwide.",
    },
    "US": {
        "country_name": "United States",
        "emergency": "911",
        "poison_control": "1-800-222-1222 (Poison Help)",
        "note": "",
    },
    "GB": {
        "country_name": "United Kingdom",
        "emergency": "999",
        "non_emergency_health": "111 (NHS)",
        "note": "112 also works nationwide.",
    },
    "AU": {
        "country_name": "Australia",
        "emergency": "000",
        "poison_control": "13 11 26 (Poisons Information Centre)",
        "note": "",
    },
    "CA": {
        "country_name": "Canada",
        "emergency": "911",
        "note": "Poison control is province-specific — search \"[your province] poison control\".",
    },
    "NZ": {
        "country_name": "New Zealand",
        "emergency": "111",
        "note": "",
    },
    "SG": {
        "country_name": "Singapore",
        "emergency": "999",
        "ambulance": "995",
        "note": "",
    },
    "AE": {
        "country_name": "United Arab Emirates",
        "emergency": "999",
        "ambulance": "998",
        "note": "",
    },
    "ZA": {
        "country_name": "South Africa",
        "emergency": "112 (mobile)",
        "ambulance": "10177",
        "note": "",
    },
    "IE": {
        "country_name": "Ireland",
        "emergency": "112 or 999",
        "note": "",
    },
}

# EU / EEA countries all share the pan-European 112 emergency number.
_EU_112_COUNTRIES = {
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
    "HU", "IS", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT",
    "RO", "SK", "SI", "ES", "SE", "CH",
}


def get_emergency_contacts(country_code: Optional[str]) -> Dict:
    """Look up verified emergency numbers for a country code. Never guesses."""
    code = (country_code or "").upper()

    if code in _COUNTRY_TABLE:
        return {"country_code": code, "is_specific": True, **_COUNTRY_TABLE[code]}

    if code in _EU_112_COUNTRIES:
        return {
            "country_code": code,
            "is_specific": True,
            "country_name": code,
            "emergency": "112",
            "note": "112 is the standard emergency number across the EU/EEA.",
        }

    # Unknown country: give a safe, non-authoritative fallback rather than a guess.
    return {
        "country_code": code or None,
        "is_specific": False,
        "country_name": None,
        "emergency": None,
        "note": (
            "We don't have a verified emergency number for this location. "
            "112 and 911 work in many countries, but please confirm your "
            "local emergency number before you need it."
        ),
    }
