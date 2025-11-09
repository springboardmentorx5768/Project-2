from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from app.core.config import settings

# Prefer DATABASE_URL from environment (via .env). Fallback to a local sqlite file for
# quick local development when Postgres is not configured. This avoids hard 500s during dev.
DATABASE_URL = os.getenv('DATABASE_URL') or settings.DATABASE_URL
if not DATABASE_URL:
    # use sqlite fallback (file-based) for local dev
    DATABASE_URL = 'sqlite:///./dev.db'

# When using SQLite with SQLAlchemy, set connect_args to allow multithreaded access
engine_kwargs = {}
if DATABASE_URL.startswith('sqlite'):
    engine_kwargs['connect_args'] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()