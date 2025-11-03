# In: backend/app/api/v1/endpoints/comments.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import schemas, crud, models
from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/shoutouts/{shoutout_id}/comments", response_model=schemas.Comment)
def create_comment(
    shoutout_id: int,
    comment: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new comment on a shoutout"""
    # Verify shoutout exists
    shoutout = db.query(models.Shoutout).filter(models.Shoutout.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shoutout not found"
        )
    
    return crud.crud_comment.create_comment(
        db=db,
        comment=comment,
        shoutout_id=shoutout_id,
        user_id=current_user.id
    )

@router.get("/shoutouts/{shoutout_id}/comments", response_model=List[schemas.Comment])
def get_shoutout_comments(
    shoutout_id: int,
    db: Session = Depends(get_db)
):
    """Get all comments for a shoutout"""
    return crud.crud_comment.get_comments_for_shoutout(db=db, shoutout_id=shoutout_id)