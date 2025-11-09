"""Analytics Router for leaderboard and statistics"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from pydantic import BaseModel

from database import get_db
from models import User, ShoutOut
from auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

class LeaderboardEntry(BaseModel):
    id: int
    name: str
    department: str
    count: int

@router.get("/leaderboard/givers", response_model=List[LeaderboardEntry])
async def get_top_givers(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get top shoutout givers"""
    results = (
        db.query(
            User.id,
            User.name,
            User.department,
            func.count(ShoutOut.id).label('count')
        )
        .join(ShoutOut, User.id == ShoutOut.giver_id)
        .group_by(User.id, User.name, User.department)
        .order_by(desc('count'))
        .limit(limit)
        .all()
    )
    
    return [
        LeaderboardEntry(
            id=r[0],
            name=r[1],
            department=r[2],
            count=r[3]
        ) for r in results
    ]

@router.get("/leaderboard/receivers", response_model=List[LeaderboardEntry])
async def get_top_receivers(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get most appreciated team members"""
    results = (
        db.query(
            User.id,
            User.name,
            User.department,
            func.count(ShoutOut.id).label('count')
        )
        .join(ShoutOut, User.id == ShoutOut.receiver_id)
        .group_by(User.id, User.name, User.department)
        .order_by(desc('count'))
        .limit(limit)
        .all()
    )
    
    return [
        LeaderboardEntry(
            id=r[0],
            name=r[1],
            department=r[2],
            count=r[3]
        ) for r in results
    ]