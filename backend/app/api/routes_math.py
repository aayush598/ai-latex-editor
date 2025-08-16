from fastapi import APIRouter, HTTPException
from app.schemas.math_schema import (
    VerifyEquationRequest, VerifyEquationResponse,
    DeriveEquationRequest, DeriveEquationResponse,
    CheckUnitsRequest, CheckUnitsResponse
)
from app.services.math_service import verify_equation, derive_equation, check_units

router = APIRouter(prefix="/math", tags=["Math Intelligence"])

@router.post("/verify-equation", response_model=VerifyEquationResponse)
def verify_equation_endpoint(request: VerifyEquationRequest):
    return verify_equation(request)

@router.post("/derive-equation", response_model=DeriveEquationResponse)
def derive_equation_endpoint(request: DeriveEquationRequest):
    try:
        return derive_equation(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/check-units", response_model=CheckUnitsResponse)
def check_units_endpoint(request: CheckUnitsRequest):
    return check_units(request)
