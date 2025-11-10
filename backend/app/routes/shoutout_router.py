from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
from datetime import datetime, timedelta
import os
import aiofiles
from pathlib import Path

from ..auth import get_current_user
from .. import schemas
from ..database import get_db
from ..models import (
    User,
    ShoutOut,
    Reaction,
    Comment,
    ReactionType,
    ShoutOutCategory,
    Notification,
    NotificationType,
)

router = APIRouter(prefix="/shoutouts", tags=["ShoutOuts"])

# Create uploads directory if it doesn't exist
# Get the backend directory (parent of app, parent of routes)
BACKEND_DIR = Path(__file__).parent.parent.parent
UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _parse_date_boundary(value: str, end_of_day: bool = False) -> datetime:
    dt = datetime.fromisoformat(value)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=None)
    if dt.hour == 0 and dt.minute == 0 and dt.second == 0 and dt.microsecond == 0:
        if end_of_day:
            dt = dt + timedelta(days=1) - timedelta(microseconds=1)
    return dt


def _parse_iso_datetime(value: str) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS).")


async def _save_uploaded_image(image: UploadFile) -> str:
    original_name = os.path.basename(image.filename) if image.filename else "upload"
    file_extension = os.path.splitext(original_name)[1]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{original_name}"
    file_path = UPLOAD_DIR / filename

    async with aiofiles.open(file_path, "wb") as f:
        content_data = await image.read()
        await f.write(content_data)

    return f"/uploads/{filename}"


async def _hydrate_shoutout(shoutout: ShoutOut, db: AsyncSession) -> None:
    sender_query = await db.execute(select(User).where(User.id == shoutout.sender_id))
    shoutout.sender = sender_query.scalar_one()

    if shoutout.recipient_id:
        recipient_query = await db.execute(select(User).where(User.id == shoutout.recipient_id))
        shoutout.recipient = recipient_query.scalar_one_or_none()
    else:
        shoutout.recipient = None


async def _format_shoutout_list(shoutouts: List[ShoutOut], current_user: User, db: AsyncSession) -> List[dict]:
    formatted: List[dict] = []
    for item in shoutouts:
        await _hydrate_shoutout(item, db)
        formatted.append(await format_shoutout_response(item, current_user.id, db))
    return formatted


