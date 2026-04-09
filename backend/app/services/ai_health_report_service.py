import json
import asyncio
import os
import httpx
from typing import Dict, Any, Optional
from datetime import datetime

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
except ImportError:
    pass  

from app.config import get_settings

settings = get_settings()


SYSTEM_PROMPT = """
You are a senior environmental health analyst writing paid professional health reports
for the ChildSafeEnviro platform. Each report costs ₹95 and must justify that through
genuine depth and personalization.

RULES — NEVER BREAK THESE:
1. Every sentence must reference the user's specific numbers (AQI, pH, pollutant values, age group).
2. Never write advice that would apply to every user. It must fit THIS user's data.
3. If medical/mental health conditions are reported, explain the exact environmental
   interaction — do not just say "consult a doctor".
4. Speak directly: use "you" and "your".
5. Respond ONLY in valid JSON matching the schema given. No markdown, no preamble.
"""


class AIHealthReportService:
    OPENAI_URL = "https://api.openai.com/v1/chat/completions"
    MODEL      = "gpt-4o-mini"
    MAX_RETRIES = 3
    RETRY_BASE_DELAY = 2.0  # seconds

    def __init__(self):
       
        self.api_key: str = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY", "")

    def _validate_api_key(self) -> None:
        if not self.api_key:
            raise ValueError(
                "OPENAI_API_KEY is not set. "
                "Add OPENAI_API_KEY=sk-... to your backend/.env file and restart the server."
            )
        if not self.api_key.startswith("sk-"):
            raise ValueError(
                f"OPENAI_API_KEY looks invalid (expected to start with 'sk-'). "
                "Double-check the value in your .env file."
            )

    def _build_context(
        self,
        air_quality,
        soil_data,
        water_data,
        lifestyle_data,
        env_risk: float,
        lifestyle_risk: float,
        combined_risk: float,
        risk_level: str,
        vulnerability_multiplier: float,
        noise_data: Dict,
        radiation_data: Dict,
    ) -> str:

        aq = air_quality.data
        air_block = f"""
=== AIR QUALITY (source: {air_quality.data_source}) ===
Location         : {air_quality.location_name}
AQI              : {aq.aqi}  [Good 0-50 | Moderate 51-100 | Unhealthy 101-150 | Very Unhealthy 151-200 | Hazardous 201+]
Primary Pollutant: {air_quality.primary_pollutant}
PM2.5            : {aq.pm25} μg/m³   (WHO 24hr limit: 25 μg/m³)
PM10             : {aq.pm10} μg/m³   (WHO 24hr limit: 45 μg/m³)
NO2              : {aq.no2}  μg/m³   (WHO limit: 25 μg/m³)
SO2              : {aq.so2}  μg/m³   (WHO limit: 40 μg/m³)
CO               : {aq.co}   mg/m³   (WHO limit: 4 mg/m³)
O3               : {aq.o3}   μg/m³   (WHO limit: 100 μg/m³)
Risk Level       : {air_quality.risk_level}
Interpretation   : {air_quality.health_interpretation}
"""

        sp = soil_data.properties
        soil_block = f"""
=== SOIL DATA (source: {soil_data.data_source}) ===
Location         : {soil_data.location_name}
Soil Type        : {sp.soil_type}
pH               : {sp.ph}  [Neutral=6.5-7.5 | Acidic<6.5 increases heavy metal mobility]
Organic Matter   : {sp.organic_matter}%
Contamination    : {sp.contamination_risk}
Health Impacts   : {' | '.join(soil_data.health_impacts) if soil_data.health_impacts else 'None identified'}
Risk Level       : {soil_data.risk_level}
Recommendations  : {' | '.join(soil_data.recommendations) if soil_data.recommendations else 'None'}
"""

        water_block = f"""
=== WATER QUALITY (source: {water_data.data_source}) ===
Location         : {water_data.location}
Source Type      : {water_data.source_type}
pH               : {water_data.ph}   [WHO safe range: 6.5-8.5]
Hardness         : {water_data.hardness}
Lead Risk        : {getattr(water_data, 'lead_risk', 'unknown')}
Contamination    : {water_data.contamination_risk}
Health Impacts   : {' | '.join(water_data.health_implications) if water_data.health_implications else 'None'}
Recommendations  : {' | '.join(water_data.recommendations) if water_data.recommendations else 'None'}
"""

        if lifestyle_data:
            age      = lifestyle_data.age_range.value if hasattr(lifestyle_data.age_range, 'value') else str(lifestyle_data.age_range)
            smoking  = lifestyle_data.smoking_status.value if hasattr(lifestyle_data.smoking_status, 'value') else str(lifestyle_data.smoking_status)
            activity = lifestyle_data.activity_level.value if hasattr(lifestyle_data.activity_level, 'value') else str(lifestyle_data.activity_level)
            work_env = lifestyle_data.work_environment.value if hasattr(lifestyle_data.work_environment, 'value') else str(lifestyle_data.work_environment)
            medical  = ', '.join(lifestyle_data.medical_history) if getattr(lifestyle_data, 'medical_history', None) else 'None'
            mental   = ', '.join(lifestyle_data.mental_health_conditions) if getattr(lifestyle_data, 'mental_health_conditions', None) else 'None'

            lifestyle_block = f"""
=== LIFESTYLE & PERSONAL DATA ===
Age Group             : {age}
Gender                : {getattr(lifestyle_data, 'gender', 'not specified')}
Smoking Status        : {smoking}
Activity Level        : {activity}
Activity Duration     : {getattr(lifestyle_data, 'activity_duration', 'not specified')} min/day outdoors
Work Environment      : {work_env}
Stress Level          : {getattr(lifestyle_data, 'stress_level', 'not specified')}
Diet Quality          : {getattr(lifestyle_data, 'diet_quality', 'not specified')}
Sleep Hours           : {getattr(lifestyle_data, 'sleep_hours', 'not specified')}
Home Water Source     : {getattr(lifestyle_data, 'water_source', 'not specified')}
UV Index at Location  : {getattr(lifestyle_data, 'uv_index', 'not specified')}
Medical History       : {medical}
Mental Health Conditions: {mental}
Chronic Exposure Years: {getattr(lifestyle_data, 'chronic_exposure_years', 'not specified')}
"""
        else:
            lifestyle_block = "\n=== LIFESTYLE DATA ===\nNot provided by user.\n"

        month = datetime.now().month
        season = {12:"Winter",1:"Winter",2:"Winter",
                  3:"Spring",4:"Spring",5:"Spring",
                  6:"Summer",7:"Summer",8:"Summer",
                  9:"Autumn",10:"Autumn",11:"Autumn"}.get(month, "Unknown")

        scores_block = f"""
=== CALCULATED RISK SCORES (by health_report_service) ===
Overall Risk Score        : {combined_risk:.1f} / 100
Overall Risk Level        : {risk_level.upper()}
Environmental Component   : {env_risk:.1f} / 100
Lifestyle Component       : {lifestyle_risk:.1f} / 100
Vulnerability Multiplier  : {vulnerability_multiplier}x
  (driven by: age group, medical history, mental health conditions,
   chronic exposure years, UV index, home water source, activity in bad air)

=== AMBIENT CONDITIONS ===
Noise Level  : {noise_data.get('level', 'N/A')} dB | Source: {noise_data.get('source', 'N/A')} | Risk Score: {noise_data.get('risk_score', 'N/A')}
Radiation    : {radiation_data.get('level', 'N/A')} | Source: {radiation_data.get('source', 'N/A')} | Risk Score: {radiation_data.get('risk_score', 'N/A')}

=== TEMPORAL CONTEXT ===
Report Date  : {datetime.now().strftime('%d %B %Y')}
Month        : {datetime.now().strftime('%B')}
Season       : {season}
"""

        return air_block + soil_block + water_block + lifestyle_block + scores_block

    async def _call_openai(self, prompt: str, max_tokens: int = 1200, section_name: str = "") -> Dict:
        """Call OpenAI with exponential-backoff retry on transient errors."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": 0.4,
            "response_format": {"type": "json_object"},
        }

        last_error: Optional[Exception] = None
        for attempt in range(1, self.MAX_RETRIES + 1):
            try:
                async with httpx.AsyncClient(timeout=httpx.Timeout(45.0)) as client:
                    r = await client.post(self.OPENAI_URL, headers=headers, json=payload)

                    
                    if r.status_code in (429, 500, 502, 503, 504):
                        retry_after = float(r.headers.get("Retry-After", self.RETRY_BASE_DELAY * attempt))
                        if attempt < self.MAX_RETRIES:
                            print(f"[AI Report] {section_name} attempt {attempt} → HTTP {r.status_code}, retrying in {retry_after:.1f}s")
                            await asyncio.sleep(retry_after)
                            continue
                        r.raise_for_status()

                    r.raise_for_status()
                    data = r.json()

                   
                    usage = data.get("usage", {})
                    if usage:
                        print(
                            f"[AI Report] {section_name} tokens — "
                            f"prompt: {usage.get('prompt_tokens', '?')}, "
                            f"completion: {usage.get('completion_tokens', '?')}"
                        )

                    content = data["choices"][0]["message"]["content"]
                    return json.loads(content)

            except json.JSONDecodeError as e:
                print(f"[AI Report] {section_name} JSON parse error: {e}")
                return {"error": f"JSON parse error: {e}", "fallback": True}

            except (httpx.TimeoutException, httpx.NetworkError) as e:
                last_error = e
                if attempt < self.MAX_RETRIES:
                    delay = self.RETRY_BASE_DELAY * attempt
                    print(f"[AI Report] {section_name} network error (attempt {attempt}): {e} — retrying in {delay}s")
                    await asyncio.sleep(delay)
                    continue

            except Exception as e:
                last_error = e
                break

        err_msg = str(last_error) if last_error else "Unknown error"
        print(f"[AI Report] {section_name} failed after {self.MAX_RETRIES} attempts: {err_msg}")
        return {"error": err_msg, "fallback": True}

    

    async def _section_executive_summary(self, ctx: str) -> Dict:
        return await self._call_openai(f"""
{ctx}

