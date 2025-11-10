from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from .routers import router  # existing API router
from .test_db_router import router as test_db_router  # <-- import new router
from .routers import router as auth_router  # import the router from routers.py
from .routers import admin_router           # /admin routes
from .routes import shoutout_router, reaction_router, comment_router, admin_analytics_router, notification_router
from .database import get_db
from .models import SecurityKey
from sqlalchemy import select
import secrets

app = FastAPI(
    title="Bragboard API",
    description="Employee appreciation and shout-out platform API",
    version="1.0.0"
)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Bragboard API",
        "docs": "/docs",
        "api": "/api",
        "status": "running"
    }


# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (uploaded images)
import os
from pathlib import Path
# Get the backend directory (parent of app)
BACKEND_DIR = Path(__file__).parent.parent
UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include auth routes
app.include_router(auth_router)  # auth routes with /auth prefix already set in router

# Include admin routes
app.include_router(admin_router)

# Include new feature routes
app.include_router(shoutout_router.router)
app.include_router(reaction_router.router)
app.include_router(comment_router.router)
app.include_router(admin_analytics_router.router)
app.include_router(notification_router.router)

# Include existing routes
app.include_router(router)  # existing routes
app.include_router(test_db_router)  # new test-db route

# startup event to create tables
from .database import engine
from .models import Base

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(text("ALTER TABLE shout_outs ADD COLUMN IF NOT EXISTS title VARCHAR(255);"))
        await conn.execute(text("ALTER TABLE shout_outs ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);"))
        await conn.execute(text("ALTER TABLE shout_outs ADD COLUMN IF NOT EXISTS recipient_id INTEGER;"))
        await conn.execute(text("ALTER TABLE shout_outs ADD COLUMN IF NOT EXISTS department VARCHAR;"))
        await conn.execute(text("ALTER TABLE shout_outs ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT 'shoutout';"))
        await conn.execute(text("UPDATE shout_outs SET category='shoutout' WHERE category IS NULL;"))
        await conn.execute(text("ALTER TABLE shout_outs ADD COLUMN IF NOT EXISTS event_date TIMESTAMP WITH TIME ZONE;"))
        await conn.execute(
            text(
                """
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'shout_outs' AND column_name = 'category'
                    ) THEN
                        BEGIN
                            ALTER TABLE shout_outs ALTER COLUMN category TYPE VARCHAR(20) USING category::text;
                        EXCEPTION WHEN others THEN
                            -- ignore if conversion fails
                            NULL;
                        END;
                    END IF;
                END;
                $$;
                """
            )
        )
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;"))


@app.on_event("startup")
async def create_default_security_key():
    """Create a default security key if none exist"""
    async for db in get_db():
        try:
            result = await db.execute(select(SecurityKey).where(SecurityKey.is_used == False))
            unused_keys = result.scalars().all()
            if not unused_keys:
                default_key = SecurityKey(key=secrets.token_urlsafe(16), is_used=False)
                db.add(default_key)
                await db.commit()
                print(f"\n[INFO] Created default admin security key: {default_key.key}")
                print("[INFO] Use this key for admin registration. Create more via /auth/security-keys endpoint.\n")
            break
        except Exception as e:
            print(f"[WARNING] Could not create default security key: {e}")
            break
