import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.agents.orchestrator import orchestrator

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    chat_id: int | None = None # Used for conversation memory

class Citation(BaseModel):
    id: str
    title: str
    confidence: int

class ChatResponse(BaseModel):
    reply: str
    chat_id: int | None = None
    citations: list[Citation] = []

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import Chat, Message

@router.post("/", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    chat_id = request.chat_id
    history_str = ""
    
    if chat_id:
        # Load conversation history
        stmt = select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at)
        result = await db.execute(stmt)
        messages = result.scalars().all()
        for msg in messages:
            role = "User" if msg.sender == "user" else "Assistant"
            history_str += f"{role}: {msg.content}\n"
    else:
        # Create a new chat
        new_chat = Chat(title=request.message[:50], user_id=1) # Hardcoded user_id=1 for now
        db.add(new_chat)
        await db.commit()
        await db.refresh(new_chat)
        chat_id = new_chat.id
        
    # Save user message
    user_msg = Message(chat_id=chat_id, sender="user", content=request.message)
    db.add(user_msg)
    await db.commit()
    
    # Generate reply
    reply, citations = await orchestrator.chat(request.message, history=history_str)
    
    # Save agent message
    agent_msg = Message(chat_id=chat_id, sender="agent", content=reply)
    db.add(agent_msg)
    await db.commit()
    
    return ChatResponse(reply=reply, chat_id=chat_id, citations=citations)

@router.post("/stream")
async def chat_with_agent_stream(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    chat_id = request.chat_id
    history_str = ""
    
    if chat_id:
        # Load conversation history
        stmt = select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at)
        result = await db.execute(stmt)
        messages = result.scalars().all()
        for msg in messages:
            role = "User" if msg.sender == "user" else "Assistant"
            history_str += f"{role}: {msg.content}\n"
    else:
        # Create a new chat
        new_chat = Chat(title=request.message[:50], user_id=1) # Hardcoded user_id=1 for now
        db.add(new_chat)
        await db.commit()
        await db.refresh(new_chat)
        chat_id = new_chat.id
        
    # Save user message
    user_msg = Message(chat_id=chat_id, sender="user", content=request.message)
    db.add(user_msg)
    await db.commit()
    
    async def generate():
        full_reply = ""
        
        # Initial metadata
        yield f"data: {json.dumps({'type': 'chat_id', 'chat_id': chat_id})}\n\n"
        
        async for event in orchestrator.chat_stream(request.message, history=history_str):
            if event["type"] == "citations":
                yield f"data: {json.dumps(event)}\n\n"
            elif event["type"] == "chunk":
                full_reply += event["content"]
                yield f"data: {json.dumps(event)}\n\n"
            elif event["type"] == "error":
                full_reply = event["content"]
                yield f"data: {json.dumps(event)}\n\n"
                
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
        
        # Save agent message
        agent_msg = Message(chat_id=chat_id, sender="agent", content=full_reply)
        db.add(agent_msg)
        await db.commit()
        
    return StreamingResponse(generate(), media_type="text/event-stream")

@router.get("/")
async def get_user_chats(db: AsyncSession = Depends(get_db)):
    # Assuming user_id=1 for now as per current hardcoding
    stmt = select(Chat).where(Chat.user_id == 1).order_by(Chat.created_at.desc())
    result = await db.execute(stmt)
    chats = result.scalars().all()
    return [{"id": str(c.id), "title": c.title, "pinned": False} for c in chats]

@router.get("/{chat_id}")
async def get_chat_history(chat_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at)
    result = await db.execute(stmt)
    messages = result.scalars().all()
    return [
        {
            "id": str(msg.id),
            "role": "user" if msg.sender == "user" else "agent",
            "content": msg.content,
            "timestamp": msg.created_at.strftime("%I:%M %p") if msg.created_at else ""
        }
        for msg in messages
    ]
