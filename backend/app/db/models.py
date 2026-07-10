from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class RoleEnum(str, enum.Enum):
    EMPLOYEE = "employee"
    MANAGER = "manager"
    HR = "hr"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True) # Nullable for OAuth users
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(Enum(RoleEnum), default=RoleEnum.EMPLOYEE)
    status = Column(String, default="Active") # Active, Pending, Invited
    auth_provider = Column(String, default="email") # email, google
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    documents = relationship("Document", back_populates="uploader")
    chats = relationship("Chat", back_populates="user")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    documents = relationship("Document", back_populates="department")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    filename = Column(String, nullable=False)
    file_type = Column(String)
    content_text = Column(Text)
    upload_path = Column(String)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    uploader = relationship("User", back_populates="documents")
    department = relationship("Department", back_populates="documents")
    bookmarks = relationship("Bookmark", back_populates="document", cascade="all, delete-orphan")
    activities = relationship("ActivityLog", back_populates="document", cascade="all, delete-orphan")

class Bookmark(Base):
    __tablename__ = "bookmarks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="bookmarks")
    document = relationship("Document", back_populates="bookmarks")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False) # e.g., 'view_document', 'chat_query', 'upload_document'
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="activities")
    document = relationship("Document", back_populates="activities")

class UserInvite(Base):
    __tablename__ = "user_invites"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.EMPLOYEE)
    status = Column(String, default="Pending") # Pending, Accepted
    invited_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Chat(Base):
    __tablename__ = "chats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, default="New Chat")
    is_archived = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="chats")
    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"))
    sender = Column(String, nullable=False) # 'user' or 'agent'
    content = Column(Text, nullable=False)
    feedback = Column(String, nullable=True) # 'like', 'dislike', None
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    chat = relationship("Chat", back_populates="messages")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info") # info, warning, success, error
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    theme = Column(String, default="light")
    language = Column(String, default="en")
    email_notifications = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SystemSettings(Base):
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Folder(Base):
    __tablename__ = "folders"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    parent_id = Column(Integer, ForeignKey("folders.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DocumentVersion(Base):
    __tablename__ = "document_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    file_path = Column(String, nullable=False)
    changes_summary = Column(Text, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class OTPVerification(Base):
    __tablename__ = "otp_verifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    otp_code = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
