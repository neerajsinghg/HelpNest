import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

async def verify_data():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    print(f"Connecting to: {settings.MONGODB_URL}")
    print(f"Database: {settings.DATABASE_NAME}")
    
    # List collections
    collections = await db.list_collection_names()
    print(f"Collections found: {collections}")
    
    if "HelpNest" in collections:
        count = await db.HelpNest.count_documents({})
        print(f"Documents in 'HelpNest': {count}")
        doc = await db.HelpNest.find_one({})
        print(f"Sample 'HelpNest' doc: {doc}")
    else:
        print("'HelpNest' collection NOT found.")

    if "users" in collections:
        count = await db.users.count_documents({})
        print(f"Documents in 'users': {count}")

if __name__ == "__main__":
    asyncio.run(verify_data())