# ----- CREATE SHOUT-OUT -----
@router.post("/", response_model=schemas.ShoutOutOut)
async def create_shoutout(
    content: str = Form(...),
    recipient_id: Optional[int] = Form(None),
    title: Optional[str] = Form(None),
    category: str = Form("shoutout"),
    event_date: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new shout-out with optional image upload"""
    try:
        category_enum = ShoutOutCategory(category)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid category")
    category_value = category_enum.value

    recipient = None
    if recipient_id:
        recipient_query = await db.execute(select(User).where(User.id == recipient_id))
        recipient = recipient_query.scalar_one_or_none()
        if not recipient:
            raise HTTPException(status_code=404, detail="Recipient not found")
    elif category_enum == ShoutOutCategory.SHOUTOUT:
        raise HTTPException(status_code=400, detail="recipient_id is required for shoutouts")

    image_url = await _save_uploaded_image(image) if image else None
    event_dt = _parse_iso_datetime(event_date) if event_date else None

    shoutout = ShoutOut(
        title=title,
        content=content,
        sender_id=current_user.id,
        recipient_id=recipient_id,
        department=current_user.department,
        image_url=image_url,
        category=category_value,
        event_date=event_dt,
    )
    db.add(shoutout)
    await db.commit()
    await db.refresh(shoutout)

    await _hydrate_shoutout(shoutout, db)
    return await format_shoutout_response(shoutout, current_user.id, db)


# ----- TIMELINE POSTS -----
@router.post("/timeline", response_model=schemas.ShoutOutOut)
async def create_timeline_post(
    payload: schemas.TimelinePostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    shoutout = ShoutOut(
        title=payload.title,
        content=payload.content,
        sender_id=current_user.id,
        recipient_id=None,  # Timeline posts don't have recipients
        department=current_user.department,
        category=ShoutOutCategory.TIMELINE.value,
    )
    db.add(shoutout)
    await db.commit()
    await db.refresh(shoutout)

    await _hydrate_shoutout(shoutout, db)
    return await format_shoutout_response(shoutout, current_user.id, db)


@router.get("/timeline", response_model=List[schemas.ShoutOutOut])
async def list_timeline_posts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(ShoutOut)
        .where(
            ShoutOut.is_deleted == False,
            ShoutOut.category == ShoutOutCategory.TIMELINE.value,
        )
        .order_by(desc(ShoutOut.created_at))
    )
    result = await db.execute(query)
    shoutouts = result.scalars().all()
    return await _format_shoutout_list(shoutouts, current_user, db)


# ----- TEAM BOARD -----
@router.post("/team", response_model=schemas.ShoutOutOut)
async def create_team_post(
    payload: schemas.TimelinePostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    shoutout = ShoutOut(
        title=payload.title,
        content=payload.content,
        sender_id=current_user.id,
        recipient_id=None,  # Team posts don't have recipients
        department=current_user.department,
        category=ShoutOutCategory.TEAM.value,
    )
    db.add(shoutout)
    await db.commit()
    await db.refresh(shoutout)

    await _hydrate_shoutout(shoutout, db)
    return await format_shoutout_response(shoutout, current_user.id, db)


@router.get("/team", response_model=List[schemas.ShoutOutOut])
async def list_team_posts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(ShoutOut)
        .where(
            ShoutOut.is_deleted == False,
            ShoutOut.category == ShoutOutCategory.TEAM.value,
            ShoutOut.department == current_user.department,
        )
        .order_by(desc(ShoutOut.created_at))
    )
    result = await db.execute(query)
    shoutouts = result.scalars().all()
    return await _format_shoutout_list(shoutouts, current_user, db)


# ----- ACHIEVEMENTS -----
@router.post("/achievements", response_model=schemas.ShoutOutOut)
async def create_achievement(
    title: str = Form(...),
    description: str = Form(...),
    achieved_at: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create achievement with optional image upload"""
    event_dt = _parse_iso_datetime(achieved_at) if achieved_at else None
    image_url = await _save_uploaded_image(image) if image else None

    shoutout = ShoutOut(
        title=title,
        content=description,
        sender_id=current_user.id,
        recipient_id=None,  # Achievements don't have recipients
        department=current_user.department,
        category=ShoutOutCategory.ACHIEVEMENT.value,
        event_date=event_dt,
        image_url=image_url,
    )
    db.add(shoutout)
    await db.commit()
    await db.refresh(shoutout)

    await _hydrate_shoutout(shoutout, db)
    return await format_shoutout_response(shoutout, current_user.id, db)


@router.get("/achievements/me", response_model=List[schemas.ShoutOutOut])
async def get_my_achievements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(ShoutOut)
        .where(
            ShoutOut.is_deleted == False,
            ShoutOut.category == ShoutOutCategory.ACHIEVEMENT.value,
            ShoutOut.sender_id == current_user.id,
        )
        .order_by(desc(ShoutOut.created_at))
    )
    result = await db.execute(query)
    shoutouts = result.scalars().all()
    return await _format_shoutout_list(shoutouts, current_user, db)


