from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List

from ..auth import get_current_user
from .. import schemas
from ..database import get_db
from ..models import User, ShoutOut, Reaction, ReactionType, Notification, NotificationType

router = APIRouter(prefix="/reactions", tags=["Reactions"])


# ----- ADD/TOGGLE REACTION -----
@router.post("/")
async def add_reaction(
    reaction_data: schemas.ReactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add or remove a reaction to a shout-out"""
    # Verify shout-out exists
    shoutout_query = await db.execute(
        select(ShoutOut).where(ShoutOut.id == reaction_data.shout_out_id, ShoutOut.is_deleted == False)
    )
    shoutout = shoutout_query.scalar_one_or_none()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shout-out not found")
    
    # Validate reaction type
    try:
        reaction_type = ReactionType(reaction_data.reaction_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid reaction type. Use: like, clap, or star")
    
    # Check if user already has this reaction
    existing_query = await db.execute(
        select(Reaction).where(
            Reaction.shout_out_id == reaction_data.shout_out_id,
            Reaction.user_id == current_user.id,
            Reaction.reaction_type == reaction_type
        )
    )
    existing_reaction = existing_query.scalar_one_or_none()
    
    if existing_reaction:
        # Remove reaction (toggle off)
        await db.delete(existing_reaction)
        await db.commit()
        return {"message": "Reaction removed", "action": "removed"}
    else:
        # Add new reaction
        new_reaction = Reaction(
            user_id=current_user.id,
            shout_out_id=reaction_data.shout_out_id,
            reaction_type=reaction_type
        )
        db.add(new_reaction)

        if shoutout.sender_id != current_user.id:
            actor_name = current_user.name or current_user.username
            notification = Notification(
                user_id=shoutout.sender_id,
                source_user_id=current_user.id,
                shout_out_id=shoutout.id,
                notification_type=NotificationType.REACTION,
                message=f"{actor_name} reacted with {reaction_type.value} to your post.",
            )
            db.add(notification)

        await db.commit()
        await db.refresh(new_reaction)
        return {"message": "Reaction added", "action": "added"}


# ----- GET REACTIONS FOR SHOUT-OUT -----
@router.get("/shoutout/{shoutout_id}", response_model=List[schemas.ReactionOut])
async def get_reactions(
    shoutout_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all reactions for a specific shout-out"""
    query = await db.execute(
        select(Reaction)
        .where(Reaction.shout_out_id == shoutout_id)
        .order_by(Reaction.created_at)
    )
    reactions = query.scalars().all()
    
    # Load user relationships
    for reaction in reactions:
        await db.refresh(reaction, ["user"])
    
    return reactions


# ----- GET USER'S REACTIONS -----
@router.get("/user/{user_id}", response_model=List[schemas.ReactionOut])
async def get_user_reactions(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all reactions by a specific user"""
    query = await db.execute(
        select(Reaction)
        .where(Reaction.user_id == user_id)
        .order_by(Reaction.created_at.desc())
    )
    reactions = query.scalars().all()
    
    for reaction in reactions:
        await db.refresh(reaction, ["user"])
    
    return reactions

