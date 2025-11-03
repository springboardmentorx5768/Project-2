# In: backend/app/crud/crud_comment.py

from sqlalchemy.orm import Session, joinedload
from app import models, schemas

def create_comment(
    db: Session, 
    comment: schemas.CommentCreate, 
    shoutout_id: int, 
    user_id: int
) -> models.Comment:
    """Create a new comment"""
    db_comment = models.Comment(
        content=comment.content,
        shoutout_id=shoutout_id,
        user_id=user_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def get_comments_for_shoutout(db: Session, shoutout_id: int):
    """Get all comments for a specific shoutout with user info"""
    return db.query(models.Comment).options(
        joinedload(models.Comment.user)
    ).filter(
        models.Comment.shoutout_id == shoutout_id
    ).order_by(models.Comment.created_at.asc()).all()