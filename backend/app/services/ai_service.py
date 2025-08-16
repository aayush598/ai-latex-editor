import os
import re
from google import genai
from app.schemas.ai_schema import GenerateLatexRequest, ExplainLatexRequest
from app.core.config import settings



# Initialize Gemini client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

def process_gemini_output(text: str) -> str:
    """
    Removes markdown code block fences and a potential leading "latex" or
    other language tag from the text output.
    
    This function handles patterns like:
    - ```python
    - ```json
    - ```latex
    - ```
    
    Args:
        text: The raw string output from the Gemini model.

    Returns:
        A cleaned string with the code fences removed.
    """
    # Pattern to match and remove the opening and closing fences.
    # It handles cases like ```latex or just ```.
    pattern = r"```[\s\S]*?\n|```"
    
    # Use re.sub to find all occurrences of the pattern and replace them with an empty string.
    # The re.MULTILINE flag allows ^ and $ to match at the beginning/end of each line.
    cleaned_text = re.sub(pattern, "", text, flags=re.MULTILINE)

    # Return the stripped string to remove any leading/trailing whitespace
    return cleaned_text.strip()

def generate_latex(request: GenerateLatexRequest) -> str:
    """
    Convert natural language to LaTeX code using Gemini.
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Convert this request into valid LaTeX code only:\n\n{request.prompt}"
    )
    response = response.text.strip()
    response = process_gemini_output(response)
    return response

def explain_latex(request: ExplainLatexRequest) -> str:
    """
    Explain LaTeX code in plain English using Gemini.
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Explain this LaTeX expression in simple English:\n\n{request.code}"
    )
    response = response.text.strip()
    response = process_gemini_output(response)
    return response
