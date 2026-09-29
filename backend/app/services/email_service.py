"""
Email Service
Sends the generated health report to the user via Brevo's transactional email API
"""

import base64
import re
from typing import Any, Dict

import httpx

from app.config import get_settings

settings = get_settings()


class EmailService:
    BREVO_URL = "https://api.brevo.com/v3/smtp/email"

    def __init__(self):
        self.api_key = settings.BREVO_API_KEY
        self.sender = settings.EMAIL_FROM

    def _validate_api_key(self) -> None:
        if not self.api_key:
            raise ValueError(
                "BREVO_API_KEY is not set. Add BREVO_API_KEY=xkeysib-... to your "
                "backend/.env file and restart the server."
            )

    def _parse_sender(self) -> Dict[str, str]:
        """'Name <email>' -> {"name": Name, "email": email}"""
        match = re.match(r"^\s*(.*?)\s*<(.+?)>\s*$", self.sender)
        if match:
            name, email = match.groups()
            return {"name": name or "ChildSafeEnviro", "email": email}
        return {"email": self.sender.strip()}

    def _risk_color(self, risk_level: str) -> str:
        return {"low": "#2e7d32", "medium": "#f9a825", "high": "#c62828"}.get(
            (risk_level or "").lower(), "#666"
        )

    def _build_html(self, report: Dict[str, Any], pdf_url: str, recipient_name: str) -> str:
        risk_level = (report.get("risk_level") or "unknown").upper()
        risk_score = round(report.get("risk_score") or 0)
        location = report.get("location_name") or "your location"
        color = self._risk_color(report.get("risk_level"))

        factors = report.get("contributing_factors") or []
        concerns = [f.get("factor", "") for f in factors if f.get("impact") == "negative"][:3]
        concerns_html = "".join(f"<li style='margin-bottom:6px;'>{c}</li>" for c in concerns) or "<li>None identified</li>"

        recs = report.get("health_recommendations") or []
        recs_html = "".join(
            f"<li style='margin-bottom:8px;'><strong>{r.get('title', '')}</strong> — {r.get('description', '')}</li>"
            for r in recs[:3]
        ) or "<li>See the full report for personalized recommendations.</li>"

        return f"""
<div style="font-family: -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
    <div style="background: #1b4d3e; padding: 28px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">ChildSafeEnviro</h1>
        <p style="color: #cfe7dd; margin: 6px 0 0; font-size: 13px;">Environmental Health Risk Assessment</p>
    </div>
    <div style="background: #fff; padding: 32px; border: 1px solid #eee; border-top: none;">
        <p>Hi {recipient_name or 'there'},</p>
        <p>Your environmental health report for <strong>{location}</strong> is attached as a PDF, ready to keep or print.</p>

        <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
            <div style="font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Overall Risk</div>
            <div style="font-size: 40px; font-weight: 800; color: {color}; line-height: 1.2;">{risk_score}<span style="font-size:18px;color:#999;">/100</span></div>
            <div style="font-size: 14px; font-weight: 700; color: {color};">{risk_level} RISK</div>
        </div>

        <h3 style="font-size: 15px; border-bottom: 2px solid #1b4d3e; padding-bottom: 6px;">Top Concerns</h3>
        <ul style="padding-left: 20px; font-size: 14px; line-height: 1.5;">{concerns_html}</ul>

        <h3 style="font-size: 15px; border-bottom: 2px solid #1b4d3e; padding-bottom: 6px; margin-top: 24px;">Key Recommendations</h3>
        <ul style="padding-left: 20px; font-size: 14px; line-height: 1.5;">{recs_html}</ul>

        <div style="text-align: center; margin: 32px 0 8px;">
            <a href="{pdf_url}" style="background: #1b4d3e; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 30px; font-weight: 700; font-size: 14px; display: inline-block;">View PDF Report</a>
        </div>
        <p style="font-size: 11px; color: #aaa; text-align: center;">(Opens the PDF directly — no sign-in needed.)</p>

        <p style="font-size: 12px; color: #999; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
            This report provides environmental exposure information only and is not medical advice.
            Always consult a healthcare provider for medical concerns.
        </p>
    </div>
</div>
"""

    async def send_health_report_email(
        self,
        to_email: str,
        to_name: str,
        report: Dict[str, Any],
        pdf_url: str,
        pdf_bytes: bytes,
        pdf_filename: str,
    ) -> None:
        self._validate_api_key()

        risk_level = (report.get("risk_level") or "unknown").upper()
        risk_score = round(report.get("risk_score") or 0)

        payload = {
            "sender": self._parse_sender(),
            "to": [{"email": to_email, "name": to_name or to_email}],
            "subject": f"Your ChildSafeEnviro Health Report — {risk_level} Risk ({risk_score}/100)",
            "htmlContent": self._build_html(report, pdf_url, to_name),
            "attachment": [
                {"content": base64.b64encode(pdf_bytes).decode("ascii"), "name": pdf_filename}
            ],
        }
        headers = {
            "api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        async with httpx.AsyncClient(timeout=httpx.Timeout(30.0)) as client:
            response = await client.post(self.BREVO_URL, json=payload, headers=headers)

        if response.status_code >= 400:
            raise RuntimeError(f"Brevo send failed ({response.status_code}): {response.text}")


email_service = EmailService()
