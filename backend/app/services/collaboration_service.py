import difflib
from app.schemas.collaboration_schema import (
    DiffRequest, MergeRequest, SummarizeChangesRequest, CommentRequest
)
from app.services.ai_service import client

from app.db import crud
from app.schemas.collaboration_schema import CommentRequest

# ---- 1. Diff ----
def generate_diff(req: DiffRequest) -> str:
    diff = difflib.unified_diff(
        req.old_text.splitlines(),
        req.new_text.splitlines(),
        fromfile="old",
        tofile="new",
        lineterm=""
    )
    return "\n".join(diff)

# ---- 2. Merge ----
def merge_versions(req: MergeRequest):
    """
    AI-assisted merge between version_a and version_b given a base_text.
    """
    if req.strategy == "manual":
        # naive merge: concatenate with conflict markers
        merged = f"<<<<<<< VERSION A\n{req.version_a}\n=======\n{req.version_b}\n>>>>>>> VERSION B"
        return merged, ["Manual conflict resolution required"]

    # AI strategy
    prompt = (
        "You are a LaTeX-aware merge assistant. "
        "Given a base version and two edited versions, merge them intelligently. "
        "Preserve LaTeX syntax. Resolve conflicts gracefully.\n\n"
        f"BASE:\n{req.base_text}\n\nVERSION A:\n{req.version_a}\n\nVERSION B:\n{req.version_b}"
    )
    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return resp.text.strip(), []

# ---- 3. Summarize Changes ----
def summarize_changes(req: SummarizeChangesRequest) -> str:
    diff = generate_diff(DiffRequest(old_text=req.old_text, new_text=req.new_text))
    prompt = (
        "Summarize the following LaTeX document changes in plain English, focusing on "
        "sections, equations, and figures:\n\n" + diff
    )
    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return resp.text.strip()

# ---- 4. Comments ----

def add_comment(req: CommentRequest):
    try:
        comment_id = crud.add_comment(req.document_id, req.line_number, req.comment)
        return {"id": comment_id, "document_id": req.document_id, "line_number": req.line_number, "comment": req.comment}
    except ValueError as e:
        raise e

def get_comments_for_doc(document_id: int):
    return crud.get_comments(document_id)

def delete_comment_by_id(comment_id: int):
    return crud.delete_comment(comment_id)