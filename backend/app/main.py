import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.api import chat, kb, profile, evaluation, products, auth
from app.api.chat import vector_db
from app.rag.ingestion import DocumentIngestor
from app.rag.chunking import TextSplitter

app = FastAPI(
    title="RAG-Based Skincare AI Assistant API",
    description="Evidence-grounded skincare consultation, product recommendations, safety guardrails, admin authentication, and knowledge base administration.",
    version="2.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(chat.router, prefix="/api", tags=["Chat & Consultation"])
app.include_router(kb.router, prefix="/api", tags=["Knowledge Base Admin"])
app.include_router(profile.router, prefix="/api", tags=["User Profile"])
app.include_router(evaluation.router, prefix="/api", tags=["RAG Evaluation"])
app.include_router(products.router, prefix="/api", tags=["Product Catalog"])
app.include_router(auth.router, prefix="/api", tags=["Admin Authentication"])

@app.on_event("startup")
async def startup_event():
    """Automatically ingests sample skincare dataset on startup if vector database is empty."""
    if len(vector_db.chunks) == 0:
        print("Vector database empty. Pre-indexing default skincare knowledge base...")
        sample_files = [
            ("./app/data/ingredients.json", "ingredients.json"),
            ("./app/data/products.json", "products.json"),
            ("./app/data/skincare_education.md", "skincare_education.md")
        ]

        splitter = TextSplitter(chunk_size=450, chunk_overlap=80)
        all_chunks = []

        for file_path, filename in sample_files:
            if os.path.exists(file_path):
                docs = DocumentIngestor.parse_file(file_path, filename)
                for d in docs:
                    all_chunks.extend(splitter.split_document(d))

        vector_db.add_chunks(all_chunks)
        print(f"Pre-indexing complete! {len(vector_db.chunks)} chunks ready in vector database.")

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "RAG-Based Skincare AI Assistant",
        "version": "2.0.0",
        "vector_chunks_indexed": len(vector_db.chunks)
    }
