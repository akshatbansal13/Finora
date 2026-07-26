from contextlib import asynccontextmanager
import redis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from qdrant_client import QdrantClient

from .config import settings
from .database import create_tables
from .routes import documents, market, portfolio, trading, analysis

redis_client = None
qdrant_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client, qdrant_client
    
    # Initialize Database and create tables
    create_tables()
    
    # Initialize Redis connection
    redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
    
    # Initialize Qdrant connection
    qdrant_client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
    
    yield
    
    # Cleanup
    if redis_client:
        redis_client.close()
    if qdrant_client:
        qdrant_client.close()

app = FastAPI(
    title="Finora API",
    description="Backend for Finora AI-powered investment research platform",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(documents.router)
app.include_router(market.router)
app.include_router(portfolio.router)
app.include_router(trading.router)
app.include_router(analysis.router)

@app.get("/")
def read_root() -> dict:
    """Returns a welcome message."""
    return {"message": "Welcome to Finora by AKSHAT BANSAL"}
