#!/usr/bin/env python3
"""
Test script to create some sample reactions with user data
"""
import sys
import os
sys.path.append('.')

from app.db.session import SessionLocal
from app import models
from app.core.security import get_password_hash

def create_sample_reactions():
    db = SessionLocal()
    try:
        # Get or create test users
        user1 = db.query(models.User).filter(models.User.email == 'user1@example.com').first()
        if not user1:
            user1 = models.User(
                email='user1@example.com',
                full_name='John Doe',
                department='Engineering',
                hashed_password=get_password_hash('password123'),
                is_active=True,
                is_superuser=False
            )
            db.add(user1)
            db.commit()
            db.refresh(user1)
            print("Created user1: John Doe")

        user2 = db.query(models.User).filter(models.User.email == 'user2@example.com').first()
        if not user2:
            user2 = models.User(
                email='user2@example.com',
                full_name='Jane Smith',
                department='Marketing',
                hashed_password=get_password_hash('password123'),
                is_active=True,
                is_superuser=False
            )
            db.add(user2)
            db.commit()
            db.refresh(user2)
            print("Created user2: Jane Smith")

        # Get or create a test shoutout
        shoutout = db.query(models.Shoutout).first()
        if not shoutout:
            shoutout = models.Shoutout(
                message="Welcome to the team! Great work on the project.",
                sender_id=user1.id,
                is_all=True
            )
            db.add(shoutout)
            db.commit()
            db.refresh(shoutout)
            print("Created test shoutout")

        # Check existing reactions
        existing_reactions = db.query(models.Reaction).filter(
            models.Reaction.shoutout_id == shoutout.id
        ).all()
        print(f"Found {len(existing_reactions)} existing reactions for shoutout {shoutout.id}")

        # Add sample reactions if none exist
        if len(existing_reactions) == 0:
            # User1 likes the shoutout
            reaction1 = models.Reaction(
                shoutout_id=shoutout.id,
                user_id=user1.id,
                type='like'
            )
            db.add(reaction1)

            # User2 claps for the shoutout
            reaction2 = models.Reaction(
                shoutout_id=shoutout.id,
                user_id=user2.id,
                type='clap'
            )
            db.add(reaction2)

            # User2 also likes the shoutout
            reaction3 = models.Reaction(
                shoutout_id=shoutout.id,
                user_id=user2.id,
                type='like'
            )
            db.add(reaction3)

            db.commit()
            print("✅ Added sample reactions!")
        else:
            print("✅ Reactions already exist")

        # Display final state
        all_reactions = db.query(models.Reaction).filter(
            models.Reaction.shoutout_id == shoutout.id
        ).all()
        print(f"\nFinal state: {len(all_reactions)} reactions on shoutout {shoutout.id}")
        for reaction in all_reactions:
            user = db.query(models.User).filter(models.User.id == reaction.user_id).first()
            print(f"  - {user.full_name} {reaction.type}d the shoutout")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_reactions()