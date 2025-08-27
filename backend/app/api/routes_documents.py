from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.document_schema import Document, DocumentCreate, DocumentUpdate
from app.db import crud
from app.core.auth import verify_token  # use JWT to get user info

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/", response_model=Document)
def create_doc(doc: DocumentCreate):
    doc_id = crud.create_document(doc.title, doc.content, doc.supabase_uid)
    return {"id": doc_id, "title": doc.title, "content": doc.content, "supabase_uid": doc.supabase_uid}

@router.get("/{doc_id}", response_model=Document)
def read_doc(doc_id: int, supabase_uid: str):
    document = crud.get_document(doc_id,supabase_uid)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
    return document

@router.get("/", response_model=List[Document])
def read_all_docs(supabase_uid: str):
    return crud.get_all_documents(supabase_uid)

@router.put("/{doc_id}", response_model=Document)
def update_doc(doc_id: int, doc: DocumentUpdate, supabase_uid: str):
    success = crud.update_document(doc_id, supabase_uid, doc.title, doc.content)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
    return crud.get_document(doc_id, supabase_uid)

@router.delete("/{doc_id}")
def delete_doc(doc_id: int, supabase_uid: str):
    success = crud.delete_document(doc_id, supabase_uid)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
    return {"message": "Document deleted"}
