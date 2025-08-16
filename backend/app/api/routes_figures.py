from fastapi import APIRouter, HTTPException
from app.schemas.figure_schema import (
    GenerateTableRequest, GenerateTableResponse,
    GeneratePlotRequest, GeneratePlotResponse,
    GenerateDiagramRequest, GenerateDiagramResponse
)
from app.services.figure_service import generate_table, generate_plot, generate_diagram

router = APIRouter(prefix="/figures", tags=["Figures & Tables"])

@router.post("/generate-table", response_model=GenerateTableResponse)
def generate_table_endpoint(req: GenerateTableRequest):
    try:
        latex = generate_table(req)
        return {"latex": latex}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/generate-plot", response_model=GeneratePlotResponse)
def generate_plot_endpoint(req: GeneratePlotRequest):
    try:
        latex = generate_plot(req)
        return {"latex": latex}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/generate-diagram", response_model=GenerateDiagramResponse)
def generate_diagram_endpoint(req: GenerateDiagramRequest):
    try:
        latex = generate_diagram(req)
        return {"latex": latex}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
