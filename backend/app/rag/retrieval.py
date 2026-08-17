import re
from typing import List, Dict, Any, Optional
from app.rag.vector_db import VectorDatabase
from app.models.schemas import UserProfile

class Retriever:
    """Handles context-aware query formulation, vector search, hybrid keyword boosting, and reranking."""

    def __init__(self, vector_db: VectorDatabase):
        self.vector_db = vector_db

    def build_query(self, user_message: str, profile: Optional[UserProfile] = None) -> str:
        """Formulates an enriched retrieval query combining user input and profile context."""
        parts = [user_message]

        if profile:
            if profile.main_concern:
                parts.append(f"concern: {profile.main_concern}")
            if profile.skin_type and profile.skin_type != "unsure":
                parts.append(f"skin type: {profile.skin_type}")
            if profile.sensitivity == "sensitive":
                parts.append("sensitive skin barrier irritation")

        return " ".join(parts)

    def retrieve(
        self,
        query: str,
        profile: Optional[UserProfile] = None,
        top_k: int = 5,
        min_score: float = 0.05
    ) -> List[Dict[str, Any]]:
        """Retrieves and reranks top relevant knowledge chunks."""
        search_query = self.build_query(query, profile)
        raw_results = self.vector_db.search(query=search_query, top_k=top_k * 2, min_score=min_score)

        if not raw_results:
            # Fallback: try raw user query alone
            raw_results = self.vector_db.search(query=query, top_k=top_k * 2, min_score=0.01)

        # Rerank with keyword overlap boost for specific skincare terms
        reranked = self.rerank(raw_results, query, profile)
        return reranked[:top_k]

    def rerank(
        self,
        results: List[Dict[str, Any]],
        query: str,
        profile: Optional[UserProfile] = None
    ) -> List[Dict[str, Any]]:
        """Applies domain keyword boosting and skin-type compatibility scoring."""
        query_words = set(re.findall(r'\b\w+\b', query.lower()))

        for res in results:
            text_lower = res["text"].lower()
            meta = res.get("metadata", {})
            score = res["score"]

            # Exact keyword matching boost
            matched_words = sum(1 for w in query_words if w in text_lower and len(w) > 3)
            score += matched_words * 0.05

            # Skin type compatibility boost
            if profile and profile.skin_type and profile.skin_type != "unsure":
                if profile.skin_type.lower() in text_lower or profile.skin_type.lower() in meta.get("skin_types", []):
                    score += 0.08

            # Main concern boost
            if profile and profile.main_concern:
                if profile.main_concern.lower() in text_lower or profile.main_concern.lower() in meta.get("concerns", []):
                    score += 0.1

            res["score"] = round(score, 4)

        # Sort descending by updated score
        results.sort(key=lambda x: x["score"], reverse=True)
        return results
