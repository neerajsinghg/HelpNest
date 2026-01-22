from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.routes.auth import get_current_user
from app.models.user import UserInDB, Role
from app.models.service_provider_profile import KYCStatus
from app.core.database import db
from bson import ObjectId

router = APIRouter()

# ========== User Management ==========
@router.get("/users")
async def list_users(
    role: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_user)
):
    """List all users (admin only)"""
    if current_user.current_role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = {}
    if role:
        query["roles"] = role
    
    users = await db.get_db().users.find(query).to_list(1000)
    for u in users:
        u["_id"] = str(u["_id"])
        del u["hashed_password"]  # Don't expose passwords
    return users

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    is_active: bool,
    current_user: UserInDB = Depends(get_current_user)
):
    """Activate/deactivate user"""
    if current_user.current_role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.get_db().users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": is_active}}
    )
    return {"message": f"User {'activated' if is_active else 'deactivated'} successfully"}

# ========== KYC Management ==========
@router.get("/kyc/pending")
async def list_pending_kyc(current_user: UserInDB = Depends(get_current_user)):
    """List all pending KYC submissions"""
    if current_user.current_role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    profiles = await db.get_db().service_provider_profiles.find(
        {"kyc_status": KYCStatus.PENDING}
    ).to_list(100)
    
    for p in profiles:
        p["_id"] = str(p["_id"])
    return profiles

@router.put("/kyc/{profile_id}/approve")
async def approve_kyc(
    profile_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Approve KYC submission"""
    if current_user.current_role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    profile = await db.get_db().service_provider_profiles.find_one({"_id": ObjectId(profile_id)})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    await db.get_db().service_provider_profiles.update_one(
        {"_id": ObjectId(profile_id)},
        {"$set": {"kyc_status": KYCStatus.APPROVED}}
    )
    
    # Add provider role to user if not already present
    await db.get_db().users.update_one(
        {"_id": ObjectId(profile["user_id"])},
        {"$addToSet": {"roles": Role.PROVIDER}}
    )
    
    # TODO: Send notification to provider
    return {"message": "KYC approved successfully"}

@router.put("/kyc/{profile_id}/reject")
async def reject_kyc(
    profile_id: str,
    reason: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Reject KYC submission"""
    if current_user.current_role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.get_db().service_provider_profiles.update_one(
        {"_id": ObjectId(profile_id)},
        {"$set": {"kyc_status": KYCStatus.REJECTED, "kyc_rejection_reason": reason}}
    )
    
    # TODO: Send notification to provider
    return {"message": "KYC rejected", "reason": reason}

# ========== Analytics ==========
@router.get("/analytics/overview")
async def get_analytics_overview(current_user: UserInDB = Depends(get_current_user)):
    """Get platform analytics overview"""
    if current_user.current_role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_users = await db.get_db().users.count_documents({})
    total_providers = await db.get_db().service_provider_profiles.count_documents({})
    total_jobs = await db.get_db().jobs.count_documents({})
    completed_jobs = await db.get_db().jobs.count_documents({"status": "completed"})
    pending_kyc = await db.get_db().service_provider_profiles.count_documents({"kyc_status": KYCStatus.PENDING})
    
    # Calculate total revenue (completed payments)
    completed_payments = await db.get_db().payments.find({"status": "completed"}).to_list(10000)
    total_revenue = sum(p.get("amount", 0) for p in completed_payments)
    
    return {
        "total_users": total_users,
        "total_providers": total_providers,
        "total_jobs": total_jobs,
        "completed_jobs": completed_jobs,
        "pending_kyc": pending_kyc,
        "total_revenue": total_revenue
    }

@router.get("/analytics/payments")
async def get_payment_analytics(current_user: UserInDB = Depends(get_current_user)):
    """Get payment analytics"""
    if current_user.current_role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    payments = await db.get_db().payments.find({}).to_list(10000)
    
    by_method = {}
    by_status = {}
    
    for p in payments:
        method = p.get("payment_method", "unknown")
        status = p.get("status", "unknown")
        
        by_method[method] = by_method.get(method, 0) + 1
        by_status[status] = by_status.get(status, 0) + 1
    
    return {
        "by_payment_method": by_method,
        "by_status": by_status,
        "total_payments": len(payments)
    }
