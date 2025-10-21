# In: backend/app/main.py
# (REPLACE the entire file)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

@app.get("/")
def read_root():
    return {"message": "Welcome to the BragBoard API"}


# Lightweight debug endpoint to verify CORS and request handling during development.
@app.post('/debug/echo')
async def debug_echo(payload: dict):
    logging.info('debug/echo payload: %s', payload)
    return {"received": payload}