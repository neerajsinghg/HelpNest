from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List
from app.routes.auth import get_current_user
from app.models.user import UserInDB, Role
from app.models.job import JobCreate, JobResponse, JobStatus
from app.core.database import db
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=JobResponse)
async def create_job(job: JobCreate, current_user: UserInDB = Depends(get_current_user)):
    if current_user.current_role != Role.CUSTOMER:
        raise HTTPException(status_code=403, detail="Only customers can book jobs")
    
    job_dict = job.model_dump()
    job_dict["customer_id"] = str(current_user.id)
    job_dict["status"] = JobStatus.PENDING
    
    new_job = await db.get_db().jobs.insert_one(job_dict)
    created_job = await db.get_db().jobs.find_one({"_id": new_job.inserted_id})
    created_job["_id"] = str(created_job["_id"])
    
    # In a real app, send notification to provider here via WebSocket/FCM
    return JobResponse(**created_job)

@router.get("/", response_model=List[JobResponse])
async def list_jobs(current_user: UserInDB = Depends(get_current_user)):
    query = {}
    if current_user.current_role == Role.CUSTOMER:
        query["customer_id"] = str(current_user.id)
    elif current_user.current_role == Role.PROVIDER:
        query["provider_id"] = str(current_user.id)
    else:
        # Admin sees all?
        pass

    jobs = await db.get_db().jobs.find(query).to_list(100)
    for j in jobs:
        j["_id"] = str(j["_id"])
    return [JobResponse(**j) for j in jobs]
    
@router.put("/{job_id}/status", response_model=JobResponse)
async def update_job_status(job_id: str, status: JobStatus, current_user: UserInDB = Depends(get_current_user)):
    job = await db.get_db().jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Simple permission check
    if str(current_user.id) not in [job["provider_id"], job["customer_id"]]:
         raise HTTPException(status_code=403, detail="Not authorized")
         
    # Provider can Accept/Complete
    # Customer can Cancel
    # Keeping it simple for MVP
    
    await db.get_db().jobs.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"status": status}}
    )
    
    updated_job = await db.get_db().jobs.find_one({"_id": ObjectId(job_id)})
    updated_job["_id"] = str(updated_job["_id"])
    return JobResponse(**updated_job)
