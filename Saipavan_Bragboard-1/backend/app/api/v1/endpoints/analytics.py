from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, crud
from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/stats/me", response_model=schemas.analytics.UserStats)
def read_user_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get Quick Stats for the current logged-in user.
    """
    return crud.crud_shoutout.get_user_stats(db=db, user_id=current_user.id)

@router.get("/leaderboard/received", response_model=List[schemas.analytics.LeaderboardUser])
def read_leaderboard_received(db: Session = Depends(get_db)):
    """
    Get the Recognition Leaderboard for top employees by shout-outs received.
    """
    leaderboard_data = crud.crud_shoutout.get_leaderboard_by_received(db=db)
    return [{"user": user, "score": score} for user, score in leaderboard_data]