from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/me", response_model=schemas.UserOut)
def read_current_user_profile(current_user: models.User = Depends(get_current_user)):
    """
    Get current logged-in user's profile.
    """
    return current_user