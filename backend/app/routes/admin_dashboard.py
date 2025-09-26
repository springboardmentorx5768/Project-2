from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from dependencies import admin_required

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard")
async def admin_dashboard(user=Depends(admin_required), db: AsyncSession = Depends(get_db)):
    # Example: count all employees
    result = await db.execute("SELECT COUNT(*) FROM users WHERE role='employee'")
    count = result.scalar()
    return {"total_employees": count, "user": user}