Generate the EXECUTIVE SUMMARY.
Return JSON:
{{
  "overall_narrative": "3-4 sentences. Must mention AQI value, primary pollutant, risk score,
    AND at least one personal factor (age, condition, smoking). Explain what drives this user's risk.",
  "key_insight": "The single most important personalized insight for this exact user.
    Must reference their unique data combination. Not generic.",
  "immediate_priority": "The one action this person should take TODAY based on their specific data.",
  "protective_factors": ["2-3 real protective factors this user actually has from their data"],
  "concern_factors":    ["2-3 specific risks that need attention, with values cited"]
}}
""", max_tokens=700, section_name="Executive Summary")

    async def _section_air_quality(self, ctx: str) -> Dict:
        return await self._call_openai(f"""
{ctx}

Generate the AIR QUALITY DEEP ANALYSIS.
Return JSON:
{{
  "overall_assessment": "What does their AQI of [exact value] mean for their age group and reported conditions?",
  "pollutant_breakdown": {{
    "pm25":  {{"reading": "[value from data]", "who_limit": "25 μg/m³", "status": "above/below/at limit", "body_impact": "specific impact for this user's age and conditions"}},
    "pm10":  {{"reading": "", "who_limit": "45 μg/m³",  "status": "", "body_impact": ""}},
    "no2":   {{"reading": "", "who_limit": "25 μg/m³",  "status": "", "body_impact": ""}},
    "so2":   {{"reading": "", "who_limit": "40 μg/m³",  "status": "", "body_impact": ""}},
    "co":    {{"reading": "", "who_limit": "4 mg/m³",   "status": "", "body_impact": ""}},
    "o3":    {{"reading": "", "who_limit": "100 μg/m³", "status": "", "body_impact": ""}}
  }},
  "personal_inhaled_dose": "Calculate extra inhaled pollutant load for their activity duration vs a sedentary person. Use numbers.",
  "condition_interactions": [
    "For each reported medical condition: how does this specific AQI/pollutant profile affect it?
    If no conditions: age-group specific respiratory/cardiovascular risks."
  ],
  "peak_hours_warning": "When is pollution worst for their location type and how should they adjust their schedule?",
  "indoor_outdoor_split": "Given their work environment and activity, what is their indoor vs outdoor exposure balance?",
  "seasonal_trajectory": "How will their primary pollutants change over the coming months?"
}}
""", max_tokens=1200, section_name="Air Quality")

    async def _section_water_quality(self, ctx: str) -> Dict:
        return await self._call_openai(f"""
{ctx}

