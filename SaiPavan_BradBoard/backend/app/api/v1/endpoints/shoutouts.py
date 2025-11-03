from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from pathlib import Path
from datetime import datetime, date

# Corrected, specific imports
from app.crud import crud_shoutout
from app.models.user import User
from app.schemas.shoutout import Shoutout, ShoutoutCreate
from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()

# File upload configuration - use relative path from project root
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@router.get("/filters/departments", response_model=List[str])
def get_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of all departments that have shoutouts"""
    departments = crud_shoutout.get_available_departments(db, current_user.id)
    return departments

@router.get("/filters/senders", response_model=List[dict])
def get_senders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of all senders (users who have created shoutouts)"""
    senders = crud_shoutout.get_available_senders(db, current_user.id)
    return senders

@router.get("/", response_model=List[Shoutout])
def read_shoutouts(
    db: Session = Depends(get_db), 
    skip: int = 0, 
    limit: int = 100, 
    current_user: User = Depends(get_current_user),
    # Filter parameters
    department: Optional[str] = Query(None, description="Filter by department"),
    sender_id: Optional[int] = Query(None, description="Filter by sender ID"),
    sender_email: Optional[str] = Query(None, description="Filter by sender email"),
    date_from: Optional[date] = Query(None, description="Filter shoutouts from this date (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="Filter shoutouts to this date (YYYY-MM-DD)"),
):
    """
    Get shoutouts with optional filtering by department, sender, and date range.
    Users will only see shoutouts they have permission to view based on department visibility rules.
    """
    shoutouts = crud_shoutout.get_shoutouts(
        db, 
        skip=skip, 
        limit=limit, 
        current_user_id=current_user.id,
        department_filter=department,
        sender_id_filter=sender_id,
        sender_email_filter=sender_email,
        date_from=date_from,
        date_to=date_to
    )
    return shoutouts

@router.post("/upload-file")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload a file and return the file info for shoutout attachment"""
    
    # Validate file extension
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Validate file size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    # Determine file type
    if file_extension in {'.jpg', '.jpeg', '.png', '.gif'}:
        file_type = 'image'
    elif file_extension == '.pdf':
        file_type = 'pdf'
    else:
        file_type = 'document'
    
    return {
        "filename": file.filename,
        "unique_filename": unique_filename,
        "file_path": str(file_path),
        "file_type": file_type,
        "file_size": len(file_content),
        "file_url": f"/uploads/{unique_filename}"
    }

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

@router.get("/{shoutout_id}", response_model=Shoutout)
def read_shoutout(
    shoutout_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific shoutout by ID.
    """
    shoutout = crud_shoutout.get_shoutout_by_id(db=db, shoutout_id=shoutout_id)
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shoutout not found")
    return shoutout

@router.delete("/{shoutout_id}")
def delete_shoutout(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a shoutout. Only the sender can delete their own shoutout.
    """
    success = crud_shoutout.delete_shoutout(db=db, shoutout_id=shoutout_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=404, 
            detail="Shoutout not found or you don't have permission to delete it"
        )
    return {"message": "Shoutout deleted successfully"}