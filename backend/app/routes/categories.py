from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.routes.auth import get_current_user
from app.models.user import UserInDB, Role
from app.models.category import CategoryCreate, CategoryResponse
from app.core.database import db
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    """Create a new category (admin only)"""
    if current_user.current_role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can create categories")
    
    category_dict = category.model_dump()
    new_category = await db.get_db().categories.insert_one(category_dict)
    created = await db.get_db().categories.find_one({"_id": new_category.inserted_id})
    created["_id"] = str(created["_id"])
    return CategoryResponse(**created)

@router.get("/", response_model=List[CategoryResponse])
async def list_categories():
    """List all active categories"""
    categories = await db.get_db().categories.find({"is_active": True}).to_list(100)
    for c in categories:
        c["_id"] = str(c["_id"])
    return [CategoryResponse(**c) for c in categories]

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    category: CategoryCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    """Update a category (admin only)"""
    if current_user.current_role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can update categories")
    
    await db.get_db().categories.update_one(
        {"_id": ObjectId(category_id)},
        {"$set": category.model_dump()}
    )
    
    updated = await db.get_db().categories.find_one({"_id": ObjectId(category_id)})
    updated["_id"] = str(updated["_id"])
    return CategoryResponse(**updated)

@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Delete/deactivate a category (admin only)"""
    if current_user.current_role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can delete categories")
    
    # Soft delete by marking as inactive
    await db.get_db().categories.update_one(
        {"_id": ObjectId(category_id)},
        {"$set": {"is_active": False}}
    )
    
    return {"message": "Category deactivated successfully"}
