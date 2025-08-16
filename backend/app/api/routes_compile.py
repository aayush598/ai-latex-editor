from fastapi import APIRouter, HTTPException
from app.schemas.compile_schema import (
    CompileRequest, CompileResponse,
    FixErrorRequest, FixErrorResponse
)
from app.services.compile_service import compile_latex
from app.services.error_service import fix_errors

router = APIRouter(prefix="/compile", tags=["Compile"])

@router.post("/", response_model=CompileResponse)
def compile_document(request: CompileRequest):
    pdf_base64, error_log = compile_latex(request.content)
    if pdf_base64:
        return {"pdf_base64": pdf_base64, "error_log": None}
    else:
        return {"pdf_base64": None, "error_log": error_log}

@router.post("/fix-errors", response_model=FixErrorResponse)
def fix_document_errors(request: FixErrorRequest):
    try:
        result = fix_errors(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
