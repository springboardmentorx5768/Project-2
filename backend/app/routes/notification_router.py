from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List

from ..auth import get_current_user
from .. import schemas
from ..database import get_db
from ..models import Notification, User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[schemas.NotificationOut])
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
    )
    result = await db.execute(query)
    notifications = result.scalars().all()

    for notification in notifications:
        if notification.source_user_id:
            await db.refresh(notification, ["source_user"])

    return notifications


@router.post("/mark-read")
async def mark_notifications_read(
    payload: schemas.NotificationReadUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not payload.notification_ids:
        raise HTTPException(status_code=400, detail="notification_ids cannot be empty")

    stmt = (
        update(Notification)
        .where(
            Notification.id.in_(payload.notification_ids),
            Notification.user_id == current_user.id,
        )
        .values(is_read=True)
    )
    await db.execute(stmt)
    await db.commit()
    return {"message": "Notifications updated"}


@router.post("/mark-all-read")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        update(Notification)
        .where(Notification.user_id == current_user.id)
        .values(is_read=True)
    )
    await db.execute(stmt)
    await db.commit()
    return {"message": "All notifications marked as read"}

