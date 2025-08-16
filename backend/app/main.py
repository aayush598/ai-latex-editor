from fastapi import FastAPI
from app.core.config import settings
from app.api.routes_health import router as health_router

app = FastAPI(title=settings.APP_NAME)

# Register routes
app.include_router(health_router, tags=["Health"])

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.APP_NAME}!"}
