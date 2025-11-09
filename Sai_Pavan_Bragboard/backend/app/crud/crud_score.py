# In: backend/app/crud/crud_score.py

from sqlalchemy.orm import Session
from sqlalchemy import update
from app import models
from datetime import datetime

# Points config (could be moved to settings)
# Updated: use 'tag_received' instead of 'shoutout_received' and
# add 'comment_received' to reward authors when their posts are commented on.
POINTS = {
    'shoutout_sent': 5,
    'tag_received': 10,         # when someone tags/mentions you in a shoutout
    'reaction_received': 2,     # per reaction received on a user's post
    'reaction_given': 1,
    'comment_posted': 3,        # for the commenter
    'comment_received': 4,      # for the post author when their post receives a comment
    'post_deleted_penalty': -10,
}


def ensure_row(db: Session, user_id: int):
    row = db.query(models.UserScore).filter(models.UserScore.user_id == user_id).first()
    if not row:
        row = models.UserScore(user_id=user_id, total_points=0)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def add_points(db: Session, user_id: int, delta: int):
    # Ensure row exists then atomic update
    ensure_row(db, user_id)
    db.execute(
        update(models.UserScore)
        .where(models.UserScore.user_id == user_id)
        .values(total_points=models.UserScore.total_points + delta)
    )
    db.commit()
    # Invalidate leaderboard cache to reflect changes immediately
    try:
        from app.crud import crud_analytics
        crud_analytics.invalidate_leaderboard_cache()
    except Exception:
        pass


def apply_shoutout_creation(db: Session, sender_id: int, recipient_ids: list[int]):
    """Called after a shoutout is created.

    - award sender for creating a shoutout
    - award recipients a 'tag' point (they were mentioned/tagged)
    """
    add_points(db, sender_id, POINTS['shoutout_sent'])
    for rid in set(recipient_ids or []):
        # recipient was tagged/mentioned — count as a tag
        add_points(db, rid, POINTS['tag_received'])
    # Check badge thresholds for sender only (sending triggers champ)
    try:
        from app.crud import crud_badge
        crud_badge.ensure_badges(db, sender_id)
    except Exception:
        pass


def apply_reaction_toggle(db: Session, shoutout_owner_id: int, reactor_user_id: int, added: bool):
    if added:
        add_points(db, shoutout_owner_id, POINTS['reaction_received'])
        add_points(db, reactor_user_id, POINTS['reaction_given'])
    else:
        add_points(db, shoutout_owner_id, -POINTS['reaction_received'])
        add_points(db, reactor_user_id, -POINTS['reaction_given'])


def apply_comment_posted(db: Session, commenter_id: int, shoutout_owner_id: int | None = None):
    """Award points when a comment is posted.

    - commenter gets `comment_posted` points
    - shoutout owner (if provided and different from commenter) gets `comment_received` points
    """
    add_points(db, commenter_id, POINTS['comment_posted'])
    try:
        from app.crud import crud_badge
        crud_badge.ensure_badges(db, commenter_id)
    except Exception:
        pass

    if shoutout_owner_id and shoutout_owner_id != commenter_id:
        try:
            add_points(db, shoutout_owner_id, POINTS['comment_received'])
        except Exception:
            pass


def apply_shoutout_deleted(db: Session, author_user_id: int):
    add_points(db, author_user_id, POINTS['post_deleted_penalty'])
