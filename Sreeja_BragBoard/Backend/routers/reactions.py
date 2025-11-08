from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from database import get_db
from models import Reaction, ShoutOut, User
from auth import get_current_user

router = APIRouter(prefix="/reactions", tags=["reactions"])

# Pydantic schemas
class ReactionCreate(BaseModel):
    shoutout_id: int
    reaction_type: str  # 'like', 'clap', or 'star'

class ReactionResponse(BaseModel):
    id: int
    shoutout_id: int
    user_id: int
    reaction_type: str
    user_name: str
    
    class Config:
        from_attributes = True

class ReactionSummary(BaseModel):
    like_count: int
    clap_count: int
    star_count: int
    user_reaction: str | None  # The current user's reaction type, if any

@router.post("/", response_model=ReactionResponse)
def add_reaction(
    reaction_data: ReactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add or update a reaction to a shoutout"""
    
    # Verify shoutout exists
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == reaction_data.shoutout_id).first()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shoutout not found")
    
    # Validate reaction type
    valid_reactions = ['like', 'clap', 'star']
    if reaction_data.reaction_type not in valid_reactions:
        raise HTTPException(status_code=400, detail=f"Invalid reaction type. Must be one of: {', '.join(valid_reactions)}")
    
    # Check if user already reacted to this shoutout
    existing_reaction = db.query(Reaction).filter(
        Reaction.shoutout_id == reaction_data.shoutout_id,
        Reaction.user_id == current_user.id
    ).first()
    
    if existing_reaction:
        # If same reaction type, remove it (toggle off)
        if existing_reaction.reaction_type == reaction_data.reaction_type:
            db.delete(existing_reaction)
            db.commit()
            raise HTTPException(status_code=200, detail="Reaction removed")
        else:
            # Update to new reaction type
            existing_reaction.reaction_type = reaction_data.reaction_type
            db.commit()
            db.refresh(existing_reaction)
            return ReactionResponse(
                id=existing_reaction.id,
                shoutout_id=existing_reaction.shoutout_id,
                user_id=existing_reaction.user_id,
                reaction_type=existing_reaction.reaction_type,
                user_name=current_user.name
            )
    
    # Create new reaction
    new_reaction = Reaction(
        shoutout_id=reaction_data.shoutout_id,
        user_id=current_user.id,
        reaction_type=reaction_data.reaction_type
    )
    db.add(new_reaction)
    db.commit()
    db.refresh(new_reaction)
    
    return ReactionResponse(
        id=new_reaction.id,
        shoutout_id=new_reaction.shoutout_id,
        user_id=new_reaction.user_id,
        reaction_type=new_reaction.reaction_type,
        user_name=current_user.name
    )

@router.delete("/{shoutout_id}")
def remove_reaction(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove user's reaction from a shoutout"""
    
    reaction = db.query(Reaction).filter(
        Reaction.shoutout_id == shoutout_id,
        Reaction.user_id == current_user.id
    ).first()
    
    if not reaction:
        raise HTTPException(status_code=404, detail="No reaction found")
    
    db.delete(reaction)
    db.commit()
    
    return {"message": "Reaction removed successfully"}

@router.get("/{shoutout_id}/summary", response_model=ReactionSummary)
def get_reaction_summary(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get reaction counts and user's reaction for a shoutout"""
    
    # Verify shoutout exists
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shoutout not found")
    
    # Count each reaction type
    like_count = db.query(Reaction).filter(
        Reaction.shoutout_id == shoutout_id,
        Reaction.reaction_type == 'like'
    ).count()
    
    clap_count = db.query(Reaction).filter(
        Reaction.shoutout_id == shoutout_id,
        Reaction.reaction_type == 'clap'
    ).count()
    
    star_count = db.query(Reaction).filter(
        Reaction.shoutout_id == shoutout_id,
        Reaction.reaction_type == 'star'
    ).count()
    
    # Get current user's reaction
    user_reaction = db.query(Reaction).filter(
        Reaction.shoutout_id == shoutout_id,
        Reaction.user_id == current_user.id
    ).first()
    
    return ReactionSummary(
        like_count=like_count,
        clap_count=clap_count,
        star_count=star_count,
        user_reaction=user_reaction.reaction_type if user_reaction else None
    )

@router.get("/{shoutout_id}/users", response_model=List[ReactionResponse])
def get_reaction_users(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users who reacted to a shoutout"""
    
    reactions = db.query(Reaction).filter(Reaction.shoutout_id == shoutout_id).all()
    
    result = []
    for reaction in reactions:
        user = db.query(User).filter(User.id == reaction.user_id).first()
        result.append(ReactionResponse(
            id=reaction.id,
            shoutout_id=reaction.shoutout_id,
            user_id=reaction.user_id,
            reaction_type=reaction.reaction_type,
            user_name=user.name if user else "Unknown"
        ))
    
    return result
