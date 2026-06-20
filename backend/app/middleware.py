from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import time
import asyncio
from .models import RequestLog
from .database import db_instance

class PulseMiddleware:
    def __init__(self, app, websocket_manager):
        self.app = app
        self.websocket_manager = websocket_manager

    async def __call__(self, scope, receive, send):
        # We only want to intercept HTTP requests, not WebSockets
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        request = Request(scope, receive, send)
        start_time = time.time()
        
        # Helper to intercept the response
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                status_code = message["status"]
                latency = int((time.time() - start_time) * 1000)
                
                # Create log object
                log_data = RequestLog(
                    method=request.method,
                    path=request.url.path,
                    status_code=status_code,
                    latency_ms=latency
                )
                
                # Background task to save and broadcast
                asyncio.create_task(self.broadcast_and_save(log_data))
                
            await send(message)

        await self.app(scope, receive, send_wrapper)

    async def broadcast_and_save(self, log_data: RequestLog):
        # 1. Save to MongoDB (Optional)
        try:
            if db_instance.db is not None:
                await db_instance.db.logs.insert_one(log_data.model_dump())
        except:
            pass
            
        # 2. Broadcast via WebSocket
        try:
            from fastapi.encoders import jsonable_encoder
            json_data = jsonable_encoder(log_data)
            await self.websocket_manager.broadcast(json_data)
        except:
            pass
