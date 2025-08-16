from pydantic import BaseModel
from typing import List

class VerifyEquationRequest(BaseModel):
    lhs: str  # left-hand side expression
    rhs: str  # right-hand side expression

class VerifyEquationResponse(BaseModel):
    equivalent: bool
    simplified_lhs: str
    simplified_rhs: str

class DeriveEquationRequest(BaseModel):
    expression: str  # LaTeX or plain math expression

class DeriveEquationResponse(BaseModel):
    steps: List[str]
    final_result: str

class CheckUnitsRequest(BaseModel):
    expression: str  # e.g., "F = m * a"

class CheckUnitsResponse(BaseModel):
    consistent: bool
    details: str

