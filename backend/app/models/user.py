from pydantic import BaseModel, EmailStr, Field, BeforeValidator, ConfigDict
from typing import Optional, List, Annotated
from enum import Enum
from bson import ObjectId
from datetime import datetime

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.
PyObjectId = Annotated[str, BeforeValidator(str)]

class Role(str, Enum):
    CUSTOMER = "customer"
    PROVIDER = "provider"
    ADMIN = "admin"

class Address(BaseModel):
    address_line: str
    state: str
    district: str
    pincode: str

class UserBase(BaseModel):
    phone_number: str
    full_name: str
    email: Optional[EmailStr] = None
    dob: Optional[str] = None # ISO format YYYY-MM-DD
    address: Optional[Address] = None
    profile_picture_url: Optional[str] = None
    roles: List[Role] = [Role.CUSTOMER]
    current_role: Role = Role.CUSTOMER
    category: Optional[str] = None # For Service Providers

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    hashed_password: str
    is_active: bool = True
    otp: Optional[str] = None  # For OTP-based login
    otp_expiry: Optional[datetime] = None
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    dob: Optional[str] = None
    address: Optional[Address] = None
    profile_picture_url: Optional[str] = None
    category: Optional[str] = None
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class UserResponse(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )
