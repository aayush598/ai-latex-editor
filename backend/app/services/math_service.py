import sympy as sp
from sympy.parsing.latex import parse_latex
from sympy.parsing.sympy_parser import parse_expr
from app.services.ai_service import client
from app.schemas.math_schema import (
    VerifyEquationRequest, DeriveEquationRequest, CheckUnitsRequest
)

# ---- 1. Equation Verification ----
def verify_equation(request: VerifyEquationRequest):
    try:
        lhs = parse_latex(request.lhs) if "\\" in request.lhs else parse_expr(request.lhs)
        rhs = parse_latex(request.rhs) if "\\" in request.rhs else parse_expr(request.rhs)

        equivalent = sp.simplify(lhs - rhs) == 0

        return {
            "equivalent": equivalent,
            "simplified_lhs": str(sp.simplify(lhs)),
            "simplified_rhs": str(sp.simplify(rhs))
        }
    except Exception as e:
        return {"equivalent": False, "simplified_lhs": "error", "simplified_rhs": str(e)}

# ---- 2. Derivation Tutor ----
def derive_equation(request: DeriveEquationRequest):
    """
    Use Gemini for natural language derivation steps.
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=(
            "Break down the following math expression step by step. "
            "Return a list of derivation steps and the final result.\n\n"
            f"Expression: {request.expression}"
        )
    )

    text = response.text.strip()
    steps = text.split("\n")
    return {"steps": steps[:-1], "final_result": steps[-1]}

# ---- 3. Unit Consistency ----
def check_units(request: CheckUnitsRequest):
    """
    Very simple dimensional check using SymPy's units system.
    """
    from sympy.physics import units as u
    from sympy import Symbol

    unit_map = {
        "F": u.newton,
        "m": u.kilogram,
        "a": u.meter / u.second**2,
        # You can add more mappings here for other variables
        "E": u.joule,
        "c": u.c,
    }

    expr = request.expression.replace("^", "**")

    # Example: "F = m * a"
    try:
        if "=" in expr:
            lhs_str, rhs_str = expr.split("=")
            lhs = parse_expr(lhs_str, local_dict=unit_map)
            rhs = parse_expr(rhs_str, local_dict=unit_map)
            consistent = sp.simplify(lhs - rhs) == 0
            return {"consistent": consistent, "details": f"LHS: {lhs}, RHS: {rhs}"}
        else:
            return {"consistent": False, "details": "Expression must include '='"}
    except Exception as e:
        return {"consistent": False, "details": str(e)}
def check_units(request: CheckUnitsRequest):
    """
    Check dimensional consistency using SymPy's units system (works in SymPy <= 1.12).
    """
    import sympy as sp
    from sympy.physics import units as u
    from sympy.physics.units.systems import SI
    from sympy.parsing.sympy_parser import parse_expr

    # Map variables directly to SymPy Quantities
    unit_map = {
        "F": u.newton,
        "m": u.kilogram,
        "a": u.meter / u.second**2,
        "E": u.joule,
        "c": u.speed_of_light,
    }

    expr = request.expression.replace("^", "**")

    try:
        if "=" in expr:
            lhs_str, rhs_str = expr.split("=")

            lhs = parse_expr(lhs_str.strip(), local_dict=unit_map)
            rhs = parse_expr(rhs_str.strip(), local_dict=unit_map)

            # Compute dimensional expressions using SI system
            lhs_dim = SI.get_dimensional_expr(lhs)
            rhs_dim = SI.get_dimensional_expr(rhs)

            consistent = sp.simplify(lhs_dim - rhs_dim) == 0

            return {
                "consistent": consistent,
                "details": f"LHS: {lhs} → {lhs_dim}, RHS: {rhs} → {rhs_dim}"
            }
        else:
            return {"consistent": False, "details": "Expression must include '='"}
    except Exception as e:
        return {"consistent": False, "details": str(e)}
