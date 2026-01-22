from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from typing import Dict, List
import json
from datetime import datetime

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        """Send message to a specific user's connections"""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except:
                    # Connection might be closed
                    pass

    async def broadcast(self, message: dict):
        """Broadcast to all connected users"""
        for user_connections in self.active_connections.values():
            for connection in user_connections:
                try:
                    await connection.send_json(message)
                except:
                    pass

manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time updates
    Client connects: ws://localhost:8000/api/realtime/ws/{user_id}
    """
    await manager.connect(websocket, user_id)
    
    try:
        # Send connection confirmation
        await websocket.send_json({
            "type": "connection",
            "message": "Connected to HelpNest real-time updates",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        while True:
            # Keep connection alive and listen for messages
            data = await websocket.receive_text()
            data_json = json.loads(data)
            
            # Echo back for testing
            await websocket.send_json({
                "type": "echo",
                "data": data_json,
                "timestamp": datetime.utcnow().isoformat()
            })
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        print(f"User {user_id} disconnected")

# Helper functions to send updates from other routes
async def notify_job_update(job_id: str, status: str, customer_id: str, provider_id: str):
    """Send job status update to customer and provider"""
    message = {
        "type": "job_update",
        "job_id": job_id,
        "status": status,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await manager.send_personal_message(message, customer_id)
    await manager.send_personal_message(message, provider_id)

async def notify_new_job_request(job_id: str, provider_id: str, customer_name: str, service_name: str):
    """Notify provider of new job request"""
    message = {
        "type": "new_job_request",
        "job_id": job_id,
        "customer_name": customer_name,
        "service_name": service_name,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await manager.send_personal_message(message, provider_id)

async def notify_payment_received(payment_id: str, provider_id: str, amount: float):
    """Notify provider of payment received"""
    message = {
        "type": "payment_received",
        "payment_id": payment_id,
        "amount": amount,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await manager.send_personal_message(message, provider_id)

async def notify_kyc_status(user_id: str, status: str, reason: str = None):
    """Notify user of KYC status change"""
    message = {
        "type": "kyc_status_update",
        "status": status,
        "reason": reason,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await manager.send_personal_message(message, user_id)
