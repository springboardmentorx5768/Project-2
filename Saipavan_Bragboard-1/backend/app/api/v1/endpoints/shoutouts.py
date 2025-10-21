from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional # 1. Import Optional

from app import schemas, crud
from app.db.session import get_db

router = APIRouter()

# --- UPDATED FUNCTION ---
@router.get("/", response_model=List[schemas.Shoutout])
def read_shoutouts(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    department: Optional[str] = None # 2. Add department as a query parameter
):
    shoutouts = crud.crud_shoutout.get_shoutouts(db, skip=skip, limit=limit, department=department)
    return shoutouts

@router.post("/", response_model=schemas.Shoutout)
def create_new_shoutout(
    shoutout: schemas.ShoutoutCreate,
    db: Session = Depends(get_db)
):
    # ... (this function remains the same)
    sender_id = 1 
    return crud.crud_shoutout.create_shoutout(db=db, shoutout=shoutout, sender_id=sender_id)