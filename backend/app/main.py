from fastapi import FastAPI
from app.routes import auth, users, services, jobs
from app.core.config import settings

app = FastAPI(title="HelpNest API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "Welcome to HelpNest API"}

from app.core.database import db

@app.on_event("startup")
async def startup_db_client():
    db.connect_db()

@app.on_event("shutdown")
async def shutdown_db_client():
    db.close_db()

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
