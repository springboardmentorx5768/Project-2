from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

# Corrected, specific imports
from app.crud import crud_shoutout
from app.models.user import User
from app.schemas.shoutout import Shoutout, ShoutoutCreate
from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[Shoutout])
def read_shoutouts(
    db: Session = Depends(get_db), 
    skip: int = 0, 
    limit: int = 100, 
    department: Optional[str] = None
):
    shoutouts = crud_shoutout.get_shoutouts(db, skip=skip, limit=limit, department=department)
    return shoutouts

@router.post("/", response_model=Shoutout)
def create_new_shoutout(
    shoutout: ShoutoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_shoutout.create_shoutout(db=db, shoutout=shoutout, sender_id=current_user.id)
@router.get("/me", response_model=List[Shoutout])
def read_my_shoutouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all shout-outs sent by the current logged-in user.
    """
    return crud_shoutout.get_shoutouts_by_sender(db=db, sender_id=current_user.id)


@router.delete("/{shoutout_id}")
def delete_shoutout(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a shoutout. Only the creator (sender) or a superuser may delete.
    """
    return crud_shoutout.delete_shoutout(db=db, shoutout_id=shoutout_id, requester=current_user)