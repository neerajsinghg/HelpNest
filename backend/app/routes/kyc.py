from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from app.routes.auth import get_current_user
from app.models.user import UserInDB, Role
from app.models.service_provider_profile import (
    ServiceProviderProfileCreate,
    ServiceProviderProfileResponse,
    KYCStatus,
    KYCDocument
)
from app.core.database import db
from bson import ObjectId
from datetime import datetime
import gridfs

router = APIRouter()

@router.post("/profile", response_model=ServiceProviderProfileResponse)
async def create_provider_profile(
    profile: ServiceProviderProfileCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    """Create or update service provider profile"""
    if Role.PROVIDER not in current_user.roles:
        raise HTTPException(status_code=403, detail="User must have provider role")
    
    profile_dict = profile.model_dump()
    profile_dict["user_id"] = str(current_user.id)
    
    # Check if profile exists
    existing = await db.get_db().service_provider_profiles.find_one({"user_id": str(current_user.id)})
    if existing:
        # Update existing
        await db.get_db().service_provider_profiles.update_one(
            {"user_id": str(current_user.id)},
            {"$set": profile_dict}
        )
        updated = await db.get_db().service_provider_profiles.find_one({"user_id": str(current_user.id)})
        updated["_id"] = str(updated["_id"])
        return ServiceProviderProfileResponse(**updated)
    
    # Create new
    new_profile = await db.get_db().service_provider_profiles.insert_one(profile_dict)
    created = await db.get_db().service_provider_profiles.find_one({"_id": new_profile.inserted_id})
    created["_id"] = str(created["_id"])
    return ServiceProviderProfileResponse(**created)

@router.get("/profile", response_model=ServiceProviderProfileResponse)
async def get_provider_profile(current_user: UserInDB = Depends(get_current_user)):
    """Get current user's provider profile"""
    profile = await db.get_db().service_provider_profiles.find_one({"user_id": str(current_user.id)})
    if not profile:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    
    profile["_id"] = str(profile["_id"])
    return ServiceProviderProfileResponse(**profile)

@router.post("/kyc/upload")
async def upload_kyc_document(
    document_type: str,
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user)
):
    """Upload KYC document (Aadhar, PAN, Photo) to MongoDB GridFS"""
    if Role.PROVIDER not in current_user.roles:
        raise HTTPException(status_code=403, detail="Only providers can upload KYC")
    
    # Get GridFS
    fs = gridfs.GridFS(db.get_db())
    
    # Upload file
    file_content = await file.read()
    file_id = fs.put(
        file_content,
        filename=file.filename,
        content_type=file.content_type,
        user_id=str(current_user.id),
        document_type=document_type
    )
    
    # Update provider profile with KYC document
    kyc_doc = {
        "document_type": document_type,
        "file_id": str(file_id),
        "uploaded_at": datetime.utcnow()
    }
    
    await db.get_db().service_provider_profiles.update_one(
        {"user_id": str(current_user.id)},
        {
            "$push": {"kyc_documents": kyc_doc},
            "$set": {"kyc_status": KYCStatus.PENDING}
        },
        upsert=True
    )
    
    return {
        "message": "KYC document uploaded successfully",
        "file_id": str(file_id),
        "document_type": document_type
    }

@router.get("/kyc/download/{file_id}")
async def download_kyc_document(
    file_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Download KYC document (admin only or own documents)"""
    fs = gridfs.GridFS(db.get_db())
    
    try:
        file = fs.get(ObjectId(file_id))
        
        # Check permissions
        if current_user.current_role != Role.ADMIN and file.user_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to view this document")
        
        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "data": file.read()
        }
    except:
        raise HTTPException(status_code=404, detail="File not found")
