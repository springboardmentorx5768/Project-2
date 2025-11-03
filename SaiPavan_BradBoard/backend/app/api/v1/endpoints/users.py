# In: backend/app/api/v1/endpoints/users.py

from fastapi import APIRouter, Depends
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

@router.get("/", response_model=List[schemas.UserOut])
def read_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Get all users (for selecting recipients when creating shoutouts)
    """
    return db.query(models.User).filter(models.User.is_active == True).all()