from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from database import engine, SessionLocal, get_db
from models import Base
from routers.users import router as users_router
from routers.shoutouts import router as shoutouts_router
from routers.activity import router as activity_router
from routers.reactions import router as reactions_router
from routers.comments import router as comments_router
from routers.analytics import router as analytics_router
from routers.reports import router as reports_router
from routers.exports import router as exports_router
import time

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BragBoard API", version="1.0.0")

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware to log all requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"🌐 Incoming request: {request.method} {request.url.path}")
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    print(f"✅ Response status: {response.status_code} (took {process_time:.2f}s)")
    return response

@app.get("/")
def read_root():
    return {"message": "Yes perfect"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    # Simple DB health check
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}

app.include_router(users_router)
app.include_router(shoutouts_router)
app.include_router(activity_router)
app.include_router(reactions_router)
app.include_router(comments_router)
app.include_router(analytics_router)
app.include_router(reports_router)
app.include_router(exports_router)

