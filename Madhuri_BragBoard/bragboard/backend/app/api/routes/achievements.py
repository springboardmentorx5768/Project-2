from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.achievement import Achievement, AchievementCreate, AchievementUpdate, AchievementWithUser
from app.crud import achievement as crud_achievement
from app.crud.user import can_access_department

router = APIRouter()

@router.get("/", response_model=List[AchievementWithUser])
def read_achievements(
    skip: int = 0,
    limit: int = 100,
    department_id: Optional[int] = None,
    is_featured: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get achievements with optional filtering."""
    # If department_id is specified, check access
    if department_id and not can_access_department(current_user, department_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this department's achievements"
        )
    
    # If no department specified and user is not admin, filter by user's department
    if not department_id and current_user.role != "admin":
        department_id = current_user.department_id
    
    achievements = crud_achievement.get_achievements(
        db, 
        skip=skip, 
        limit=limit,
        department_id=department_id,
        is_featured=is_featured
    )
    
    # Convert to response format with user and department info
    result = []
    for achievement in achievements:
        achievement_dict = achievement.__dict__.copy()
        achievement_dict['user_name'] = achievement.user.name
        achievement_dict['user_email'] = achievement.user.email
        achievement_dict['department_name'] = achievement.department.name
        result.append(achievement_dict)
    
    return result

@router.get("/my", response_model=List[Achievement])
def read_my_achievements(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's achievements."""
    return crud_achievement.get_achievements(
        db, 
        skip=skip, 
        limit=limit,
        user_id=current_user.id
    )

@router.post("/", response_model=Achievement)
def create_achievement(
    achievement: AchievementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new achievement."""
    # Check if user can create achievements for the specified department
    if not can_access_department(current_user, achievement.department_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create achievements for this department"
        )
    
    # Employees can only create achievements for themselves
    if current_user.role == "employee" and achievement.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employees can only create achievements for themselves"
        )
    
    return crud_achievement.create_achievement(db, achievement)

@router.get("/{achievement_id}", response_model=AchievementWithUser)
def read_achievement(
    achievement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get achievement by ID."""
    achievement = crud_achievement.get_achievement(db, achievement_id)
    if not achievement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found"
        )
    
    # Check access to department
    if not can_access_department(current_user, achievement.department_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this achievement"
        )
    
    # Add user and department info
    achievement_dict = achievement.__dict__.copy()
    achievement_dict['user_name'] = achievement.user.name
    achievement_dict['user_email'] = achievement.user.email
    achievement_dict['department_name'] = achievement.department.name
    
    return achievement_dict

@router.put("/{achievement_id}", response_model=Achievement)
def update_achievement(
    achievement_id: int,
    achievement: AchievementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update achievement."""
    db_achievement = crud_achievement.get_achievement(db, achievement_id)
    if not db_achievement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found"
        )
    
    # Check permissions
    if current_user.role == "employee" and db_achievement.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own achievements"
        )
    
    if not can_access_department(current_user, db_achievement.department_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this achievement"
        )
    
    return crud_achievement.update_achievement(db, achievement_id, achievement)

@router.delete("/{achievement_id}")
def delete_achievement(
    achievement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete achievement."""
    db_achievement = crud_achievement.get_achievement(db, achievement_id)
    if not db_achievement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found"
        )
    
    # Check permissions
    if current_user.role == "employee" and db_achievement.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own achievements"
        )
    
    if not can_access_department(current_user, db_achievement.department_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this achievement"
        )
    
    crud_achievement.delete_achievement(db, achievement_id)
    return {"message": "Achievement deleted successfully"}

@router.get("/stats/my")
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's achievement statistics."""
    return crud_achievement.get_user_achievements_stats(db, current_user.id)

@router.get("/leaderboard/{department_id}")
def get_department_leaderboard(
    department_id: int,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get department leaderboard."""
    if not can_access_department(current_user, department_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this department's leaderboard"
        )
    
    return crud_achievement.get_department_leaderboard(db, department_id, limit)