from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List

from ..auth import get_current_user
from .. import schemas
from ..database import get_db
from ..models import User, ShoutOut, Comment, Notification, NotificationType

router = APIRouter(prefix="/comments", tags=["Comments"])


# ----- CREATE COMMENT -----
@router.post("/", response_model=schemas.CommentOut)
async def create_comment(
    comment_data: schemas.CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new comment on a shout-out"""
    # Verify shout-out exists
    shoutout_query = await db.execute(
        select(ShoutOut).where(ShoutOut.id == comment_data.shout_out_id, ShoutOut.is_deleted == False)
    )
    shoutout = shoutout_query.scalar_one_or_none()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shout-out not found")
    
    parent = None
    # If parent_id is provided, verify it exists
    if comment_data.parent_id:
        parent_query = await db.execute(
            select(Comment).where(Comment.id == comment_data.parent_id, Comment.is_deleted == False)
        )
        parent = parent_query.scalar_one_or_none()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")
    
    # Create comment
    comment = Comment(
        content=comment_data.content,
        user_id=current_user.id,
        shout_out_id=comment_data.shout_out_id,
        parent_id=comment_data.parent_id
    )
    db.add(comment)
    notifications = []

    if shoutout.sender_id != current_user.id:
        actor_name = current_user.name or current_user.username
        notifications.append(
            Notification(
                user_id=shoutout.sender_id,
                source_user_id=current_user.id,
                shout_out_id=shoutout.id,
                notification_type=NotificationType.COMMENT,
                message=f"{actor_name} commented on your post.",
            )
        )

    if comment_data.parent_id and parent and parent.user_id not in {current_user.id, shoutout.sender_id}:
        actor_name = current_user.name or current_user.username
        notifications.append(
            Notification(
                user_id=parent.user_id,
                source_user_id=current_user.id,
                shout_out_id=shoutout.id,
                notification_type=NotificationType.COMMENT,
                message=f"{actor_name} replied to your comment.",
            )
        )

    for note in notifications:
        db.add(note)

    await db.commit()
    await db.refresh(comment)

    # Load user relationship
    user_query = await db.execute(select(User).where(User.id == comment.user_id))
    comment.user = user_query.scalar_one()

    return schemas.CommentOut(
        id=comment.id,
        content=comment.content,
        user_id=comment.user_id,
        shout_out_id=comment.shout_out_id,
        parent_id=comment.parent_id,
        created_at=comment.created_at,
        user=schemas.UserOut(
            id=comment.user.id,
            username=comment.user.username,
            name=comment.user.name,
            email=comment.user.email,
            role=comment.user.role,
            department=comment.user.department,
        ),
        replies=[]
    )


# ----- GET COMMENTS FOR SHOUT-OUT -----
@router.get("/shoutout/{shoutout_id}", response_model=List[schemas.CommentOut])
async def get_comments(
    shoutout_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all comments for a specific shout-out (with nesting)"""
    # Get all top-level comments (no parent)
    query = await db.execute(
        select(Comment)
        .where(Comment.shout_out_id == shoutout_id, Comment.parent_id == None, Comment.is_deleted == False)
        .order_by(Comment.created_at)
    )
    top_comments = query.scalars().all()
    
    # Load user relationships and replies
    comments_list = []
    for comment in top_comments:
        # Load user relationship
        user_query = await db.execute(select(User).where(User.id == comment.user_id))
        comment.user = user_query.scalar_one()
        comment_dict = await format_comment_with_replies(comment, db)
        comments_list.append(comment_dict)
    
    return comments_list


# ----- DELETE COMMENT -----
@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a comment (soft delete)"""
    query = await db.execute(
        select(Comment).where(Comment.id == comment_id)
    )
    comment = query.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Only comment owner or admin can delete
    if comment.user_id != current_user.id and current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    comment.is_deleted = True
    await db.commit()
    return {"message": "Comment deleted successfully"}


# ----- HELPER FUNCTION -----
async def format_comment_with_replies(comment: Comment, db: AsyncSession) -> dict:
    """Format comment with nested replies"""
    # Get replies
    replies_query = await db.execute(
        select(Comment)
        .where(Comment.parent_id == comment.id, Comment.is_deleted == False)
        .order_by(Comment.created_at)
    )
    replies = replies_query.scalars().all()
    
    # Format replies recursively
    formatted_replies = []
    for reply in replies:
        # Load user relationship
        user_query = await db.execute(select(User).where(User.id == reply.user_id))
        reply.user = user_query.scalar_one()
        formatted_replies.append(await format_comment_with_replies(reply, db))
    
    # Convert user to dict for JSON serialization
    user_dict = None
    if comment.user:
        user_dict = {
            "id": comment.user.id,
            "username": comment.user.username,
            "name": comment.user.name,
            "email": comment.user.email,
            "role": comment.user.role,
            "department": comment.user.department,
        }
    
    return {
        "id": comment.id,
        "content": comment.content,
        "user_id": comment.user_id,
        "shout_out_id": comment.shout_out_id,
        "parent_id": comment.parent_id,
        "created_at": comment.created_at,
        "user": user_dict,
        "replies": formatted_replies
    }