Generate the WATER QUALITY DEEP ANALYSIS.
Return JSON:
{{
  "overall_assessment": "Their water source, pH of [exact value], hardness — what does this mean for their age and conditions?",
  "source_risk_profile": "Contaminants typical for their specific source type in their region.",
  "ph_analysis": "Their pH of [exact value] vs WHO range 6.5-8.5. Impact on mineral absorption, pipe corrosion, health.",
  "hardness_impact": "Their hardness level — specific effects on skin, hair, kidneys, cardiovascular.",
  "contaminant_deep_dive": {{
    "lead":            "Risk for their source type and age group",
    "pfas":            "Forever chemical risk for their source type",
    "nitrates":        "Risk — flag especially if children or pregnancy in context",
    "microbiological": "Bacterial/viral risk given their water source"
  }},
  "daily_intake_risk": "At 2-3L/day, what is their cumulative daily exposure from water?",
  "filtration_recommendation": "Specific filter type (RO/UV/Carbon/Ceramic) matched to their contaminants. Not generic.",
  "condition_interactions": ["How does their water quality interact with their specific reported conditions?"]
}}
""", max_tokens=1100, section_name="Water Quality")

    async def _section_soil(self, ctx: str) -> Dict:
        return await self._call_openai(f"""
{ctx}

