import uuid
from typing import List, Dict, Any
from langchain_community.embeddings import HuggingFaceEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from backend.config import settings

# Load embedding model 
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def get_qdrant_client() -> QdrantClient:
    """Initialize and return a Qdrant client based on settings."""
    return QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY
    )

def create_collection(collection_name: str = "financial_documents"):
    """Create a Qdrant collection if it doesn't already exist."""
    client = get_qdrant_client()
    if not client.collection_exists(collection_name):
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE)
        )

def generate_embeddings(text_chunks: List[str]) -> List[List[float]]:
    """Generate vector embeddings for a list of text chunks."""
    return embedding_model.embed_documents(text_chunks)

def store_embeddings(
    chunks: List[str], 
    embeddings: List[List[float]], 
    metadata_list: List[Dict[str, Any]], 
    collection_name: str = "financial_documents"
):
    """Store chunks and their embeddings in Qdrant with metadata."""
    client = get_qdrant_client()
    points = []
    
    for chunk, emb, meta in zip(chunks, embeddings, metadata_list):
        # Merge text into payload
        payload = meta.copy()
        payload["text"] = chunk
        
        points.append(
            PointStruct(
                id=str(uuid.uuid4()),
                vector=emb,
                payload=payload
            )
        )
        
    # Batch upsert to avoid Qdrant Cloud payload size limits
    batch_size = 100
    for i in range(0, len(points), batch_size):
        batch = points[i:i + batch_size]
        client.upsert(
            collection_name=collection_name,
            points=batch
        )
