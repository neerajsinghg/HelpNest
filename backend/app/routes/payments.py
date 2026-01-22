from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.routes.auth import get_current_user
from app.models.user import UserInDB, Role
from app.models.payment import PaymentCreate, PaymentResponse, PaymentStatus
from app.core.database import db
from bson import ObjectId
from datetime import datetime

router = APIRouter()

# Note: In production, integrate actual Razorpay/Stripe SDK here
# This is a simplified implementation

@router.post("/", response_model=PaymentResponse)
async def create_payment(
    payment: PaymentCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    """Create a payment for a job"""
    if current_user.current_role != Role.CUSTOMER:
        raise HTTPException(status_code=403, detail="Only customers can make payments")
    
    # Verify job exists and belongs to customer
    job = await db.get_db().jobs.find_one({"_id": ObjectId(payment.job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job["customer_id"] != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized for this job")
    
    payment_dict = payment.model_dump()
    payment_dict["status"] = PaymentStatus.PENDING
    
    # In production: Call Razorpay/Stripe API here
    # For now, simulate payment
    if payment.payment_method == "cod":
        payment_dict["status"] = PaymentStatus.PENDING
    else:
        # Simulate instant payment for UPI/Card/Wallet
        payment_dict["status"] = PaymentStatus.COMPLETED
        payment_dict["completed_at"] = datetime.utcnow()
        payment_dict["transaction_id"] = f"TXN_{datetime.utcnow().timestamp()}"
    
    new_payment = await db.get_db().payments.insert_one(payment_dict)
    
    # Update job with payment_id
    await db.get_db().jobs.update_one(
        {"_id": ObjectId(payment.job_id)},
        {"$set": {"payment_id": str(new_payment.inserted_id)}}
    )
    
    # Update provider earnings if payment completed
    if payment_dict["status"] == PaymentStatus.COMPLETED:
        await db.get_db().service_provider_profiles.update_one(
            {"user_id": payment.provider_id},
            {"$inc": {"total_earnings": payment.amount}}
        )
    
    created = await db.get_db().payments.find_one({"_id": new_payment.inserted_id})
    created["_id"] = str(created["_id"])
    return PaymentResponse(**created)

@router.get("/", response_model=List[PaymentResponse])
async def list_payments(current_user: UserInDB = Depends(get_current_user)):
    """List all payments for current user"""
    query = {}
    if current_user.current_role == Role.CUSTOMER:
        query["customer_id"] = str(current_user.id)
    elif current_user.current_role == Role.PROVIDER:
        query["provider_id"] = str(current_user.id)
    # Admin sees all
    
    payments = await db.get_db().payments.find(query).to_list(100)
    for p in payments:
        p["_id"] = str(p["_id"])
    return [PaymentResponse(**p) for p in payments]

@router.put("/{payment_id}/status")
async def update_payment_status(
    payment_id: str,
    status: PaymentStatus,
    current_user: UserInDB = Depends(get_current_user)
):
    """Update payment status (admin or system)"""
    if current_user.current_role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can update payment status")
    
    update_data = {"status": status}
    if status == PaymentStatus.COMPLETED:
        update_data["completed_at"] = datetime.utcnow()
    
    await db.get_db().payments.update_one(
        {"_id": ObjectId(payment_id)},
        {"$set": update_data}
    )
    
    return {"message": "Payment status updated"}
