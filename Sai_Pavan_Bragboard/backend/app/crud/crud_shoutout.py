from sqlalchemy.orm import Session, joinedload
from app import models, schemas
from app.crud import crud_attachment
from typing import List, Optional
from datetime import datetime, date
from app.crud import crud_score

def create_shoutout(db: Session, shoutout: schemas.ShoutoutCreate, sender_id: int) -> models.Shoutout:
    """
    Creates a new shoutout in the database with support for multiple attachments.
    """
    # Create the main shoutout object
    db_shoutout = models.Shoutout(
        message=shoutout.message,
        sender_id=sender_id,
        # Keep legacy single attachment fields for backward compatibility
        attachment_url=shoutout.attachment_url,
        attachment_filename=shoutout.attachment_filename,
        attachment_type=shoutout.attachment_type,
        attachment_size=shoutout.attachment_size,
        is_all=shoutout.is_all or False,
        target_department=shoutout.target_department if shoutout.target_department else None
    )
    
    # Determine recipients
    recipients = []
    if shoutout.is_all:
        recipients = db.query(models.User).all()
    elif shoutout.target_department:
        recipients = db.query(models.User).filter(models.User.department == shoutout.target_department).all()
    elif shoutout.recipient_ids:
        recipients = db.query(models.User).filter(models.User.id.in_(shoutout.recipient_ids)).all()

    if not recipients:
        # No recipients found; still allow shoutout creation but leave recipients empty
        recipients = []

    # Associate the recipients with the shoutout
    db_shoutout.recipients.extend(recipients)
    
    db.add(db_shoutout)
    db.commit()
    db.refresh(db_shoutout)

    # Update scores: +5 to sender, +10 to each recipient
    try:
        crud_score.apply_shoutout_creation(
            db,
            sender_id=sender_id,
            recipient_ids=[u.id for u in recipients],
        )
    except Exception:
        # Don't block shoutout creation on scoring; log if needed
        pass
    
    # Handle multiple attachments if provided
    if shoutout.attachments:
        for attachment_data in shoutout.attachments:
            attachment_create = schemas.AttachmentCreate(
                filename=attachment_data["filename"],
                unique_filename=attachment_data["unique_filename"],
                file_path=attachment_data["file_path"],
                file_url=attachment_data["file_url"],
                file_type=attachment_data["file_type"],
                file_size=attachment_data["file_size"],
                mime_type=attachment_data.get("mime_type")
            )
            crud_attachment.create_attachment(
                db=db,
                attachment=attachment_create,
                shoutout_id=db_shoutout.id,
                uploaded_by=sender_id
            )
    
    # Refresh to get the attachments
    db.refresh(db_shoutout)
    return db_shoutout

