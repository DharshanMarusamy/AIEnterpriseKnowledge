from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
import random
import string
import uuid
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.core.config import settings

from app.db.database import get_db
from app.db.models import User, UserInvite, RoleEnum, PasswordResetToken, OTPVerification
from pydantic import BaseModel, EmailStr
from app.core.security import (
    create_access_token, 
    create_refresh_token, 
    verify_password, 
    get_password_hash,
    get_current_user
)
from app.services.email import email_service

router = APIRouter()

class InviteRequest(BaseModel):
    email: EmailStr
    role: RoleEnum = RoleEnum.EMPLOYEE

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class GoogleLoginRequest(BaseModel):
    token: str

class MicrosoftLoginRequest(BaseModel):
    token: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class OTPRequest(BaseModel):
    email: EmailStr
    otp_code: str

@router.post("/register")
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing_user = (await db.execute(select(User).where(User.email == req.email))).scalar_one_or_none()
    if existing_user and existing_user.status != "Invited":
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(req.password)
    
    if existing_user and existing_user.status == "Invited":
        existing_user.status = "Active"
        existing_user.is_active = True
        existing_user.full_name = req.full_name
        existing_user.hashed_password = hashed_password
        user = existing_user
    else:
        user = User(
            email=req.email,
            hashed_password=hashed_password,
            full_name=req.full_name,
            auth_provider="email",
            status="Active",
            is_active=True
        )
        db.add(user)
        
    await db.commit()
    await db.refresh(user)
    
    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "name": user.full_name, "role": user.role}
    }

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.email == form_data.username))).scalar_one_or_none()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "name": user.full_name, "role": user.role}
    }

@router.post("/refresh")
async def refresh_token(req: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    from jose import jwt
    from app.core.config import settings
    from app.core.security import ALGORITHM
    
    try:
        payload = jwt.decode(req.refresh_token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    user = (await db.execute(select(User).where(User.id == int(user_id)))).scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
        
    access_token = create_access_token(subject=str(user.id))
    new_refresh_token = create_refresh_token(subject=str(user.id))
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.email == req.email))).scalar_one_or_none()
    if not user:
        # Don't reveal if user exists
        return {"message": "If the email is registered, a password reset link has been sent."}
        
    # Generate token
    token = str(uuid.uuid4())
    expires = datetime.utcnow() + timedelta(hours=1)
    
    reset_token = PasswordResetToken(user_id=user.id, token=token, expires_at=expires)
    db.add(reset_token)
    await db.commit()
    
    await email_service.send_password_reset_email(user.email, token)
    return {"message": "If the email is registered, a password reset link has been sent."}

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    reset_token = (await db.execute(select(PasswordResetToken).where(PasswordResetToken.token == req.token))).scalar_one_or_none()
    
    if not reset_token or reset_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user = (await db.execute(select(User).where(User.id == reset_token.user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
        
    user.hashed_password = get_password_hash(req.new_password)
    
    # Delete the used token
    await db.delete(reset_token)
    await db.commit()
    
    return {"message": "Password successfully reset"}

@router.post("/send-otp")
async def send_otp(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.email == req.email))).scalar_one_or_none()
    if not user:
        return {"message": "OTP sent if email exists"}
        
    otp_code = ''.join(random.choices(string.digits, k=6))
    expires = datetime.utcnow() + timedelta(minutes=10)
    
    otp_entry = OTPVerification(user_id=user.id, otp_code=otp_code, expires_at=expires)
    db.add(otp_entry)
    await db.commit()
    
    await email_service.send_otp_email(user.email, otp_code)
    return {"message": "OTP sent if email exists"}

@router.post("/verify-otp")
async def verify_otp(req: OTPRequest, db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.email == req.email))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    otp_entry = (await db.execute(
        select(OTPVerification)
        .where(OTPVerification.user_id == user.id)
        .where(OTPVerification.otp_code == req.otp_code)
    )).scalar_one_or_none()
    
    if not otp_entry or otp_entry.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    await db.delete(otp_entry)
    await db.commit()
    
    return {"message": "OTP verified successfully"}

@router.post("/invite")
async def invite_user(req: InviteRequest, db: AsyncSession = Depends(get_db)):
    existing_user = (await db.execute(select(User).where(User.email == req.email))).scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
        
    existing_invite = (await db.execute(select(UserInvite).where(UserInvite.email == req.email))).scalar_one_or_none()
    if existing_invite:
        raise HTTPException(status_code=400, detail="User already invited")
        
    invite = UserInvite(email=req.email, role=req.role, status="Pending", invited_by=1) 
    db.add(invite)
    
    stub_user = User(email=req.email, full_name="Invited User", role=req.role, status="Invited", is_active=False)
    db.add(stub_user)
    
    await db.commit()
    await email_service.send_invite_email(req.email, req.role)
    
    return {"message": "Invite sent successfully"}

@router.post("/google")
async def google_login(req: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {req.token}"}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid Google token")
            
        data = response.json()
        email = data.get("email")
        name = data.get("name", "")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")

    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    
    if not user:
        user = User(
            email=email,
            full_name=name,
            auth_provider="google",
            status="Active",
            is_active=True
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        if user.status in ["Invited", "Pending"]:
            user.status = "Active"
            user.is_active = True
            user.full_name = name or user.full_name
            user.auth_provider = "google"
            await db.commit()
            
    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "name": user.full_name, "role": user.role}
    }

@router.post("/microsoft")
async def microsoft_login(req: MicrosoftLoginRequest, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://graph.microsoft.com/v1.0/me",
            headers={"Authorization": f"Bearer {req.token}"}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid Microsoft token")
            
        data = response.json()
        email = data.get("mail") or data.get("userPrincipalName")
        name = data.get("displayName", "")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Microsoft")

    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    
    if not user:
        user = User(
            email=email,
            full_name=name,
            auth_provider="microsoft",
            status="Active",
            is_active=True
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        if user.status in ["Invited", "Pending"]:
            user.status = "Active"
            user.is_active = True
            user.full_name = name or user.full_name
            user.auth_provider = "microsoft"
            await db.commit()
            
    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "name": user.full_name, "role": user.role}
    }

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.full_name,
        "role": current_user.role,
        "department_id": current_user.department_id if hasattr(current_user, 'department_id') else None
    }
