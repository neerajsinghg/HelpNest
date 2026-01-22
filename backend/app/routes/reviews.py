from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.routes.auth import get_current_user
from app.models.user import UserInDB, Role
from app.models.review import ReviewCreate, ReviewResponse
from app.core.database import db
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=ReviewResponse)
async def create_review(
    review: ReviewCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    """Create a review for a provider after job completion"""
    if current_user.current_role != Role.CUSTOMER:
        raise HTTPException(status_code=403, detail="Only customers can review")
    
    # Verify job exists and is completed
    job = await db.get_db().jobs.find_one({"_id": ObjectId(review.job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job["customer_id"] != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job must be completed before reviewing")
    
    # Check if review already exists
    existing = await db.get_db().reviews.find_one({"job_id": review.job_id})
    if existing:
        raise HTTPException(status_code=400, detail="Review already exists for this job")
    
    review_dict = review.model_dump()
    new_review = await db.get_db().reviews.insert_one(review_dict)
    
    # Update provider's average rating
    provider_reviews = await db.get_db().reviews.find({"provider_id": review.provider_id}).to_list(1000)
    avg_rating = sum(r["rating"] for r in provider_reviews) / len(provider_reviews)
    
    await db.get_db().service_provider_profiles.update_one(
        {"user_id": review.provider_id},
        {
            "$set": {"average_rating": avg_rating}
        }
    )
    
    # Update service rating if applicable
    service = await db.get_db().services.find_one({"_id": ObjectId(job["service_id"])})
    if service:
        service_reviews = await db.get_db().reviews.find({
            "provider_id": review.provider_id
        }).to_list(1000)
        service_avg = sum(r["rating"] for r in service_reviews) / len(service_reviews)
        
        await db.get_db().services.update_one(
            {"_id": ObjectId(job["service_id"])},
            {
                "$set": {
                    "average_rating": service_avg,
                    "total_reviews": len(service_reviews)
                }
            }
        )
    
    created = await db.get_db().reviews.find_one({"_id": new_review.inserted_id})
    created["_id"] = str(created["_id"])
    return ReviewResponse(**created)

@router.get("/provider/{provider_id}", response_model=List[ReviewResponse])
async def get_provider_reviews(provider_id: str):
    """Get all reviews for a provider"""
    reviews = await db.get_db().reviews.find({"provider_id": provider_id}).to_list(100)
    for r in reviews:
        r["_id"] = str(r["_id"])
    return [ReviewResponse(**r) for r in reviews]

@router.get("/my-reviews", response_model=List[ReviewResponse])
async def get_my_reviews(current_user: UserInDB = Depends(get_current_user)):
    """Get reviews for current provider"""
    if current_user.current_role != Role.PROVIDER:
        raise HTTPException(status_code=403, detail="Only providers can view their reviews")
    
    reviews = await db.get_db().reviews.find({"provider_id": str(current_user.id)}).to_list(100)
    for r in reviews:
        r["_id"] = str(r["_id"])
    return [ReviewResponse(**r) for r in reviews]
