from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.db.database import get_db
from app.db.models import Department, Document

router = APIRouter()

@router.get("/")
async def list_departments(db: AsyncSession = Depends(get_db)):
    stmt = select(Department)
    result = await db.execute(stmt)
    departments = result.scalars().all()
    
    dept_list = []
    for d in departments:
        # Get doc count
        count_stmt = select(func.count()).select_from(Document).where(Document.department_id == d.id)
        count = (await db.execute(count_stmt)).scalar() or 0
        
        dept_list.append({
            "id": d.id,
            "name": d.name,
            "description": d.description,
            "document_count": count
        })
        
    return dept_list
