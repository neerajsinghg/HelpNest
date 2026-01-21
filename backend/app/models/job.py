from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from enum import Enum
from datetime import datetime
from bson import ObjectId

class JobStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class JobBase(BaseModel):
    service_id: str
    provider_id: str
    scheduled_time: datetime
    address: str

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: str = Field(alias="_id")
    customer_id: str
    status: JobStatus = JobStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
    )
