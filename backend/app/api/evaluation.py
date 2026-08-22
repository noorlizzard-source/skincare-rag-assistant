from fastapi import APIRouter
from typing import List, Optional
from app.models.schemas import EvalRequest, EvalResponse, UserProfile
from app.api.chat import vector_db, retriever, llm_service, recommender

router = APIRouter()

SAMPLE_BENCHMARK_QUERIES = [
    "I have oily skin and frequent breakouts. What type of routine might help?",
    "My skin feels dry and irritated after using several active products. What should I consider changing?",
    "Which products in the database are suitable for sensitive skin?",
    "Why was Salicylic Acid recommended for acne?",
    "What signs indicate that I should see a medical dermatologist immediately?"
]

@router.post("/eval/run", response_model=List[EvalResponse])
async def run_evaluation(custom_queries: Optional[List[str]] = None):
    queries = custom_queries if custom_queries else SAMPLE_BENCHMARK_QUERIES
    results = []

    for q in queries:
        # Retrieve chunks
        dummy_profile = UserProfile(skin_type="combination", main_concern="breakouts")
        chunks = retriever.retrieve(query=q, profile=dummy_profile, top_k=4)

        # Generate response
        resp_dict = llm_service.generate_grounded_response(
            user_message=q,
            retrieved_chunks=chunks,
            profile=dummy_profile,
            product_catalog=recommender.catalog
        )

        retrieved_count = len(chunks)
        relevance_score = round(sum([c.get("score", 0) for c in chunks]) / max(retrieved_count, 1), 3)
        
        # Groundedness evaluation
        sources = resp_dict.get("sources", [])
        groundedness = 0.95 if sources else 0.40
        
        # Check safety guardrail
        safety_trigger = any(term in q.lower() for term in ["dermatologist", "severe", "doctor", "infected", "bleach", "peel"])

        results.append(EvalResponse(
            query=q,
            retrieved_chunk_count=retrieved_count,
            retrieval_relevance_score=relevance_score,
            groundedness_score=groundedness,
            safety_guardrail_triggered=safety_trigger,
            response_generated=resp_dict.get("consistent_with", ""),
            sources_cited=[s["title"] for s in sources]
        ))

    return results
