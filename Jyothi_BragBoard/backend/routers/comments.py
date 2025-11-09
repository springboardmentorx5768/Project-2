from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from database_models import Comment, User
from schemas import CommentCreate, CommentResponse
from auth import get_current_user

router = APIRouter(prefix="/comments", tags=["Comments"])

# post comment
@router.post("/{shoutout_id}", response_model=dict)
def add_comment(shoutout_id: int, data: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    comment = Comment(
        shoutout_id=shoutout_id,
        user_id=current_user.id,
        content=data.content,
        created_at=datetime.utcnow(),
    )
    db.add(comment)
    db.commit()
    return {"message": "Comment added successfully"}

# get comments
@router.get("/{shoutout_id}", response_model=list[CommentResponse])
def get_comments(shoutout_id: int, db: Session = Depends(get_db)):
    # join Comment + User so we can include user fields
    rows = (
        db.query(Comment, User)
        .join(User, Comment.user_id == User.id)
        .filter(Comment.shoutout_id == shoutout_id, Comment.is_deleted == False)
        .order_by(Comment.created_at.asc())
        .all()
    )

    result = []
    for c, u in rows:
        result.append(
            CommentResponse(
                id=c.id,
                shoutout_id=c.shoutout_id,
                user_id=u.id,
                username=u.username,
                department=u.department,
                role=u.role,
                content=c.content,
                created_at=c.created_at,
                edited_at=c.edited_at,
                is_deleted=c.is_deleted
            )
        )

    return result

# update comment
@router.put("/{comment_id}", response_model=CommentResponse)
def update_comment(comment_id: int, data: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")

    comment.content = data.content
    comment.edited_at = datetime.utcnow()
    db.commit()
    db.refresh(comment)

    user = db.query(User).filter(User.id == comment.user_id).first()

    return CommentResponse(
        id=comment.id,
        shoutout_id=comment.shoutout_id,
        user_id=user.id,
        username=user.username,
        department=user.department,
        role=user.role,
        content=comment.content,
        created_at=comment.created_at,
        edited_at=comment.edited_at,
        is_deleted=comment.is_deleted
    )

# delete comment
@router.delete("/{comment_id}", response_model=dict)
def delete_comment(
    comment_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
    ):

    comment = db.query(Comment).filter(Comment.id == comment_id).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")

    comment.is_deleted = True
    db.commit()
    return {"message": "Comment deleted successfully"}
