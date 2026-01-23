from fastapi import APIRouter
from typing import List
from app.models.state import State
from app.core.database import db

router = APIRouter()

@router.get("/", response_model=List[State])
async def get_states():
    states = await db.get_db().states.find().to_list(100)
    return states