# ----- GET ALL SHOUT-OUTS (with filters) -----
@router.get("/", response_model=List[schemas.ShoutOutOut])
async def get_shoutouts(
    department: Optional[str] = None,
    sender_id: Optional[int] = None,
    recipient_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all shout-outs with optional filters"""
    query = select(ShoutOut).where(ShoutOut.is_deleted == False)
    
    # Apply filters
    if department:
        query = query.where(ShoutOut.department == department)
    if sender_id:
        query = query.where(ShoutOut.sender_id == sender_id)
    if recipient_id:
        query = query.where(ShoutOut.recipient_id == recipient_id)
    if start_date:
        query = query.where(ShoutOut.created_at >= _parse_date_boundary(start_date, end_of_day=False))
    if end_date:
        query = query.where(ShoutOut.created_at <= _parse_date_boundary(end_date, end_of_day=True))
    if category:
        try:
            category_enum = ShoutOutCategory(category)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid category filter")
        query = query.where(ShoutOut.category == category_enum.value)
    
    # Department-wise scoping for employees
    if current_user.role == "employee" and category != ShoutOutCategory.ACHIEVEMENT.value:
        query = query.where(ShoutOut.department == current_user.department)
    
    query = query.order_by(desc(ShoutOut.created_at))
    
    result = await db.execute(query)
    shoutouts = result.scalars().all()
    
    return await _format_shoutout_list(shoutouts, current_user, db)


# ----- GET SHOUT-OUT BY ID -----
@router.get("/{shoutout_id}", response_model=schemas.ShoutOutOut)
async def get_shoutout(
    shoutout_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific shout-out by ID"""
    query = await db.execute(
        select(ShoutOut).where(ShoutOut.id == shoutout_id, ShoutOut.is_deleted == False)
    )
    shoutout = query.scalar_one_or_none()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shout-out not found")
    
    # Load relationships
    await _hydrate_shoutout(shoutout, db)
    return await format_shoutout_response(shoutout, current_user.id, db)


# ----- DELETE SHOUT-OUT -----
@router.delete("/{shoutout_id}")
async def delete_shoutout(
    shoutout_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a shout-out (soft delete)"""
    query = await db.execute(
        select(ShoutOut).where(ShoutOut.id == shoutout_id)
    )
    shoutout = query.scalar_one_or_none()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shout-out not found")
    
    # Only sender or admin can delete
    if shoutout.sender_id != current_user.id and current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this shout-out")
    
    shoutout.is_deleted = True
    await db.commit()
    return {"message": "Shout-out deleted successfully"}


# ----- REPORT SHOUT-OUT -----
@router.post("/{shoutout_id}/report")
async def report_shoutout(
    shoutout_id: int,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Report a shout-out"""
    from ..models import Report
    # Verify shout-out exists
    shoutout_query = await db.execute(
        select(ShoutOut).where(ShoutOut.id == shoutout_id, ShoutOut.is_deleted == False)
    )
    shoutout = shoutout_query.scalar_one_or_none()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shout-out not found")
    
    # Create report
    report = Report(
        shout_out_id=shoutout_id,
        reporter_id=current_user.id,
        reason=reason
    )
    shoutout.is_reported = True
    db.add(report)
    await db.commit()
    
    return {"message": "Shout-out reported successfully"}


# ----- HELPER FUNCTION -----
async def format_shoutout_response(shoutout: ShoutOut, user_id: int, db: AsyncSession) -> dict:
    """Format shout-out response with reaction counts and user reactions"""
    # Get reaction counts
    reactions_query = await db.execute(
        select(Reaction.reaction_type, func.count(Reaction.id))
        .where(Reaction.shout_out_id == shoutout.id)
        .group_by(Reaction.reaction_type)
    )
    reaction_counts = {str(r_type): count for r_type, count in reactions_query.all()}
    
    # Get user's reactions
    user_reactions_query = await db.execute(
        select(Reaction.reaction_type)
        .where(Reaction.shout_out_id == shoutout.id, Reaction.user_id == user_id)
    )
    user_reactions = [str(r[0]) for r in user_reactions_query.all()]
    
    # Get comment count
    comments_query = await db.execute(
        select(func.count(Comment.id))
        .where(Comment.shout_out_id == shoutout.id, Comment.is_deleted == False)
    )
    comment_count = comments_query.scalar_one() or 0
    
    # Build response dict
    response_dict = {
        "id": shoutout.id,
        "title": shoutout.title,
        "content": shoutout.content,
        "image_url": shoutout.image_url,
        "sender_id": shoutout.sender_id,
        "recipient_id": shoutout.recipient_id,
        "department": shoutout.department,
        "category": shoutout.category or ShoutOutCategory.SHOUTOUT.value,
        "event_date": shoutout.event_date,
        "created_at": shoutout.created_at,
        "sender": {
            "id": shoutout.sender.id,
            "username": shoutout.sender.username,
            "name": shoutout.sender.name,
            "email": shoutout.sender.email,
            "role": shoutout.sender.role,
            "department": shoutout.sender.department,
        } if shoutout.sender else None,
        "recipient": {
            "id": shoutout.recipient.id,
            "username": shoutout.recipient.username,
            "name": shoutout.recipient.name,
            "email": shoutout.recipient.email,
            "role": shoutout.recipient.role,
            "department": shoutout.recipient.department,
        } if shoutout.recipient else None,
        "reaction_counts": {
            "like": reaction_counts.get("like", 0),
            "clap": reaction_counts.get("clap", 0),
            "star": reaction_counts.get("star", 0),
        },
        "user_reactions": user_reactions,
        "comment_count": comment_count
    }
    
    return response_dict


# ----- COUNT ENDPOINTS -----
@router.get("/count")
async def get_shoutout_count(
    type: str,  # "posted" or "received"
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get count of posted or received shout-outs"""
    if type == "posted":
        query = await db.execute(
            select(func.count(ShoutOut.id)).where(
                ShoutOut.is_deleted == False,
                ShoutOut.category == ShoutOutCategory.SHOUTOUT.value,
                ShoutOut.sender_id == current_user.id,
            )
        )
        count = query.scalar_one() or 0
        return {"type": "posted", "count": count}
    elif type == "received":
        query = await db.execute(
            select(func.count(ShoutOut.id)).where(
                ShoutOut.is_deleted == False,
                ShoutOut.category == ShoutOutCategory.SHOUTOUT.value,
                ShoutOut.recipient_id == current_user.id,
            )
        )
        count = query.scalar_one() or 0
        return {"type": "received", "count": count}
    else:
        raise HTTPException(status_code=400, detail="Invalid type. Use 'posted' or 'received'")


@router.get("/summary", response_model=schemas.ShoutOutSummary)
async def get_shoutout_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    achievements_count_query = await db.execute(
        select(func.count(ShoutOut.id)).where(
            ShoutOut.is_deleted == False,
            ShoutOut.category == ShoutOutCategory.ACHIEVEMENT.value,
            ShoutOut.sender_id == current_user.id,
        )
    )
    achievements_count = achievements_count_query.scalar_one() or 0

    sent_count_query = await db.execute(
        select(func.count(ShoutOut.id)).where(
            ShoutOut.is_deleted == False,
            ShoutOut.category == ShoutOutCategory.SHOUTOUT.value,
            ShoutOut.sender_id == current_user.id,
        )
    )
    sent_count = sent_count_query.scalar_one() or 0

    received_count_query = await db.execute(
        select(func.count(ShoutOut.id)).where(
            ShoutOut.is_deleted == False,
            ShoutOut.category == ShoutOutCategory.SHOUTOUT.value,
            ShoutOut.recipient_id == current_user.id,
        )
    )
    received_count = received_count_query.scalar_one() or 0

    recent_query = await db.execute(
        select(ShoutOut)
        .where(
            ShoutOut.is_deleted == False,
            ShoutOut.category == ShoutOutCategory.SHOUTOUT.value,
            ShoutOut.sender_id == current_user.id,
        )
        .order_by(desc(ShoutOut.created_at))
        .limit(5)
    )
    recent_shoutouts = recent_query.scalars().all()
    formatted_recent = await _format_shoutout_list(recent_shoutouts, current_user, db)

    return {
        "achievements_count": achievements_count,
        "shoutouts_sent_count": sent_count,
        "shoutouts_received_count": received_count,
        "recent_shoutouts": formatted_recent,
    }

