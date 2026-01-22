from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from enum import Enum
from datetime import datetime

class NotificationType(str, Enum):
    JOB_REQUEST = "job_request"
    JOB_ACCEPTED = "job_accepted"
    JOB_COMPLETED = "job_completed"
    JOB_CANCELLED = "job_cancelled"
    PAYMENT_RECEIVED = "payment_received"
    KYC_APPROVED = "kyc_approved"
    KYC_REJECTED = "kyc_rejected"
    NEW_REVIEW = "new_review"

class NotificationBase(BaseModel):
    user_id: str
    type: NotificationType
    title: str
    message: str
    data: Optional[dict] = {}  # Additional data like job_id, payment_id, etc.

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: str = Field(alias="_id")
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        populate_by_name=True,
    )
