from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from app.db.database import get_db
from app.db.models import Document, Chat

router = APIRouter()

@router.get("/")
async def global_search(q: str = "", db: AsyncSession = Depends(get_db)):
    if not q or len(q.strip()) == 0:
        return {"documents": [], "chats": []}
        
    search_term = f"%{q}%"
    
    # Search documents
    doc_stmt = select(Document).where(
        or_(
            Document.title.ilike(search_term),
            Document.filename.ilike(search_term)
        )
    ).limit(5)
    doc_result = await db.execute(doc_stmt)
    documents = doc_result.scalars().all()
    
    # Search chats
    chat_stmt = select(Chat).where(Chat.title.ilike(search_term)).limit(5)
    chat_result = await db.execute(chat_stmt)
    chats = chat_result.scalars().all()
    
    return {
        "documents": [
            {"id": d.id, "title": d.title, "type": "document"} for d in documents
        ],
        "chats": [
            {"id": str(c.id), "title": c.title, "type": "chat"} for c in chats
        ]
    }
