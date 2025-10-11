
from fastapi import FastAPI, Depends
from database import engine, get_db
import database_models
from routers import users, shoutouts
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database_models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BragBoard API", version="1.0.0")

origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Yes Done"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}

app.include_router(users.router)
app.include_router(shoutouts.router)  