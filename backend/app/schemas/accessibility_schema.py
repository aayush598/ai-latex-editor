from pydantic import BaseModel
from typing import Optional, List, Literal

# ---- Alt Text ----
class AddAltTextRequest(BaseModel):
    figure_code: str             # e.g., \includegraphics{img.png}
    context: Optional[str] = None  # e.g., caption or surrounding text
    max_length: int = 200

class AddAltTextResponse(BaseModel):
    alt_text: str

# ---- Color Compliance ----
class CheckColorRequest(BaseModel):
    colors: List[str]            # list of LaTeX color names or hex codes
    palette_type: Literal["all","protanopia","deuteranopia","tritanopia"] = "all"

class CheckColorResponse(BaseModel):
    compliant: bool
    issues: List[str]

# ---- Template Compliance ----
class CheckTemplateRequest(BaseModel):
    latex_code: str
    template: Literal["ieee","acm"]

class CheckTemplateResponse(BaseModel):
    compliant: bool
    issues: List[str]
