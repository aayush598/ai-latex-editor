from pydantic import BaseModel
from typing import List, Optional, Literal

# ------- Table -------
class GenerateTableRequest(BaseModel):
    csv: str                                # raw CSV text
    delimiter: str = ","                    # default comma
    has_header: bool = True
    align: Optional[str] = None             # e.g., "lcr" or None → auto
    use_booktabs: bool = True
    max_col_width: Optional[int] = 60       # wrap long cells with \makecell
    caption: Optional[str] = None
    label: Optional[str] = None
    table_env: Literal["table", "table*","none"] = "table"  # "none" → just tabularx

class GenerateTableResponse(BaseModel):
    latex: str

# ------- Plot (pgfplots) -------
class GeneratePlotRequest(BaseModel):
    mode: Literal["data","equation"]        # "data" or "equation"
    title: Optional[str] = None
    xlabel: Optional[str] = None
    ylabel: Optional[str] = None
    width: str = "\\linewidth"
    height: Optional[str] = None
    grid: bool = True
    legend: Optional[List[str]] = None

    # data mode
    series: Optional[List[List[List[float]]]] = None
    # shape: [ series_i : [ [x,y], ... ] ]

    # equation mode
    expressions: Optional[List[str]] = None # e.g. ["sin(deg(x))","x^2"]
    domain: Optional[List[float]] = None    # [xmin, xmax]
    samples: int = 200

class GeneratePlotResponse(BaseModel):
    latex: str

# ------- TikZ diagram -------
class GenerateDiagramRequest(BaseModel):
    prompt: str                   # natural language description
    style_hints: Optional[str] = None  # optional constraints (colors, nodes, etc.)
    tikz_libs: Optional[List[str]] = ["arrows.meta", "positioning"]
    strict_latex_only: bool = True     # enforce LaTeX-only output

class GenerateDiagramResponse(BaseModel):
    latex: str
