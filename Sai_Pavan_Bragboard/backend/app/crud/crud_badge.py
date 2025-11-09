# In: backend/app/crud/crud_badge.py
from sqlalchemy.orm import Session
from app import models

THRESHOLDS = {
    'APPRECIATION_CHAMP': {
        'name': 'Appreciation Champ',
        'description': 'Sent at least 50 shoutouts',
        'criteria': lambda db, user_id: db.query(models.Shoutout).filter(models.Shoutout.sender_id == user_id).count() >= 50
    },
    'SUPPORTIVE_TEAMMATE': {
        'name': 'Supportive Teammate',
        'description': 'Posted at least 25 comments',
        'criteria': lambda db, user_id: db.query(models.Comment).filter(models.Comment.user_id == user_id).count() >= 25
    }
}

def has_badge(db: Session, user_id: int, code: str) -> bool:
    return db.query(models.Badge).filter(models.Badge.user_id == user_id, models.Badge.code == code).first() is not None


def ensure_badges(db: Session, user_id: int):
    for code, meta in THRESHOLDS.items():
        try:
            if not has_badge(db, user_id, code) and meta['criteria'](db, user_id):
                badge = models.Badge(
                    user_id=user_id,
                    code=code,
                    name=meta['name'],
                    description=meta['description']
                )
                db.add(badge)
                db.commit()
                db.refresh(badge)
        except Exception:
            pass


def list_badges_for_user(db: Session, user_id: int):
    rows = db.query(models.Badge).filter(models.Badge.user_id == user_id).order_by(models.Badge.awarded_at.asc()).all()
    return [
        {
            'id': b.id,
            'code': b.code,
            'name': b.name,
            'description': b.description,
            'awarded_at': b.awarded_at.isoformat() if b.awarded_at else None
        }
        for b in rows
    ]
