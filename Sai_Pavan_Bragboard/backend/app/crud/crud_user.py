from sqlalchemy.orm import Session
from sqlalchemy import delete, func
import logging
from app import models, schemas
from app.core.security import get_password_hash, verify_password

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> models.User | None:
    # Case-insensitive lookup to avoid login failures due to email casing
    return (
        db.query(models.User)
        .filter(func.lower(models.User.email) == (email or "").lower())
        .first()
    )

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=(user.email or "").lower(),
        full_name=user.full_name,
        department=user.department,
        location=getattr(user, 'location', None),
        phone=getattr(user, 'phone', None),
        hashed_password=hashed_password,
        is_approved=False  # require admin approval by default
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> models.User | None:
    user = get_user_by_email(db, email=email)
    if not user:
        logging.warning("auth_failed:user_not_found email=%s", email)
        return None
    if not user.is_active:
        logging.warning("auth_failed:user_inactive email=%s", email)
        return None
    if not verify_password(password, user.hashed_password):
        logging.warning("auth_failed:bad_password email=%s", email)
        return None
    logging.info("auth_success email=%s id=%s is_superuser=%s", user.email, user.id, user.is_superuser)
    return user

def hard_delete_user(db: Session, user: models.User) -> None:
    """Permanently remove a user and all directly associated content.

    Steps:
    - Delete reactions authored by user
    - Delete comments authored by user
    - Delete reports where user is reporter or resolver
    - Remove user from recipient association table
    - Delete attachments uploaded by user (files themselves should be removed separately if stored on disk)
    - Delete shoutouts sent by user (cascades to reactions/comments/attachments via relationships)
    - Finally delete the user record
    """
    # Remove reactions
    db.query(models.Reaction).filter(models.Reaction.user_id == user.id).delete(synchronize_session=False)
    # Remove comments
    db.query(models.Comment).filter(models.Comment.user_id == user.id).delete(synchronize_session=False)
    # Remove reports (as reporter or resolved_by)
    db.query(models.Report).filter(models.Report.reporter_id == user.id).delete(synchronize_session=False)
    db.query(models.Report).filter(models.Report.resolved_by == user.id).delete(synchronize_session=False)
    # Remove from shoutout recipients association
    db.execute(delete(models.shoutout_recipients).where(models.shoutout_recipients.c.user_id == user.id))
    # Delete attachments uploaded by user (attached to shoutouts not authored by them)
    db.query(models.Attachment).filter(models.Attachment.uploaded_by == user.id).delete(synchronize_session=False)
    # Delete shoutouts authored by user (will cascade delete their reactions/comments/attachments)
    db.query(models.Shoutout).filter(models.Shoutout.sender_id == user.id).delete(synchronize_session=False)
    # Delete employee of month records referencing user
    db.query(models.EmployeeOfMonth).filter(models.EmployeeOfMonth.user_id == user.id).delete(synchronize_session=False)
    # Delete user score if exists
    db.query(models.UserScore).filter(models.UserScore.user_id == user.id).delete(synchronize_session=False)
    # Finally delete user
    db.delete(user)
    db.commit()

def create_admin_user(db: Session, email: str, full_name: str, password: str) -> models.User:
    existing = get_user_by_email(db, email=email)
    if existing:
        # Ensure main admin is active and superuser if the record already exists
        changed = False
        if not existing.is_active:
            existing.is_active = True
            changed = True
        if not existing.is_superuser:
            existing.is_superuser = True
            changed = True
        if not getattr(existing, 'is_approved', True):
            existing.is_approved = True
            changed = True
        if changed:
            db.add(existing)
            db.commit()
            db.refresh(existing)
            logging.info("bootstrap_admin_reactivated email=%s id=%s", existing.email, existing.id)
        return existing
    hashed_password = get_password_hash(password)
    admin = models.User(
        email=(email or "").lower(),
        full_name=full_name,
        department=None,
        bio=None,
        location=None,
        phone=None,
        hashed_password=hashed_password,
        is_active=True,
        is_superuser=True,
        is_approved=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    logging.info("bootstrap_admin_created email=%s id=%s", admin.email, admin.id)
    return admin
