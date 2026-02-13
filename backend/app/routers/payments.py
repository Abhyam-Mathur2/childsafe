from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import razorpay
from app.database import get_db
from app.config import get_settings
from app.models.health_report import HealthReport
from pydantic import BaseModel
import hmac
import hashlib

router = APIRouter()
settings = get_settings()

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

@router.get("/razorpay-config")
async def get_config():
    return {"key": settings.RAZORPAY_KEY_ID}

class OrderRequest(BaseModel):
    report_id: int

class VerifyRequest(BaseModel):
    report_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@router.post("/create-razorpay-order")
async def create_order(request: OrderRequest, db: Session = Depends(get_db)):
    report = db.query(HealthReport).filter(HealthReport.id == request.report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    amount = 500 * 100  # Rs. 500 (Razorpay expects amount in paise)
    data = {
        "amount": amount,
        "currency": "INR",
        "receipt": f"report_{report.id}",
        "notes": {
            "report_id": report.id
        }
    }
    
    try:
        order = client.order.create(data=data)
        # We can store the order_id in stripe_session_id column for now or rename it
        report.stripe_session_id = order['id'] 
        db.commit()
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-razorpay-payment")
async def verify_payment(request: VerifyRequest, db: Session = Depends(get_db)):
    # Verify the signature
    params_dict = {
        'razorpay_order_id': request.razorpay_order_id,
        'razorpay_payment_id': request.razorpay_payment_id,
        'razorpay_signature': request.razorpay_signature
    }
    
    try:
        client.utility.verify_payment_signature(params_dict)
        
        # If verification passes, update report status
        report = db.query(HealthReport).filter(HealthReport.id == request.report_id).first()
        if report:
            report.is_paid = 1
            db.commit()
            return {"status": "success"}
        else:
            raise HTTPException(status_code=404, detail="Report not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid signature")