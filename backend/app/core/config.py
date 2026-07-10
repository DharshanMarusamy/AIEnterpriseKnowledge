from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Enterprise Knowledge Assistant"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://eka_admin:eka_secure_pass_123@localhost:5433/ai_enterprice"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Qdrant
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: Optional[str] = None
    
    # Security
    JWT_SECRET: str = "super_secret_jwt_key_change_in_prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # LLM
    GEMINI_API_KEY: Optional[str] = None
    
    # OAuth SSO
    GOOGLE_CLIENT_ID: Optional[str] = None
    MICROSOFT_CLIENT_ID: Optional[str] = None
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
