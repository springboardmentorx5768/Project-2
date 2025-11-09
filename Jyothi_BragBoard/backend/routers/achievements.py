from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from database_models import User, ShoutOut,Comment
from auth import get_current_user
from sqlalchemy import func,text,cast,Date
from datetime import datetime, timedelta,date
from database_models import User, ShoutOut, ShoutOutReaction, Comment,ShoutOutTag

router = APIRouter(prefix="/achievements", tags=["Achievements"])

# -------------------- USER ACHIEVEMENTS --------------------
@router.get("/", response_model=dict)
def get_user_achievements(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    # Aggregate shoutouts in one query
    sent_count = db.query(func.count(ShoutOut.id)).filter(
        ShoutOut.giver_id == current_user.id,
        ShoutOut.is_deleted == False
    ).scalar()

    received_count = db.query(func.count(ShoutOut.id)).filter(
        ShoutOut.receiver_id == current_user.id,
        ShoutOut.is_deleted == False
    ).scalar()

    # Reactions
    reactions_given = db.query(func.count(ShoutOutReaction.id)).filter(
        ShoutOutReaction.user_id == current_user.id
    ).scalar()

    reactions_received = db.query(func.count(ShoutOutReaction.id)).join(ShoutOut).filter(
        ShoutOut.receiver_id == current_user.id,
        ShoutOut.is_deleted == False
    ).scalar()

    # Tagged
    tagged_count = db.query(func.count(ShoutOutTag.id)).join(ShoutOut).filter(
        ShoutOutTag.tagged_user_id == current_user.id,
        ShoutOut.is_deleted == False
    ).scalar()


    # Comments 
    comments_given = db.query(func.count(Comment.id)).join(ShoutOut).filter(
    Comment.user_id == current_user.id,
    ShoutOut.is_deleted == False
    ).scalar()

    comments_received = db.query(func.count(Comment.id)).join(ShoutOut).filter(
        ShoutOut.receiver_id == current_user.id,
        ShoutOut.is_deleted == False
    ).scalar()


    # Monthly contributor
    month_start = datetime.utcnow().replace(day=1)
    monthly_sent = db.query(func.count(ShoutOut.id)).filter(
        ShoutOut.giver_id == current_user.id,
        ShoutOut.is_deleted == False,
        ShoutOut.created_at >= month_start
    ).scalar()

    # Level System
    def calc_level(count, milestone):
        if count >= milestone * 4:
            return "Gold 🥇"
        elif count >= milestone * 2:
            return "Silver 🥈"
        elif count >= milestone:
            return "Bronze 🥉"
        return None
    
    streak_count = get_user_streak(current_user.id, db)

    achievements = [
    {
            "title": "Consistency Streak",
            "label": "day",
            "count": streak_count,
            "milestone": 7,   
            "badge": None  
    },

    {
        "title": "Shoutouts Sent",
        "label": "shoutout",
        "count": sent_count,
        "milestone": 5,
        "badge": calc_level(sent_count, 5)
    },
    {
        "title": "Shoutouts Received",
        "label": "shoutout",
        "count": received_count,
        "milestone": 5,
        "badge": calc_level(received_count, 5)
    },
    {
        "title": "Reactions Given",
        "label": "reaction",
        "count": reactions_given,
        "milestone": 10,
        "badge": calc_level(reactions_given, 10)
    },
    {
        "title": "Reactions Received",
        "label": "reaction",
        "count": reactions_received,
        "milestone": 10,
        "badge": calc_level(reactions_received, 10)
    },
    {
        "title": "Comments Given",
        "label": "comment",
        "count": comments_given,
        "milestone": 10,
        "badge": calc_level(comments_given, 10)
    },
    {
        "title": "Comments Received",
        "label": "comment",
        "count": comments_received,
        "milestone": 10,
        "badge": calc_level(comments_received, 10)
    },
    {
        "title": "Tagged in Shoutouts",
        "label": "tag",
        "count": tagged_count,
        "milestone": 5,
        "badge": calc_level(tagged_count, 5)
    },
    {
        "title": "Monthly Contributor",
        "label": "shoutout",
        "count": monthly_sent,
        "milestone": 5,
        "badge": calc_level(monthly_sent, 5)
    },
    ]

    return {"user": current_user.username,
             "achievements": achievements}

# -------------------- LEADERBOARD --------------------
@router.get("/leaderboard", response_model=dict)
def get_leaderboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user), top_n: int = 10):

    # Count: Shoutouts Sent (giver)
    sent_sq = db.query(
        ShoutOut.giver_id.label("user_id"),
        func.count(ShoutOut.id).label("sent")
    ).filter(ShoutOut.is_deleted == False).group_by(ShoutOut.giver_id).subquery()

    # Count: Shoutouts Received (receiver)
    received_sq = db.query(
        ShoutOut.receiver_id.label("user_id"),
        func.count(ShoutOut.id).label("received")
    ).filter(ShoutOut.is_deleted == False).group_by(ShoutOut.receiver_id).subquery()

    # Count: Tagged In
    tagged_sq = db.query(
        ShoutOutTag.tagged_user_id.label("user_id"),
        func.count(ShoutOutTag.id).label("tagged")
    ).join(ShoutOut, ShoutOut.id == ShoutOutTag.shoutout_id).filter(
        ShoutOut.is_deleted == False
    ).group_by(ShoutOutTag.tagged_user_id).subquery()

    # Count: Comments Made
    comments_sq = db.query(
        Comment.user_id.label("user_id"),
        func.count(Comment.id).label("comments")
    ).join(ShoutOut, ShoutOut.id == Comment.shoutout_id).filter(
        ShoutOut.is_deleted == False,
        Comment.is_deleted == False
    ).group_by(Comment.user_id).subquery()

    # Gamified Score Query
    leaderboard_query = (
        db.query(
            User.username,
            User.department,
            func.coalesce(sent_sq.c.sent, 0).label("sent"),
            func.coalesce(received_sq.c.received, 0).label("received"),
            func.coalesce(tagged_sq.c.tagged, 0).label("tagged"),
            func.coalesce(comments_sq.c.comments, 0).label("comments"),
            (
                func.coalesce(sent_sq.c.sent, 0) * 10 +
                func.coalesce(received_sq.c.received, 0) * 15 +
                func.coalesce(tagged_sq.c.tagged, 0) * 5 +
                func.coalesce(comments_sq.c.comments, 0) * 2
            ).label("score")
        )
        .outerjoin(sent_sq, sent_sq.c.user_id == User.id)
        .outerjoin(received_sq, received_sq.c.user_id == User.id)
        .outerjoin(tagged_sq, tagged_sq.c.user_id == User.id)
        .outerjoin(comments_sq, comments_sq.c.user_id == User.id)
        .order_by(text("score DESC"))
        .limit(top_n)
        .all()
    )

    # Convert to JSON
    top_users_global = [
        {
            "username": u.username,
            "sent_count": u.sent,
            "received_count": u.received,
            "tagged_count": u.tagged,
            "comment_count": u.comments,
            "score": u.score
        }
        for u in leaderboard_query
    ]

    # Department Filter
    top_users_department = [u for u in top_users_global if db.query(User).filter(User.username == u["username"], User.department == current_user.department).first()]

   #  Top Departments Based on SHOUTOUTS SENT (Giver Department)
    top_departments = (
    db.query(
        ShoutOut.giver_department.label("department"),
        func.count(ShoutOut.id).label("shoutout_count")
    )
    .filter(ShoutOut.is_deleted == False)
    .filter(ShoutOut.giver_department.isnot(None))
    .filter(ShoutOut.giver_department != "")
    .group_by(ShoutOut.giver_department)
    .having(func.count(ShoutOut.id) > 0)  # ensures departments with ZERO activity are excluded
    .order_by(func.count(ShoutOut.id).desc())
    .limit(3)
    .all()
)

    # Top Contributors by SENT only
    top_contributors_global = db.query(
        User.username,
        func.count(ShoutOut.id).label("sent_count")
    ).join(ShoutOut, ShoutOut.giver_id == User.id
    ).filter(ShoutOut.is_deleted == False
    ).group_by(User.id
    ).order_by(func.count(ShoutOut.id).desc()
    ).limit(top_n).all()

    return {
        "top_users_global": top_users_global,
        "top_contributors_global": [{"username": u.username, "sent_count": u.sent_count} for u in top_contributors_global],
        "top_users_department": top_users_department,
        "top_departments": [
            {"department": d.department, "shoutout_count": d.shoutout_count}
            for d in top_departments
        ]
    }



def get_user_streak(user_id: int, db: Session):
    # Fetch shoutouts where user is sender OR receiver
    day_col = cast(ShoutOut.created_at, Date).label("day")

    activity_dates = (
        db.query(day_col)
        .filter(
            ShoutOut.is_deleted == False,
            (ShoutOut.giver_id == user_id) | (ShoutOut.receiver_id == user_id)
        )
        .group_by(day_col)
        .order_by(day_col.desc())
        .all()
    )

    # Convert rows → Python date list
    days = [row.day for row in activity_dates]

    if not days:
        return 0

    streak = 1
    current_day = date.today()

    # If user hasn't interacted today, start streak from yesterday
    if current_day not in days:
        current_day -= timedelta(days=1)

    while True:
        prev_day = current_day - timedelta(days=1)
        if prev_day in days:
            streak += 1
            current_day = prev_day
        else:
            break

    return streak
