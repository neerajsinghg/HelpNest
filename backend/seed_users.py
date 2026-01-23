import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import Role
from bson import ObjectId

# Hardcoded list of Indian States and UTs
INDIAN_STATES = [
    {"name": "Andhra Pradesh", "code": "AP", "type": "State"},
    {"name": "Arunachal Pradesh", "code": "AR", "type": "State"},
    {"name": "Assam", "code": "AS", "type": "State"},
    {"name": "Bihar", "code": "BR", "type": "State"},
    {"name": "Chhattisgarh", "code": "CG", "type": "State"},
    {"name": "Goa", "code": "GA", "type": "State"},
    {"name": "Gujarat", "code": "GJ", "type": "State"},
    {"name": "Haryana", "code": "HR", "type": "State"},
    {"name": "Himachal Pradesh", "code": "HP", "type": "State"},
    {"name": "Jharkhand", "code": "JH", "type": "State"},
    {"name": "Karnataka", "code": "KA", "type": "State"},
    {"name": "Kerala", "code": "KL", "type": "State"},
    {"name": "Madhya Pradesh", "code": "MP", "type": "State"},
    {"name": "Maharashtra", "code": "MH", "type": "State"},
    {"name": "Manipur", "code": "MN", "type": "State"},
    {"name": "Meghalaya", "code": "ML", "type": "State"},
    {"name": "Mizoram", "code": "MZ", "type": "State"},
    {"name": "Nagaland", "code": "NL", "type": "State"},
    {"name": "Odisha", "code": "OD", "type": "State"},
    {"name": "Punjab", "code": "PB", "type": "State"},
    {"name": "Rajasthan", "code": "RJ", "type": "State"},
    {"name": "Sikkim", "code": "SK", "type": "State"},
    {"name": "Tamil Nadu", "code": "TN", "type": "State"},
    {"name": "Telangana", "code": "TS", "type": "State"},
    {"name": "Tripura", "code": "TR", "type": "State"},
    {"name": "Uttar Pradesh", "code": "UP", "type": "State"},
    {"name": "Uttarakhand", "code": "UK", "type": "State"},
    {"name": "West Bengal", "code": "WB", "type": "State"},
    {"name": "Andaman and Nicobar Islands", "code": "AN", "type": "Union Territory"},
    {"name": "Chandigarh", "code": "CH", "type": "Union Territory"},
    {"name": "Dadra and Nagar Haveli and Daman and Diu", "code": "DN", "type": "Union Territory"},
    {"name": "Delhi", "code": "DL", "type": "Union Territory"},
    {"name": "Jammu and Kashmir", "code": "JK", "type": "Union Territory"},
    {"name": "Ladakh", "code": "LA", "type": "Union Territory"},
    {"name": "Lakshadweep", "code": "LD", "type": "Union Territory"},
    {"name": "Puducherry", "code": "PY", "type": "Union Territory"}
]

async def seed():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    # 1. Clear existing data
    print("Dropping 'users' and 'states' collections...")
    await db.users.drop()
    await db.states.drop()
    
    # 2. Seed States
    print("Seeding States...")
    await db.states.insert_many(INDIAN_STATES)
    print(f"Inserted {len(INDIAN_STATES)} states.")
    
    # 3. Seed Users
    print("Seeding 10 Dummy Users...")
    users_to_insert = []
    base_phone = "123456789"
    hashed_password = get_password_hash("test123")
    
    # Get a state ID for address
    state = await db.states.find_one({"code": "DL"})
    state_name = state["name"]
    
    for i in range(10):
        # 0 to 9. User requested 1234567891 specifically as one example.
        # Let's generate 1234567890 to 1234567899
        phone = f"{base_phone}{i}"
        
        roles = [Role.CUSTOMER]
        if i % 2 == 0:
            roles.append(Role.PROVIDER)
            current_role = Role.PROVIDER
            category = "Plumber" if i % 4 == 0 else "Electrician"
        else:
            current_role = Role.CUSTOMER
            category = None
            
        user = {
            "full_name": f"Dummy User {i}",
            "phone_number": phone,
            "dob": "1990-01-01",
            "hashed_password": hashed_password,
            "is_active": True,
            "roles": roles,
            "current_role": current_role,
            "address": {
                "address_line": f"Flat {i}, Dummy Street",
                "state": state_name,
                "district": "New Delhi",
                "pincode": "110001"
            }
        }
        
        if category:
            user["category"] = category
            
        users_to_insert.append(user)
        
    await db.users.insert_many(users_to_insert)
    print("Inserted 10 dummy users.")
    print("Mobile Numbers: 1234567890 - 1234567899")
    print("Password: test123")
    
    client.close()
    print("Seeding Complete.")

if __name__ == "__main__":
    asyncio.run(seed())
