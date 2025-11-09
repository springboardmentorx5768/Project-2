# In: backend/app/api/v1/endpoints/users.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.api import deps
from app.db.session import get_db

router = APIRouter()

@router.get("/me", response_model=schemas.UserOut)
def read_users_me(
    current_user: models.User = Depends(deps.get_current_user)
):
    return current_user

@router.put("/me", response_model=schemas.UserOut)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Update current user's profile
    """
    # Update only the provided fields
    update_data = user_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/", response_model=List[schemas.UserOut])
def read_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Get all users (for selecting recipients when creating shoutouts)
    """
    return (
        db.query(models.User)
        .filter(models.User.is_active == True)
        .filter(models.User.is_approved == True)
        .all()
    )

@router.get("/{user_id}", response_model=schemas.UserOut)
def read_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Get a single user's public profile by id (requires auth)."""
    user = db.query(models.User).filter(models.User.id == user_id, models.User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/departments", response_model=List[str])
def read_distinct_departments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Return distinct non-null departments for dropdown filters."""
    departments = (
        db.query(models.User.department)
        .filter(models.User.department.isnot(None))
        .distinct()
        .all()
    )
    return [d[0] for d in departments if d[0]]

@router.get("/me/settings", response_model=schemas.UserSettings)
def get_user_settings(
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Get current user's settings
    """
    return schemas.UserSettings(
        email_notifications=current_user.email_notifications,
        push_notifications=current_user.push_notifications,
        weekly_digest=current_user.weekly_digest,
        public_profile=current_user.public_profile,
        show_email=current_user.show_email,
        show_phone=current_user.show_phone,
        theme=current_user.theme,
        language=current_user.language
    )

@router.put("/me/settings", response_model=schemas.UserSettings)
def update_user_settings(
    *,
    db: Session = Depends(get_db),
    settings_update: schemas.UserSettingsUpdate,
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Update current user's settings
    """
    # Update only the provided settings fields
    update_data = settings_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return schemas.UserSettings(
        email_notifications=current_user.email_notifications,
        push_notifications=current_user.push_notifications,
        weekly_digest=current_user.weekly_digest,
        public_profile=current_user.public_profile,
        show_email=current_user.show_email,
        show_phone=current_user.show_phone,
        theme=current_user.theme,
        language=current_user.language
    )

@router.delete("/me", status_code=204)
def delete_user_account(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Permanently delete the current user's account and related data.

    This uses the same deep deletion logic as the admin endpoint so the user
    can immediately re-register with the same email if desired.
    """
    from app.crud.crud_user import hard_delete_user
    hard_delete_user(db, current_user)
    return None