Generate the SOIL SAFETY DEEP ANALYSIS.
Return JSON:
{{
  "overall_assessment": "Their soil type and pH — what does this mean given their outdoor activity and lifestyle?",
  "ph_heavy_metal_risk": "At their pH of [exact value], which heavy metals become bioavailable? Does their pH cross the danger threshold?",
  "soil_type_specific_risks": "Their soil type — drainage, pathogen survival, and dust generation implications.",
  "heavy_metal_profile": {{
    "lead":    "Risk and exposure pathway for their age group",
    "arsenic": "Natural vs industrial sources, cancer risk",
    "cadmium": "Risk and interaction with their diet quality",
    "mercury": "Risk especially near industrial/water areas"
  }},
  "exposure_pathways": [
    "How specifically could THIS user be exposed, given their outdoor activity duration,
    work environment, and lifestyle?"
  ],
  "dust_inhalation_link": "Given their AQI and outdoor minutes, how much soil-derived PM are they likely inhaling?",
  "gardening_outdoor_safety": "Specific precautions for their contamination risk level.",
  "practical_remediation": "If medium/high contamination: practical steps to reduce exposure at home."
}}
""", max_tokens=1000, section_name="Soil")

    async def _section_personal_vulnerability(self, ctx: str) -> Dict:
        return await self._call_openai(f"""
{ctx}

