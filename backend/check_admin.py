
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import verify_password

async def check_admin():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    print(f"Checking for admin user...")
    admin = await db.users.find_one({"email": "admin@helpnest.com"})
    
    if admin:
        print(f"Admin found: {admin['email']}")
        print(f"Roles: {admin.get('roles')}")
        # Verify password if possible (requires hashing utils, or just reset it)
        print("Note: Cannot verify password directly without hash, but user exists.")
    else:
        print("Admin user NOT found in database.")
        
    print("\nListing all users:")
    async for user in db.users.find({}, {"email": 1, "roles": 1}):
        print(f"- {user['email']} {user.get('roles')}")

if __name__ == "__main__":
    asyncio.run(check_admin())
