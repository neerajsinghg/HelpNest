from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.routes.auth import get_current_user
from app.models.user import UserInDB, Role
from app.models.service_provider_profile import TimeSlot
from app.core.database import db
from bson import ObjectId

router = APIRouter()

@router.put("/availability", response_model=dict)
async def update_availability(
    availability: List[TimeSlot],
    current_user: UserInDB = Depends(get_current_user)
):
    """Update provider availability schedule"""
    if current_user.current_role != Role.PROVIDER:
        raise HTTPException(status_code=403, detail="Only providers can update availability")
    
    # Convert to dict for MongoDB storage
    availability_list = [slot.model_dump() for slot in availability]
    
    await db.get_db().service_provider_profiles.update_one(
        {"user_id": str(current_user.id)},
        {"$set": {"availability": availability_list}},
        upsert=True
    )
    
    return {"message": "Availability updated successfully", "availability": availability_list}

@router.get("/availability", response_model=List[TimeSlot])
async def get_availability(current_user: UserInDB = Depends(get_current_user)):
    """Get provider's current availability"""
    profile = await db.get_db().service_provider_profiles.find_one({"user_id": str(current_user.id)})
    
    if not profile:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    
    return profile.get("availability", [])

@router.get("/earnings")
async def get_earnings(current_user: UserInDB = Depends(get_current_user)):
    """Get provider earnings summary"""
    if current_user.current_role != Role.PROVIDER:
        raise HTTPException(status_code=403, detail="Only providers can view earnings")
    
    # Get provider profile
    profile = await db.get_db().service_provider_profiles.find_one({"user_id": str(current_user.id)})
    
    if not profile:
        return {
            "total_earnings": 0,
            "jobs_completed": 0,
            "average_rating": 0,
            "earnings_history": []
        }
    
    # Get completed jobs with payments
    completed_jobs = await db.get_db().jobs.find({
        "provider_id": str(current_user.id),
        "status": "completed",
        "payment_id": {"$exists": True}
    }).to_list(1000)
    
    # Get payment details
    job_ids = [job["_id"] for job in completed_jobs]
    payments = await db.get_db().payments.find({
        "provider_id": str(current_user.id),
        "status": "completed"
    }).to_list(1000)
    
    # Calculate earnings by month
    from collections import defaultdict
    from datetime import datetime
    
    monthly_earnings = defaultdict(float)
    for payment in payments:
        if payment.get("completed_at"):
            month_key = payment["completed_at"].strftime("%Y-%m")
            monthly_earnings[month_key] += payment["amount"]
    
    earnings_history = [
        {"month": month, "amount": amount}
        for month, amount in sorted(monthly_earnings.items())
    ]
    
    return {
        "total_earnings": profile.get("total_earnings", 0),
        "jobs_completed": profile.get("total_jobs_completed", 0),
        "average_rating": profile.get("average_rating", 0),
        "earnings_history": earnings_history,
        "recent_payments": payments[-10:]  # Last 10 payments
    }
