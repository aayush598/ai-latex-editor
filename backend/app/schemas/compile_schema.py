from pydantic import BaseModel
from typing import Optional

class CompileRequest(BaseModel):
    content: str  # full LaTeX source code

class CompileResponse(BaseModel):
    pdf_base64: Optional[str] = None
    error_log: Optional[str] = None

class FixErrorRequest(BaseModel):
    content: str
    error_log: str

class FixErrorResponse(BaseModel):
    fixed_content: str
    explanation: str