Generate the PERSONAL VULNERABILITY & LIFESTYLE RISK ANALYSIS.
Return JSON:
{{
  "vulnerability_score_explanation": "Plain language explanation of why their multiplier is [exact value].
    What specific factors drove it? What does it mean — they experience [X]x the harm of an average person.",
  "age_group_profile": {{
    "key_organs_at_risk": ["organs most vulnerable for their exact age group"],
    "developmental_or_degenerative_note": "Children: developing organs. Adults: cumulative damage. Elderly: immune decline.",
    "safe_aqi_threshold": "Recommended AQI ceiling for their age group and the science behind it."
  }},
  "smoking_multiplier_analysis": "How does their smoking status multiply their environmental risk?
    Reference mechanisms: cilia damage, oxidative stress, particle retention in lungs.",
  "activity_exposure_math": {{
    "daily_outdoor_minutes": "value from their data",
    "extra_air_volume_vs_sedentary": "estimated extra liters of polluted air inhaled per day",
    "weekly_cumulative_impact": "what this means over 7 days at their AQI",
    "optimal_exercise_window": "best time to exercise given their location's pollution cycle"
  }},
  "stress_immune_link": "How their stress level weakens immune response to pollutants.
    Cortisol, neuroinflammation, oxidative stress — specific to their reported level.",
  "diet_detox_capacity": "How their diet quality affects ability to process and eliminate pollutants.
    Antioxidant status, liver load — specific to their diet quality.",
  "sleep_pollution_recovery": "Their sleep hours and how this affects cellular repair from daily exposure.
    Melatonin, autophagy, inflammation resolution.",
  "chronic_exposure_burden": "Given their [X] years of chronic exposure, explain body burden accumulation.
    Which organs are most loaded? What is the tipping point risk?"
}}
""", max_tokens=1300, section_name="Personal Vulnerability")

    async def _section_medical_conditions(self, ctx: str) -> Dict:
        return await self._call_openai(f"""
{ctx}

Generate the MEDICAL CONDITIONS & ENVIRONMENTAL INTERACTION section.
If no conditions reported: write a preventive health analysis for their age group instead.

Return JSON:
{{
  "profile_summary": "How does their overall health profile interact with their environmental exposure?",
  "condition_analyses": [
    {{
      "condition": "condition name",
      "specific_pollutant_triggers": "Which of their actual pollutants (cite values) trigger or worsen this?",
      "current_risk_level": "Given today's readings, what is their risk of flare/episode?",
      "early_warning_signs": ["Symptoms indicating environmental triggers are active"],
      "targeted_actions": ["Specific actions for this condition tied to their data — not generic"],
      "medication_environment_interactions": "Are common medications for this condition affected by heat/AQ/water?"
    }}
  ],
  "synergistic_compound_risks": [
    "If multiple conditions or conditions + smoking + poor air: explain compounding effects.
    These are often worse than sum of individual risks."
  ],
  "priority_screenings": "What health screenings should they prioritize in next 6-12 months based on their exposure?"
}}
""", max_tokens=1200, section_name="Medical Conditions")

    async def _section_noise_radiation(self, ctx: str) -> Dict:
        return await self._call_openai(f"""
{ctx}

Generate the NOISE & RADIATION EXPOSURE section.
Return JSON:
{{
  "noise": {{
    "level_context": "Their [exact dB] vs WHO limits: <45dB sleep, <55dB daytime. Where do they stand?",
    "cardiovascular_impact": "At their dB, documented effects on blood pressure and stress hormones.",
    "sleep_disruption_risk": "Given their reported sleep hours, is noise a compounding factor?",
    "cognitive_impact": "Chronic noise at their level and effects on focus and cognition.",
    "hearing_accumulation": "At their exposure, over what timeline could hearing damage accumulate?",
    "mitigation_steps": ["Specific noise reduction steps for their living/work situation"]
  }},
  "uv_radiation": {{
    "index_assessment": "Their UV index of [exact value] — Low/Moderate/High/Very High/Extreme classification",
    "daily_dose_calculation": "Given their outdoor minutes, approximate daily UV dose and skin exposure risk.",
    "skin_cancer_risk": "Skin and photoaging risk at their UV level and activity duration.",
    "eye_risk": "Cataract and macular degeneration risk at their UV exposure.",
    "vitamin_d_balance": "Are they getting enough UV for Vitamin D synthesis without overexposure?",
    "protection_protocol": ["SPF rating needed, clothing recommendations, timing — tied to their UV index and activity"]
  }},
  "background_radiation": {{
    "level_context": "Their background radiation level vs normal range for the region.",
    "annual_dose_estimate": "Estimated annual dose vs WHO recommended public limit of 1 mSv/year."
  }}
}}
""", max_tokens=950, section_name="Noise & Radiation")

    async def _section_action_plan(self, ctx: str) -> Dict:
        return await self._call_openai(f"""
{ctx}

