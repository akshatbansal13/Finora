from typing import List, Dict, Any
from backend.rag.embeddings import get_qdrant_client, embedding_model

def search_documents(query: str, top_k: int = 5, collection_name: str = "financial_documents") -> List[Dict[str, Any]]:
    """
    Retrieves the most semantically relevant chunks for a given query.
    1. Converts query to an embedding using the same HuggingFace model.
    2. Searches the Qdrant vector database.
    3. Returns top-k matching chunks with similarity scores and metadata.
    """
    client = get_qdrant_client()
    
    # Generate embedding for the query(embed_query handles single string vs list properly for search)
    query_vector = embedding_model.embed_query(query)
    
    # Search Qdrant collection
    search_results = client.query_points(
        collection_name=collection_name,
        query=query_vector,
        limit=top_k
    ).points
    
    results = []
    for hit in search_results:
        results.append({
            "text": hit.payload.get("text", ""),
            "score": hit.score,
            "metadata": {
                k: v for k, v in hit.payload.items() if k != "text"
            }
        })
        
    return results
