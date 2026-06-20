from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router, manager
from .database import connect_to_mongo, close_mongo_connection
from .config import settings
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await connect_to_mongo()
    except:
        pass
    yield
    await close_mongo_connection()

app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Using Direct Routes for now to avoid middleware conflicts
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    print(f"🔥 PulseProxy Server starting on http://127.0.0.1:9000")
    uvicorn.run("app.main:app", host="127.0.0.1", port=9000, reload=True)
