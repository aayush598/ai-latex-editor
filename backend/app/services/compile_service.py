import subprocess
import tempfile
import base64
import os

def compile_latex(content: str):
    """
    Compile LaTeX to PDF using pdflatex.
    
    This function creates a temporary directory, writes the LaTeX content to a file,
    runs the `pdflatex` command to compile it, and then reads the resulting PDF.
    It returns the PDF content as a base64-encoded string and an error log if
    the compilation fails.
    
    Args:
        content (str): A string containing the full LaTeX document source code.
        
    Returns:
        tuple[str | None, str | None]: A tuple containing:
            - The base64-encoded PDF content (str) on success, or None on failure.
            - The error log (str) on failure, or None on success.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        # Define file paths within the temporary directory
        tex_path = os.path.join(tmpdir, "document.tex")
        pdf_path = os.path.join(tmpdir, "document.pdf")
        
        # Write the LaTeX content to the .tex file
        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(content)

        try:
            # We run pdflatex from within the temporary directory using `cwd`.
            # This ensures all output files (.pdf, .log, etc.) are placed there.
            # We use `-interaction=nonstopmode` to prevent the compiler from
            # stopping on errors and waiting for user input.
            
            # First pass: Generates auxiliary files and resolves some references
            result1 = subprocess.run(
                ["pdflatex", "-interaction=nonstopmode", "document.tex"],
                cwd=tmpdir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=60
            )

            # Second pass: Crucial for resolving all cross-references, table of
            # contents, and other forward-references from the first pass.
            result2 = subprocess.run(
                ["pdflatex", "-interaction=nonstopmode", "document.tex"],
                cwd=tmpdir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=60
            )
            
            # The compilation log is a combination of stdout and stderr
            full_log = (result1.stdout + result1.stderr + result2.stdout + result2.stderr)

            # Check if the PDF file was successfully created
            if os.path.exists(pdf_path):
                # Read the PDF as binary data
                with open(pdf_path, "rb") as f:
                    pdf_bytes = f.read()
                # Encode the bytes to base64
                pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")
                return pdf_base64, None
            else:
                return None, full_log

        except FileNotFoundError:
            return None, "Error: pdflatex command not found. Please ensure it is installed and in your system's PATH."
        except subprocess.TimeoutExpired:
            return None, "Error: Compilation timed out."
        except Exception as e:
            return None, f"An unexpected error occurred: {str(e)}"