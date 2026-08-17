from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class UserProfile(BaseModel):
    age_range: Optional[str] = "unsure"
    skin_type: Optional[str] = "unsure" # oily, dry, combination, normal, sensitive, unsure
    main_concern: Optional[str] = None # acne/breakouts, dryness, oiliness, redness, dark spots, clogged pores, etc.
    secondary_concerns: List[str] = Field(default_factory=list)
    sensitivity: Optional[str] = "normal" # sensitive, highly sensitive, normal
    current_routine: Dict[str, Any] = Field(default_factory=dict) # cleanser, moisturizer, sunscreen, actives
    recent_product_introduced: Optional[bool] = False
    reported_triggers: List[str] = Field(default_factory=list)
    previous_answers: Dict[str, Any] = Field(default_factory=dict)
    recommended_products: List[Dict[str, Any]] = Field(default_factory=list)
    products_to_avoid: List[str] = Field(default_factory=list)
    conversation_history: List[Dict[str, str]] = Field(default_factory=list)

class QuestionnaireQuestion(BaseModel):
    question_id: str
    text: str
    options: List[str]
    allow_custom: bool = True
    category: str # basic, concern, routine, lifestyle

class ChatRequest(BaseModel):
    message: str
    profile: Optional[UserProfile] = None
    questionnaire_response: Optional[Dict[str, Any]] = None

class DocumentChunk(BaseModel):
    chunk_id: str
    text: str
    metadata: Dict[str, Any]

class SearchResult(BaseModel):
    chunk_id: str
    text: str
    metadata: Dict[str, Any]
    score: float

class RecommendedProduct(BaseModel):
    id: str
    brand: str
    product: str
    category: str
    ingredients: List[str]
    skin_types: List[str]
    why_suitable: str
    cautions: List[str]
    source: str

class GroundedResponse(BaseModel):
    concern_summary: str
    consistent_with: str
    routine_am: List[str]
    routine_pm: List[str]
    ingredients_to_look_for: List[Dict[str, str]] # {"name": "", "reason": ""}
    what_to_avoid: List[str]
    recommended_products: List[RecommendedProduct]
    how_to_start: str
    when_to_see_dermatologist: str
    sources: List[Dict[str, Any]]
    disclaimer: str

class ChatResponse(BaseModel):
    reply: str
    structured_data: Optional[GroundedResponse] = None
    updated_profile: UserProfile
    next_question: Optional[QuestionnaireQuestion] = None
    sources: List[Dict[str, Any]] = Field(default_factory=list)

class KBStats(BaseModel):
    total_documents: int
    total_chunks: int
    document_titles: List[str]
    vector_dimension: int

class EvalRequest(BaseModel):
    query: str
    expected_keywords: Optional[List[str]] = Field(default_factory=list)

class EvalResponse(BaseModel):
    query: str
    retrieved_chunk_count: int
    retrieval_relevance_score: float
    groundedness_score: float
    safety_guardrail_triggered: bool
    response_generated: str
    sources_cited: List[str]
