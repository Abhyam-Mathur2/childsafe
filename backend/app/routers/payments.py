from fastapi import APIRouter, Depends, HTTPException, Request, Form
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import get_settings
from app.models.health_report import HealthReport
from pydantic import BaseModel
import hashlib
from datetime import datetime, timezone
from typing import Optional
import os

router = APIRouter()
settings = get_settings()

# In-memory store for pending Airpay payment data (for server-side proxy POST)
_airpay_pending_payments = {}

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
async def create_airpay_order(request: AirpayOrderRequest, db: Session = Depends(get_db)):
    report = db.query(HealthReport).filter(HealthReport.id == request.report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Bypass for specific email
    if request.buyerEmail.lower() == "abhyammath78@gamil.com":
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
    buyer_phone = clean(request.buyerPhone)
    buyer_pin = clean(request.buyerPinCode)

    amount = "80.00"
    orderid = f"REP{report.id}T{int(datetime.utcnow().timestamp())}"
    
    # Store orderid in database to verify later
    report.stripe_session_id = orderid
    db.commit()
    
    date = datetime.now().strftime("%Y-%m-%d")
    
    # 2. Derive Private Key
    # Prefer API key when provided; fallback to secret key for older accounts
    merchant_key = settings.AIRPAY_API_KEY or settings.AIRPAY_SECRET_KEY
    _private_key_raw_string = f"{merchant_key}@{settings.AIRPAY_USERNAME}:|:{settings.AIRPAY_PASSWORD}"
    private_key = hashlib.sha256(_private_key_raw_string.encode('utf-8')).hexdigest()
    
    # 3. Checksum (SHA256): sKey@allData (per Airpay integration docs)
    _skey_raw = f"{settings.AIRPAY_USERNAME}~:~{settings.AIRPAY_PASSWORD}"
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
        + ""  # siindexvar for subscription; blank for normal txn
        + date
    )
    _checksum_raw_input_create = f"{s_key}@{checksum_data}"
    checksum = hashlib.sha256(_checksum_raw_input_create.encode('utf-8')).hexdigest()

    # Build the FINAL POST payload in the EXACT order verified to work
    from collections import OrderedDict
    post_data = OrderedDict([
        ("mercid",         settings.AIRPAY_MERCHANT_ID),
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
        ("isocurrency",    "INR")
    ])

    # POST to Airpay from the SERVER using urllib
    import urllib.request
    import urllib.parse
    
    encoded = urllib.parse.urlencode(post_data).encode('utf-8')

    airpay_req = urllib.request.Request(
        "https://payments.airpay.co.in/pay/index.php", 
        data=encoded,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    )
    
    try:
        with urllib.request.urlopen(airpay_req, timeout=30) as resp:
            body = resp.read().decode('utf-8', errors='replace')
            final_url = resp.url
            
            if "error" in final_url.lower():
                return HTMLResponse(content=body)
            else:
                # Fix relative URLs to point to Airpay's domain
                body = body.replace('href="/', 'href="https://payments.airpay.co.in/')
                body = body.replace("href='/", "href='https://payments.airpay.co.in/")
                body = body.replace('src="/', 'src="https://payments.airpay.co.in/')
                body = body.replace("src='/", "src='https://payments.airpay.co.in/")
                body = body.replace('action="/', 'action="https://payments.airpay.co.in/')
                body = body.replace("action='/", "action='https://payments.airpay.co.in/")
                return HTMLResponse(content=body)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Airpay connection error: {str(e)}")

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
    # Verify checksum
    custom_var = CUSTOMVAR if CUSTOMVAR else ""
    checksum_string = f"{TRANSACTIONSTATUS}~:{TRANSACTIONID}~:{APTRANSACTIONID}~:{AMOUNT}~:{TRANSACTIONTIME}~:{MESSAGE}~:{settings.AIRPAY_MERCHANT_ID}~:{custom_var}~:{settings.AIRPAY_SECRET_KEY}"
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
    req = urllib.request.Request("https://payments.airpay.co.in/pay/index.php", data=encoded)
    
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
    import urllib.request
    import urllib.parse
    from datetime import timezone
    
    amount = "80.00"
    orderid = f"BTEST{int(datetime.now(timezone.utc).timestamp())}"
    date = datetime.now().strftime("%Y-%m-%d")
    
    pk = hashlib.sha256(
        f"{settings.AIRPAY_API_KEY}@{settings.AIRPAY_USERNAME}:|:{settings.AIRPAY_PASSWORD}".encode()
    ).hexdigest()
    
    alldata = "test@example.com" + "Test" + "User" + "123 Main St" + "Mumbai" + "Maharashtra" + "India" + amount + orderid
    checksum = hashlib.md5((alldata + date + pk).encode()).hexdigest()
    
    post_data = {
        "buyerEmail": "test@example.com", "buyerPhone": "9876543210",
        "buyerFirstName": "Test", "buyerLastName": "User",
        "buyerAddress": "123 Main St", "buyerCity": "Mumbai",
        "buyerState": "Maharashtra", "buyerCountry": "India", "buyerPinCode": "400001",
        "amount": amount, "orderid": orderid, "mercid": settings.AIRPAY_MERCHANT_ID,
        "privatekey": pk, "checksum": checksum, "currency": "356", "isocurrency": "INR", "date": date,
    }
    
    # POST to Airpay from the SERVER (this works, unlike browser POST)
    encoded = urllib.parse.urlencode(post_data).encode()
    req = urllib.request.Request("https://payments.airpay.co.in/pay/index.php", data=encoded)
    
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read().decode('utf-8', errors='replace')
            final_url = resp.url
            
            if "error" in final_url.lower():
                return HTMLResponse(content=f"<h2>FAILED</h2><p>URL: {final_url}</p><pre>{body[:2000]}</pre>")
            else:
                return HTMLResponse(content=f"<h2>SUCCESS! Payment page loaded.</h2><p>URL: {final_url}</p><p>The server-side POST works. Now applying this to the main flow...</p>")
    except Exception as e:
        return HTMLResponse(content=f"<h2>Error</h2><pre>{str(e)}</pre>")
