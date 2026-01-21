from pydantic import BaseModel, EmailStr, Field, BeforeValidator, ConfigDict
from typing import Optional, List, Annotated
from enum import Enum
from bson import ObjectId

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.
PyObjectId = Annotated[str, BeforeValidator(str)]

class Role(str, Enum):
    CUSTOMER = "customer"
    PROVIDER = "provider"
    ADMIN = "admin"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: str
    roles: List[Role] = [Role.CUSTOMER]
    current_role: Role = Role.CUSTOMER

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    hashed_password: str
    is_active: bool = True
    
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
