from fastapi import APIRouter, Depends, HTTPException
from typing import List
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId
from app.routes.auth import get_current_user
from app.models.user import UserInDB, Role
from app.core.database import db

router = APIRouter()

class ServiceBase(BaseModel):
    name: str
    category: str
    price: float
    description: str

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    id: str = Field(alias="_id")
    provider_id: str

    model_config = ConfigDict(
        populate_by_name=True,
    )

@router.post("/", response_model=ServiceResponse)
async def create_service(service: ServiceCreate, current_user: UserInDB = Depends(get_current_user)):
    if current_user.current_role != Role.PROVIDER:
        raise HTTPException(status_code=403, detail="Only providers can create services")
    
    service_dict = service.model_dump()
    service_dict["provider_id"] = str(current_user.id)
    
    new_service = await db.get_db().services.insert_one(service_dict)
    created_service = await db.get_db().services.find_one({"_id": new_service.inserted_id})
    created_service["_id"] = str(created_service["_id"])
    return ServiceResponse(**created_service)

@router.get("/", response_model=List[ServiceResponse])
async def list_services():
    services = await db.get_db().services.find().to_list(100)
    for s in services:
        s["_id"] = str(s["_id"])
    return [ServiceResponse(**s) for s in services]
