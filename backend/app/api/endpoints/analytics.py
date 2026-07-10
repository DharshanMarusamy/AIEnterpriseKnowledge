from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func
from app.db.database import get_db
from app.db.models import ActivityLog, Document, User

router = APIRouter()

@router.get("/")
async def get_analytics(db: AsyncSession = Depends(get_db)):
    # Very basic analytics
    total_docs = (await db.execute(select(func.count()).select_from(Document))).scalar() or 0
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar() or 0
    
    # Recent activity
    stmt = select(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(10)
    recent_activity = (await db.execute(stmt)).scalars().all()
    
    return {
        "overview": {
            "total_documents": total_docs,
            "total_users": total_users,
            "active_users": total_users, # placeholder
            "queries_today": 0 # placeholder
        },
        "recent_activity": [
            {
                "id": a.id,
                "action": a.action,
                "details": a.details,
                "created_at": a.created_at
            }
            for a in recent_activity
        ]
    }
