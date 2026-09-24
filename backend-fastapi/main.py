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

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
IS_PRODUCTION = ENVIRONMENT in ("production", "prod")

app = FastAPI(
    title="Legal AI Assistant API",
    description="Backend microservice for Legal Document Parsing, ChromaDB RAG, and Gemini Legal Insights",
    version="1.0.0",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json"
)

# Explicit CORS Configuration
# In production, require explicit origins from CORS_ORIGINS. Localhost origins are only allowed in development.
cors_origins_env = os.getenv("CORS_ORIGINS", "")
configured_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

if IS_PRODUCTION:
    # Strict production allowlist: no localhost, no broad regexes
    allowed_origins = configured_origins if configured_origins else ["https://legal-ai.vercel.app"]
    origin_regex = None
else:
    # Development: allow local frontend servers
    allowed_origins = configured_origins + [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
    ]
    origin_regex = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"

ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
ALLOWED_HEADERS = [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=origin_regex,
    allow_credentials=True,
    allow_methods=ALLOWED_METHODS,
    allow_headers=ALLOWED_HEADERS,
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
        "environment": ENVIRONMENT,
        "docs_url": "/docs" if not IS_PRODUCTION else None,
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
        "environment": ENVIRONMENT,
        "database_connected": db_connected,
        "error_message": db_status.get("error") if not db_connected else None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "components": {
            "vector_store": rag_service.get_stats(),
            "llm_service": gemini_service.get_status(),
            "database": db_status
        }
    }


# Debug routes are strictly restricted to local development
if not IS_PRODUCTION:
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
    print(f"Starting Legal AI FastAPI server on {host}:{port} ({ENVIRONMENT} mode)")
    uvicorn.run("main:app", host=host, port=port, reload=not IS_PRODUCTION)
