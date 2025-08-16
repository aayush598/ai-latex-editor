from fastapi import FastAPI
from app.core.config import settings
from app.api.routes_health import router as health_router
from app.api.routes_documents import router as documents_router
from app.api.routes_ai import router as ai_router
from app.api.routes_compile import router as compile_router
from app.api.routes_references import router as references_router
from app.api.routes_math import router as math_router
from app.api.routes_figures import router as figures_router
from app.api.routes_accessibility import router as accessibility_router
from app.api.routes_collaboration import router as collab_router

app = FastAPI(title=settings.APP_NAME)

# Register routes
app.include_router(health_router, tags=["Health"])
app.include_router(documents_router)
app.include_router(ai_router)
app.include_router(compile_router)
app.include_router(references_router)
app.include_router(math_router)
app.include_router(figures_router)
app.include_router(accessibility_router)
app.include_router(collab_router)

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.APP_NAME}!"}
