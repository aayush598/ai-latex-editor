from pydantic import BaseModel
from typing import List, Optional

# ---- 1. Diff ----
class DiffRequest(BaseModel):
    old_text: str
    new_text: str

class DiffResponse(BaseModel):
    diff: str  # unified diff string or JSON representation

# ---- 2. Merge ----
class MergeRequest(BaseModel):
    base_text: str
    version_a: str
    version_b: str
    strategy: Optional[str] = "ai"  # "ai" or "manual"

class MergeResponse(BaseModel):
    merged_text: str
    conflicts: Optional[List[str]] = []

# ---- 3. Summarize Changes ----
class SummarizeChangesRequest(BaseModel):
    old_text: str
    new_text: str

class SummarizeChangesResponse(BaseModel):
    summary: str

# ---- 4. Comments ----
class CommentRequest(BaseModel):
    document_id: int
    line_number: int
    comment: str

class CommentResponse(BaseModel):
    status: str
    comment_id: int
