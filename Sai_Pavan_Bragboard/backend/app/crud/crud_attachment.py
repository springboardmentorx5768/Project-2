# In: backend/app/crud/crud_attachment.py

from sqlalchemy.orm import Session
from app import models, schemas
from typing import List

def create_attachment(
    db: Session, 
    attachment: schemas.AttachmentCreate, 
    shoutout_id: int,
    uploaded_by: int
) -> models.Attachment:
    """Create a new attachment"""
    db_attachment = models.Attachment(
        filename=attachment.filename,
        unique_filename=attachment.unique_filename,
        file_path=attachment.file_path,
        file_url=attachment.file_url,
        file_type=attachment.file_type,
        file_size=attachment.file_size,
        mime_type=attachment.mime_type,
        shoutout_id=shoutout_id,
        uploaded_by=uploaded_by
    )
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)
    return db_attachment

def get_attachments_for_shoutout(db: Session, shoutout_id: int) -> List[models.Attachment]:
    """Get all attachments for a specific shoutout"""
    return db.query(models.Attachment).filter(
        models.Attachment.shoutout_id == shoutout_id
    ).all()

def delete_attachment(db: Session, attachment_id: int, user_id: int) -> bool:
    """Delete an attachment (only by the uploader)"""
    attachment = db.query(models.Attachment).filter(
        models.Attachment.id == attachment_id,
        models.Attachment.uploaded_by == user_id
    ).first()
    
    if attachment:
        db.delete(attachment)
        db.commit()
        return True
    return False