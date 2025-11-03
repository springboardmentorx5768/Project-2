# In: backend/app/main.py
# (REPLACE the entire file)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.db.base import Base
from app.db.session import engine
from app.api.v1.api import api_router

# --- ADD THIS IMPORT ---
# This line is crucial. It imports app/models/__init__.py,
# which in turn imports your User and Shoutout models.
# This "registers" them with the 'Base' so create_all() knows about them.
from app import models
# ---------------------

# This creates your database tables if they don't exist
Base.metadata.create_all(bind=engine)

import logging
logging.basicConfig(level=logging.INFO)

# This is the main application object Uvicorn is looking for
app = FastAPI(title="BragBoard API")

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    # Add other local dev origins here as needed
]

# Allow all origins when DEV_ALLOW_ALL_CORS is truthy (useful for quick local dev)
dev_allow_all = os.getenv("DEV_ALLOW_ALL_CORS", "false").lower() in ("1", "true", "yes")
allowed = ["*"] if dev_allow_all else origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Log the configured CORS origins for easier debugging when dev clients hit preflight errors
import socket
try:
    host = socket.gethostname()
except Exception:
    host = 'localhost'
logging.info('CORS allow_origins=%s (dev_allow_all=%s) host=%s', allowed, dev_allow_all, host)

# Include your API router
app.include_router(api_router, prefix="/api/v1")

# Mount static files for uploaded attachments
# Get the backend directory path more reliably
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
uploads_dir = os.path.join(backend_dir, "uploads")
os.makedirs(uploads_dir, exist_ok=True)

# Only mount if the directory exists
if os.path.exists(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
    logging.info(f"Mounted uploads directory at: {uploads_dir}")
else:
    logging.warning(f"Uploads directory not found: {uploads_dir}")

@app.get("/")
def read_root():
    return {"message": "Welcome to the BragBoard API"}


# Lightweight debug endpoint to verify CORS and request handling during development.
@app.post('/debug/echo')
async def debug_echo(payload: dict):
    logging.info('debug/echo payload: %s', payload)
    return {"received": payload}