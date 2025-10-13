from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func, desc
from app.models.user import Achievement, User, Department
from app.schemas.achievement import AchievementCreate, AchievementUpdate
from typing import List, Optional

def get_achievement(db: Session, achievement_id: int) -> Optional[Achievement]:
    return db.query(Achievement).filter(Achievement.id == achievement_id).first()

def get_achievements(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    department_id: Optional[int] = None,
    user_id: Optional[int] = None,
    is_featured: Optional[bool] = None
) -> List[Achievement]:
    query = db.query(Achievement).options(
        joinedload(Achievement.user),
        joinedload(Achievement.department)
    )
    
    if department_id:
        query = query.filter(Achievement.department_id == department_id)
    if user_id:
        query = query.filter(Achievement.user_id == user_id)
    if is_featured is not None:
        query = query.filter(Achievement.is_featured == is_featured)
    
    return query.order_by(desc(Achievement.created_at)).offset(skip).limit(limit).all()

def create_achievement(db: Session, achievement: AchievementCreate) -> Achievement:
    db_achievement = Achievement(**achievement.model_dump())
    db.add(db_achievement)
    db.commit()
    db.refresh(db_achievement)
    return db_achievement

def update_achievement(db: Session, achievement_id: int, achievement: AchievementUpdate) -> Optional[Achievement]:
    db_achievement = get_achievement(db, achievement_id)
    if db_achievement:
        update_data = achievement.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_achievement, field, value)
        db.commit()
        db.refresh(db_achievement)
    return db_achievement

def delete_achievement(db: Session, achievement_id: int) -> bool:
    db_achievement = get_achievement(db, achievement_id)
    if db_achievement:
        db.delete(db_achievement)
        db.commit()
        return True
    return False

def get_user_achievements_stats(db: Session, user_id: int):
    total_count = db.query(func.count(Achievement.id)).filter(Achievement.user_id == user_id).scalar()
    total_points = db.query(func.sum(Achievement.points)).filter(Achievement.user_id == user_id).scalar() or 0
    featured_count = db.query(func.count(Achievement.id)).filter(
        and_(Achievement.user_id == user_id, Achievement.is_featured == True)
    ).scalar()
    
    return {
        "total_count": total_count,
        "total_points": total_points,
        "featured_count": featured_count
    }

def get_department_leaderboard(db: Session, department_id: int, limit: int = 10):
    return db.query(
        User.id,
        User.name,
        User.email,
        func.count(Achievement.id).label('achievement_count'),
        func.sum(Achievement.points).label('total_points')
    ).join(Achievement).filter(
        User.department_id == department_id
    ).group_by(User.id).order_by(
        desc(func.sum(Achievement.points))
    ).limit(limit).all()