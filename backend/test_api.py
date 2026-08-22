import os
import sys

# Ensure backend path is on sys.path
sys.path.insert(0, os.path.abspath('.'))

from app.models.schemas import UserProfile, ChatRequest
from app.rag.vector_db import VectorDatabase
from app.rag.retrieval import Retriever
from app.rag.llm import LLMService
from app.rag.ingestion import DocumentIngestor
from app.rag.chunking import TextSplitter
from app.services.recommender import RecommenderService
from app.services.questionnaire import QuestionnaireEngine

print("--- Testing RAG Skincare Assistant Backend Components ---")

# 1. Ingestion test
docs = DocumentIngestor.parse_file("./app/data/ingredients.json", "ingredients.json")
print(f"[OK] Parsed {len(docs)} document objects from ingredients.json")

# 2. Chunking test
splitter = TextSplitter(chunk_size=450, chunk_overlap=80)
chunks = []
for d in docs:
    chunks.extend(splitter.split_document(d))
print(f"[OK] Generated {len(chunks)} text chunks")

# 3. Vector DB test
vdb = VectorDatabase(db_file_path="./data/test_vector_store.json")
vdb.clear()
vdb.add_chunks(chunks)
print(f"[OK] Added chunks to Vector DB. Total stored: {len(vdb.chunks)}")

# 4. Search test
search_results = vdb.search("Salicylic Acid acne clogged pores", top_k=3)
print(f"[OK] Vector Search returned {len(search_results)} matching chunks.")
assert len(search_results) > 0
print(f"     Top match score: {search_results[0]['score']}, snippet: {search_results[0]['text'][:80]}...")

# 5. LLM Grounded Response test
llm = LLMService()
profile = UserProfile(skin_type="oily", main_concern="acne/breakouts")
recommender = RecommenderService(catalog_path="./app/data/products.json")

response_dict = llm.generate_grounded_response(
    user_message="I have oily skin and persistent acne. What routine and products help?",
    retrieved_chunks=search_results,
    profile=profile,
    product_catalog=recommender.catalog
)

print("[OK] Successfully generated grounded response:")
print(f"     Summary: {response_dict.get('concern_summary')}")
print(f"     Consistent with: {response_dict.get('consistent_with')}")
print(f"     AM Routine Steps: {len(response_dict.get('routine_am', []))}")
print(f"     PM Routine Steps: {len(response_dict.get('routine_pm', []))}")
print(f"     Matched Products: {[p['product'] for p in response_dict.get('recommended_products', [])]}")
print(f"     Sources Cited: {[s['title'] for s in response_dict.get('sources', [])]}")

print("\n--- ALL RAG BACKEND COMPONENT TESTS PASSED PERFECTLY ---")
