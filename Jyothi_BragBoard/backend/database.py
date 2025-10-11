
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL, ENVIRONMENT
import logging

# Set up logging for database connection
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# PostgreSQL-only configuration
if not DATABASE_URL.startswith("postgresql"):
    raise ValueError("Only PostgreSQL databases are supported. Please check your DATABASE_URL.")

engine = create_engine(
    DATABASE_URL,
    echo=(ENVIRONMENT == "development"),  # Enable SQL logging in development
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,    # Recycle connections every 5 minutes
)

logger.info("Configured PostgreSQL engine")

session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Test connection on import
try:
    with engine.connect() as conn:
        logger.info("Database connection successful.")
except Exception as e:
    logger.error(f"Database connection failed: {e}")
    raise

def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()

    
