from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime
from auth import get_current_user
from database import get_db
from database_models import ShoutOut, ShoutOutReaction, User
from schemas import AddReactionRequest, ReactionResponse, ReactionCountResponse

router = APIRouter(prefix="/reactions", tags=["Reactions"])

@router.post("/{shoutout_id}")
def add_or_update_reaction(
    shoutout_id: int,
    request: AddReactionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(status_code=404, detail="ShoutOut not found.")

    existing_reaction = db.query(ShoutOutReaction).filter(
        and_(
            ShoutOutReaction.shoutout_id == shoutout_id,
            ShoutOutReaction.user_id == current_user.id
        )
    ).first()

    if existing_reaction:
        if existing_reaction.reaction_type == request.reaction_type:
            db.delete(existing_reaction)
            db.commit()
            return {"message": "Reaction removed."}

        existing_reaction.reaction_type = request.reaction_type
        existing_reaction.created_at = datetime.utcnow()

    else:
        new_reaction = ShoutOutReaction(
            shoutout_id=shoutout_id,
            user_id=current_user.id,
            reaction_type=request.reaction_type,
            created_at=datetime.utcnow()
        )
        db.add(new_reaction)

    db.commit()
    return {"message": "Reaction added/updated successfully."}

@router.get("/{shoutout_id}", response_model=ReactionCountResponse)
def get_reaction_counts(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    counts = db.query(
        ShoutOutReaction.reaction_type,
        func.count(ShoutOutReaction.id)
    ).filter(
        ShoutOutReaction.shoutout_id == shoutout_id
    ).group_by(
        ShoutOutReaction.reaction_type
    ).all()

    reaction_data = {rtype: count for rtype, count in counts}

    all_types = ["like", "love", "clap", "celebrate", "insightful", "support", "star"]
    for t in all_types:
        reaction_data.setdefault(t, 0)

    my_reaction = db.query(ShoutOutReaction).filter(
        ShoutOutReaction.shoutout_id == shoutout_id,
        ShoutOutReaction.user_id == current_user.id
    ).first()

    reaction_data["my_reaction"] = my_reaction.reaction_type if my_reaction else None

    return reaction_data

@router.get("/{shoutout_id}/users")
def get_reacted_users(shoutout_id: int, db: Session = Depends(get_db)):
    reactions = db.query(
        ShoutOutReaction.reaction_type,
        User.username,
        User.department,
        User.role
    ).join(User, User.id == ShoutOutReaction.user_id
    ).filter(ShoutOutReaction.shoutout_id == shoutout_id).all()

    result = {}
    for reaction_type, username, department, role in reactions:
        result.setdefault(reaction_type, []).append({
            "username": username,
            "department": department,
            "role": role
        })

    return result

