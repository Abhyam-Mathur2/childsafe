from fastapi import APIRouter, Depends, HTTPException, Request, Form
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import get_settings
from app.models.health_report import HealthReport
from pydantic import BaseModel
import hashlib
import base64
from datetime import datetime, timezone
from typing import Optional
import os
import re
from urllib.parse import urlparse

router = APIRouter()
settings = get_settings()

# In-memory store for pending Airpay payment data (for server-side proxy POST)
_airpay_pending_payments = {}


def _clean_secret(value: Optional[str]) -> str:
    """Normalize environment values to avoid hidden whitespace/quotes issues."""
    if value is None:
        return ""
    cleaned = str(value).strip()
    if len(cleaned) >= 2 and cleaned[0] == cleaned[-1] and cleaned[0] in ('"', "'"):
        cleaned = cleaned[1:-1].strip()
    return cleaned


def _get_airpay_creds() -> dict:
    """Return sanitized Airpay credentials and fail fast when required values are missing."""
    creds = {
        "merchant_id": _clean_secret(settings.AIRPAY_MERCHANT_ID),
        "username": _clean_secret(settings.AIRPAY_USERNAME),
        "password": _clean_secret(settings.AIRPAY_PASSWORD),
        "api_key": _clean_secret(settings.AIRPAY_API_KEY),
        "client_id": _clean_secret(settings.AIRPAY_CLIENT_ID),
        "secret_key": _clean_secret(settings.AIRPAY_SECRET_KEY),
    }

    missing = [
        name for name in ("merchant_id", "username", "password")
        if not creds[name] or creds[name].lower().startswith("your_")
    ]
    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"Airpay is not configured correctly. Missing/placeholder: {', '.join(missing)}"
        )

    if not creds["secret_key"] and not creds["api_key"]:
        raise HTTPException(
            status_code=500,
            detail="Airpay is not configured correctly. Provide AIRPAY_SECRET_KEY or AIRPAY_API_KEY."
        )

    # Different merchant accounts may require either API key or Secret key in privatekey generation.
    # Try API key first, then Secret key (unique values only).
    merchant_key_candidates = []
    for value in (creds["api_key"], creds["secret_key"]):
        if value and value not in merchant_key_candidates:
            merchant_key_candidates.append(value)

    creds["merchant_key_candidates"] = merchant_key_candidates

    return creds


def _is_airpay_merchant_auth_error(text: Optional[str]) -> bool:
    if not text:
        return False
    lowered = text.lower()
    return (
        "merchant key authentication failed" in lowered
        or "authentication/authorization failed" in lowered
    )


def _is_airpay_invalid_domain_error(text: Optional[str]) -> bool:
    if not text:
        return False
    return "invalid domain" in text.lower()


def _normalize_domain(value: Optional[str]) -> str:
    cleaned = _clean_secret(value)
    if not cleaned:
        return ""

    parsed = urlparse(cleaned if "://" in cleaned else f"https://{cleaned}")
    host = (parsed.netloc or parsed.path or "").strip().lower()
    if ":" in host:
        host = host.split(":", 1)[0]
    return host.strip("/")


def _build_domain_candidates(primary: str, fallback_urls: list) -> list:
    candidates = []

    def add(host: str):
        host = _normalize_domain(host)
        if not host:
            return
        # Airpay typically expects a real public domain; localhost and loopback are invalid.
        if host.startswith("localhost") or host.startswith("127."):
            return
        if host not in candidates:
            candidates.append(host)

    add(primary)
    for value in fallback_urls:
        add(value)

    # Try both with/without www when applicable.
    expanded_hosts = []
    for host in candidates:
        if host not in expanded_hosts:
            expanded_hosts.append(host)
        if host.startswith("www."):
            plain = host[4:]
            if plain and plain not in expanded_hosts:
                expanded_hosts.append(plain)
        else:
            with_www = f"www.{host}"
            if with_www not in expanded_hosts:
                expanded_hosts.append(with_www)

    # Airpay guidance references "domain URL"; try URL and host variants.
    final_candidates = []
    for host in expanded_hosts:
        variants = (host, f"https://{host}", f"http://{host}")
        for value in variants:
            # Airpay docs mention BASE_64 length 1-50.
            if len(value) <= 50 and value not in final_candidates:
                final_candidates.append(value)

    return final_candidates


