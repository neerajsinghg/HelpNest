from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.core.database import db
from app.models.user import UserInDB
from app.routes.auth import create_access_token
from datetime import datetime, timedelta
import random
import string

router = APIRouter()

class OTPRequest(BaseModel):
    phone_number: str

class OTPVerify(BaseModel):
    phone_number: str
    otp: str

def generate_otp(length: int = 6) -> str:
    """Generate a random numeric OTP"""
    return ''.join(random.choices(string.digits, k=length))

@router.post("/send-otp")
async def send_otp(request: OTPRequest):
    """
    Send OTP to user's phone number
    
    NOTE: This is a simplified implementation.
    In production, integrate with SMS gateway like:
    - Twilio: https://www.twilio.com/
    - Firebase Phone Auth: https://firebase.google.com/docs/auth/web/phone-auth
    - MSG91: https://msg91.com/
    """
    
    # Generate 6-digit OTP
    otp = generate_otp(6)
    
    # Set OTP expiry (5 minutes)
    otp_expiry = datetime.utcnow() + timedelta(minutes=5)
    
    # Find or create user by phone number
    user = await db.get_db().users.find_one({"phone_number": request.phone_number})
    
    if user:
        # Update existing user with OTP
        await db.get_db().users.update_one(
            {"phone_number": request.phone_number},
            {
                "$set": {
                    "otp": otp,
                    "otp_expiry": otp_expiry
                }
            }
        )
    else:
        # Create new user with OTP
        new_user = {
            "phone_number": request.phone_number,
            "email": f"{request.phone_number}@placeholder.com",  # Placeholder
            "full_name": "User",  # Can be updated later
            "hashed_password": "otp_user",  # Not used for OTP login
            "roles": ["customer"],
            "current_role": "customer",
            "is_active": True,
            "otp": otp,
            "otp_expiry": otp_expiry
        }
        await db.get_db().users.insert_one(new_user)
    
    # TODO: Integrate SMS gateway here
    # For now, just log the OTP (development only!)
    print(f"🔐 OTP for {request.phone_number}: {otp}")
    
    # In production, replace with:
    # send_sms(request.phone_number, f"Your HelpNest OTP is: {otp}")
    
    return {
        "message": "OTP sent successfully",
        "phone_number": request.phone_number,
        "otp": otp  # Remove this in production!
    }

@router.post("/verify-otp")
async def verify_otp(request: OTPVerify):
    """Verify OTP and return access token"""
    
    # Find user by phone number
    user = await db.get_db().users.find_one({"phone_number": request.phone_number})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if OTP matches
    if user.get("otp") != request.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")
    
    # Check if OTP expired
    if user.get("otp_expiry") and user["otp_expiry"] < datetime.utcnow():
        raise HTTPException(status_code=401, detail="OTP expired")
    
    # Clear OTP after successful verification
    await db.get_db().users.update_one(
        {"phone_number": request.phone_number},
        {
            "$unset": {
                "otp": "",
                "otp_expiry": ""
            }
        }
    )
    
    # Create access token
    user_obj = UserInDB(**user)
    access_token = create_access_token(data={"sub": user_obj.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "_id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "phone_number": user["phone_number"],
            "roles": user["roles"],
            "current_role": user["current_role"]
        }
    }
