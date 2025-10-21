from sqlalchemy.orm import Session
from app import models

def get_all_reports(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Report).offset(skip).limit(limit).all()

def delete_shoutout(db: Session, shoutout_id: int):
    db_shoutout = db.query(models.Shoutout).filter(models.Shoutout.id == shoutout_id).first()
    if db_shoutout:
        db.delete(db_shoutout)
        db.commit()
    return db_shoutout

def update_user_role(db: Session, user_id: int, role: str):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.role = role
        db.commit()
        db.refresh(db_user)
    return db_user