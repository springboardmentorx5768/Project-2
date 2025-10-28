# shoutouts.py
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime, timedelta
import shutil, uuid, os
from database import get_db
from database_models import ShoutOut, User, ShoutOutTag
from auth import get_current_user
from schemas import UserOut, ShoutOutCreate, ShoutOutResponse, ShoutOutUpdate, VisibilityEnum

router = APIRouter(prefix="/shoutouts", tags=["shoutouts"])

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# -------------------- UPLOAD IMAGE --------------------
@router.post("/upload-image")
async def upload_image(image: UploadFile = File(...)):
    ext = image.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    return {"image_url": f"/{UPLOAD_FOLDER}/{filename}"}


# -------------------- DASHBOARD STATS --------------------
@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_users = db.query(User).filter(User.department == current_user.department).count()

    # Exclude deleted shoutouts
    shoutouts_sent = db.query(ShoutOut).filter(
        ShoutOut.giver_id == current_user.id,
        ShoutOut.message != "This shoutout was deleted"
    ).count()

    shoutouts_received = db.query(ShoutOut).filter(
        ShoutOut.receiver_id == current_user.id,
        ShoutOut.message != "This shoutout was deleted"
    ).count()

    return {
        "totalUsers": total_users,
        "shoutoutsSent": shoutouts_sent,
        "shoutoutsReceived": shoutouts_received
    }