Generate the PERSONALIZED TIME-BASED ACTION PLAN.
Every action MUST be tied to their specific data values. No generic advice.

Return JSON:
{{
  "this_week": {{
    "critical_today": [
      "3-4 actions for TODAY citing their exact AQI, conditions, and lifestyle.
      Include specific times, thresholds, and the reason tied to their data."
    ],
    "exercise_guidance": "Given their activity level and AQI, exactly when/how should they exercise?
      Specific hours and duration limits based on their data.",
    "nutrition_protocol": [
      "2-3 specific foods or supplements that counter their primary pollutant.
      Explain the mechanism (e.g. high PM2.5 → Omega-3 reduces lung inflammation)."
    ],
    "daily_monitoring": ["What to track specifically this week given their risk profile"]
  }},
  "this_month": {{
    "home_improvements": ["Ranked by impact for their risk profile. Include rough cost indication."],
    "medical_appointments": [
      {{"specialist": "type", "reason": "why based on their data", "urgency": "routine/soon/urgent"}}
    ],
    "testing_to_do": ["Water testing, indoor air, soil — what matters most for them and why"],
    "behavioral_shifts": ["Specific habit changes with expected health impact"]
  }},
  "this_year": {{
    "infrastructure_investments": [
      {{"item": "HEPA/RO filter/etc", "reason": "why for their risk", "approx_cost_inr": "range"}}
    ],
    "annual_screenings": ["Tests relevant to their specific exposure history"],
    "long_term_exposure_reduction": ["Structural changes — route, timing, home modifications"],
    "cumulative_health_tracking": "How to monitor their environmental health burden year over year."
  }}
}}
""", max_tokens=1400, section_name="Action Plan")

    async def _section_seasonal_daily(self, ctx: str) -> Dict:
        return await self._call_openai(f"""
{ctx}

Generate the SEASONAL & DAILY OPTIMIZATION GUIDE.
Return JSON:
{{
  "current_season": {{
    "name": "season name",
    "location_specific_risks": "Seasonal risks specific to their location and region — not generic.",
    "pollutant_seasonal_shifts": "How will their primary pollutants shift this season vs next?",
    "condition_season_impact": "How does this season worsen or ease any of their conditions?",
    "action_items": ["4-5 season-specific actions for this exact user"]
  }},
  "next_season_prep": "What should they do NOW to prepare for next season given their health profile?",
  "daily_schedule": {{
    "early_morning_5_to_8":  {{"aqi_pattern": "", "recommended": "", "avoid": ""}},
    "morning_8_to_12":       {{"aqi_pattern": "", "recommended": "", "avoid": ""}},
    "afternoon_12_to_5":     {{"aqi_pattern": "", "recommended": "", "avoid": ""}},
    "evening_5_to_10":       {{"aqi_pattern": "", "recommended": "", "avoid": ""}}
  }},
  "annual_health_calendar": {{
    "jan_feb":     "Key risks and priority actions",
    "mar_apr_may": "Spring risks and preparation",
    "jun_jul_aug": "Summer heat, UV, ozone actions",
    "sep_oct_nov": "Harvest burning, transition risks",
    "dec":         "Winter smog, indoor air quality focus"
  }}
}}
""", max_tokens=1300, section_name="Seasonal & Daily")

    async def _section_doctor_guide(self, ctx: str) -> Dict:
        return await self._call_openai(f"""
{ctx}

