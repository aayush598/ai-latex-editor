from typing import List
from app.schemas.accessibility_schema import (
    AddAltTextRequest, CheckColorRequest, CheckTemplateRequest
)
from app.services.ai_service import client

# ---- 1. Alt Text (AI captioning) ----
def add_alt_text(req: AddAltTextRequest) -> str:
    """
    Use Gemini to generate concise alt text for figures.
    """
    system_prompt = (
        "You are an accessibility assistant. "
        "Generate descriptive alt text for figures in LaTeX. "
        f"Limit to {req.max_length} characters. "
        "Do not return LaTeX code, only plain text."
    )
    user_prompt = f"Figure code:\n{req.figure_code}\n\nContext: {req.context or 'N/A'}"
    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=system_prompt + "\n" + user_prompt
    )
    return resp.text.strip()

# ---- 2. Color Compliance ----
def _simulate_colorblindness(hex_color: str, mode: str) -> str:
    """
    Placeholder: in production, apply LMS color-blindness simulation.
    For now, check contrast differences crudely.
    """
    # Normalize
    c = hex_color.lstrip("#").lower()
    if len(c) == 3:
        c = "".join([x*2 for x in c])
    if len(c) != 6:
        return hex_color

    r, g, b = [int(c[i:i+2],16) for i in (0,2,4)]

    if mode == "protanopia":
        return f"({int(r*0.3)},{g},{b})"
    elif mode == "deuteranopia":
        return f"({r},{int(g*0.3)},{b})"
    elif mode == "tritanopia":
        return f"({r},{g},{int(b*0.3)})"
    return f"({r},{g},{b})"

def check_color(req: CheckColorRequest) -> (bool, List[str]):
    issues = []
    seen = {}

    modes = (
        ["protanopia","deuteranopia","tritanopia"]
        if req.palette_type == "all" else [req.palette_type]
    )

    for m in modes:
        transformed = [_simulate_colorblindness(c, m) for c in req.colors]
        # crude: check uniqueness
        if len(set(transformed)) < len(transformed):
            issues.append(f"Colors not distinguishable under {m}.")

    return (len(issues) == 0, issues)

# ---- 3. Template Compliance ----
def check_template(req: CheckTemplateRequest) -> (bool, List[str]):
    issues = []

    code = req.latex_code.lower()

    if req.template == "ieee":
        if "\\documentclass" not in code or "ieee" not in code:
            issues.append("Missing IEEEtran document class.")
        if "\\author" not in code:
            issues.append("Missing author info.")
        if "\\bibliographystyle{ieee" not in code:
            issues.append("Missing IEEE bibliography style.")

    elif req.template == "acm":
        if "\\documentclass" not in code or "acmart" not in code:
            issues.append("Missing ACM acmart class.")
        if "\\keywords" not in code:
            issues.append("Missing ACM keywords section.")
        if "\\ccsdesc" not in code:
            issues.append("Missing ACM CCS concepts.")

    return (len(issues) == 0, issues)
