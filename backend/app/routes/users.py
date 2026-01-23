from fastapi import APIRouter, Depends, HTTPException
from app.models.user import UserResponse, Role, UserInDB, UserUpdate
from app.routes.auth import get_current_user
from app.core.database import db

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    return current_user

@router.post("/me/switch-role", response_model=UserResponse)
async def switch_role(role: Role, current_user: UserInDB = Depends(get_current_user)):
    if role not in current_user.roles:
        # Add role if not present (simplified logic for MVP)
        await db.get_db().users.update_one(
            {"_id": current_user.id},
            {"$addToSet": {"roles": role}}
        )
    
    await db.get_db().users.update_one(
        {"_id": current_user.id},
        {"$set": {"current_role": role}}
    )
    
    updated_user = await db.get_db().users.find_one({"_id": current_user.id})
    return UserResponse(**updated_user)

@router.put("/me", response_model=UserResponse)
async def update_user_me(user_update: UserUpdate, current_user: UserInDB = Depends(get_current_user)):
    update_data = user_update.model_dump(exclude_unset=True)
    
    if update_data:
        await db.get_db().users.update_one(
            {"_id": current_user.id},
            {"$set": update_data}
        )
        
    updated_user = await db.get_db().users.find_one({"_id": current_user.id})
    return UserResponse(**updated_user)
