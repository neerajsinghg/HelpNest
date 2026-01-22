from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.routes.auth import get_current_user
from app.models.user import UserInDB
from app.core.database import db

router = APIRouter()

@router.get("/search")
async def search_providers_by_location(
    longitude: float = Query(..., description="Customer's longitude"),
    latitude: float = Query(..., description="Customer's latitude"),
    max_distance_km: float = Query(10, description="Maximum distance in kilometers"),
    category_id: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Search for service providers near user's location using MongoDB geospatial query
    Location should be stored as GeoJSON Point: {type: 'Point', coordinates: [longitude, latitude]}
    """
    
    # Build aggregation pipeline
    pipeline = [
        {
            "$geoNear": {
                "near": {
                    "type": "Point",
                    "coordinates": [longitude, latitude]
                },
                "distanceField": "distance",
                "maxDistance": max_distance_km * 1000,  # Convert to meters
                "spherical": True,
                "key": "location"
            }
        },
        {
            "$match": {
                "kyc_status": "approved"  # Only show approved providers
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "_id",
                "as": "user_info"
            }
        },
        {
            "$lookup": {
                "from": "services",
                "localField": "user_id",
                "foreignField": "provider_id",
                "as": "services"
            }
        }
    ]
    
    # Filter by category if provided
    if category_id:
        pipeline.append({
            "$match": {
                "services.category_id": category_id
            }
        })
    
    try:
        # Note: Requires 2dsphere index on location field
        # db.service_provider_profiles.createIndex({"location": "2dsphere"})
        results = await db.get_db().service_provider_profiles.aggregate(pipeline).to_list(50)
        
        for r in results:
            r["_id"] = str(r["_id"])
            r["distance_km"] = round(r["distance"] / 1000, 2)
            
        return results
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Geospatial search failed. Make sure 2dsphere index exists on location field. Error: {str(e)}"
        )

@router.post("/create-geo-index")
async def create_geospatial_index(current_user: UserInDB = Depends(get_current_user)):
    """Create 2dsphere index for geospatial queries (one-time setup)"""
    try:
        await db.get_db().service_provider_profiles.create_index([("location", "2dsphere")])
        return {"message": "Geospatial index created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
