from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.router import api_router
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks: connect to DB, init agents, etc.
    print("Starting Enterprise Knowledge Assistant Backend...")
    yield
    # Shutdown tasks: close connections
    print("Shutting down...")

app = FastAPI(
    title="Enterprise Knowledge Assistant API",
    description="Agentic AI Platform for Enterprise Documents",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration — reads from env var for production
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

app.include_router(api_router, prefix="/api/v1")
