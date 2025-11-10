from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List
import csv
from io import StringIO
from fastapi.responses import StreamingResponse, FileResponse
from datetime import datetime
import json

from ..auth import get_current_admin_user
from .. import schemas
from ..database import get_db
from ..models import User, ShoutOut, Reaction, Comment, Report, ShoutOutCategory

router = APIRouter(prefix="/admin/analytics", tags=["Admin Analytics"])


# ----- GET ANALYTICS DASHBOARD -----
@router.get("/", response_model=schemas.AnalyticsOut)
async def get_analytics(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get admin dashboard analytics"""
    # Total shout-outs
    shoutouts_query = await db.execute(
        select(func.count(ShoutOut.id)).where(
            ShoutOut.is_deleted == False,
            ShoutOut.category == ShoutOutCategory.SHOUTOUT.value,
        )
    )
    total_shout_outs = shoutouts_query.scalar_one()
    
    # Total users
    users_query = await db.execute(select(func.count(User.id)))
    total_users = users_query.scalar_one()
    
    # Total reactions
    reactions_query = await db.execute(select(func.count(Reaction.id)))
    total_reactions = reactions_query.scalar_one()
    
    # Total comments
    comments_query = await db.execute(select(func.count(Comment.id)).where(Comment.is_deleted == False))
    total_comments = comments_query.scalar_one()
    
    # Top contributors (users who sent most shout-outs)
    contributors_query = await db.execute(
        select(
            User.id,
            User.name,
            User.department,
            func.count(ShoutOut.id).label("count")
        )
        .join(ShoutOut, ShoutOut.sender_id == User.id)
        .where(
            ShoutOut.is_deleted == False,
            ShoutOut.category == ShoutOutCategory.SHOUTOUT.value,
        )
        .group_by(User.id, User.name, User.department)
        .order_by(desc("count"))
        .limit(10)
    )
    top_contributors = [
        {
            "user_id": row[0],
            "user_name": row[1],
            "department": row[2],
            "count": row[3]
        }
        for row in contributors_query.all()
    ]
    
    # Most tagged (users who received most shout-outs)
    tagged_query = await db.execute(
        select(
            User.id,
            User.name,
            User.department,
            func.count(ShoutOut.id).label("count")
        )
        .join(ShoutOut, ShoutOut.recipient_id == User.id)
        .where(
            ShoutOut.is_deleted == False,
            ShoutOut.category == ShoutOutCategory.SHOUTOUT.value,
        )
        .group_by(User.id, User.name, User.department)
        .order_by(desc("count"))
        .limit(10)
    )
    most_tagged = [
        {
            "user_id": row[0],
            "user_name": row[1],
            "department": row[2],
            "count": row[3]
        }
        for row in tagged_query.all()
    ]
    
    # Department stats
    dept_query = await db.execute(
        select(
            ShoutOut.department,
            func.count(ShoutOut.id).label("count")
        )
        .where(
            ShoutOut.is_deleted == False,
            ShoutOut.category == ShoutOutCategory.SHOUTOUT.value,
        )
        .group_by(ShoutOut.department)
    )
    department_stats = [
        {"department": row[0], "count": row[1]}
        for row in dept_query.all()
    ]
    
    return {
        "total_shout_outs": total_shout_outs,
        "total_users": total_users,
        "total_reactions": total_reactions,
        "total_comments": total_comments,
        "top_contributors": top_contributors,
        "most_tagged": most_tagged,
        "department_stats": department_stats
    }


# ----- GET LEADERBOARD -----
@router.get("/leaderboard", response_model=List[schemas.LeaderboardEntry])
async def get_leaderboard(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get leaderboard for gamified appreciation"""
    # Get all users with their shout-out and reaction counts
    # Use subqueries to count properly
    
    # Subquery for shout-outs received
    shoutouts_subq = (
        select(
            ShoutOut.recipient_id,
            func.count(ShoutOut.id).label("count")
        )
        .where(
            ShoutOut.is_deleted == False,
            ShoutOut.category == ShoutOutCategory.SHOUTOUT.value,
        )
        .group_by(ShoutOut.recipient_id)
        .subquery()
    )
    
    # Subquery for reactions received (on user's shout-outs)
    reactions_subq = (
        select(
            ShoutOut.recipient_id,
            func.count(Reaction.id).label("count")
        )
        .join(Reaction, Reaction.shout_out_id == ShoutOut.id)
        .where(
            ShoutOut.is_deleted == False,
            ShoutOut.category == ShoutOutCategory.SHOUTOUT.value,
        )
        .group_by(ShoutOut.recipient_id)
        .subquery()
    )
    
    shout_outs_count = func.coalesce(shoutouts_subq.c.count, 0).label("shout_outs_received")
    reactions_count = func.coalesce(reactions_subq.c.count, 0).label("reactions_received")
    
    leaderboard_query = await db.execute(
        select(
            User.id,
            User.name,
            User.department,
            shout_outs_count,
            reactions_count
        )
        .outerjoin(shoutouts_subq, shoutouts_subq.c.recipient_id == User.id)
        .outerjoin(reactions_subq, reactions_subq.c.recipient_id == User.id)
        .where(User.role == "employee")
        .group_by(User.id, User.name, User.department, shoutouts_subq.c.count, reactions_subq.c.count)
        .order_by(desc(shout_outs_count), desc(reactions_count))
    )
    
    leaderboard = []
    for row in leaderboard_query.all():
        shout_outs = row[3] or 0
        reactions = row[4] or 0
        total_score = shout_outs * 10 + reactions  # 10 points per shout-out, 1 point per reaction
        leaderboard.append({
            "user_id": row[0],
            "user_name": row[1],
            "department": row[2],
            "shout_outs_received": shout_outs,
            "reactions_received": reactions,
            "total_score": total_score
        })
    
    return leaderboard


# ----- GET REPORTED SHOUT-OUTS -----
@router.get("/reports", response_model=List[schemas.ReportOut])
async def get_reports(
    status: str = "pending",
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get reported shout-outs"""
    query = await db.execute(
        select(Report)
        .where(Report.status == status)
        .order_by(desc(Report.created_at))
    )
    reports = query.scalars().all()
    
    for report in reports:
        await db.refresh(report, ["shout_out", "reporter"])
    
    return reports


# ----- RESOLVE REPORT -----
@router.post("/reports/{report_id}/resolve")
async def resolve_report(
    report_id: int,
    action: str,  # "dismiss" or "delete"
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Resolve a reported shout-out"""
    query = await db.execute(select(Report).where(Report.id == report_id))
    report = query.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if action == "delete":
        shoutout_query = await db.execute(
            select(ShoutOut).where(ShoutOut.id == report.shout_out_id)
        )
        shoutout = shoutout_query.scalar_one_or_none()
        if shoutout:
            shoutout.is_deleted = True
    
    report.status = "resolved" if action == "delete" else "dismissed"
    report.resolved_at = datetime.now()
    await db.commit()
    
    return {"message": f"Report {action}ed successfully"}


# ----- EXPORT CSV -----
@router.get("/export/csv")
async def export_csv(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Export shout-outs data as CSV"""
    query = await db.execute(
        select(ShoutOut)
        .where(ShoutOut.is_deleted == False)
        .order_by(ShoutOut.created_at)
    )
    shoutouts = query.scalars().all()
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Content", "Sender", "Recipient", "Department", "Created At", "Reactions", "Comments"])
    
    for shoutout in shoutouts:
        await db.refresh(shoutout, ["sender", "recipient"])
        reactions_count = await db.execute(
            select(func.count(Reaction.id)).where(Reaction.shout_out_id == shoutout.id)
        )
        comments_count = await db.execute(
            select(func.count(Comment.id)).where(Comment.shout_out_id == shoutout.id, Comment.is_deleted == False)
        )
        writer.writerow([
            shoutout.id,
            shoutout.content[:100],
            shoutout.sender.name if shoutout.sender else "",
            shoutout.recipient.name if shoutout.recipient else "",
            shoutout.department,
            shoutout.created_at.isoformat(),
            reactions_count.scalar_one(),
            comments_count.scalar_one()
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=shoutouts_export.csv"}
    )



