from app.services.ai_service import client
from app.schemas.compile_schema import FixErrorRequest

def parse_log(log: str) -> str:
    """
    Extract meaningful LaTeX errors from log text.
    """
    errors = []
    for line in log.splitlines():
        if "!" in line or "Error" in line:
            errors.append(line.strip())
    return "\n".join(errors) if errors else log

def fix_errors(request: FixErrorRequest) -> dict:
    """
    Ask Gemini to fix LaTeX errors based on log + content.
    """
    parsed_errors = parse_log(request.error_log)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=(
            "The following LaTeX code has errors. "
            "Fix the errors and return corrected LaTeX only.\n\n"
            f"Errors:\n{parsed_errors}\n\nCode:\n{request.content}"
        )
    )

    return {
        "fixed_content": response.text.strip(),
        "explanation": f"Fixed based on errors: {parsed_errors}"
    }
