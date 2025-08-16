from pydantic import BaseModel

class GenerateLatexRequest(BaseModel):
    prompt: str

class GenerateLatexResponse(BaseModel):
    latex: str

class ExplainLatexRequest(BaseModel):
    code: str

class ExplainLatexResponse(BaseModel):
    explanation: str
