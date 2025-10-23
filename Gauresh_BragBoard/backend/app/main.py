import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine
from .models import Base

# Routers
from .routers import router, open_router, admin_router, auth_router
from .test_db_router import router as test_db_router

app = FastAPI()

# -------------------------
# ✅ CORS Settings
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# ✅ Include Routers
# -------------------------
app.include_router(auth_router)       # Auth routes (/auth)
app.include_router(admin_router)      # Admin routes (/admin)
app.include_router(router)            # Main routes
app.include_router(open_router)       # Public posts routes (/posts/...)
app.include_router(test_db_router)    # Test DB routes

# -------------------------
# ✅ Database Startup
# -------------------------
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# -------------------------
# ✅ Serve Uploads Directory
# -------------------------
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
