import asyncio
import random
from faker import Faker
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import Role
from datetime import datetime

fake = Faker()

# Database Connection
client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

async def seed_data():
    print("Seeding database...")
    
    # 1. Clear existing data (optional, but good for testing)
    # await db.users.delete_many({})
    # await db.services.delete_many({})
    # await db.jobs.delete_many({})

    users = []
    providers = []
    customers = []

    # 2. Create Users
    print("Creating users...")
    try:
        password_hash = get_password_hash("test")
    except Exception as e:
        print(f"Error hashing password: {e}")
        # Fallback hash for 'test' using bcrypt (pre-calculated)
        password_hash = "$2b$12$D.v.a.a.a.a.a.a.a.a.au/x" # Dummy hash if fails
    
    for _ in range(50):
        role = random.choice([Role.CUSTOMER, Role.PROVIDER])
        user = {
            "email": fake.unique.email(),
            "full_name": fake.name(),
            "phone_number": fake.phone_number(),
            "roles": [role],
            "current_role": role,
            "hashed_password": password_hash,
            "is_active": True
        }
        result = await db.users.insert_one(user)
        user["_id"] = str(result.inserted_id)
        users.append(user)
        if role == Role.PROVIDER:
            providers.append(user)
        else:
            customers.append(user)

    print(f"Created {len(users)} users.")

    # 3. Create Services (only for providers)
    print("Creating services...")
    services = []
    categories = ["Plumbing", "Electrical", "Cleaning", "Carpentry", "Painting"]
    
    for provider in providers:
        num_services = random.randint(1, 3)
        for _ in range(num_services):
            service = {
                "name": f"{random.choice(categories)} Service",
                "category": random.choice(categories),
                "price": round(random.uniform(20.0, 200.0), 2),
                "description": fake.sentence(),
                "provider_id": provider["_id"]
            }
            result = await db.services.insert_one(service)
            service["_id"] = str(result.inserted_id)
            services.append(service)

    print(f"Created {len(services)} services.")

    # 4. Create Jobs (Customers booking services)
    print("Creating jobs...")
    jobs_count = 0
    for customer in customers:
        if not services:
            break
        num_jobs = random.randint(0, 3)
        for _ in range(num_jobs):
            service = random.choice(services)
            job = {
                "service_id": service["_id"],
                "provider_id": service["provider_id"],
                "customer_id": customer["_id"],
                "scheduled_time": fake.future_datetime(),
                "address": fake.address(),
                "status": random.choice(["pending", "accepted", "completed", "cancelled"]),
                "created_at": datetime.utcnow()
            }
            await db.jobs.insert_one(job)
            jobs_count += 1

    print(f"Created {jobs_count} jobs.")

    # 5. Create 'HelpNest' collection (User Request)
    print("Creating 'HelpNest' collection...")
    await db.HelpNest.insert_one({
        "info": "This is the HelpNest collection as requested.",
        "created_at": datetime.utcnow(),
        "sample_data": "VISIBLE DATA"
    })
    print("Created 'HelpNest' collection.")
    
    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())
