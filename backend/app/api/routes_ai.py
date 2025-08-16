from fastapi import APIRouter, HTTPException
from app.schemas.ai_schema import (
    GenerateLatexRequest, GenerateLatexResponse,
    ExplainLatexRequest, ExplainLatexResponse
)
from app.services.ai_service import generate_latex, explain_latex

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/generate-latex", response_model=GenerateLatexResponse)
def generate_latex_endpoint(request: GenerateLatexRequest):
    try:
        result = generate_latex(request)
        return {"latex": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain-latex", response_model=ExplainLatexResponse)
def explain_latex_endpoint(request: ExplainLatexRequest):
    try:
        result = explain_latex(request)
        return {"explanation": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
