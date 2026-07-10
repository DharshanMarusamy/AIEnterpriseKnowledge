from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import User, RoleEnum, UserInvite
from pydantic import BaseModel
from typing import List

router = APIRouter()

class UserUpdate(BaseModel):
    role: RoleEnum
    status: str

@router.get("/")
async def list_users(db: AsyncSession = Depends(get_db)):
    stmt = select(User)
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "status": u.status,
            "auth_provider": u.auth_provider,
            "created_at": u.created_at
        } for u in users
    ]

@router.put("/{user_id}")
async def update_user(user_id: int, user_update: UserUpdate, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.id == user_id)
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.role = user_update.role
    user.status = user_update.status
    await db.commit()
    return {"message": "User updated"}
