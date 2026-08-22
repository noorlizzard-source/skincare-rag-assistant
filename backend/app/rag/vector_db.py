import os
import json
import numpy as np
from typing import List, Dict, Any, Optional
from app.rag.embeddings import EmbeddingEngine

class VectorDatabase:
    """In-memory persistent vector database supporting similarity search and metadata filtering."""

    def __init__(self, db_file_path: str = "./data/vector_store.json"):
        self.db_file_path = db_file_path
        self.chunks: List[Dict[str, Any]] = []
        self.embeddings: List[List[float]] = []
        self.embedding_engine = EmbeddingEngine(vector_dim=384)
        self.load_or_initialize()

    def load_or_initialize(self):
        """Loads index from disk if present."""
        if os.path.exists(self.db_file_path):
            try:
                with open(self.db_file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.chunks = data.get("chunks", [])
                    self.embeddings = data.get("embeddings", [])
                    vocab = data.get("vocab", {})
                    idf = data.get("idf", {})
                    if vocab and idf:
                        self.embedding_engine.vocabulary = vocab
                        self.embedding_engine.idf = idf
                        self.embedding_engine.is_fitted = True
            except Exception as e:
                print(f"Error loading vector DB: {e}. Starting fresh.")
                self.chunks = []
                self.embeddings = []

    def save(self):
        """Persists chunks, embeddings, and vocabulary mapping to JSON file."""
        os.makedirs(os.path.dirname(self.db_file_path), exist_ok=True)
        data = {
            "chunks": self.chunks,
            "embeddings": self.embeddings,
            "vocab": self.embedding_engine.vocabulary,
            "idf": self.embedding_engine.idf
        }
        with open(self.db_file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)

    def add_chunks(self, chunks: List[Dict[str, Any]]):
        """Fits embedding engine on new chunks if needed, embeds, and stores chunks."""
        if not chunks:
            return

        all_texts = [c["text"] for c in chunks]
        
        # Refit engine if corpus changes significantly
        existing_texts = [c["text"] for c in self.chunks] + all_texts
        self.embedding_engine.fit(existing_texts)
        
        # Re-embed all chunks with updated fitting for consistency
        self.chunks.extend(chunks)
        self.embeddings = self.embedding_engine.embed_batch([c["text"] for c in self.chunks])
        self.save()

    def search(self, query: str, top_k: int = 5, min_score: float = 0.05, filter_meta: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Performs cosine similarity search against query vector with optional metadata filtering."""
        if not self.chunks or not self.embeddings:
            return []

        query_vec = np.array(self.embedding_engine.embed_text(query), dtype=np.float32)
        norm_q = np.linalg.norm(query_vec)
        if norm_q == 0:
            return []

        doc_matrix = np.array(self.embeddings, dtype=np.float32)
        scores = np.dot(doc_matrix, query_vec)

        # Sort indices descending
        ranked_indices = np.argsort(scores)[::-1]

        results = []
        for idx in ranked_indices:
            score = float(scores[idx])
            if score < min_score:
                break
            
            chunk = self.chunks[idx]
            
            # Check metadata filter if specified
            if filter_meta:
                match = True
                for k, v in filter_meta.items():
                    chunk_meta = chunk.get("metadata", {})
                    if k in chunk_meta:
                        if isinstance(chunk_meta[k], list) and v not in chunk_meta[k]:
                            match = False
                        elif not isinstance(chunk_meta[k], list) and chunk_meta[k] != v:
                            match = False
                if not match:
                    continue

            results.append({
                "chunk_id": chunk.get("chunk_id", str(idx)),
                "text": chunk["text"],
                "metadata": chunk.get("metadata", {}),
                "score": round(score, 4)
            })

            if len(results) >= top_k:
                break

        return results

    def delete_by_source(self, source_name: str) -> int:
        """Deletes all chunks belonging to a specific source document."""
        initial_count = len(self.chunks)
        new_chunks = []
        new_embeddings = []

        for i, c in enumerate(self.chunks):
            if c.get("metadata", {}).get("source") != source_name:
                new_chunks.append(c)
                if i < len(self.embeddings):
                    new_embeddings.append(self.embeddings[i])

        self.chunks = new_chunks
        self.embeddings = new_embeddings
        self.save()
        return initial_count - len(self.chunks)

    def clear(self):
        self.chunks = []
        self.embeddings = []
        self.save()
