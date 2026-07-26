from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models import UploadedDocument
from backend.rag.ingestion import ingest_pdf
from backend.rag.retrieval import search_documents

router = APIRouter(prefix="/documents", tags=["Documents"])

class QueryRequest(BaseModel):
    question: str

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    company: str = Form(...),
    report_type: str = Form("Annual Report"),
    db: Session = Depends(get_db)
) -> dict:
    """
    Accepts a PDF file upload, saves it, extracts text, chunks it, 
    generates embeddings, and stores vectors in Qdrant.
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")
            
        result = ingest_pdf(
            file_bytes=content,
            filename=file.filename,
            company=company,
            report_type=report_type,
            db=db
        )
        return {
            "success": True,
            "message": "Document uploaded successfully.",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest document: {str(e)}")

@router.post("/query")
def query_documents(request: QueryRequest) -> dict:
    """
    Accepts a user question, converts it to an embedding, 
    and retrieves the most relevant semantic chunks from Qdrant.
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
        
    try:
        chunks = search_documents(request.question)
        return {
            "success": True,
            "message": "Documents queried successfully.",
            "data": chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query database: {str(e)}")

@router.get("/")
def get_documents(db: Session = Depends(get_db)) -> dict:
    """Get all uploaded documents."""
    try:
        docs = db.query(UploadedDocument).all()
        doc_list = []
        for doc in docs:
            doc_list.append({
                "id": doc.id,
                "filename": doc.filename,
                "company": doc.company,
                "report_type": doc.report_type,
                "upload_date": doc.upload_date.isoformat(),
                "file_path": doc.file_path,
                "processed": doc.processed
            })
        return {
            "success": True,
            "message": "Documents retrieved successfully.",
            "data": doc_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)) -> dict:
    """Delete an uploaded document by ID."""
    try:
        doc = db.query(UploadedDocument).filter(UploadedDocument.id == doc_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found.")
            
        # Optional: Delete from Qdrant vector database (can be implemented in rag/deletion.py later)
        # We just remove from Postgres for now.
        
        db.delete(doc)
        db.commit()
        return {
            "success": True,
            "message": "Document deleted successfully.",
            "data": None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
