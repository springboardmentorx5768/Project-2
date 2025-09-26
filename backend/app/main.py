from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import router  # existing API router
from .test_db_router import router as test_db_router  # <-- import new router
from .routers import router as auth_router  # import the router from routers.py



app = FastAPI()



# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routers
app.include_router(router)  # existing routes
app.include_router(test_db_router)  # new test-db route
app.include_router(auth_router, prefix="/auth")
# startup event to create tables
from .database import engine
from .models import Base

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
