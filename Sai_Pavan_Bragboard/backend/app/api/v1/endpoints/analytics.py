# In: backend/app/api/v1/endpoints/analytics.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app import schemas, models
from app.crud import crud_badge
from app import crud
from app.api.deps import get_current_user
from app.db.session import get_db

router = APIRouter()

@router.get("/insights", response_model=schemas.AdminInsights)
def read_admin_insights(db: Session = Depends(get_db)):
    return crud.crud_analytics.get_admin_insights(db=db)

@router.get("/leaderboard", response_model=List[schemas.LeaderboardEntry])
def read_leaderboard(
    db: Session = Depends(get_db),
    days: int | None = Query(default=None, ge=1, description="Limit to last N days"),
    department: str | None = Query(default=None, description="Restrict to a single department"),
):
    return crud.crud_analytics.get_leaderboard(db=db, days=days, department=department)

@router.get("/badges", response_model=List[schemas.BadgeOut])
def my_badges(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Return badges for the authenticated user
    out = crud_badge.list_badges_for_user(db, current_user.id)
    return [schemas.BadgeOut(**b) for b in out]

@router.get("/departments", response_model=List[schemas.DepartmentHighlight])
def read_department_highlights(db: Session = Depends(get_db)):
    return crud.crud_analytics.get_department_highlights(db=db)