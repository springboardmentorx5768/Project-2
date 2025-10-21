# In: backend/app/crud/crud_analytics.py

from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app import models, schemas

def get_admin_insights(db: Session) -> schemas.AdminInsights:
    total_posts = db.query(models.Shoutout).count()
    total_users = db.query(models.User).count()

    # This is a complex query to find top tagged users.
    # It assumes you have a 'shoutout_recipients' association table.
    top_tagged_query = (
        db.query(
            models.User.full_name,
            func.count(models.shoutout_recipients.c.user_id).label("received_count"),
        )
        .join(
            models.shoutout_recipients,
            models.User.id == models.shoutout_recipients.c.user_id,
        )
        .group_by(models.User.id)
        .order_by(desc("received_count"))
        .limit(3)
    )
    
    top_tagged_users = [row[0] for row in top_tagged_query.all()]

    return schemas.AdminInsights(
        total_posts=total_posts,
        total_users=total_users,
        top_tagged_users=top_tagged_users,
    )

def get_leaderboard(db: Session) -> list[schemas.LeaderboardEntry]:
    # Query for shoutouts sent
    sent_query = (
        db.query(
            models.User.id,
            models.User.full_name,
            func.count(models.Shoutout.id).label("sent_count"),
        )
        .outerjoin(models.Shoutout, models.User.id == models.Shoutout.sender_id)
        .group_by(models.User.id)
    ).subquery()

    # Query for shoutouts received
    received_query = (
        db.query(
            models.User.id,
            func.count(models.shoutout_recipients.c.user_id).label("received_count"),
        )
        .outerjoin(
            models.shoutout_recipients,
            models.User.id == models.shoutout_recipients.c.user_id,
        )
        .group_by(models.User.id)
    ).subquery()

    # Combine them and rank
    combined_query = (
        db.query(
            sent_query.c.full_name,
            sent_query.c.sent_count,
            received_query.c.received_count,
            (sent_query.c.sent_count + received_query.c.received_count).label("total_score")
        )
        .join(received_query, sent_query.c.id == received_query.c.id)
        .order_by(desc("total_score"))
        .limit(10)
    )
    
    leaderboard = [
        schemas.LeaderboardEntry(
            rank=index + 1,
            name=row[0],
            sent=row[1],
            received=row[2]
        )
        for index, row in enumerate(combined_query.all())
    ]
    
    return leaderboard

def get_department_highlights(db: Session) -> list[schemas.DepartmentHighlight]:
    # Assumes User model has a 'department' column
    query = (
        db.query(
            models.User.department,
            func.count(models.Shoutout.id).label("shoutout_count"),
        )
        .join(models.Shoutout, models.User.id == models.Shoutout.sender_id)
        .group_by(models.User.department)
        .order_by(desc("shoutout_count"))
    )
    
    highlights = [
        schemas.DepartmentHighlight(department=row[0], count=row[1])
        for row in query.all() if row[0] is not None
    ]
    
    return highlights