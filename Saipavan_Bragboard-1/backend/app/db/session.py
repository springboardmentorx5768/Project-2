from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# --- IMPORTANT ---
# Replace the placeholder values below with your actual PostgreSQL connection details.
# Format: "postgresql://USERNAME:PASSWORD@HOST/DATABASE_NAME"
DATABASE_URL = "postgresql://postgres:Saipavan%40123@db.wjauqzauknqlgcxrwwci.supabase.co:5432/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency function to get a DB session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()