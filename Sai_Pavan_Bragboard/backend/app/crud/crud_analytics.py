# In: backend/app/crud/crud_analytics.py

from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from time import time

from app import models, schemas
from app.crud import crud_score

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

_LB_CACHE: dict[tuple, tuple[float, list[schemas.LeaderboardEntry]]] = {}
_LB_TTL_SECONDS = 120


def invalidate_leaderboard_cache():
    """Clear in-memory leaderboard cache so score changes reflect immediately."""
    _LB_CACHE.clear()


def get_leaderboard(db: Session, days: int | None = None, department: str | None = None) -> list[schemas.LeaderboardEntry]:
    """Return top users ranked by sent+received counts.
    Optional filters:
    - days: restrict counts to shoutouts created within the last N days
    - department: restrict to users in this department
    Results are cached for a short TTL to reduce load.
    """

    # simple TTL cache keyed by (days, department)
    key = (int(days) if days else 0, department or "*")
    now = time()
    cached = _LB_CACHE.get(key)
    if cached and now - cached[0] < _LB_TTL_SECONDS:
        return cached[1]

    time_filter = None
    if days and days > 0:
        cutoff = datetime.utcnow() - timedelta(days=days)
        time_filter = cutoff

    # Compute counts which matter for ranking: reactions received on user's posts,
    # comments received on user's posts, and tag count (times the user was mentioned/recipient).

    # reactions_received_q: count reactions that belong to shoutouts authored by the user
    reactions_q = (
        db.query(
            models.User.id.label("uid"),
            func.count(models.Reaction.id).label("reactions_received")
        )
        .outerjoin(models.Shoutout, models.User.id == models.Shoutout.sender_id)
        .outerjoin(models.Reaction, models.Shoutout.id == models.Reaction.shoutout_id)
    )
    if department:
        reactions_q = reactions_q.filter(models.User.department == department)
    if time_filter is not None:
        reactions_q = reactions_q.filter(models.Reaction.created_at >= time_filter)
    reactions_q = reactions_q.group_by(models.User.id).subquery()

    # comments_received_q: count comments on shoutouts authored by the user
    comments_q = (
        db.query(
            models.User.id.label("uid"),
            func.count(models.Comment.id).label("comments_received")
        )
        .outerjoin(models.Shoutout, models.User.id == models.Shoutout.sender_id)
        .outerjoin(models.Comment, models.Shoutout.id == models.Comment.shoutout_id)
    )
    if department:
        comments_q = comments_q.filter(models.User.department == department)
    if time_filter is not None:
        comments_q = comments_q.filter(models.Comment.created_at >= time_filter)
    comments_q = comments_q.group_by(models.User.id).subquery()

    # tags_q: how many times the user appears in shoutout_recipients
    tags_q = (
        db.query(
            models.User.id.label("uid"),
            func.count(models.shoutout_recipients.c.user_id).label("tag_count")
        )
        .outerjoin(models.shoutout_recipients, models.User.id == models.shoutout_recipients.c.user_id)
        .outerjoin(models.Shoutout, models.Shoutout.id == models.shoutout_recipients.c.shoutout_id)
    )
    if department:
        tags_q = tags_q.filter(models.User.department == department)
    if time_filter is not None:
        tags_q = tags_q.filter(models.Shoutout.created_at >= time_filter)
    tags_q = tags_q.group_by(models.User.id).subquery()

    # Build base user list, outer joining these counts and score table
    combined_query = (
        db.query(
            models.User.id.label("user_id"),
            models.User.full_name.label("full_name"),
            func.coalesce(reactions_q.c.reactions_received, 0).label("reactions_received"),
            func.coalesce(comments_q.c.comments_received, 0).label("comments_received"),
            func.coalesce(tags_q.c.tag_count, 0).label("tag_count"),
            # prefer persistent UserScore.total_points when available, otherwise compute a fallback score
            func.coalesce(
                models.UserScore.total_points,
                (func.coalesce(reactions_q.c.reactions_received, 0) * crud_score.POINTS['reaction_received'])
                + (func.coalesce(comments_q.c.comments_received, 0) * crud_score.POINTS['comment_received'])
                + (func.coalesce(tags_q.c.tag_count, 0) * crud_score.POINTS['tag_received'])
            ).label("total_score"),
        )
        .outerjoin(reactions_q, models.User.id == reactions_q.c.uid)
        .outerjoin(comments_q, models.User.id == comments_q.c.uid)
        .outerjoin(tags_q, models.User.id == tags_q.c.uid)
        .outerjoin(models.UserScore, models.User.id == models.UserScore.user_id)
    )
    
    if department:
        combined_query = combined_query.filter(models.User.department == department)
    combined_query = combined_query.order_by(desc("total_score")).limit(10)

    rows = combined_query.all()
    leaderboard = []
    for i, r in enumerate(rows):
        leaderboard.append(
            schemas.LeaderboardEntry(
                rank=i + 1,
                user_id=int(r.user_id),
                name=r.full_name,
                # keep schema compatibility: map 'sent' -> reactions_received, 'received' -> comments_received
                sent=int(getattr(r, 'reactions_received', 0) or 0),
                received=int(getattr(r, 'comments_received', 0) or 0),
                score=int(r.total_score or 0),
            )
        )
    # store in cache
    _LB_CACHE[key] = (now, leaderboard)
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