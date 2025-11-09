# In: backend/app/api/v1/endpoints/reactions.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import schemas, crud, models
from app.crud import crud_score
from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/shoutouts/{shoutout_id}/reactions")
def toggle_reaction(
    shoutout_id: int,
    reaction: schemas.ReactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Toggle a reaction on a shoutout"""
    # Verify shoutout exists
    shoutout = db.query(models.Shoutout).filter(models.Shoutout.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shoutout not found"
        )
    
    result = crud.crud_reaction.toggle_reaction(
        db=db,
        shoutout_id=shoutout_id,
        user_id=current_user.id,
        reaction_type=reaction.type
    )
    # Update scores
    try:
        added = result is not None
        crud_score.apply_reaction_toggle(db, shoutout_owner_id=shoutout.sender_id, reactor_user_id=current_user.id, added=added)
    except Exception:
        pass

    if result:
        return {"message": "Reaction added", "reaction": result}
    else:
        return {"message": "Reaction removed"}

@router.get("/shoutouts/{shoutout_id}/reactions", response_model=List[schemas.Reaction])
def get_shoutout_reactions(
    shoutout_id: int,
    db: Session = Depends(get_db)
):
    """Get all reactions for a shoutout"""
    reactions = crud.crud_reaction.get_reactions_for_shoutout(db=db, shoutout_id=shoutout_id)
    return reactions