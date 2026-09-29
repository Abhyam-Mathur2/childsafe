"""
PDF Service
Renders a generated health report to a real PDF file, server-side.

Used for emailing a paid user their report as an attachment and for the
"View Report" link in that email, which must show the PDF directly rather
than the (login-gated, paywall-aware) web app.
"""

from html import escape
from typing import Any, Dict, List, Optional

from weasyprint import HTML

RISK_COLORS = {"low": "#2e7d32", "medium": "#f9a825", "high": "#c62828"}


def _esc(value: Any) -> str:
    return escape(str(value)) if value is not None else ""


def _risk_color(level: Optional[str]) -> str:
    return RISK_COLORS.get((level or "").lower(), "#666")


def _list_items(items: Optional[List[str]]) -> str:
    if not items:
        return ""
    return "".join(f"<li>{_esc(i)}</li>" for i in items)


def _section(title: str, body: str) -> str:
    return f'<h2 class="section-title">{_esc(title)}</h2>{body}'


def _build_html(report: Dict[str, Any]) -> str:
    risk_level = (report.get("risk_level") or "unknown").upper()
    risk_score = round(report.get("risk_score") or 0)
    color = _risk_color(report.get("risk_level"))
    location = report.get("location_name") or "Unknown location"

    factors = report.get("contributing_factors") or []
    concerns = [f.get("factor", "") for f in factors if f.get("impact") == "negative"]
    positives = [f.get("factor", "") for f in factors if f.get("impact") == "positive"]

    recs = report.get("health_recommendations") or []
    recs_html = "".join(
        f'<div class="rec-card"><strong>{_esc(r.get("title", ""))}</strong> '
        f'<span class="priority priority-{_esc(r.get("priority", "medium"))}">{_esc(r.get("priority", ""))}</span>'
        f'<p>{_esc(r.get("description", ""))}</p></div>'
        for r in recs
    )

    ai = report.get("ai_report") or {}

    def ai_text(key: str, field: str) -> str:
        section = ai.get(key) or {}
        if section.get("fallback"):
            return ""
        return _esc(section.get(field, ""))

    exec_summary = ai.get("ai_executive_summary") or {}
    exec_html = ""
    if not exec_summary.get("fallback"):
        exec_html = f"""
        <div class="callout">
            <p>{_esc(exec_summary.get('overall_narrative', ''))}</p>
            {f"<p><strong>Immediate priority:</strong> {_esc(exec_summary.get('immediate_priority'))}</p>" if exec_summary.get('immediate_priority') else ''}
            {f"<p><strong>Key insight:</strong> {_esc(exec_summary.get('key_insight'))}</p>" if exec_summary.get('key_insight') else ''}
        </div>"""

    emergency = report.get("emergency_contacts") or {}
    emergency_html = ""
    if emergency.get("is_specific"):
        rows = "".join(
            f'<div class="em-item"><span>{label}</span><strong>{_esc(emergency.get(key))}</strong></div>'
            for label, key in [("Emergency", "emergency"), ("Ambulance", "ambulance"),
                                ("Poison Control", "poison_control"), ("Health Helpline", "non_emergency_health")]
            if emergency.get(key)
        )
        emergency_html = f"""
        <div class="emergency-box">
            <strong>In a health emergency{f" in {_esc(emergency.get('country_name'))}" if emergency.get('country_name') else ''}</strong>
            <div class="em-grid">{rows}</div>
        </div>"""

    doctor_guide = report.get("health_professional_guide") or []
    action_short = report.get("short_term_considerations") or []
    action_medium = report.get("medium_term_considerations") or []
    action_long = report.get("long_term_considerations") or []

    return f"""<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
    @page {{ size: A4; margin: 18mm 16mm; }}
    body {{ font-family: 'Helvetica', Arial, sans-serif; color: #1a1a1a; font-size: 11pt; line-height: 1.5; }}
    h1 {{ font-size: 22pt; color: #1b4d3e; margin-bottom: 4pt; }}
    .meta {{ color: #666; font-size: 9pt; margin-bottom: 20pt; }}
    .section-title {{ font-size: 14pt; color: #1b4d3e; border-bottom: 2px solid #1b4d3e; padding-bottom: 4pt; margin-top: 22pt; }}
    .risk-box {{ background: #f8f9fa; border-radius: 8pt; padding: 16pt; text-align: center; margin: 14pt 0; }}
    .risk-score {{ font-size: 34pt; font-weight: 800; color: {color}; }}
    .risk-level {{ font-size: 11pt; font-weight: 700; color: {color}; letter-spacing: 1px; }}
    .callout {{ background: #f0f7f4; border-left: 5px solid #1b4d3e; border-radius: 4pt; padding: 12pt; margin: 10pt 0; font-size: 10pt; }}
    .two-col {{ display: flex; gap: 16pt; }}
    .two-col > div {{ flex: 1; }}
    ul {{ padding-left: 16pt; font-size: 10pt; }}
    li {{ margin-bottom: 4pt; }}
    .rec-card {{ background: #fafaf8; border: 1px solid #eee; border-radius: 4pt; padding: 10pt; margin-bottom: 8pt; font-size: 10pt; }}
    .priority {{ font-size: 8pt; font-weight: 700; text-transform: uppercase; padding: 2pt 6pt; border-radius: 8pt; }}
    .priority-high {{ background: #ffebee; color: #c62828; }}
    .priority-medium {{ background: #fff8e1; color: #f9a825; }}
    .priority-low {{ background: #e8f5e9; color: #2e7d32; }}
    .emergency-box {{ background: #fff5f5; border: 2px solid #ffcdd2; border-left: 5px solid #c62828; border-radius: 6pt; padding: 12pt; margin: 14pt 0; font-size: 10pt; }}
    .em-grid {{ display: flex; flex-wrap: wrap; gap: 10pt; margin-top: 8pt; }}
    .em-item {{ background: #fff; border: 1px solid #ffcdd2; border-radius: 4pt; padding: 6pt 10pt; text-align: center; min-width: 90pt; }}
    .em-item span {{ display: block; font-size: 7pt; text-transform: uppercase; color: #888; }}
    .em-item strong {{ color: #c62828; font-size: 11pt; }}
    .disclaimer {{ font-size: 8pt; color: #888; border-top: 1px solid #eee; padding-top: 10pt; margin-top: 24pt; }}
    .timeline {{ display: flex; gap: 10pt; }}
    .timeline > div {{ flex: 1; background: #fafaf8; border-radius: 4pt; padding: 8pt; font-size: 9pt; }}
    .timeline h4 {{ margin: 0 0 6pt 0; font-size: 9pt; }}
</style>
</head>
<body>
    <h1>Environmental Health Risk Assessment</h1>
    <div class="meta">Report ID: EHA-2026-{_esc(report.get('report_id'))} &middot; {_esc(location)} &middot; Generated {_esc(report.get('generated_at', ''))}</div>

    <div class="risk-box">
        <div class="risk-score">{risk_score}<span style="font-size:14pt;color:#999;">/100</span></div>
        <div class="risk-level">{risk_level} RISK</div>
    </div>

    {exec_html}

    <div class="two-col">
        <div>
            <h3>Primary Concerns</h3>
            <ul>{_list_items(concerns) or '<li>None identified</li>'}</ul>
        </div>
        <div>
            <h3>Protective Factors</h3>
            <ul>{_list_items(positives) or '<li>None noted</li>'}</ul>
        </div>
    </div>

    {_section("Health Recommendations", recs_html or "<p>See www.childsafeenvirons.com for the interactive report.</p>")}

    {_section("Time-Based Action Plan", f'''
        <div class="timeline">
            <div><h4>This Week</h4><ul>{_list_items(action_short)}</ul></div>
            <div><h4>This Month</h4><ul>{_list_items(action_medium)}</ul></div>
            <div><h4>This Year</h4><ul>{_list_items(action_long)}</ul></div>
        </div>
    ''') if (action_short or action_medium or action_long) else ""}

    {_section("Health Professional Discussion Guide", f"<ul>{_list_items(doctor_guide)}</ul>") if doctor_guide else ""}

    {emergency_html}

    <div class="disclaimer">
        This report provides environmental exposure information only and is not medical or clinical advice.
        It does not replace consultation with a qualified healthcare provider. Generated by ChildSafeEnviro.
    </div>
</body>
</html>"""


def generate_report_pdf(report: Dict[str, Any]) -> bytes:
    """Render a health report dict (HealthReportResponse.model_dump() shape) to PDF bytes"""
    html = _build_html(report)
    return HTML(string=html).write_pdf()