Generate the HEALTH PROFESSIONAL DISCUSSION GUIDE — a checklist for their doctor visit.
Return JSON:
{{
  "why_share": "One sentence why their doctor needs this data — specific to their risk profile.",
  "priority_questions": [
    "6-8 specific questions referencing their ACTUAL values (AQI, pollutant levels, pH, conditions, age).
    Must be questions only possible because of their specific data."
  ],
  "specialist_referrals": [
    {{"specialist": "type", "reason": "why based on their data", "urgency": "routine/soon/urgent"}}
  ],
  "tests_to_request": [
    {{"test": "name", "reason": "why relevant to their exposure profile", "frequency": "how often"}}
  ],
  "key_data_to_share": ["Specific numbers from this report the doctor needs"],
  "red_flag_symptoms": [
    "Symptoms THIS user should watch for that indicate environmental harm —
    based on their specific conditions and pollutants"
  ]
}}
""", max_tokens=1000, section_name="Doctor Guide")

    async def _section_mental_health(self, ctx: str) -> Dict:
        return await self._call_openai(f"""
{ctx}

Generate the MENTAL HEALTH & ENVIRONMENTAL STRESS section.
Return JSON:
{{
  "pollution_mental_health_link": "Research-backed connection between their specific pollutant values and mental health.
    PM2.5 and depression, NO2 and anxiety, noise and stress — cite their actual readings.",
  "condition_environment_analysis": [
    "For each reported mental health condition: exactly how do their environmental readings interact with it?
    If none reported: give age-specific mental health environmental risk profile."
  ],
  "stress_pollution_cycle": "How their stress level creates a feedback loop with environmental exposure —
    cortisol elevation, inflammatory response, HPA axis.",
  "cognitive_environmental_impact": "What chronic exposure to their pollution levels means for brain health and cognition.
    Reference specific pollutants — NO2 and PM2.5 and neuroinflammation.",
  "sleep_mental_resilience": "How their environmental factors (noise, air quality) degrade sleep quality
    and how poor sleep weakens mental health resilience.",
  "protective_strategies": [
    "5 evidence-based strategies tied to their specific environment and conditions"
  ],
  "support_resources": [
    {{"resource": "name", "relevance": "why relevant to their situation", "url": "website"}}
  ]
}}
""", max_tokens=1000, section_name="Mental Health")

    async def _section_children_family(self, ctx: str) -> Dict:
        return await self._call_openai(f"""
{ctx}

Generate the CHILDREN & FAMILY PROTECTION section.
Relevant if: user age group is 0-17, or medical history mentions children/pregnancy/premature_birth,
or any child context exists in the data. Otherwise write a preventive family planning section.