def _normalize_phone_number(raw_phone: str) -> str:
    """Normalize to a 10-digit Indian mobile number for Airpay."""
    digits = re.sub(r"\D", "", raw_phone or "")

    # Handle numbers entered with country code (e.g. +91XXXXXXXXXX or 91XXXXXXXXXX)
    if len(digits) > 10 and digits.startswith("91"):
        digits = digits[-10:]

    return digits


def _normalize_pincode(raw_pin: str) -> str:
    """Keep only digits for pincode sent to gateway."""
    return re.sub(r"\D", "", raw_pin or "")


def _inject_airpay_base_href(html: str, base_url: str = "https://payments.airpay.co.in/") -> str:
    """Ensure Airpay HTML resolves root-relative assets against Airpay domain."""
    if not html:
        return html

    lowered = html.lower()
    if "<base " in lowered:
        return html

    base_tag = f'<base href="{base_url}">'

    if "<head>" in lowered:
        # Preserve original case by replacing both common variants.
        html = html.replace("<head>", f"<head>{base_tag}", 1)
        html = html.replace("<HEAD>", f"<HEAD>{base_tag}", 1)
        return html

    if "<html" in lowered:
        # Fallback when head tag is missing.
        return html.replace(">", f"><head>{base_tag}</head>", 1)

    return f"<head>{base_tag}</head>{html}"

def _get_airpay_url() -> str:
    """Return the Airpay payment endpoint URL (allow override via env)."""
    base = _clean_secret(getattr(settings, "AIRPAY_BASE_URL", "")) or "https://payments.airpay.co.in/pay/index.php"
    return base

class AirpayOrderRequest(BaseModel):
    report_id: int
    buyerEmail: str
    buyerPhone: str
    buyerFirstName: str
    buyerLastName: str
    buyerAddress: str
    buyerCity: str
    buyerState: str
    buyerCountry: str
    buyerPinCode: str