# -------------------- CREATE SHOUTOUT --------------------
@router.post("/create", response_model=ShoutOutResponse)
def create_shoutout(
    shoutout: ShoutOutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    receiver = db.query(User).filter(User.id == shoutout.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    title = shoutout.title.strip() if shoutout.title else f"Shoutout from {current_user.username}"

    new_shoutout = ShoutOut(
        title=title,
        message=shoutout.message,
        giver_id=current_user.id,
        receiver_id=shoutout.receiver_id,
        giver_department=current_user.department,
        receiver_department=receiver.department,
        category=shoutout.category,
        is_public=shoutout.is_public,
        image_url=shoutout.image_url,
        created_at=datetime.utcnow()
    )
    db.add(new_shoutout)
    db.commit()
    db.refresh(new_shoutout)

    # Handle tagged users
    tagged_users_objs = []
    for uid in shoutout.tagged_user_ids or []:
        tagged_user = db.query(User).filter(User.id == uid).first()
        if tagged_user:
            db.add(ShoutOutTag(shoutout_id=new_shoutout.id, tagged_user_id=uid))
            tagged_users_objs.append(tagged_user)
    db.commit()

    image_url = f"http://127.0.0.1:8000{new_shoutout.image_url}" if new_shoutout.image_url else None

    return ShoutOutResponse(
        id=new_shoutout.id,
        giver_id=new_shoutout.giver_id,
        receiver_id=new_shoutout.receiver_id,
        title=new_shoutout.title,
        message=new_shoutout.message,
        giver_name=current_user.username,
        receiver_name=receiver.username,
        giver_department=current_user.department,
        giver_role=current_user.role,
        receiver_department=receiver.department,
        receiver_role=receiver.role,
        tagged_users=[UserOut.model_validate(u) for u in tagged_users_objs],
        category=new_shoutout.category,
        is_public=new_shoutout.is_public,
        created_at=new_shoutout.created_at,
        edited_at=new_shoutout.edited_at,
        image_url=image_url
    )


# -------------------- EDIT SHOUTOUT --------------------
@router.put("/{shoutout_id}", response_model=ShoutOutResponse)
def update_shoutout(
    shoutout_id: int,
    shoutout_data: ShoutOutUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Shoutout not found")

    if existing.giver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this shoutout")

    # --- Update simple fields ---
    for field, value in shoutout_data.dict(exclude_unset=True).items():
        if field not in ["tagged_user_ids", "image_url"]:
            setattr(existing, field, value)

    # --- Handle image ---
    if "image_url" in shoutout_data.dict(exclude_unset=True):
        existing.image_url = shoutout_data.image_url if shoutout_data.image_url else None

    # --- Handle tagged users safely ---
    if "tagged_user_ids" in shoutout_data.dict(exclude_unset=True):
        db.query(ShoutOutTag).filter(ShoutOutTag.shoutout_id == existing.id).delete()
        db.commit() 

        for uid in shoutout_data.tagged_user_ids or []:
            tagged_user = db.query(User).filter(User.id == uid).first()
            if tagged_user:
                db.add(ShoutOutTag(shoutout_id=existing.id, tagged_user_id=uid))

    # --- Update edited_at timestamp ---
    existing.edited_at = datetime.utcnow()

    db.commit()
    db.refresh(existing)

    # --- Re-fetch receiver and tags ---
    receiver = db.query(User).filter(User.id == existing.receiver_id).first()
    tagged_users = [
        UserOut.model_validate(t.tagged_user)
        for t in db.query(ShoutOutTag).filter(ShoutOutTag.shoutout_id == existing.id).all()
        if t.tagged_user
    ]

    image_url = f"http://127.0.0.1:8000{existing.image_url}" if existing.image_url else None

    return ShoutOutResponse(
        id=existing.id,
        giver_id=existing.giver_id,
        receiver_id=existing.receiver_id,
        title=existing.title,
        message=existing.message,
        giver_name=current_user.username,
        receiver_name=receiver.username,
        giver_department=current_user.department,
        giver_role=current_user.role,
        receiver_department=receiver.department,
        receiver_role=receiver.role,
        tagged_users=tagged_users,
        category=existing.category,
        is_public=existing.is_public,
        created_at=existing.created_at,
        edited_at=existing.edited_at,
        image_url=image_url
    )

@router.delete("/{shoutout_id}")
def delete_shoutout(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shoutout not found")

    if shoutout.giver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this shoutout")

    # Instead of deleting, mark it as deleted
    shoutout.message = "This shoutout was deleted"
    shoutout.image_url = None
    shoutout.edited_at = datetime.utcnow()
    
    for tag in shoutout.tags:
        db.delete(tag)

    db.commit()
    db.refresh(shoutout)

    return {"detail": "Shoutout marked as deleted", "id": shoutout.id}

# -------------------- FEED --------------------
@router.get("/feed", response_model=List[ShoutOutResponse])
def get_shoutouts_feed(
    department: Optional[str] = Query("all"),
    sender_id: Optional[int] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ShoutOut)

    if department != "all":
        query = query.filter(
            or_(ShoutOut.giver_department == department,
                ShoutOut.receiver_department == department)
        )
    if sender_id:
        query = query.filter(ShoutOut.giver_id == sender_id)
    if date_from:
        query = query.filter(ShoutOut.created_at >= date_from)
    if date_to:
        query = query.filter(ShoutOut.created_at <= date_to)
    if search:
        query = query.filter(ShoutOut.message.ilike(f"%{search}%"))

    shoutouts = query.order_by(ShoutOut.created_at.desc()).offset(skip).limit(limit).all()

    results = []
    for s in shoutouts:
        if (
            s.is_public == VisibilityEnum.public
            or s.giver_id == current_user.id
            or s.receiver_id == current_user.id
            or (s.is_public == VisibilityEnum.department_only and (
                s.giver_department == current_user.department
                or s.receiver_department == current_user.department
            ))
        ):
            tagged_users = [UserOut.model_validate(t.tagged_user) for t in s.tags]
            image_url = f"http://127.0.0.1:8000{s.image_url}" if s.image_url else None
            results.append(ShoutOutResponse(
                id=s.id,
                giver_id=s.giver_id,
                receiver_id=s.receiver_id,
                title=s.title,
                message=s.message,
                giver_name=s.giver.username,
                receiver_name=s.receiver.username,
                giver_department=s.giver.department,
                receiver_department=s.receiver.department,
                giver_role=s.giver.role,
                receiver_role=s.receiver.role,
                tagged_users=tagged_users,
                category=s.category,
                is_public=s.is_public,
                created_at=s.created_at,
                edited_at=s.edited_at,
                image_url=image_url
            ))
    return results


# -------------------- MY SHOUTOUTS --------------------
@router.get("/my-shoutouts", response_model=dict)
def get_my_shoutouts(
    receiver_department: Optional[str] = Query("all"),
    days: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Base query - only include non-deleted shoutouts
    query = db.query(ShoutOut).filter(
        or_(
            ShoutOut.giver_id == current_user.id,
            ShoutOut.receiver_id == current_user.id
        ),
        ShoutOut.message != "This shoutout was deleted"
    )

    # Apply department filter
    if receiver_department != "all":
        query = query.filter(ShoutOut.receiver_department == receiver_department)

    # Apply date filter
    if days is not None:
        cutoff = datetime.utcnow() - timedelta(days=days)
        query = query.filter(ShoutOut.created_at >= cutoff)

    # Fetch shoutouts
    shoutouts = query.order_by(ShoutOut.created_at.desc()).all()

    # Format results
    result = []
    for s in shoutouts:
        tagged_users = [UserOut.model_validate(t.tagged_user) for t in s.tags]
        image_url = f"http://127.0.0.1:8000{s.image_url}" if s.image_url else None
        result.append({
            "id": s.id,
            "title": s.title,
            "message": s.message,
            "giver_id": s.giver_id,
            "giver_name": s.giver.username,
            "giver_department": s.giver.department,
            "giver_role": s.giver.role,
            "receiver_id": s.receiver_id,
            "receiver_name": s.receiver.username,
            "receiver_department": s.receiver.department,
            "receiver_role": s.receiver.role,
            "category": s.category,
            "is_public": s.is_public,
            "created_at": s.created_at,
            "edited_at": s.edited_at,
            "image_url": image_url,
            "tagged_users": tagged_users
        })

    return {
        "total": len(shoutouts),
        "sent": sum(1 for s in shoutouts if s.giver_id == current_user.id),
        "received": sum(1 for s in shoutouts if s.receiver_id == current_user.id),
        "shoutouts": result
    }

# -------------------- SEARCH USERS --------------------
@router.get("/users/search", response_model=List[UserOut])
def search_users_by_department(
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(User).filter(User.id != current_user.id)
    if department and department != "all":
        query = query.filter(User.department == department)
    if search:
        query = query.filter(User.username.ilike(f"%{search}%"))
    users = query.limit(20).all()

    return [UserOut.model_validate(user) for user in users]
