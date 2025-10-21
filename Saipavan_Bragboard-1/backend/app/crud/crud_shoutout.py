from sqlalchemy.orm import Session
from app import models, schemas
from typing import List

def create_shoutout(db: Session, shoutout: schemas.ShoutoutCreate, sender_id: int):
    # ... (this function remains the same)
    db_shoutout = models.Shoutout(message=shoutout.message, sender_id=sender_id)
    db.add(db_shoutout)
    db.commit()
    db.refresh(db_shoutout)
    for recipient_id in shoutout.recipient_ids:
        db_recipient = models.ShoutOutRecipient(shoutout_id=db_shoutout.id, recipient_id=recipient_id)
        db.add(db_recipient)
    db.commit()
    db.refresh(db_shoutout)
    return db_shoutout

# --- UPDATED FUNCTION ---
def get_shoutouts(db: Session, skip: int = 0, limit: int = 100, department: str = None):
    query = db.query(models.Shoutout).order_by(models.Shoutout.created_at.desc())

    if department:
        # If a department is provided, join with the User table and filter
        query = query.join(models.User, models.Shoutout.sender_id == models.User.id).filter(models.User.department == department)

    return query.offset(skip).limit(limit).all()