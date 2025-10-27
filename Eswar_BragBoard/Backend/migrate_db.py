#!/usr/bin/env python3
"""
Database migration script to add image_url column to shoutouts table
"""
from database import engine
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def add_image_url_column():
    """Add image_url column to shoutouts table"""
    try:
        with engine.connect() as conn:
            # Check if column exists
            result = conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'shoutouts' AND column_name = 'image_url'
            """))
            if result.fetchone():
                logger.info("image_url column already exists")
                return

            # Add the column
            conn.execute(text("""
                ALTER TABLE shoutouts ADD COLUMN image_url VARCHAR(500)
            """))
            conn.commit()
            logger.info("Successfully added image_url column to shoutouts table")

    except Exception as e:
        logger.error(f"Failed to add image_url column: {e}")
        raise

if __name__ == "__main__":
    add_image_url_column()
