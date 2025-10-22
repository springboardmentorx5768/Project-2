from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routes.user import router as user_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BragBoard API",
    description="A social platform for sharing achievements",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5175", "http://127.0.0.1:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(user_router, prefix="/api", tags=["users"])

@app.get("/")
def read_root():
    return {"message": "Welcome to BragBoard API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