def get_shoutouts(
    db: Session, 
    current_user_id: int, 
    skip: int = 0, 
    limit: int = 100,
    department_filter: Optional[str] = None,
    sender_id_filter: Optional[int] = None,
    sender_email_filter: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> List[models.Shoutout]:
    """
    Retrieves a list of shoutouts that the current user is allowed to see.
    Rules:
    - User can see shoutouts where is_all=True
    - User can see shoutouts where target_department matches their department
    - User can see shoutouts where they are in the recipients list
    - User can see their own shoutouts
    
    Additional filtering options:
    - department_filter: Filter by target department
    - sender_id_filter: Filter by sender ID
    - sender_email_filter: Filter by sender email
    - date_from: Filter shoutouts from this date
    - date_to: Filter shoutouts to this date
    """
    # Get current user's department
    current_user = db.query(models.User).filter(models.User.id == current_user_id).first()
    if not current_user:
        return []
    
    user_department = current_user.department
    
    # Build the base query with proper filtering
    query = (
        db.query(models.Shoutout)
        .options(
            joinedload(models.Shoutout.sender),
            joinedload(models.Shoutout.recipients),
            joinedload(models.Shoutout.reactions).joinedload(models.Reaction.user),
            joinedload(models.Shoutout.comments).joinedload(models.Comment.user),
            joinedload(models.Shoutout.attachments)
        )
        .filter(
            # User can see if:
            (models.Shoutout.is_all == True) |  # 1. It's for everyone
            (models.Shoutout.target_department == user_department) |  # 2. It's for their department
            (models.Shoutout.sender_id == current_user_id) |  # 3. They sent it
            (models.Shoutout.recipients.any(models.User.id == current_user_id))  # 4. They are a recipient
        )
    )
    
    # Apply additional filters
    if department_filter:
        query = query.filter(models.Shoutout.target_department == department_filter)
    
    if sender_id_filter:
        query = query.filter(models.Shoutout.sender_id == sender_id_filter)
    
    if sender_email_filter:
        # Join with sender to filter by email
        query = query.join(models.User, models.Shoutout.sender_id == models.User.id)
        query = query.filter(models.User.email == sender_email_filter)
    
    if date_from:
        # Convert date to datetime for comparison
        datetime_from = datetime.combine(date_from, datetime.min.time())
        query = query.filter(models.Shoutout.created_at >= datetime_from)
    
    if date_to:
        # Convert date to datetime for comparison (end of day)
        datetime_to = datetime.combine(date_to, datetime.max.time())
        query = query.filter(models.Shoutout.created_at <= datetime_to)
    
    # Apply ordering, skip, and limit
    query = query.order_by(models.Shoutout.created_at.desc()).offset(skip).limit(limit)
    
    return query.all()
def get_available_departments(db: Session, current_user_id: int) -> List[str]:
    """Get list of departments that have shoutouts visible to the current user"""
    current_user = db.query(models.User).filter(models.User.id == current_user_id).first()
    if not current_user:
        return []
    
    user_department = current_user.department
    
    # Get departments from shoutouts the user can see
    departments = (
        db.query(models.Shoutout.target_department)
        .filter(
            models.Shoutout.target_department.isnot(None),
            # Apply same visibility rules
            (models.Shoutout.is_all == True) |
            (models.Shoutout.target_department == user_department) |
            (models.Shoutout.sender_id == current_user_id) |
            (models.Shoutout.recipients.any(models.User.id == current_user_id))
        )
        .distinct()
        .all()
    )
    
    return [dept[0] for dept in departments if dept[0]]

def get_available_senders(db: Session, current_user_id: int) -> List[dict]:
    """Get list of senders (users) who have created shoutouts visible to the current user"""
    current_user = db.query(models.User).filter(models.User.id == current_user_id).first()
    if not current_user:
        return []
    
    user_department = current_user.department
    
    # Get senders from shoutouts the user can see
    senders = (
        db.query(models.User.id, models.User.email, models.User.full_name)
        .join(models.Shoutout, models.Shoutout.sender_id == models.User.id)
        .filter(
            # Apply same visibility rules
            (models.Shoutout.is_all == True) |
            (models.Shoutout.target_department == user_department) |
            (models.Shoutout.sender_id == current_user_id) |
            (models.Shoutout.recipients.any(models.User.id == current_user_id))
        )
        .distinct()
        .all()
    )
    
    return [
        {
            "id": sender.id,
            "email": sender.email,
            "full_name": sender.full_name or sender.email
        }
        for sender in senders
    ]

def get_shoutouts_by_sender(db: Session, sender_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Shoutout).filter(models.Shoutout.sender_id == sender_id).order_by(models.Shoutout.created_at.desc()).offset(skip).limit(limit).all()

def get_shoutout_by_id(db: Session, shoutout_id: int):
    """
    Retrieve a single shoutout by its ID.
    """
    return db.query(models.Shoutout).filter(models.Shoutout.id == shoutout_id).first()

def delete_shoutout(db: Session, shoutout_id: int, user_id: int) -> bool:
    """
    Delete a shoutout if it belongs to the current user.
    Returns True if deleted, False if not found or unauthorized.
    """
    shoutout = db.query(models.Shoutout).filter(
        models.Shoutout.id == shoutout_id,
        models.Shoutout.sender_id == user_id
    ).first()
    
    if not shoutout:
        return False
    
    author_id = shoutout.sender_id
    db.delete(shoutout)
    db.commit()
    # Apply penalty for deletion
    try:
        from app.crud import crud_score
        crud_score.apply_shoutout_deleted(db, author_id)
    except Exception:
        pass
    return True