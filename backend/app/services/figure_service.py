import csv
import io
import textwrap
from typing import List, Optional
from app.schemas.figure_schema import (
    GenerateTableRequest, GeneratePlotRequest, GenerateDiagramRequest
)
from app.services.ai_service import client

LATEX_SPECIALS = {
    "&": r"\&", "%": r"\%", "$": r"\$", "#": r"\#",
    "_": r"\_", "{": r"\{", "}": r"\}", "~": r"\textasciitilde{}",
    "^": r"\textasciicircum{}", "\\": r"\textbackslash{}"
}

def _escape_latex(s: str) -> str:
    out = []
    for ch in s:
        out.append(LATEX_SPECIALS.get(ch, ch))
    return "".join(out)

def _makecell(s: str, maxw: Optional[int]) -> str:
    if maxw and len(s) > maxw:
        wrapped = r" \\ ".join(textwrap.wrap(s, maxw))
        return r"\makecell{" + wrapped + "}"
    return s

# ---------- TABLE ----------
# ---------- TABLE (CORRECTED) ----------
def generate_table(req: GenerateTableRequest) -> str:
    """
    Generates a LaTeX table fragment. The required packages
    (tabularx, makecell, booktabs) must be included by the caller.
    """
    # Parse CSV
    reader = csv.reader(io.StringIO(req.csv), delimiter=req.delimiter)
    rows = [list(r) for r in reader]

    if not rows:
        return "% Empty CSV -> no table"

    header = rows[0] if req.has_header else None
    data = rows[1:] if req.has_header else rows

    # Determine column alignment
    ncols = len(rows[0])
    align = req.align or ("X" * ncols)   # tabularx: flexible columns

    # Build LaTeX
    lines = []

    # The package includes are moved to a comment for user guidance
    lines.append("% --- Required packages: tabularx, makecell, booktabs ---")
    lines.append("")

    open_env = close_env = ""
    if req.table_env != "none":
        open_env = r"\begin{" + req.table_env + r"}[ht]" + "\n\\centering\n"
        close_env = "\n" + r"\end{" + req.table_env + r"}"

    lines.append(open_env + r"\begin{tabularx}{\linewidth}{" + align + r"}")

    if req.use_booktabs:
        lines.append(r"\toprule")

    # Header
    if header:
        head_cells = [ _escape_latex(_makecell(h.strip(), req.max_col_width)) for h in header ]
        lines.append(" & ".join(head_cells) + r" \\")
        if req.use_booktabs:
            lines.append(r"\midrule")
        else:
            lines.append(r"\hline")

    # Body
    for row in data:
        cells = [ _escape_latex(_makecell((c or "").strip(), req.max_col_width)) for c in row ]
        lines.append(" & ".join(cells) + r" \\")

    if req.use_booktabs:
        lines.append(r"\bottomrule")

    lines.append(r"\end{tabularx}")

    # caption / label
    if req.table_env != "none" and (req.caption or req.label):
        if req.caption:
            lines.append(r"\caption{" + _escape_latex(req.caption) + r"}")
        if req.label:
            lines.append(r"\label{" + req.label + r"}")

    lines.append(close_env)

    return "\n".join([l for l in lines if l is not None])

# ---------- PLOTS (PGFPLOTS) ----------
def _pgfplots_preamble() -> List[str]:
    return [
        r"\usepackage{pgfplots}",
        r"\pgfplotsset{compat=newest}",
    ]

def generate_plot(req: GeneratePlotRequest) -> str:
    lines = _pgfplots_preamble()
    lines.append("")
    width = req.width or r"\linewidth"
    height = f", height={req.height}" if req.height else ""
    grid = "major" if req.grid else "none"

    # Fix: Build the options list and then join them into the axis environment string.
    # This avoids the f-string variable parsing error.
    opts = [
        f"width={width}{height}",
        f"grid={grid}"
    ]
    if req.title:
        opts.append(f"title={{{_escape_latex(req.title)}}}")
    
    lines.append(r"  \begin{axis}[" + ", ".join(opts) + r"]")

    # Data mode
    if req.mode == "data":
        if not req.series:
            return "% No data provided"
        for i, series in enumerate(req.series):
            lines.append("    \\addplot table[row sep=crcr]{%")
            for x, y in series:
                lines.append(f"{x} {y}\\\\")
            lines.append("    };")
            if req.legend and i < len(req.legend):
                lines.append(f"    \\addlegendentry{{{_escape_latex(req.legend[i])}}}")

    # Equation mode
    elif req.mode == "equation":
        if not req.expressions:
            return "% No expressions provided"
        dom = req.domain or [-5, 5]
        for i, expr in enumerate(req.expressions):
            lines.append(fr"    \addplot[samples={req.samples},domain={dom[0]}:{dom[1]}] {{{expr}}};")
            if req.legend and i < len(req.legend):
                lines.append(f"    \\addlegendentry{{{_escape_latex(req.legend[i])}}}")

    # labels
    if req.xlabel: lines.append(fr"    xlabel={{{_escape_latex(req.xlabel)}}}")
    if req.ylabel: lines.append(fr"    ylabel={{{_escape_latex(req.ylabel)}}}")

    lines.append(r"  \end{axis}")
    lines.append(r"\end{tikzpicture}")
    return "\n".join(lines)

# ---------- TikZ DIAGRAM ----------
def generate_diagram(req: GenerateDiagramRequest) -> str:
    """
    Use Gemini to synthesize TikZ code. We strictly enforce LaTeX-only output.
    """
    libs = req.tikz_libs or []
    libs_line = "".join([f"\\usetikzlibrary{{{lib}}}\n" for lib in libs])

    system_prompt = (
        "You are a LaTeX TikZ assistant. Produce ONLY compilable LaTeX code. "
        "Do not include explanations or backticks. "
        "Use a standalone tikzpicture environment. "
    )
    if req.style_hints:
        system_prompt += f"Style constraints: {req.style_hints}\n"

    user_prompt = (
        f"Task: Create a TikZ diagram.\nDescription:\n{req.prompt}\n\n"
        "Requirements:\n"
        "- Return ONLY LaTeX code for the diagram.\n"
        "- Wrap in:\n"
        "  \\begin{tikzpicture}\n"
        "  ...\n"
        "  \\end{tikzpicture}\n"
    )

    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=system_prompt + "\n" + user_prompt
    )
    tikz = resp.text.strip()

    # Minimal preamble hint (caller can prepend in their doc)
    preamble_comment = "% Required packages:\n% \\usepackage{tikz}\n" + "".join([f"% \\usetikzlibrary{{{l}}}\n" for l in libs])
    return preamble_comment + "\n" + tikz
