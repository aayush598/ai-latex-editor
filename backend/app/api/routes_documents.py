from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.document_schema import Document, DocumentCreate, DocumentUpdate
from app.db import crud
from app.core.auth import verify_token  # use JWT to get user info

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/", response_model=Document)
def create_doc(doc: DocumentCreate, user=Depends(verify_token)):
    doc_id = crud.create_document(doc.title, doc.content, user["supabase_uid"])
    return {"id": doc_id, "title": doc.title, "content": doc.content, "supabase_uid": user["supabase_uid"]}

@router.get("/{doc_id}", response_model=Document)
def read_doc(doc_id: int, user=Depends(verify_token)):
    document = crud.get_document(doc_id, user["supabase_uid"])
    if not document:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
    return document

@router.get("/", response_model=List[Document])
def read_all_docs(user=Depends(verify_token)):
    return crud.get_all_documents(user["supabase_uid"])

@router.put("/{doc_id}", response_model=Document)
def update_doc(doc_id: int, doc: DocumentUpdate, user=Depends(verify_token)):
    success = crud.update_document(doc_id, user["supabase_uid"], doc.title, doc.content)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
    return crud.get_document(doc_id, user["supabase_uid"])

@router.delete("/{doc_id}")
def delete_doc(doc_id: int, user=Depends(verify_token)):
    success = crud.delete_document(doc_id, user["supabase_uid"])
    if not success:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
    return {"message": "Document deleted"}
