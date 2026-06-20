from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import random
import asyncio
import time

router = APIRouter()

# Global metrics for backup
metrics_db = {"requests": 0, "errors": 0, "logs": []}

class ConnectionManager:
    def __init__(self):
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

async def log_traffic(method, path, status, start_time):
    metrics_db["requests"] += 1
    if status >= 500: metrics_db["errors"] += 1
    
    latency = int((time.time() - start_time) * 1000)
    data = {
        "method": method,
        "path": path,
        "status_code": status,
        "latency_ms": latency,
        "timestamp": time.strftime('%H:%M:%S', time.gmtime())
    }
    metrics_db["logs"] = [data] + metrics_db["logs"][:29] # Keep last 30 for polling
    await manager.broadcast(data)

@router.websocket("/ws/traffic")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        manager.disconnect(websocket)

@router.get("/api/v1/metrics")
async def get_metrics():
    return {
        "metrics": {
            "totalRequests": metrics_db["requests"],
            "errorCount": metrics_db["errors"],
            "avgLatency": sum(l["latency_ms"] for l in metrics_db["logs"])/max(1, len(metrics_db["logs"]))
        },
        "logs": metrics_db["logs"]
    }

@router.get("/api/v1/status")
async def get_status():
    start = time.time()
    await log_traffic("GET", "/status", 200, start)
    return {"status": "ok"}

@router.get("/api/v1/users")
async def get_users():
    start = time.time()
    await log_traffic("GET", "/users", 200, start)
    return {"users": ["user1", "user2"]}

@router.post("/api/v1/data")
async def post_data():
    start = time.time()
    status = 200 if random.random() > 0.1 else 500
    await log_traffic("POST", "/data", status, start)
    return {"ok": True}
