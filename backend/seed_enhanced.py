"""
Database seeding script for HelpNest
Creates 10 users (customers + providers), categories, services, jobs, reviews, and admin account
Run with: python seed_enhanced.py
"""

import asyncio
from app.core.database import db
from app.core.security import get_password_hash
from datetime import datetime, timedelta
from bson import ObjectId
import random

# Verified admin credentials
ADMIN_EMAIL = "admin@helpnest.com"
ADMIN_PASSWORD = "Admin@123"

# Sample data
CATEGORIES = [
    {"name": "Plumbing", "description": "Plumbing services", "icon": "🔧", "is_active": True},
    {"name": "Electrical", "description": "Electrical services", "icon": "⚡", "is_active": True},
    {"name": "Carpentry", "description": "Carpentry and woodwork", "icon": "🪚", "is_active": True},
    {"name": "Cleaning", "description": "Home cleaning services", "icon": "🧹", "is_active": True},
    {"name": "Painting", "description": "Painting services", "icon": "🎨", "is_active": True},
]

USERS_DATA = [
    # Customers
    {"email": "customer1@test.com", "full_name": "Raj Kumar", "phone_number": "+919876543210", "roles": ["customer"], "is_provider": False},
    {"email": "customer2@test.com", "full_name": "Priya Sharma", "phone_number": "+919876543211", "roles": ["customer"], "is_provider": False},
    {"email": "customer3@test.com", "full_name": "Amit Verma", "phone_number": "+919876543212", "roles": ["customer"], "is_provider": False},
    
    # Service Providers
    {"email": "provider1@test.com", "full_name": "Ramesh Singh", "phone_number": "+919876543213", "roles": ["customer", "provider"], "is_provider": True},
    {"email": "provider2@test.com", "full_name": "Sunita Devi", "phone_number": "+919876543214", "roles": ["customer", "provider"], "is_provider": True},
    {"email": "provider3@test.com", "full_name": "Vijay Patel", "phone_number": "+919876543215", "roles": ["customer", "provider"], "is_provider": True},
    {"email": "provider4@test.com", "full_name": "Lakshmi Reddy", "phone_number": "+919876543216", "roles": ["customer", "provider"], "is_provider": True},
    {"email": "provider5@test.com", "full_name": "Manoj Gupta", "phone_number": "+919876543217", "roles": ["customer", "provider"], "is_provider": True},
    {"email": "provider6@test.com", "full_name": "Kavita Joshi", "phone_number": "+919876543218", "roles": ["customer", "provider"], "is_provider": True},
    {"email": "provider7@test.com", "full_name": "Deepak Yadav", "phone_number": "+919876543219", "roles": ["customer", "provider"], "is_provider": True},
]

# Delhi coordinates for location-based services
DELHI_LOCATIONS = [
    [77.2090, 28.6139],  # Connaught Place
    [77.2273, 28.6692],  # Civil Lines
    [77.1025, 28.7041],  # Pitampura
    [77.2903, 28.5355],  # Nehru Place
    [77.1011, 28.4595],  # Vasant Kunj
    [77.3910, 28.6282],  # Noida
    [77.1849, 28.6358],  # Karol Bagh
]

