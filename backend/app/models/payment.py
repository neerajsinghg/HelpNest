from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from enum import Enum
from datetime import datetime

class PaymentMethod(str, Enum):
    UPI = "upi"
    CARD = "card"
    WALLET = "wallet"
    COD = "cod"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentBase(BaseModel):
    job_id: str
    customer_id: str
    provider_id: str
    amount: float
    payment_method: PaymentMethod
    transaction_id: Optional[str] = None  # Razorpay/Stripe transaction ID
    
class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: str = Field(alias="_id")
    status: PaymentStatus = PaymentStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    model_config = ConfigDict(
        populate_by_name=True,
    )