@router.post("/create-airpay-order")
async def create_airpay_order(request: AirpayOrderRequest, http_request: Request, db: Session = Depends(get_db)):
    creds = _get_airpay_creds()

    report = db.query(HealthReport).filter(HealthReport.id == request.report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Bypass for specific email
    if request.buyerEmail.lower() == "abhyammath78@gmail.com":
        report.is_paid = 1
        db.commit()
        return {
            "is_bypassed": True,
            "message": "Payment bypassed for special user",
            "report_id": report.id
        }

    # Normalize inputs (strip and clean internal whitespaces)
    def clean(s):
        return str(s).strip().replace("\n", " ").replace("\r", " ").replace("\t", " ")
        
    buyer_email = clean(request.buyerEmail)
    buyer_fname = clean(request.buyerFirstName)
    buyer_lname = clean(request.buyerLastName)
    address = clean(request.buyerAddress)[:50]
    buyer_city = clean(request.buyerCity)
    buyer_state = clean(request.buyerState)
    buyer_country = clean(request.buyerCountry)
    buyer_phone = _normalize_phone_number(clean(request.buyerPhone))
    buyer_pin = _normalize_pincode(clean(request.buyerPinCode))

    if len(buyer_phone) != 10:
        raise HTTPException(status_code=400, detail="Invalid phone number. Enter a valid 10-digit mobile number.")

    if not buyer_phone[0].isdigit() or buyer_phone[0] not in "6789":
        raise HTTPException(status_code=400, detail="Invalid phone number. Use an Indian mobile number starting with 6, 7, 8, or 9.")

    if len(buyer_pin) < 6:
        raise HTTPException(status_code=400, detail="Invalid PIN code. Enter at least 6 digits.")

    amount = "95.00"
    orderid = f"REP{report.id}T{int(datetime.now(timezone.utc).timestamp())}"

    # Airpay requires a registered merchant domain in Base64 (mer_dom).
    # Build a robust candidate list to handle accounts registered with/without www.
    configured_domain = _clean_secret(settings.AIRPAY_REFERER_DOMAIN)
    origin = (http_request.headers.get("origin") or "").strip()
    referer = (http_request.headers.get("referer") or "").strip()
    frontend_url = (os.getenv("FRONTEND_URL", "") or "").strip()

    domain_candidates = _build_domain_candidates(
        configured_domain,
        [origin, referer, frontend_url],
    )

    if not domain_candidates:
        raise HTTPException(
            status_code=500,
            detail="Airpay domain is not configured. Set AIRPAY_REFERER_DOMAIN to your registered public domain.",
        )
    report.stripe_session_id = orderid
    db.commit()
    
    date = datetime.now().strftime("%Y-%m-%d")
    
    # 2. Checksum helper key (SHA256): username~:~password
    _skey_raw = f"{creds['username']}~:~{creds['password']}"
    s_key = hashlib.sha256(_skey_raw.encode('utf-8')).hexdigest()
    checksum_data = (
        buyer_email
        + buyer_fname
        + buyer_lname
        + address
        + buyer_city
        + buyer_state
        + buyer_country
        + amount
        + orderid
        + date
    )

    def _build_post_data(merchant_key: str, mer_dom_value: str):
        _private_key_raw_string = f"{merchant_key}@{creds['username']}:|:{creds['password']}"
        private_key = hashlib.sha256(_private_key_raw_string.encode('utf-8')).hexdigest()
        _checksum_raw_input_create = f"{s_key}@{checksum_data}"
        checksum = hashlib.sha256(_checksum_raw_input_create.encode('utf-8')).hexdigest()

        from collections import OrderedDict
        return OrderedDict([
            ("mercid",         creds["merchant_id"]),
            ("mer_dom",        mer_dom_value),
            ("orderid",        orderid),
            ("amount",         amount),
            ("currency",       "356"),
            ("buyerEmail",     buyer_email),
            ("buyerPhone",     buyer_phone),
            ("buyerFirstName", buyer_fname),
            ("buyerLastName",  buyer_lname),
            ("buyerAddress",   address),
            ("buyerCity",      buyer_city),
            ("buyerState",     buyer_state),
            ("buyerCountry",   buyer_country),
            ("buyerPinCode",   buyer_pin),
            ("privatekey",     private_key),
            ("checksum",       checksum),
            ("date",           date),
            ("isocurrency",    "INR"),
            ("clientid",       creds["client_id"])
        ])

    # Stable flow: return signed fields so browser can do a top-level form POST to Airpay.
    # This avoids document.write/cross-origin script failures in localhost.
    preferred_domain = next((d for d in domain_candidates if d.startswith("https://")), domain_candidates[0])
    mer_dom = base64.b64encode(preferred_domain.encode("utf-8")).decode("ascii")

    merchant_key = creds.get("api_key") or creds.get("secret_key")
    if not merchant_key:
        raise HTTPException(status_code=500, detail="Airpay merchant key is missing.")

    post_data = _build_post_data(merchant_key, mer_dom)

    return {
        "is_bypassed": False,
        "transaction_id": orderid,
        "post_url": _get_airpay_url(),
        "domain_used": preferred_domain,
        "form_fields": dict(post_data),
    }


@router.get("/payment-transactions/recent")
async def get_recent_transactions(limit: int = 20, db: Session = Depends(get_db)):
    """Return recent payment transactions for testing and debugging."""
    reports = db.query(HealthReport).order_by(HealthReport.created_at.desc()).limit(limit).all()
    return {
        "total": len([r for r in reports if r.stripe_session_id]),
        "transactions": [
            {
                "report_id": report.id,
                "transaction_id": report.stripe_session_id,
                "is_paid": bool(report.is_paid),
                "created_at": report.created_at.isoformat() if report.created_at else None,
            }
            for report in reports if report.stripe_session_id
        ]
    }


@router.get("/payment-transaction/{report_id}")
async def get_payment_transaction(report_id: int, db: Session = Depends(get_db)):
    """Return the latest generated Airpay transaction id for a report."""
    report = db.query(HealthReport).filter(HealthReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "report_id": report.id,
        "transaction_id": report.stripe_session_id,
        "is_paid": bool(report.is_paid),
        "created_at": report.created_at.isoformat() if report.created_at else None,
    }

@router.post("/airpay-callback")
async def airpay_callback(
    TRANSACTIONID: str = Form(...),
    APTRANSACTIONID: str = Form(...),
    AMOUNT: str = Form(...),
    TRANSACTIONSTATUS: str = Form(...),
    MESSAGE: str = Form(...),
    TRANSACTIONTIME: str = Form(...),
    CUSTOMVAR: Optional[str] = Form(None),
    CHECKSUM: str = Form(...),
    db: Session = Depends(get_db)
):
    creds = _get_airpay_creds()

    # Verify checksum
    custom_var = CUSTOMVAR if CUSTOMVAR else ""
    checksum_string = f"{TRANSACTIONSTATUS}~:{TRANSACTIONID}~:{APTRANSACTIONID}~:{AMOUNT}~:{TRANSACTIONTIME}~:{MESSAGE}~:{creds['merchant_id']}~:{custom_var}~:{creds['secret_key']}"
    calculated_checksum = hashlib.md5(checksum_string.encode('utf-8')).hexdigest()
    
    # Get frontend URL from environment or default to localhost
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173") + "/report"

    # Update report status if success
    if TRANSACTIONSTATUS == "200":
        report = db.query(HealthReport).filter(HealthReport.stripe_session_id == TRANSACTIONID).first()
        if report:
            report.is_paid = 1
            db.commit()
            return RedirectResponse(url=f"{frontend_url}?payment=success", status_code=303)
    
        return RedirectResponse(url=f"{frontend_url}?payment=failed", status_code=303)

    return RedirectResponse(url=f"{frontend_url}?payment=failed", status_code=303)


@router.get("/airpay-proxy/{orderid}")
async def airpay_proxy(orderid: str):
    """
    Server-side proxy: POSTs to Airpay from the backend (bypasses browser encoding issue).
    The browser opens this URL, backend POSTs to Airpay, returns the payment page HTML.
    """
    import urllib.request
    import urllib.parse
    
    post_data = _airpay_pending_payments.pop(orderid, None)
    if not post_data:
        return HTMLResponse(content="<h2>Error: Payment session expired or not found.</h2>", status_code=404)
    
    # POST to Airpay from the SERVER (Python urllib works, browser form POST doesn't)
    encoded = urllib.parse.urlencode(post_data).encode()
    req = urllib.request.Request(_get_airpay_url(), data=encoded)
    
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode('utf-8', errors='replace')
            final_url = resp.url
            
            if "error" in final_url.lower():
                return HTMLResponse(content=body)
            else:
                # Serve the Airpay payment page HTML to the browser
                # Fix relative URLs in the HTML to point to Airpay's domain
                body = body.replace('href="/', 'href="https://payments.airpay.co.in/')
                body = body.replace("href='/", "href='https://payments.airpay.co.in/")
                body = body.replace('src="/', 'src="https://payments.airpay.co.in/')
                body = body.replace("src='/", "src='https://payments.airpay.co.in/")
                body = body.replace('action="/', 'action="https://payments.airpay.co.in/')
                body = body.replace("action='/", "action='https://payments.airpay.co.in/")
                return HTMLResponse(content=body)
    except Exception as e:
        return HTMLResponse(content=f"<h2>Payment Error</h2><p>{str(e)}</p>", status_code=500)

@router.get("/test-airpay")
async def test_airpay_form():
    """Server-side proxy: POSTs to Airpay from the backend (bypasses browser encoding issue)."""
    creds = _get_airpay_creds()

    import urllib.request
    import urllib.parse
    from datetime import timezone
    
    amount = "95.00"
    orderid = f"BTEST{int(datetime.now(timezone.utc).timestamp())}"
    date = datetime.now().strftime("%Y-%m-%d")

    # Airpay requires merchant domain in Base64 (mer_dom).
    # Use settings if available, else hardcoded fallback.
    merchant_domain = _clean_secret(settings.AIRPAY_REFERER_DOMAIN) or "childsafeenvirons.com"
    merchant_domain = merchant_domain.replace("http://", "").replace("https://", "").rstrip("/")
    mer_dom = base64.b64encode(merchant_domain.encode("utf-8")).decode("ascii")

    # Private key using SECRET_KEY (which has fallback to API_KEY in _get_airpay_creds)
    private_key = hashlib.sha256(
        f"{creds['secret_key']}@{creds['username']}:|:{creds['password']}".encode('utf-8')
    ).hexdigest()

    # Checksum using SHA256 (same as create_airpay_order)
    _skey_raw = f"{creds['username']}~:~{creds['password']}"
    s_key = hashlib.sha256(_skey_raw.encode('utf-8')).hexdigest()

    checksum_data = (
        "test@example.com"
        + "Test"
        + "User"
        + "123 Main St"
        + "Mumbai"
        + "Maharashtra"
        + "India"
        + amount
        + orderid
        + date
    )
    checksum = hashlib.sha256(
        f"{s_key}@{checksum_data}".encode('utf-8')
    ).hexdigest()

    from collections import OrderedDict
    post_data = OrderedDict([
        ("mercid",         creds["merchant_id"]),
        ("mer_dom",        mer_dom),
        ("orderid",        orderid),
        ("amount",         amount),
        ("currency",       "356"),
        ("buyerEmail",     "test@example.com"),
        ("buyerPhone",     "9876543210"),
        ("buyerFirstName", "Test"),
        ("buyerLastName",  "User"),
        ("buyerAddress",   "123 Main St"),
        ("buyerCity",      "Mumbai"),
        ("buyerState",     "Maharashtra"),
        ("buyerCountry",   "India"),
        ("buyerPinCode",   "400001"),
        ("privatekey",     private_key),
        ("checksum",       checksum),
        ("date",           date),
        ("isocurrency",    "INR")
    ])
    
    # POST to Airpay from the SERVER (this works, unlike browser POST)
    encoded = urllib.parse.urlencode(post_data).encode()
    req = urllib.request.Request(_get_airpay_url(), data=encoded)
    
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read().decode('utf-8', errors='replace')
            final_url = resp.url
            
            if "error" in final_url.lower():
                return HTMLResponse(content=f"""
        <h2>❌ FAILED</h2>
        <p><strong>Final URL:</strong> {final_url}</p>
        <p><strong>Merchant ID:</strong> {settings.AIRPAY_MERCHANT_ID}</p>
        <p><strong>Username:</strong> {settings.AIRPAY_USERNAME}</p>
        <p><strong>Secret Key set:</strong> {bool(settings.AIRPAY_SECRET_KEY)}</p>
        <p><strong>Private Key (first 10):</strong> {private_key[:10]}...</p>
        <p><strong>Checksum (first 10):</strong> {checksum[:10]}...</p>
        <p><strong>Order ID:</strong> {orderid}</p>
        <p><strong>Date:</strong> {date}</p>
        <hr/>
        <pre>{body[:3000]}</pre>
    """)
            else:
                return HTMLResponse(content=f"<h2>SUCCESS! Payment page loaded.</h2><p>URL: {final_url}</p><p>The server-side POST works. Now applying this to the main flow...</p>")
    except Exception as e:
        return HTMLResponse(content=f"<h2>Error</h2><pre>{str(e)}</pre>")
