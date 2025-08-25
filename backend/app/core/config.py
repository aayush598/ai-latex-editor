# backend/app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "latex-ai-backend"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    GEMINI_API_KEY: str = ""

    # ✅ Add Supabase + OAuth keys
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    class Config:
        env_file = ".env"
        extra = "ignore"   # 👈 this way, if extra keys exist, they won’t break

settings = Settings()
