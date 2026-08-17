import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import List, Dict, Any
from app.rag.ingestion import DocumentIngestor
from app.rag.chunking import TextSplitter
from app.api.chat import vector_db
from app.models.schemas import KBStats, SearchResult

router = APIRouter()
UPLOAD_DIR = "./data/uploads"

@router.get("/kb/stats", response_model=KBStats)
async def get_kb_stats():
    sources = set()
    for c in vector_db.chunks:
        s = c.get("metadata", {}).get("source")
        if s:
            sources.add(s)
    return KBStats(
        total_documents=len(sources),
        total_chunks=len(vector_db.chunks),
        document_titles=list(sources),
        vector_dimension=vector_db.embedding_engine.vector_dim
    )

@router.post("/kb/upload")
async def upload_document(file: UploadFile = File(...)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    temp_path = os.path.join(UPLOAD_DIR, file.filename)

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1. Parse document
        raw_docs = DocumentIngestor.parse_file(temp_path, file.filename)

        # 2. Chunk document
        splitter = TextSplitter(chunk_size=450, chunk_overlap=80)
        chunks = []
        for doc in raw_docs:
            doc_chunks = splitter.split_document(doc)
            chunks.extend(doc_chunks)

        # 3. Add to vector store
        vector_db.add_chunks(chunks)

        return {
            "filename": file.filename,
            "parsed_documents": len(raw_docs),
            "created_chunks": len(chunks),
            "status": "successfully indexed"
        }

    except Exception as e:
        print(f"Ingestion error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to ingest document: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.get("/kb/search", response_model=List[SearchResult])
async def search_kb(query: str = Query(..., min_length=1), top_k: int = 5):
    results = vector_db.search(query=query, top_k=top_k, min_score=0.0)
    return [
        SearchResult(
            chunk_id=r.get("chunk_id", "id"),
            text=r["text"],
            metadata=r.get("metadata", {}),
            score=r.get("score", 0.0)
        )
        for r in results
    ]

@router.delete("/kb/document/{source_name}")
async def delete_document(source_name: str):
    removed = vector_db.delete_by_source(source_name)
    return {"source": source_name, "removed_chunks": removed, "status": "deleted"}
