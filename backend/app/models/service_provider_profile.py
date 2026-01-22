from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from enum import Enum
from datetime import datetime

class KYCStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class KYCDocument(BaseModel):
    document_type: str  # "aadhar", "pan", "photo"
    file_id: str  # MongoDB GridFS file ID
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class Location(BaseModel):
    type: str = "Point"
    coordinates: List[float]  # [longitude, latitude]

class TimeSlot(BaseModel):
    day: str  # "monday", "tuesday", etc.
    start_time: str  # "09:00"
    end_time: str  # "18:00"
    is_available: bool = True

class ServiceProviderProfileBase(BaseModel):
    user_id: str
    bio: Optional[str] = None
    location: Optional[Location] = None
    service_radius_km: float = 10.0  # Service area radius
    kyc_documents: List[KYCDocument] = []
    kyc_status: KYCStatus = KYCStatus.PENDING
    availability: List[TimeSlot] = []
    total_earnings: float = 0.0
    average_rating: float = 0.0
    total_jobs_completed: int = 0

class ServiceProviderProfileCreate(ServiceProviderProfileBase):
    pass

class ServiceProviderProfileResponse(ServiceProviderProfileBase):
    id: str = Field(alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        populate_by_name=True,
    )
