import subprocess
import tempfile
import base64
import os

def compile_latex(content: str):
    """
    Compile LaTeX to PDF using tectonic.
    Returns (pdf_base64, error_log).
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        tex_path = os.path.join(tmpdir, "document.tex")
        pdf_path = os.path.join(tmpdir, "document.pdf")

        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(content)

        try:
            result = subprocess.run(
                ["./tectonic", tex_path, "--outdir", tmpdir],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=60
            )
        except Exception as e:
            return None, str(e)

        if os.path.exists(pdf_path):
            with open(pdf_path, "rb") as f:
                pdf_bytes = f.read()
            pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")
            return pdf_base64, None
        else:
            return None, result.stdout + "\n" + result.stderr
