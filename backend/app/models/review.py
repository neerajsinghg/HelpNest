from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    job_id: str
    customer_id: str
    provider_id: str
    rating: int = Field(ge=1, le=5)  # 1-5 stars
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: str = Field(alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        populate_by_name=True,
    )
