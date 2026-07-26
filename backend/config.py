import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/finora"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Qdrant
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str | None = None
    
    # Hugging Face
    HUGGINGFACE_API_KEY: str | None = None
    
    # Gemini
    GEMINI_API_KEY: str | None = None
    
    # Groq
    GROQ_API_KEY: str | None = None
    
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"), 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

settings = Settings()
