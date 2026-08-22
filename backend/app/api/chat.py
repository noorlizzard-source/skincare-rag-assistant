from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from app.models.schemas import ChatRequest, ChatResponse, UserProfile, GroundedResponse
from app.rag.vector_db import VectorDatabase
from app.rag.retrieval import Retriever
from app.rag.llm import LLMService
from app.services.questionnaire import QuestionnaireEngine
from app.services.recommender import RecommenderService

router = APIRouter()

# Global RAG dependencies
vector_db = VectorDatabase(db_file_path="./data/vector_store.json")
retriever = Retriever(vector_db)
llm_service = LLMService()
recommender = RecommenderService(catalog_path="./app/data/products.json")

@router.post("/chat", response_model=ChatResponse)
async def handle_chat(request: ChatRequest):
    try:
        profile = request.profile or UserProfile()
        user_message = request.message.strip()

        # 1. Process questionnaire response if provided
        if request.questionnaire_response:
            q_id = request.questionnaire_response.get("question_id")
            ans = request.questionnaire_response.get("answer")
            if q_id and ans:
                profile = QuestionnaireEngine.update_profile_with_answer(profile, q_id, ans)

        # 2. Append user message to conversation history
        profile.conversation_history.append({"role": "user", "content": user_message})

        # 3. Perform vector retrieval
        retrieved_chunks = retriever.retrieve(query=user_message, profile=profile, top_k=5)

        # 4. Generate grounded LLM response
        grounded_dict = llm_service.generate_grounded_response(
            user_message=user_message,
            retrieved_chunks=retrieved_chunks,
            profile=profile,
            product_catalog=recommender.catalog
        )

        # 5. Formulate structured response object
        structured_data = GroundedResponse(**grounded_dict)

        # 6. Update profile recommendations and history
        if structured_data.recommended_products:
            profile.recommended_products = [p.dict() for p in structured_data.recommended_products]
        if structured_data.what_to_avoid:
            profile.products_to_avoid = structured_data.what_to_avoid

        reply_text = f"**{structured_data.concern_summary}**\n\n{structured_data.consistent_with}\n\n*Review your personalized routine and product matches below.*"
        profile.conversation_history.append({"role": "assistant", "content": reply_text})

        # 7. Check if next questionnaire question is needed
        next_question = QuestionnaireEngine.get_next_question(profile)

        return ChatResponse(
            reply=reply_text,
            structured_data=structured_data,
            updated_profile=profile,
            next_question=next_question,
            sources=structured_data.sources
        )

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
