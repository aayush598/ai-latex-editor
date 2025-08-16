import requests
import re
from app.schemas.reference_schema import FetchBibtexRequest, CheckBibtexRequest

CROSSREF_API = "https://api.crossref.org/works/"
ARXIV_API = "http://export.arxiv.org/api/query?id_list="

def fetch_bibtex(request: FetchBibtexRequest) -> str:
    """
    Fetch BibTeX entry from DOI or arXiv ID.
    """
    identifier = request.identifier.strip()

    # DOI handling
    if identifier.startswith("10."):
        url = f"https://doi.org/{identifier}"
        headers = {"Accept": "application/x-bibtex"}
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code == 200:
            return r.text.strip()
        else:
            raise ValueError(f"DOI not found: {identifier}")

    # arXiv handling
    elif identifier.lower().startswith("arxiv:") or re.match(r"^\d{4}\.\d{4,5}$", identifier):
        arxiv_id = identifier.replace("arxiv:", "")
        url = f"http://arxiv.org/bibtex/{arxiv_id}"
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            return r.text.strip()
        else:
            raise ValueError(f"arXiv ID not found: {identifier}")

    else:
        raise ValueError("Identifier must be a DOI (10.xxxx) or arXiv ID")

def check_bibtex(request: CheckBibtexRequest) -> dict:
    """
    Clean BibTeX: deduplicate fields, enforce lowercase keys, consistent spacing.
    """
    bibtex = request.bibtex.strip()

    # Normalize field names to lowercase
    cleaned = re.sub(r"([A-Za-z]+)\s*=", lambda m: m.group(1).lower() + " =", bibtex)

    # Deduplicate fields (keep first occurrence)
    seen = set()
    lines = []
    changes = []
    for line in cleaned.splitlines():
        field_match = re.match(r"\s*([a-z]+)\s*=", line)
        if field_match:
            field = field_match.group(1)
            if field in seen:
                changes.append(f"Removed duplicate field: {field}")
                continue
            seen.add(field)
        lines.append(line)

    return {
        "cleaned_bibtex": "\n".join(lines),
        "changes": "\n".join(changes) if changes else "No changes"
    }
