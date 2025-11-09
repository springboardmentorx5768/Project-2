# In: backend/app/crud/crud_reaction.py

from sqlalchemy.orm import Session, joinedload
from app import models, schemas
from typing import Optional

def toggle_reaction(
    db: Session, 
    shoutout_id: int, 
    user_id: int, 
    reaction_type: str
) -> Optional[models.Reaction]:
    """
    Toggle a reaction - if it exists, remove it; if not, create it.
    Returns the reaction if created, None if removed.
    """
    # Check if reaction already exists
    existing_reaction = db.query(models.Reaction).filter(
        models.Reaction.shoutout_id == shoutout_id,
        models.Reaction.user_id == user_id,
        models.Reaction.type == reaction_type
    ).first()
    
    if existing_reaction:
        # Remove existing reaction
        db.delete(existing_reaction)
        db.commit()
        return None
    else:
        # Create new reaction
        new_reaction = models.Reaction(
            shoutout_id=shoutout_id,
            user_id=user_id,
            type=reaction_type
        )
        db.add(new_reaction)
        db.commit()
        db.refresh(new_reaction)
        return new_reaction

def get_reactions_for_shoutout(db: Session, shoutout_id: int):
    """Get all reactions for a specific shoutout with user information"""
    return db.query(models.Reaction).options(
        joinedload(models.Reaction.user)
    ).filter(
        models.Reaction.shoutout_id == shoutout_id
    ).all()