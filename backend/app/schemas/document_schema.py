from pydantic import BaseModel
from typing import Optional

class DocumentBase(BaseModel):
    title: str
    content: str
    supabase_uid: str

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class Document(DocumentBase):
    id: int

    class Config:
        orm_mode = True
