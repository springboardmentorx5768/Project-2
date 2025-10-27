from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import shutil
from pathlib import Path
from database import get_db
from models import ShoutOut, User, ShoutOutRecipient, ShoutOutReaction
from auth import get_current_user

router = APIRouter(prefix="/shoutouts", tags=["shoutouts"])

class ShoutOutCreate(BaseModel):
    title: Optional[str] = None
    message: str
    receiver_id: int
    category: Optional[str] = None
    is_public: str = "public"
    image_url: Optional[str] = None

class ShoutOutCreateMulti(BaseModel):
    title: Optional[str] = None
    message: str
    recipient_ids: List[int]
    category: Optional[str] = None
    is_public: str = "public"
    image_url: Optional[str] = None

class ShoutOutResponse(BaseModel):
    id: int
    title: str
    message: str
    giver_name: str
    receiver_name: str
    giver_department: str
    receiver_department: str
    category: str
    is_public: str
    image_url: Optional[str] = None
    reactions: Optional[List[dict]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DepartmentStats(BaseModel):
    department: str
    total_shoutouts: int
    shoutouts_given: int
    shoutouts_received: int

@router.post("/create", response_model=ShoutOutResponse)
def create_shoutout(
    shoutout: ShoutOutCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get receiver details
    receiver = db.query(User).filter(User.id == shoutout.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    # Derive title if not provided
    derived_title = shoutout.title or (shoutout.message[:60].strip() or "Shout-Out")

    # Create shoutout
    new_shoutout = ShoutOut(
        title=derived_title,
        message=shoutout.message,
        giver_id=current_user.id,
        receiver_id=shoutout.receiver_id,
        giver_department=current_user.department,
        receiver_department=receiver.department,
        category=(shoutout.category or "teamwork"),
        is_public=shoutout.is_public,
        image_url=shoutout.image_url
    )
    
    db.add(new_shoutout)
    db.commit()
    db.refresh(new_shoutout)
    
    return ShoutOutResponse(
        id=new_shoutout.id,
        title=new_shoutout.title,
        message=new_shoutout.message,
        giver_name=current_user.name,
        receiver_name=receiver.name,
        giver_department=new_shoutout.giver_department,
        receiver_department=new_shoutout.receiver_department,
        category=new_shoutout.category,
        is_public=new_shoutout.is_public,
        image_url=new_shoutout.image_url,
        created_at=new_shoutout.created_at
    )

@router.post("/create-multi", response_model=List[ShoutOutResponse])
def create_shoutout_multi(
    payload: ShoutOutCreateMulti,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a shoutout with multiple recipients. The first recipient is stored as primary for compatibility."""
    if not payload.recipient_ids:
        raise HTTPException(status_code=400, detail="At least one recipient is required")

    # Validate recipients and collect their details
    receivers = db.query(User).filter(User.id.in_(payload.recipient_ids)).all()
    receiver_map = {u.id: u for u in receivers}
    missing = [rid for rid in payload.recipient_ids if rid not in receiver_map]
    if missing:
        raise HTTPException(status_code=404, detail=f"Recipients not found: {missing}")

    # Use first recipient as primary receiver for legacy fields
    primary = receiver_map[payload.recipient_ids[0]]

    # Derive title if not provided
    derived_title = payload.title or (payload.message[:60].strip() or "Shout-Out")

    new_shoutout = ShoutOut(
        title=derived_title,
        message=payload.message,
        giver_id=current_user.id,
        receiver_id=primary.id,
        giver_department=current_user.department,
        receiver_department=primary.department,
        category=(payload.category or "teamwork"),
        is_public=payload.is_public,
        image_url=payload.image_url
    )

    db.add(new_shoutout)
    db.flush()  # get shoutout id before adding recipients

    # Add all recipients to join table (including primary)
    for rid in payload.recipient_ids:
        db.add(ShoutOutRecipient(shoutout_id=new_shoutout.id, recipient_id=rid))

    db.commit()
    db.refresh(new_shoutout)

    responses: List[ShoutOutResponse] = []
    for rid in payload.recipient_ids:
        r = receiver_map[rid]
        responses.append(ShoutOutResponse(
            id=new_shoutout.id,
            title=new_shoutout.title,
            message=new_shoutout.message,
            giver_name=current_user.name,
            receiver_name=r.name,
            giver_department=new_shoutout.giver_department,
            receiver_department=r.department,
            category=new_shoutout.category,
            is_public=new_shoutout.is_public,
            image_url=new_shoutout.image_url,
            created_at=new_shoutout.created_at
        ))

    return responses

@router.get("/feed", response_model=List[ShoutOutResponse])
def get_shoutouts_feed(
    department: Optional[str] = Query(None, description="Filter by department. Use 'all' for all departments"),
    sender: Optional[str] = Query(None, description="Filter by sender name"),
    date_from: Optional[datetime] = Query(None, description="Filter shout-outs from this date (YYYY-MM-DD)"),
    date_to: Optional[datetime] = Query(None, description="Filter shout-outs until this date (YYYY-MM-DD)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get shoutouts feed with department-wise filtering, sender filtering, and date range filtering
    - department='all' or None: Show all public shoutouts + department-only from user's dept
    - department='engineering': Show shoutouts related to engineering department
    - sender: Filter by sender name (case-insensitive partial match)
    - date_from/date_to: Filter by creation date range
    """

    query = db.query(ShoutOut).join(User, ShoutOut.giver_id == User.id)

    # Apply sender filter
    if sender:
        query = query.filter(User.name.ilike(f"%{sender}%"))

    # Apply date range filters
    if date_from:
        query = query.filter(ShoutOut.created_at >= date_from)
    if date_to:
        query = query.filter(ShoutOut.created_at <= date_to)

    if department and department != "all":
        # Filter by specific department - show shoutouts where either giver or receiver is from that dept
        query = query.filter(
            or_(
                ShoutOut.giver_department == department,
                ShoutOut.receiver_department == department
            )
        )

        # Apply visibility rules for department filtering
        if current_user.department == department or current_user.role == "admin":
            # User is from this department or admin - show public + department_only
            query = query.filter(ShoutOut.is_public.in_(["public", "department_only"]))
        else:
            # User is from different department - show only public
            query = query.filter(ShoutOut.is_public == "public")
    else:
        # Show all departments - apply visibility rules
        if current_user.role == "admin":
            # Admin sees everything except private
            query = query.filter(ShoutOut.is_public.in_(["public", "department_only"]))
        else:
            # Regular user sees: public + department_only from their dept
            query = query.filter(
                or_(
                    ShoutOut.is_public == "public",
                    and_(
                        ShoutOut.is_public == "department_only",
                        or_(
                            ShoutOut.giver_department == current_user.department,
                            ShoutOut.receiver_department == current_user.department
                        )
                    )
                )
            )

    shoutouts = query.order_by(ShoutOut.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for shoutout in shoutouts:
        giver = db.query(User).filter(User.id == shoutout.giver_id).first()
        receiver = db.query(User).filter(User.id == shoutout.receiver_id).first()

        result.append(ShoutOutResponse(
            id=shoutout.id,
            title=shoutout.title,
            message=shoutout.message,
            giver_name=giver.name,
            receiver_name=receiver.name,
            giver_department=shoutout.giver_department,
            receiver_department=shoutout.receiver_department,
            category=shoutout.category,
            is_public=shoutout.is_public,
            image_url=shoutout.image_url,
            created_at=shoutout.created_at
        ))

    return result

@router.get("/my-shoutouts", response_model=List[ShoutOutResponse])
def get_my_shoutouts(
    type: str = Query("all", description="'given', 'received', or 'all'"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's shoutouts (given, received, or both)"""
    
    query = db.query(ShoutOut)
    
    if type == "given":
        query = query.filter(ShoutOut.giver_id == current_user.id)
    elif type == "received":
        query = query.filter(ShoutOut.receiver_id == current_user.id)
    else:  # "all"
        query = query.filter(
            or_(
                ShoutOut.giver_id == current_user.id,
                ShoutOut.receiver_id == current_user.id
            )
        )
    
    shoutouts = query.order_by(ShoutOut.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for shoutout in shoutouts:
        giver = db.query(User).filter(User.id == shoutout.giver_id).first()
        receiver = db.query(User).filter(User.id == shoutout.receiver_id).first()
        
        result.append(ShoutOutResponse(
            id=shoutout.id,
            title=shoutout.title,
            message=shoutout.message,
            giver_name=giver.name,
            receiver_name=receiver.name,
            giver_department=shoutout.giver_department,
            receiver_department=shoutout.receiver_department,
            category=shoutout.category,
            is_public=shoutout.is_public,
            image_url=shoutout.image_url,
            created_at=shoutout.created_at
        ))
    
    return result

@router.get("/departments/stats", response_model=List[DepartmentStats])
def get_department_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get shoutout statistics by department"""
    
    # Get all departments
    departments = db.query(User.department).distinct().all()
    department_list = [dept[0] for dept in departments]
    
    stats = []
    for dept in department_list:
        # Total shoutouts involving this department
        total = db.query(ShoutOut).filter(
            or_(
                ShoutOut.giver_department == dept,
                ShoutOut.receiver_department == dept
            )
        ).count()
        
        # Shoutouts given by this department
        given = db.query(ShoutOut).filter(ShoutOut.giver_department == dept).count()
        
        # Shoutouts received by this department
        received = db.query(ShoutOut).filter(ShoutOut.receiver_department == dept).count()
        
        stats.append(DepartmentStats(
            department=dept,
            total_shoutouts=total,
            shoutouts_given=given,
            shoutouts_received=received
        ))
    
    return sorted(stats, key=lambda x: x.total_shoutouts, reverse=True)

@router.get("/users/search")
def search_users_by_department(
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search users by department and name for shoutout creation"""
    
    query = db.query(User).filter(User.id != current_user.id)  # Exclude current user
    
    if department and department != "all":
        dep = department.strip().lower()
        query = query.filter(func.lower(User.department) == dep)
    
    if search:
        query = query.filter(User.name.ilike(f"%{search}%"))
    
    users = query.limit(20).all()
    
    return [
        {
            "id": user.id,
            "name": user.name,
            "department": user.department,
            "email": user.email
        }
        for user in users
    ]

@router.delete("/{shoutout_id}")
def delete_shoutout(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a shout-out (admin only)"""
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete shout-outs")

    # Find the shout-out
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shout-out not found")

    # Delete associated image file if it exists
    if shoutout.image_url:
        try:
            image_path = Path(f"uploads{shoutout.image_url}")
            if image_path.exists():
                image_path.unlink()
        except Exception:
            # Log error but don't fail the deletion
            pass

    # Delete the shout-out
    db.delete(shoutout)
    db.commit()

    return {"message": "Shout-out deleted successfully"}

@router.post("/upload-image")
def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload an image for shout-out attachments"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only image files (JPEG, PNG, GIF, WebP) are allowed")

    # Validate file size (max 5MB)
    max_size = 5 * 1024 * 1024  # 5MB
    file_content = file.file.read()
    if len(file_content) > max_size:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")

    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads/images")
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    file_extension = Path(file.filename).suffix.lower()
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{current_user.id}_{timestamp}{file_extension}"
    file_path = upload_dir / unique_filename

    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)

    # Return the relative URL path
    image_url = f"/uploads/images/{unique_filename}"
    return {"image_url": image_url}

@router.post("/{shoutout_id}/react")
def add_reaction(
    shoutout_id: int,
    reaction_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add or change a reaction to a shout-out (one reaction per user per shoutout)"""

    # Validate reaction type
    valid_reactions = ['thumbs_up', 'heart', 'clap', 'celebrate', 'insightful', 'support']
    if reaction_type not in valid_reactions:
        raise HTTPException(status_code=400, detail=f"Invalid reaction type. Valid types: {', '.join(valid_reactions)}")

    # Check if shoutout exists
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shout-out not found")

    # Check if user already has any reaction on this shoutout
    existing_reaction = db.query(ShoutOutReaction).filter(
        ShoutOutReaction.shoutout_id == shoutout_id,
        ShoutOutReaction.user_id == current_user.id
    ).first()

    if existing_reaction:
        if existing_reaction.reaction_type == reaction_type:
            # Same reaction type - remove it (toggle off)
            db.delete(existing_reaction)
            db.commit()
            return {"message": "Reaction removed", "action": "removed"}
        else:
            # Different reaction type - update to new type
            existing_reaction.reaction_type = reaction_type
            existing_reaction.created_at = datetime.utcnow()  # Update timestamp
            db.commit()
            db.refresh(existing_reaction)
            return {"message": "Reaction updated", "action": "updated"}
    else:
        # No existing reaction - add new one
        new_reaction = ShoutOutReaction(
            shoutout_id=shoutout_id,
            user_id=current_user.id,
            reaction_type=reaction_type
        )
        db.add(new_reaction)
        db.commit()
        db.refresh(new_reaction)
        return {"message": "Reaction added", "action": "added"}

@router.get("/{shoutout_id}/reactions")
def get_reactions(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all reactions for a shout-out"""

    # Check if shoutout exists
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shout-out not found")

    # Get reaction counts
    reactions = db.query(
        ShoutOutReaction.reaction_type,
        func.count(ShoutOutReaction.id).label('count')
    ).filter(
        ShoutOutReaction.shoutout_id == shoutout_id
    ).group_by(ShoutOutReaction.reaction_type).all()

    # Get user's reactions
    user_reactions = db.query(ShoutOutReaction.reaction_type).filter(
        ShoutOutReaction.shoutout_id == shoutout_id,
        ShoutOutReaction.user_id == current_user.id
    ).all()

    user_reaction_types = [r.reaction_type for r in user_reactions]

    return {
        "reactions": [
            {
                "type": reaction.reaction_type,
                "count": reaction.count,
                "user_reacted": reaction.reaction_type in user_reaction_types
            }
            for reaction in reactions
        ]
    }
