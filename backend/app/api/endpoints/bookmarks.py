from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import Bookmark, Document
from pydantic import BaseModel
from typing import List

router = APIRouter()

class BookmarkCreate(BaseModel):
    document_id: int

@router.get("/")
async def list_bookmarks(db: AsyncSession = Depends(get_db)):
    user_id = 1 # Hardcoded for now
    stmt = select(Bookmark).where(Bookmark.user_id == user_id)
    result = await db.execute(stmt)
    bookmarks = result.scalars().all()
    
    # Fetch document details
    bookmark_list = []
    for b in bookmarks:
        doc_stmt = select(Document).where(Document.id == b.document_id)
        doc = (await db.execute(doc_stmt)).scalar_one_or_none()
        if doc:
            bookmark_list.append({
                "id": b.id,
                "document_id": doc.id,
                "document": {
                    "id": doc.id,
                    "title": doc.title,
                    "filename": doc.filename,
                    "file_type": doc.file_type,
                    "department_id": doc.department_id,
                    "created_at": doc.created_at,
                    "uploaded_by": doc.uploaded_by
                }
            })
    return bookmark_list

@router.post("/")
async def add_bookmark(bookmark: BookmarkCreate, db: AsyncSession = Depends(get_db)):
    user_id = 1 # Hardcoded
    
    # Check if doc exists
    doc = (await db.execute(select(Document).where(Document.id == bookmark.document_id))).scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Check if already bookmarked
    existing = (await db.execute(select(Bookmark).where(Bookmark.user_id == user_id, Bookmark.document_id == bookmark.document_id))).scalar_one_or_none()
    if existing:
        return {"message": "Already bookmarked", "id": existing.id}
        
    new_bookmark = Bookmark(user_id=user_id, document_id=bookmark.document_id)
    db.add(new_bookmark)
    await db.commit()
    await db.refresh(new_bookmark)
    return {"message": "Bookmark added", "id": new_bookmark.id}

@router.delete("/{document_id}")
async def remove_bookmark(document_id: int, db: AsyncSession = Depends(get_db)):
    user_id = 1
    existing = (await db.execute(select(Bookmark).where(Bookmark.user_id == user_id, Bookmark.document_id == document_id))).scalar_one_or_none()
    if not existing:
        raise HTTPException(status_code=404, detail="Bookmark not found")
        
    await db.delete(existing)
    await db.commit()
    return {"message": "Bookmark removed"}
