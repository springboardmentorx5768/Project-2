from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from dependencies import employee_required

router = APIRouter(prefix="/employee", tags=["Employee"])

@router.get("/dashboard")
async def employee_dashboard(user=Depends(employee_required), db: AsyncSession = Depends(get_db)):
    return {"message": f"Welcome {user['sub']}!"}
