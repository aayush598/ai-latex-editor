from fastapi import APIRouter, HTTPException
from app.schemas.collaboration_schema import (
    DiffRequest, DiffResponse,
    MergeRequest, MergeResponse,
    SummarizeChangesRequest, SummarizeChangesResponse,
    CommentRequest, CommentResponse
)
from app.services.collaboration_service import (
    generate_diff, merge_versions, summarize_changes,
    add_comment, get_comments_for_doc, delete_comment_by_id
)

router = APIRouter(prefix="/collaboration", tags=["Collaboration"])

@router.post("/diff", response_model=DiffResponse)
def diff_endpoint(req: DiffRequest):
    try:
        diff = generate_diff(req)
        return {"diff": diff}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/merge", response_model=MergeResponse)
def merge_endpoint(req: MergeRequest):
    try:
        merged, conflicts = merge_versions(req)
        return {"merged_text": merged, "conflicts": conflicts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize-changes", response_model=SummarizeChangesResponse)
def summarize_changes_endpoint(req: SummarizeChangesRequest):
    try:
        summary = summarize_changes(req)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/comment", response_model=CommentResponse)
def comment_endpoint(req: CommentRequest):
    try:
        comment = add_comment(req)
        return {"status": "saved", "comment_id": comment["id"]}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/comments/{document_id}")
def get_comments_endpoint(document_id: int):
    try:
        comments = get_comments_for_doc(document_id)
        return {"document_id": document_id, "comments": comments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/comment/{comment_id}")
def delete_comment_endpoint(comment_id: int):
    try:
        deleted = delete_comment_by_id(comment_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Comment not found")
        return {"status": "deleted", "comment_id": comment_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
