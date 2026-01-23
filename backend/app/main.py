from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import auth, users, services, jobs, kyc, payments, reviews, categories, admin, geolocation, provider, realtime, otp_auth, states, upload
from app.core.config import settings

app = FastAPI(title="HelpNest API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to HelpNest API"}

# Mount uploads directory to serve static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

from app.core.database import db

@app.on_event("startup")
async def startup_db_client():
    db.connect_db()

@app.on_event("shutdown")
async def shutdown_db_client():
    db.close_db()

# Register all routes
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(otp_auth.router, prefix="/api/auth", tags=["OTP Auth"])
app.include_router(states.router, prefix="/api/states", tags=["States"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(kyc.router, prefix="/api/kyc", tags=["KYC"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(geolocation.router, prefix="/api/geolocation", tags=["Geolocation"])
app.include_router(provider.router, prefix="/api/provider", tags=["Provider"])
app.include_router(realtime.router, prefix="/api/realtime", tags=["Real-time"])