async def seed_database():
    """Seed the database with sample data"""
    db.connect_db()
    database = db.get_db()
    
    print("🌱 Starting database seeding...")
    
    # Clear existing data
    print("🗑️  Clearing existing data...")
    await database.users.delete_many({})
    await database.categories.delete_many({})
    await database.services.delete_many({})
    await database.service_provider_profiles.delete_many({})
    await database.jobs.delete_many({})
    await database.payments.delete_many({})
    await database.reviews.delete_many({})
    await database.notifications.delete_many({})
    
    # Create admin user
    print(f"👤 Creating admin user...")
    print(f"   Email: {ADMIN_EMAIL}")
    print(f"   Password: {ADMIN_PASSWORD}")
    
    admin_user = {
        "email": ADMIN_EMAIL,
        "full_name": "System Administrator",
        "phone_number": "+919999999999",
        "hashed_password": get_password_hash(ADMIN_PASSWORD),
        "roles": ["admin"],
        "current_role": "admin",
        "is_active": True
    }
    await database.users.insert_one(admin_user)
    
    # Create categories
    print("📁 Creating categories...")
    category_ids = []
    for cat in CATEGORIES:
        result = await database.categories.insert_one(cat)
        category_ids.append(str(result.inserted_id))
        print(f"   ✓ {cat['name']}")
    
    # Create users
    print("👥 Creating users...")
    user_ids = []
    provider_ids = []
    customer_ids = []
    
    for user_data in USERS_DATA:
        user = {
            "email": user_data["email"],
            "full_name": user_data["full_name"],
            "phone_number": user_data["phone_number"],
            "hashed_password": get_password_hash("password123"),  # Same password for all test users
            "roles": user_data["roles"],
            "current_role": user_data["roles"][0],
            "is_active": True
        }
        result = await database.users.insert_one(user)
        user_id = str(result.inserted_id)
        user_ids.append(user_id)
        
        if user_data["is_provider"]:
            provider_ids.append(user_id)
        else:
            customer_ids.append(user_id)
        
        print(f"   ✓ {user_data['full_name']} ({user_data['email']})")
    
    # Create provider profiles with KYC
    print("🏢 Creating provider profiles...")
    for provider_id in provider_ids:
        location = random.choice(DELHI_LOCATIONS)
        profile = {
            "user_id": provider_id,
            "bio": "Experienced professional with 5+ years in the field",
            "location": {
                "type": "Point",
                "coordinates": location
            },
            "service_radius_km": random.choice([5, 10, 15]),
            "kyc_documents": [],  # Empty for now, admin can upload later
            "kyc_status": "approved",  # Pre-approved for testing
            "availability": [
                {"day": "monday", "start_time": "09:00", "end_time": "18:00", "is_available": True},
                {"day": "tuesday", "start_time": "09:00", "end_time": "18:00", "is_available": True},
                {"day": "wednesday", "start_time": "09:00", "end_time": "18:00", "is_available": True},
                {"day": "thursday", "start_time": "09:00", "end_time": "18:00", "is_available": True},
                {"day": "friday", "start_time": "09:00", "end_time": "18:00", "is_available": True},
                {"day": "saturday", "start_time": "10:00", "end_time": "14:00", "is_available": True},
            ],
            "total_earnings": 0.0,
            "average_rating": 0.0,
            "total_jobs_completed": 0,
            "created_at": datetime.utcnow()
        }
        await database.service_provider_profiles.insert_one(profile)
        print(f"   ✓ Profile for provider {provider_id}")
    
    # Create 2dsphere index for geolocation
    print("📍 Creating geospatial index...")
    await database.service_provider_profiles.create_index([("location", "2dsphere")])
    
    # Create services
    print("🛠️  Creating services...")
    service_prices = {
        "Plumbing": [500, 800, 1200],
        "Electrical": [600, 1000, 1500],
        "Carpentry": [1000, 1500, 2000],
        "Cleaning": [300, 500, 800],
        "Painting": [1500, 2500, 3500]
    }
    
    service_ids = []
    for provider_id in provider_ids:
        # Each provider offers 2-3 services
        num_services = random.randint(2, 3)
        selected_categories = random.sample(list(enumerate(category_ids)), num_services)
        
        for idx, category_id in selected_categories:
            category_name = CATEGORIES[idx]["name"]
            service = {
                "name": f"{category_name} Service",
                "category_id": category_id,
                "price": random.choice(service_prices[category_name]),
                "description": f"Professional {category_name.lower()} services by experienced technicians",
                "provider_id": provider_id,
                "images": [],
                "average_rating": 0.0,
                "total_reviews": 0
            }
            result = await database.services.insert_one(service)
            service_ids.append(str(result.inserted_id))
            print(f"   ✓ {service['name']} by provider {provider_id}")
    
    # Create jobs
    print("📋 Creating jobs...")
    job_ids = []
    for i in range(15):  # Create 15 jobs
        customer_id = random.choice(customer_ids)
        service = await database.services.aggregate([{"$sample": {"size": 1}}]).to_list(1)
        service = service[0]
        
        status = random.choice(["pending", "accepted", "completed"])
        job = {
            "service_id": str(service["_id"]),
            "provider_id": service["provider_id"],
            "customer_id": customer_id,
            "scheduled_time": datetime.utcnow() + timedelta(days=random.randint(1, 30)),
            "address": f"{random.randint(1,100)} Sector {random.randint(1,20)}, Delhi",
            "status": status,
            "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 60)),
            "completion_time": datetime.utcnow() if status == "completed" else None
        }
        result = await database.jobs.insert_one(job)
        job_ids.append((str(result.inserted_id), job, service))
        print(f"   ✓ Job {i+1}: {status}")
    
    # Create payments and reviews for completed jobs
    print("💰 Creating payments and reviews...")
    for job_id, job, service in job_ids:
        if job["status"] == "completed":
            # Create payment
            payment = {
                "job_id": job_id,
                "customer_id": job["customer_id"],
                "provider_id": job["provider_id"],
                "amount": service["price"],
                "payment_method": random.choice(["upi", "card", "wallet"]),
                "status": "completed",
                "transaction_id": f"TXN_{random.randint(100000, 999999)}",
                "created_at": job["created_at"],
                "completed_at": job["completion_time"]
            }
            payment_result = await database.payments.insert_one(payment)
            
            # Update job with payment_id
            await database.jobs.update_one(
                {"_id": ObjectId(job_id)},
                {"$set": {"payment_id": str(payment_result.inserted_id)}}
            )
            
            # Update provider earnings
            await database.service_provider_profiles.update_one(
                {"user_id": job["provider_id"]},
                {"$inc": {"total_earnings": service["price"], "total_jobs_completed": 1}}
            )
            
            # Create review
            rating = random.randint(3, 5)
            comments = [
                "Excellent service!",
                "Very professional and timely.",
                "Good work, satisfied with the service.",
                "Great experience, highly recommend!",
                "Prompt and efficient."
            ]
            review = {
                "job_id": job_id,
                "customer_id": job["customer_id"],
                "provider_id": job["provider_id"],
                "rating": rating,
                "comment": random.choice(comments),
                "created_at": job["completion_time"]
            }
            await database.reviews.insert_one(review)
            print(f"   ✓ Payment & Review for job {job_id}")
    
    # Update provider and service ratings
    print("⭐ Updating ratings...")
    for provider_id in provider_ids:
        reviews = await database.reviews.find({"provider_id": provider_id}).to_list(1000)
        if reviews:
            avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
            await database.service_provider_profiles.update_one(
                {"user_id": provider_id},
                {"$set": {"average_rating": round(avg_rating, 2)}}
            )
    
    # Update service ratings
    for service_id in service_ids:
        service_doc = await database.services.find_one({"_id": ObjectId(service_id)})
        if service_doc:
            provider_reviews = await database.reviews.find({"provider_id": service_doc["provider_id"]}).to_list(1000)
            if provider_reviews:
                avg_rating = sum(r["rating"] for r in provider_reviews) / len(provider_reviews)
                await database.services.update_one(
                    {"_id": ObjectId(service_id)},
                    {"$set": {
                        "average_rating": round(avg_rating, 2),
                        "total_reviews": len(provider_reviews)
                    }}
                )
    
    print("\n✅ Database seeding completed successfully!")
    print("\n📝 Test Credentials:")
    print(f"   Admin: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    print(f"   Test Users: Any user email / password123")
    print(f"   Example: customer1@test.com / password123")
    print(f"   Example: provider1@test.com / password123")
    
    db.close_db()

if __name__ == "__main__":
    asyncio.run(seed_database())
