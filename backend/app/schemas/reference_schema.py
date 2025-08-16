from pydantic import BaseModel

class FetchBibtexRequest(BaseModel):
    identifier: str  # DOI or arXiv ID

class FetchBibtexResponse(BaseModel):
    bibtex: str

class CheckBibtexRequest(BaseModel):
    bibtex: str

class CheckBibtexResponse(BaseModel):
    cleaned_bibtex: str
    changes: str
