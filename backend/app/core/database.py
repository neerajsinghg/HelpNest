from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None

    def connect_db(self):
        self.client = AsyncIOMotorClient(settings.MONGODB_URL)
        print("Connected to MongoDB")

    def close_db(self):
        self.client.close()
        print("Closed MongoDB connection")

    def get_db(self):
        return self.client[settings.DATABASE_NAME]

db = Database()
