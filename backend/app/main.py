from fastapi import FastAPI
from app.core.config import settings
from app.api.routes_health import router as health_router
from app.api.routes_documents import router as documents_router
from app.api.routes_ai import router as ai_router
from app.api.routes_compile import router as compile_router

app = FastAPI(title=settings.APP_NAME)

# Register routes
app.include_router(health_router, tags=["Health"])
app.include_router(documents_router)
app.include_router(ai_router)
app.include_router(compile_router)

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.APP_NAME}!"}
