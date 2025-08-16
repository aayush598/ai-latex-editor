from fastapi import APIRouter, HTTPException
from app.schemas.accessibility_schema import (
    AddAltTextRequest, AddAltTextResponse,
    CheckColorRequest, CheckColorResponse,
    CheckTemplateRequest, CheckTemplateResponse
)
from app.services.accessibility_service import add_alt_text, check_color, check_template

router = APIRouter(prefix="/accessibility", tags=["Accessibility & Compliance"])

@router.post("/add-alt-text", response_model=AddAltTextResponse)
def add_alt_text_endpoint(req: AddAltTextRequest):
    try:
        alt = add_alt_text(req)
        return {"alt_text": alt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/check-color", response_model=CheckColorResponse)
def check_color_endpoint(req: CheckColorRequest):
    try:
        compliant, issues = check_color(req)
        return {"compliant": compliant, "issues": issues}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/check-template", response_model=CheckTemplateResponse)
def check_template_endpoint(req: CheckTemplateRequest):
    try:
        compliant, issues = check_template(req)
        return {"compliant": compliant, "issues": issues}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
