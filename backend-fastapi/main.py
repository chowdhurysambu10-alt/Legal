import os
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from api.document_routes import router as doc_router
from api.agent_routes import router as agent_router
from api.auth_routes import router as auth_router
from core.rag_service import rag_service
from core.gemini_service import gemini_service
from core.supabase_client import db_client

app = FastAPI(
    title="Legal AI Assistant API",
    description="Backend microservice for Legal Document Parsing, ChromaDB RAG, and Gemini Legal Insights",
    version="1.0.0"
)

# Parse CORS Origins from env
cors_origins_env = os.getenv("CORS_ORIGINS", "")
custom_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
default_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000",
]

# Allow any Vercel domain (*.vercel.app), Render (*.onrender.com), or localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=custom_origins + default_origins if custom_origins else default_origins,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.onrender\.com|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(doc_router)
app.include_router(agent_router)
app.include_router(auth_router)


@app.get("/")
async def root():
    return {
        "service": "Legal AI API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_url": "/api/health",
        "endpoints": {
            "upload_pdf": "POST /api/upload",
            "list_documents": "GET /api/documents",
            "document_details": "GET /api/documents/{id}",
            "ask_rag": "POST /api/ask",
            "chat_history": "GET /api/documents/{id}/chat"
        }
    }


@app.get("/api/health")
async def health_check():
    """System health check showing status of RAG vector store, Gemini LLM, and Database."""
    try:
        db_status = db_client.get_status()
    except Exception as e:
        db_status = {
            "mode": "unknown",
            "connected": False,
            "error": str(e)
        }

    db_connected = bool(db_status.get("connected", False))
    system_healthy = db_connected

    return {
        "status": "healthy" if system_healthy else "error",
        "database_connected": db_connected,
        "error_message": db_status.get("error") if not db_connected else None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "components": {
            "vector_store": rag_service.get_stats(),
            "llm_service": gemini_service.get_status(),
            "database": db_status
        }
    }


@app.post("/api/debug/toggle-db")
async def toggle_db_simulated(connected: bool = True):
    """Debug route to simulate database connection loss/restoration for UI verification."""
    db_client.simulated_disconnected = not connected
    return {
        "simulated_disconnected": db_client.simulated_disconnected,
        "database_connected": not db_client.simulated_disconnected
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"Starting Legal AI FastAPI server on {host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)
