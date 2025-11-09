# In: backend/app/main.py
# (REPLACE the entire file)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.db.base import Base
from app.db.session import engine, SessionLocal
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

# (Removed custom CORS logging/OPTIONS override to let CORSMiddleware handle preflights cleanly.)

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

# --- Ensure DB schema and MAIN_ADMIN exist on startup for local/dev ---
@app.on_event("startup")
def ensure_schema_columns():
    """Ensure critical columns exist and backfill for smooth local/dev operation.

    - Adds users.is_approved when missing (SQLite/Postgres)
    - Approves existing users by default so legacy accounts can log in
    """
    import logging
    from sqlalchemy import inspect, text
    try:
        insp = inspect(engine)
        cols = {c['name'] for c in insp.get_columns('users')}
        if 'is_approved' not in cols:
            dialect = engine.dialect.name
            logging.info("Schema migration: adding users.is_approved (dialect=%s)", dialect)
            with engine.begin() as conn:
                if dialect == 'sqlite':
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT 0"))
                    # Approve existing users
                    conn.execute(text("UPDATE users SET is_approved = 1"))
                elif dialect == 'postgresql':
                    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false"))
                    conn.execute(text("UPDATE users SET is_approved = true WHERE is_approved = false"))
                else:
                    # Generic SQL; may need adjustment for other dialects
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT 0"))
                    conn.execute(text("UPDATE users SET is_approved = 1"))
            logging.info("Schema migration: users.is_approved created and existing users approved")
    except Exception:
        logging.exception("Schema ensure failed; continuing startup. Verify DB permissions and run manual migration if needed.")

# --- Ensure MAIN_ADMIN exists on startup for local/dev ---
@app.on_event("startup")
def ensure_main_admin_exists():
    import os
    from app.core.config import settings
    from app.crud.crud_user import create_admin_user
    auto = os.getenv("AUTO_BOOTSTRAP_MAIN_ADMIN", "1").lower() in ("1", "true", "yes")
    if not auto:
        logging.info("AUTO_BOOTSTRAP_MAIN_ADMIN disabled; skipping admin ensure")
        return
    db = None
    try:
        db = SessionLocal()
        admin = create_admin_user(db, email=settings.MAIN_ADMIN_EMAIL, full_name="Main Admin", password=os.getenv("ADMIN_INITIAL_PASSWORD", "admin123!"))
        logging.info("Main admin ensured at startup: %s active=%s superuser=%s", admin.email, admin.is_active, admin.is_superuser)
    except Exception:
        logging.exception("Failed to ensure main admin on startup")
    finally:
        if db:
            db.close()