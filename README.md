# Legal AI — Autonomous Contract Intelligence & RAG Ecosystem

A production-grade, 4-tier Legal AI Assistant designed for law firms, in-house counsel, and corporate enterprises. The ecosystem ingests legal agreements (PDFs), extracts text and clause structures, generates sub-clause vector embeddings stored persistently in **ChromaDB**, synthesizes executive risk insights and lawyer checklists using **Google Gemini**, stores analysis and chat histories in **Supabase PostgreSQL** (with instant local SQLite fallback), and presents a state-of-the-art **React.js SPA** ready for global deployment on **Cloudflare Pages**.

---

## High-Level Architecture Flow

```
[ User Browser ]
       │
       ▼ (HTTPS / Global Anycast CDN)
[ Cloudflare Pages ] ──(Hosts Static SPA)──► React.js Frontend SPA
       │                                        ├── Contract Upload & PDF Parser Dropzone
       ├──(Reverse Proxy: /api/*)              ├── Analysis View (Summary, Risk Flags, Checklist)
       ▼                                        └── Interactive RAG Chat Panel
[ Python FastAPI Backend ]
       ├── 1. PDF Parser (pypdf: clean clause extraction)
       ├── 2. Chunking & Local Vector DB (ChromaDB persistent collection)
       └── 3. Gemini API Client (Legal prompt engineering, risk scoring, RAG Q&A)
       │
       ▼
[ Supabase (PostgreSQL Database) ]
       └── Tables: users, documents, analyses, chat_messages (with SQLite fallback)
```

---

## Key Features

- **Document Ingestion & Parsing**: Extract structured text from complex corporate PDF contracts while preserving page numbers and paragraph boundaries.
- **Persistent Local Vector DB (ChromaDB)**: Chunks contracts with intelligent legal clause boundaries (800-char window, 150-char overlap) and indexes them into ChromaDB for filtered similarity search.
- **AI-Powered Risk Assessment**: Analyzes indemnification exposure, liability caps, termination cure periods, governing law, and non-solicitation restrictions to calculate an overall risk rating (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- **Actionable Lawyer Checklist**: Interactive negotiation task checklist with priority flags (`Immediate`, `Recommended`, `Standard`) and progress tracking.
- **Interactive Contract RAG Assistant**: Ask any follow-up question regarding the active contract; queries ChromaDB for relevant clauses and provides answers grounded with page and excerpt citations.
- **Dual Database Strategy**: Direct connection to **Supabase PostgreSQL** using the provided `supabase_schema.sql`, plus transparent embedded **SQLite** fallback for zero-configuration local usage.
- **Cloudflare Edge Deployment Ready**: Includes `_routes.json`, `wrangler.toml`, and comprehensive multi-tier deployment instructions in `cloudflare/DEPLOYMENT_GUIDE.md`.

---

## Directory Structure

```
legal AI/
│
├── frontend/                     # React.js application (Vite + Modern Vanilla CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Branding & live microservice indicators
│   │   │   ├── FileUpload.jsx    # Drag-and-drop PDF dropzone + 1-click sample loaders
│   │   │   ├── DocumentHistory.jsx # Stored contract library with delete actions
│   │   │   ├── AnalysisView.jsx  # Executive summary, key provisions & risk dashboard
│   │   │   ├── RiskFlagsCard.jsx # Categorized risk flags with clause citations
│   │   │   ├── ChecklistCard.jsx # Interactive lawyer renegotiation checklist
│   │   │   └── ChatPanel.jsx     # RAG conversational interface with source chips
│   │   ├── services/
│   │   │   └── api.js            # API client communication layer
│   │   ├── App.jsx               # Workspace layout & view mode coordinator
│   │   ├── index.css             # Ultra-premium legal dark-mode design system
│   │   └── main.jsx
│   ├── public/
│   │   ├── _routes.json          # Cloudflare Pages edge routing rules
│   │   └── sample_contracts/     # Ready-to-use sample PDFs
│   ├── vite.config.js            # Vite configuration with /api proxy to FastAPI
│   └── package.json
│
├── backend-fastapi/              # Python FastAPI RAG microservice
│   ├── api/
│   │   ├── document_routes.py    # PDF upload, chunking, and metadata endpoints
│   │   └── agent_routes.py       # ChromaDB similarity search & RAG Q&A endpoints
│   ├── core/
│   │   ├── rag_service.py        # Persistent ChromaDB client & vector indexer
│   │   ├── gemini_service.py     # Google Gemini legal prompt engineer & analyzer
│   │   └── supabase_client.py    # Supabase PostgreSQL client with SQLite fallback
│   ├── utils/
│   │   └── pdf_parser.py         # PyPDF text extraction & clause chunking algorithm
│   ├── sample_contracts/         # Generated sample legal contracts (MSA & NDA)
│   ├── supabase_schema.sql       # Full database schema for Supabase SQL Editor
│   ├── requirements.txt          # Python dependencies
│   ├── main.py                   # FastAPI server entry point
│   └── .env                      # Server environment configuration
│
└── cloudflare/
    ├── wrangler.toml             # Cloudflare Pages & Worker configuration
    └── DEPLOYMENT_GUIDE.md       # Comprehensive 4-tier infrastructure deployment guide
```

---

## Quick Start (Running Locally)

### 1. Backend Setup

```bash
cd backend-fastapi

# Create virtual environment & activate
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Add your Gemini API key in backend-fastapi/.env:
# GEMINI_API_KEY=your_google_ai_studio_key
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your_supabase_service_role_key

# Start the FastAPI server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Backend API will be live at:
- **API Root**: `http://127.0.0.1:8000/`
- **Interactive OpenAPI Documentation**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/api/health`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend application will be live at:
- **Web App**: `http://127.0.0.1:5173/`

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns microservice health (ChromaDB status, Gemini model, DB mode) |
| `POST` | `/api/upload` | Upload PDF file (or set `use_sample=true`), chunks, embeds into ChromaDB, and runs legal risk analysis |
| `GET` | `/api/documents` | List all processed contracts |
| `GET` | `/api/documents/{id}` | Retrieve document details, raw preview, and saved AI analysis |
| `DELETE` | `/api/documents/{id}` | Delete document from database and purge vectors from ChromaDB |
| `POST` | `/api/ask` | Submit question for active document; runs ChromaDB similarity retrieval + Gemini RAG answer |
| `GET` | `/api/documents/{id}/chat` | Fetch conversation dialogue history for a contract |

---

## Supabase Database Setup

1. Open your [Supabase](https://supabase.com) project dashboard.
2. In the **SQL Editor**, paste and execute the contents of [supabase_schema.sql](file:///Users/sambu/Desktop/legal%20AI/backend-fastapi/supabase_schema.sql).
3. Set `SUPABASE_URL` and `SUPABASE_KEY` in `backend-fastapi/.env`.
