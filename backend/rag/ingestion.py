import re
import fitz  # PyMuPDF
from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy.orm import Session
from backend.models import UploadedDocument
from backend.rag.embeddings import create_collection, generate_embeddings, store_embeddings

def ingest_pdf(file_bytes: bytes, filename: str, company: str, report_type: str, db: Session):
    """
    Handles the full ingestion pipeline:
    1. Saves the PDF file.
    2. Creates a database record.
    3. Extracts text using PyMuPDF and cleans it.
    4. Chunks text using RecursiveCharacterTextSplitter.
    5. Generates embeddings and stores them in Qdrant.
    6. Updates database record to processed.
    """
    # 1. Save file to backend/data/reports/
    reports_dir = Path("backend/data/reports")
    reports_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = reports_dir / filename
    with open(file_path, "wb") as f:
        f.write(file_bytes)
        
    # 2. Create initial DB record
    db_doc = UploadedDocument(
        filename=filename,
        company=company,
        report_type=report_type,
        file_path=str(file_path),
        processed=False
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    # 3. Extract and clean text using PyMuPDF
    doc = fitz.open(file_path)
    total_pages = len(doc)
    
    pages_data = []
    for page_num in range(total_pages):
        page = doc[page_num]
        text = page.get_text("text")
        
        # Clean text: remove excessive whitespace but preserve paragraph structure loosely
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)
        
        if text.strip():
            pages_data.append({
                "page_num": page_num + 1,
                "text": text.strip()
            })
            
    doc.close()
            
    # 4. Chunk text using RecursiveCharacterTextSplitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", " ", ""]
    )
    
    chunks = []
    metadata_list = []
    
    for page_data in pages_data:
        page_chunks = text_splitter.split_text(page_data["text"])
        for chunk in page_chunks:
            chunks.append(chunk)
            metadata_list.append({
                "filename": filename,
                "company": company,
                "page_number": page_data["page_num"],
                "document_id": db_doc.id
            })
            
    # 5. Generate and store embeddings in Qdrant
    if chunks:
        create_collection()
        embeddings = generate_embeddings(chunks)
        store_embeddings(chunks, embeddings, metadata_list)
        
        # 6. Mark document as processed
        db_doc.processed = True
        db.commit()
        
    return {
        "filename": filename,
        "company": company,
        "pages": total_pages,
        "chunks_created": len(chunks),
        "embedding_count": len(chunks)
    }
