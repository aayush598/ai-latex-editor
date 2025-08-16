from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "latex-ai-backend"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    class Config:
        env_file = ".env"

settings = Settings()