Return JSON:
{{
  "child_vulnerability_science": "Why children are 2-4x more vulnerable at their AQI of [exact value] —
    developing lungs, blood-brain barrier permeability, higher breathing rate per body weight.",
  "age_band_thresholds": {{
    "0_1_years":   {{"safe_aqi": "less than 25", "key_risk": "specific risk"}},
    "1_3_years":   {{"safe_aqi": "less than 50", "key_risk": ""}},
    "3_12_years":  {{"safe_aqi": "less than 75", "key_risk": "relate to current AQI"}},
    "13_17_years": {{"safe_aqi": "less than 100","key_risk": ""}}
  }},
  "safe_outdoor_windows": "Given their local AQI patterns, when are safe outdoor play windows?",
  "home_clean_air_zone": ["Steps to create a clean air refuge at home given their pollution level"],
  "developmental_health_markers": ["What to monitor given their environmental exposure"],
  "school_sports_guidance": "What to communicate to school about outdoor activity at their AQI level.",
  "pregnancy_or_infant_note": "If pregnancy or premature_birth in medical history: specific environmental
    risks and management steps. Otherwise: general family planning environmental considerations."
}}
""", max_tokens=900, section_name="Children & Family")

   
    async def generate(
        self,
        air_quality,
        soil_data,
        water_data,
        lifestyle_data,
        env_risk: float,
        lifestyle_risk: float,
        combined_risk: float,
        risk_level: str,
        vulnerability_multiplier: float,
        noise_data: Dict,
        radiation_data: Dict,
    ) -> Dict:
        self._validate_api_key()

        ctx = self._build_context(
            air_quality, soil_data, water_data, lifestyle_data,
            env_risk, lifestyle_risk, combined_risk, risk_level,
            vulnerability_multiplier, noise_data, radiation_data,
        )

        print("[AI Report] Generating sections concurrently")
        start = datetime.now()

        async def safe(name: str, coro):
            try:
                result = await coro
                if not result.get("fallback"):
                    print(f"[AI Report] ✓ {name}")
                else:
                    print(f"[AI Report] ✗ {name} (fallback): {result.get('error', '')}")
                return result
            except Exception as e:
                print(f"[AI Report] ✗ {name}: {e}")
                return {"error": str(e), "fallback": True}

        (
            executive_summary,
            air_analysis,
            water_analysis,
            soil_analysis,
            personal_vulnerability,
            medical_conditions,
            noise_radiation,
            action_plan,
            seasonal_daily,
            doctor_guide,
            mental_health,
            children_family,
        ) = await asyncio.gather(
            safe("Executive Summary",      self._section_executive_summary(ctx)),
            safe("Air Quality",            self._section_air_quality(ctx)),
            safe("Water Quality",          self._section_water_quality(ctx)),
            safe("Soil",                   self._section_soil(ctx)),
            safe("Personal Vulnerability", self._section_personal_vulnerability(ctx)),
            safe("Medical Conditions",     self._section_medical_conditions(ctx)),
            safe("Noise & Radiation",      self._section_noise_radiation(ctx)),
            safe("Action Plan",            self._section_action_plan(ctx)),
            safe("Seasonal & Daily",       self._section_seasonal_daily(ctx)),
            safe("Doctor Guide",           self._section_doctor_guide(ctx)),
            safe("Mental Health",          self._section_mental_health(ctx)),
            safe("Children & Family",      self._section_children_family(ctx)),
        )

        elapsed = (datetime.now() - start).total_seconds()
        successful = sum(
            1 for s in [executive_summary, air_analysis, water_analysis, soil_analysis,
                        personal_vulnerability, medical_conditions, noise_radiation,
                        action_plan, seasonal_daily, doctor_guide, mental_health, children_family]
            if not s.get("fallback")
        )
        print(f"[AI Report] Done — {successful}/12 sections succeeded in {elapsed:.1f}s")

        return {
            "ai_executive_summary":      executive_summary,
            "ai_air_quality_analysis":   air_analysis,
            "ai_water_quality_analysis": water_analysis,
            "ai_soil_analysis":          soil_analysis,
            "ai_personal_vulnerability": personal_vulnerability,
            "ai_medical_conditions":     medical_conditions,
            "ai_noise_radiation":        noise_radiation,
            "ai_action_plan":            action_plan,
            "ai_seasonal_daily_guide":   seasonal_daily,
            "ai_doctor_guide":           doctor_guide,
            "ai_mental_health":          mental_health,
            "ai_children_family":        children_family,
            "ai_meta": {
                "model":              self.MODEL,
                "sections_total":     12,
                "sections_succeeded": successful,
                "generated":          datetime.now().isoformat(),
                "elapsed_seconds":    round(elapsed, 1),
                "cost_inr":           0.05,
            },
        }



ai_health_report_service = AIHealthReportService()
