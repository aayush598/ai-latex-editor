from fastapi import APIRouter, HTTPException
from app.schemas.reference_schema import (
    FetchBibtexRequest, FetchBibtexResponse,
    CheckBibtexRequest, CheckBibtexResponse
)
from app.services.reference_service import fetch_bibtex, check_bibtex

router = APIRouter(prefix="/references", tags=["References"])

@router.post("/fetch-bibtex", response_model=FetchBibtexResponse)
def fetch_bibtex_endpoint(request: FetchBibtexRequest):
    try:
        bibtex = fetch_bibtex(request)
        return {"bibtex": bibtex}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/check-bibtex", response_model=CheckBibtexResponse)
def check_bibtex_endpoint(request: CheckBibtexRequest):
    try:
        result = check_bibtex(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
