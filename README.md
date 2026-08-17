# RAG-Based Skincare AI Assistant

A complete, production-ready **RAG-based Skincare AI Assistant** web application that provides evidence-grounded skincare consultations, adaptive skin profiling, product matching, safety guardrails, knowledge base administration, and RAG evaluation benchmarks.

---

## 🌟 Key Features

1. **Evidence-Grounded RAG Pipeline**:
   - Ingests documents (PDF, TXT, Markdown, CSV, JSON).
   - Text cleaning, semantic chunking, and embedding generation.
   - Persistent vector index with cosine similarity & hybrid reranking.
   - Prompt Injection Protection (treats retrieved context strictly as untrusted data).

2. **Adaptive Consultation & Dynamic Questionnaire**:
   - Step-by-step skin profiling (skin type, main concern, routine, sensitivity, triggers).
   - Dynamically adapts subsequent questions based on missing profile fields.

3. **Multi-Part Grounded Response Format**:
   - **Reported Concern Summary**
   - **What It May Be Consistent With** (Non-diagnostic language)
   - **What You Can Try** (Morning AM & Evening PM routine timeline)
   - **Ingredients to Look For & Reasons**
   - **What to Avoid / Cautions**
   - **Matched Products from Knowledge Base** (Rich cards with suitability explanations & source citations)
   - **How to Start & Patch Testing Protocol**
   - **When to See a Board-Certified Dermatologist** (Red flag symptoms)
   - **Source Drawer** (Inspect exact retrieved chunks & similarity scores)

4. **Medical Boundaries & Safety Guardrails**:
   - Non-medical disclaimer ("consistent with...", referral for severe/painful/infected symptoms).
   - Protection against dangerous DIY hacks, extreme peeling, or unsafe chemical combinations.

5. **Admin RAG Dashboard**:
   - Document upload drag-and-drop.
   - View chunk count, metadata, and index stats.
   - Test vector retrieval similarity live.
   - Delete indexed documents.

6. **RAG Evaluation Suite**:
   - Automated evaluation testing retrieval relevance, groundedness scores, hallucination defense, and safety response compliance.

---

## 🏗️ Technical Stack

- **Backend**: Python (FastAPI, Uvicorn, Pydantic, PyPDF, Markdown, Google GenAI SDK / Local Fallback RAG Engine).
- **Frontend**: React (Vite, Tailwind CSS, Lucide Icons, Axios).
- **Vector DB**: Persistent local vector index with cosine similarity & character/subword TF-IDF embedding engine.
- **LLM Engine**: Google Gemini API (`gemini-2.5-flash`) with fallback grounded generator when API keys are omitted.

---

## 📁 Project Structure

```text
skincare-rag-assistant/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat.py         # Main consultation endpoint
│   │   │   ├── kb.py           # Admin Knowledge Base CRUD & Search
│   │   │   ├── profile.py      # Session memory & profile reset
│   │   │   ├── evaluation.py   # RAG evaluation benchmarks
│   │   │   └── products.py     # Catalog reference endpoints
│   │   ├── rag/
│   │   │   ├── ingestion.py    # Document parsers (PDF, TXT, MD, CSV, JSON)
│   │   │   ├── chunking.py     # Semantic text splitter
│   │   │   ├── embeddings.py   # Embedding engine
│   │   │   ├── vector_db.py    # Persistent vector database
│   │   │   ├── retrieval.py   # Query processing & reranking
│   │   │   ├── grounding.py   # RAG prompt safety & injection guard
│   │   │   └── llm.py         # LLM service & fallback generator
│   │   ├── models/
│   │   │   └── schemas.py      # Pydantic data schemas
│   │   ├── services/
│   │   │   ├── questionnaire.py # Adaptive question logic
│   │   │   └── recommender.py  # Product matching engine
│   │   ├── data/
│   │   │   ├── skincare_education.md # Core educational guide
│   │   │   ├── ingredients.json       # Ingredient database
│   │   │   └── products.json          # Product catalog
│   │   └── main.py
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── DynamicQuestionnaire.jsx
│   │   │   ├── StructuredResponse.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── SourceDrawer.jsx
│   │   │   ├── SkinProfileDashboard.jsx
│   │   │   ├── KbAdminDashboard.jsx
│   │   │   ├── RagEvalSuite.jsx
│   │   │   └── IngredientBrowser.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🚀 Setup & Run Instructions

### 1. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add your `LLM_API_KEY` for Google Gemini. If omitted, the system operates in fallback grounded RAG mode out-of-the-box!)*

### 2. Launch Backend (Python FastAPI)
```bash
cd backend
pip install -r requirements.txt
python run.py
```
Backend API will start at: `http://localhost:8000` (API documentation at `http://localhost:8000/docs`).

### 3. Launch Frontend (React + Vite)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend Web UI will open at: `http://localhost:3000`.

---

## 🔌 Core API Endpoints

- `POST /api/chat`: Submit consultation query or questionnaire response; returns grounded structured response & sources.
- `GET /api/kb/stats`: Get knowledge base document count, chunk count, and vector dimensions.
- `POST /api/kb/upload`: Upload PDF, TXT, MD, CSV, or JSON document to ingest and embed.
- `GET /api/kb/search`: Search vector database directly with query string.
- `DELETE /api/kb/document/{source_name}`: Delete document and associated chunks from vector index.
- `POST /api/profile/reset`: Reset session profile memory.
- `POST /api/eval/run`: Run RAG benchmark quality suite.
- `GET /api/products`: Retrieve catalog products.
- `GET /api/ingredients`: Retrieve ingredient reference guidelines.
