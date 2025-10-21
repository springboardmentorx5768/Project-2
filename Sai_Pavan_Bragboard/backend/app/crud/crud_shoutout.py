from sqlalchemy.orm import Session, joinedload
from app import models, schemas
from typing import List

def create_shoutout(db: Session, shoutout: schemas.ShoutoutCreate, sender_id: int) -> models.Shoutout:
    """
    Creates a new shoutout in the database.
    """
    # Create the main shoutout object
    db_shoutout = models.Shoutout(
        message=shoutout.message,
        sender_id=sender_id
    )
    
    # Determine recipients
    recipients = []
    if shoutout.is_all:
        recipients = db.query(models.User).all()
    elif shoutout.department:
        recipients = db.query(models.User).filter(models.User.department == shoutout.department).all()
    elif shoutout.recipient_ids:
        recipients = db.query(models.User).filter(models.User.id.in_(shoutout.recipient_ids)).all()

    if not recipients:
        # No recipients found; still allow shoutout creation but leave recipients empty
        recipients = []

    # Associate the recipients with the shoutout
    db_shoutout.recipients.extend(recipients)
    
    db.add(db_shoutout)
    db.commit()
    db.refresh(db_shoutout)
    return db_shoutout

def get_shoutouts(db: Session, skip: int = 0, limit: int = 100, department: str | None = None) -> List[models.Shoutout]:
    """
    Retrieves a list of shoutouts with sender and recipient data pre-loaded.
    """
    return (
        db.query(models.Shoutout)
        .options(
            joinedload(models.Shoutout.sender),
            joinedload(models.Shoutout.recipients)
        )
    .order_by(models.Shoutout.created_at.desc())
        .offset(skip)
        .limit(limit)
    .all()
    )
def get_shoutouts_by_sender(db: Session, sender_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Shoutout).filter(models.Shoutout.sender_id == sender_id).order_by(models.Shoutout.created_at.desc()).offset(skip).limit(limit).all()


def delete_shoutout(db: Session, shoutout_id: int, requester) -> dict:
    """
    Delete the shoutout with the given id if the requester is the sender or a superuser.
    Returns an empty dict on success.
    """
    stmt = db.query(models.Shoutout).filter(models.Shoutout.id == shoutout_id)
    target = stmt.first()
    if not target:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail='Shoutout not found')

    # requester may be a User model instance or have attributes id/is_superuser
    req_id = getattr(requester, 'id', None)
    is_super = getattr(requester, 'is_superuser', False)
    if target.sender_id != req_id and not is_super:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail='Not authorized to delete this shoutout')

    # delete the shoutout
    db.delete(target)
    db.commit()
    return {}