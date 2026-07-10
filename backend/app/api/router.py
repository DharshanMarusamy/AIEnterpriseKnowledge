from fastapi import APIRouter
from app.api.endpoints import documents, chat, bookmarks, analytics, departments, users, auth, health, search

api_router = APIRouter()

api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(bookmarks.router, prefix="/bookmarks", tags=["bookmarks"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(departments.router, prefix="/departments", tags=["departments"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
