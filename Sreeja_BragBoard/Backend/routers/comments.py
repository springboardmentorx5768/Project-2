"""Comments API Router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import Comment, ShoutOut, User
from auth import get_current_user

router = APIRouter(prefix="/comments", tags=["comments"])

# Pydantic models
class CommentCreate(BaseModel):
    shoutout_id: int
    comment_text: str
    parent_id: Optional[int] = None  # For nested comments

class CommentResponse(BaseModel):
    id: int
    shoutout_id: int
    user_id: int
    user_name: str
    user_department: str
    comment_text: str
    created_at: str
    parent_id: Optional[int] = None
    replies: Optional[List["CommentResponse"]] = []
    avatar_url: Optional[str] = None  # For user avatars
    
    class Config:
        from_attributes = True

@router.post("/", response_model=CommentResponse)
def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new comment on a shoutout"""
    # Verify shoutout exists
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == comment.shoutout_id).first()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shoutout not found")
    
    # Create comment
    new_comment = Comment(
        shoutout_id=comment.shoutout_id,
        user_id=current_user.id,
        comment_text=comment.comment_text,
        created_at=datetime.utcnow()
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return CommentResponse(
        id=new_comment.id,
        shoutout_id=new_comment.shoutout_id,
        user_id=new_comment.user_id,
        user_name=current_user.name,
        user_department=current_user.department,
        comment_text=new_comment.comment_text,
        created_at=new_comment.created_at.isoformat()
    )

@router.get("/{shoutout_id}", response_model=List[CommentResponse])
def get_comments(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all comments for a shoutout"""
    # Verify shoutout exists
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shoutout not found")
    
    # Get comments with user info
    comments = db.query(Comment).filter(Comment.shoutout_id == shoutout_id).order_by(Comment.created_at.desc()).all()
    
    result = []
    for comment in comments:
        user = db.query(User).filter(User.id == comment.user_id).first()
        result.append(CommentResponse(
            id=comment.id,
            shoutout_id=comment.shoutout_id,
            user_id=comment.user_id,
            user_name=user.name if user else "Unknown",
            user_department=user.department if user else "Unknown",
            comment_text=comment.comment_text,
            created_at=comment.created_at.isoformat()
        ))
    
    return result

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a comment (only by comment owner or admin)"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user is comment owner or admin
    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}
