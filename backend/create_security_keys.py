"""
Script to create security keys for admin registration.
Run this script to generate unused security keys that can be used for admin registration.
"""
import asyncio
from app.database import get_db, engine
from app.models import SecurityKey, Base
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


async def create_security_keys(count=5):
    """Create unused security keys"""
    async with AsyncSession(engine) as db:
        # Check existing unused keys
        result = await db.execute(select(SecurityKey).where(SecurityKey.is_used == False))
        existing = result.scalars().all()
        
        if existing:
            print(f"Found {len(existing)} unused security keys:")
            for key in existing:
                print(f"  - {key.key}")
            print("\nTo create new keys, delete or use the existing ones first.")
            return
        
        # Create new keys
        import secrets
        keys_created = []
        for i in range(count):
            key_value = secrets.token_urlsafe(16)
            new_key = SecurityKey(key=key_value, is_used=False)
            db.add(new_key)
            keys_created.append(key_value)
        
        await db.commit()
        
        print(f"Created {count} new security keys:")
        for key in keys_created:
            print(f"  - {key}")
        print("\n⚠️  IMPORTANT: Save these keys securely. They can only be used once!")


if __name__ == "__main__":
    print("Creating security keys for admin registration...\n")
    asyncio.run(create_security_keys(5))

