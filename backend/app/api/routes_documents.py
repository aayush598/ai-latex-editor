from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.document_schema import Document, DocumentCreate, DocumentUpdate
from app.db import crud

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/", response_model=Document)
def create_doc(doc: DocumentCreate):
    doc_id = crud.create_document(doc.title, doc.content)
    return {"id": doc_id, "title": doc.title, "content": doc.content}

@router.get("/{doc_id}", response_model=Document)
def read_doc(doc_id: int):
    document = crud.get_document(doc_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.get("/", response_model=List[Document])
def read_all_docs():
    return crud.get_all_documents()

@router.put("/{doc_id}", response_model=Document)
def update_doc(doc_id: int, doc: DocumentUpdate):
    success = crud.update_document(doc_id, doc.title, doc.content)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return crud.get_document(doc_id)

@router.delete("/{doc_id}")
def delete_doc(doc_id: int):
    success = crud.delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted"}
