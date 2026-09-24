import pytest
import asyncio
from unittest.mock import MagicMock, patch
from httpx import AsyncClient, ASGITransport
from fastapi.testclient import TestClient
import sys
import os

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from core.supabase_client import DatabaseClient


@pytest.fixture(scope="session")
def event_loop():
    """Create a persistent event loop for the async test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def sync_client():
    """Standard synchronous TestClient for fast integration tests."""
    with TestClient(app) as client:
        yield client


@pytest.fixture
async def async_client():
    """Asynchronous HTTP test client for testing async routes."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


@pytest.fixture
def mock_db():
    """In-memory mock database client simulating document & analysis storage."""
    mock = MagicMock(spec=DatabaseClient)

    db_store = {
        "documents": {
            "doc-100": {
                "id": "doc-100",
                "user_id": "test-user-uuid",
                "filename": "Master_Services_Agreement.pdf",
                "file_size": 20480,
                "page_count": 3,
                "status": "completed",
                "raw_preview": "This is an agreement between Company and Contractor..."
            }
        },
        "analyses": {
            "doc-100": {
                "document_id": "doc-100",
                "overall_risk_score": "HIGH",
                "summary": "High indemnification exposure with 30-day cure period.",
                "risk_flags": [
                    {
                        "severity": "HIGH",
                        "category": "Indemnification",
                        "clause_title": "Section 5: Indemnity",
                        "issue": "Uncapped indemnification liability.",
                        "recommendation": "Cap at 12 months fees paid."
                    }
                ],
                "checklist": [{"action": "Renegotiate Section 5", "priority": "Immediate", "done": False}],
                "key_clauses": {"governing_law": "Delaware"}
            }
        },
        "chat_messages": [],
        "users": {
            "test-user-uuid": {
                "id": "test-user-uuid",
                "email": "owner@legal.ai",
                "full_name": "Test Counsel",
                "role": "Legal Counsel"
            }
        }
    }

    mock._db_store = db_store
    mock.get_document.side_effect = lambda doc_id: db_store["documents"].get(doc_id)
    mock.create_document.side_effect = lambda data: db_store["documents"].setdefault(data["id"], data)
    mock.get_analysis.side_effect = lambda doc_id: db_store["analyses"].get(doc_id)
    mock.save_analysis.side_effect = lambda data: db_store["analyses"].setdefault(data["document_id"], data)
    mock.get_chat_history.return_value = []
    mock.save_chat_message.side_effect = lambda **kwargs: db_store["chat_messages"].append(kwargs)
    mock.get_user_by_id.side_effect = lambda uid: db_store["users"].get(uid)
    mock.get_user_by_email.side_effect = lambda email: next((u for u in db_store["users"].values() if u.get("email") == email), None)
    mock.create_user.side_effect = lambda email, password_hash, full_name=None: {
        "id": "test-user-uuid",
        "email": email,
        "full_name": full_name or "Counsel",
        "role": "Legal Counsel",
        "created_at": "2026-10-01T00:00:00Z"
    }

    with patch("api.document_routes.db_client", mock), \
         patch("api.agent_routes.db_client", mock), \
         patch("api.auth_routes.db_client", mock), \
         patch("core.security.db_client", mock):
        yield mock


@pytest.fixture
def mock_gemini():
    """Mocks Google Gemini legal analysis and conversational RAG responses."""
    with patch("core.gemini_service.gemini_service.analyze_contract") as mock_analyze, \
         patch("core.gemini_service.gemini_service.answer_rag_query") as mock_answer, \
         patch("core.gemini_service.gemini_service._is_conversational_query") as mock_intent:

        mock_analyze.return_value = {
            "overall_risk_score": "HIGH",
            "summary": "Executive contract overview with risk exposure.",
            "risk_flags": [
                {
                    "severity": "HIGH",
                    "category": "Liability",
                    "clause_title": "Limitation of Liability",
                    "issue": "No aggregate ceiling on damages.",
                    "recommendation": "Insert a 1x contract value cap."
                }
            ],
            "checklist": [{"action": "Add cap", "priority": "Immediate", "done": False}],
            "key_clauses": {"governing_law": "State of New York"}
        }

        mock_answer.return_value = {
            "answer": "The agreement states Delaware law governs all dispute resolutions under Section 9.",
            "citations": [{"page": 1, "excerpt": "governed by the laws of Delaware"}],
            "confidence": "HIGH"
        }

        mock_intent.return_value = None

        yield {
            "analyze": mock_analyze,
            "answer": mock_answer,
            "intent": mock_intent
        }


@pytest.fixture
def mock_rag():
    """Mocks ChromaDB vector chunk indexing and similarity retrieval."""
    with patch("core.rag_service.rag_service.add_document_chunks") as mock_add, \
         patch("core.rag_service.rag_service.similarity_search") as mock_search:

        mock_add.return_value = True
        mock_search.return_value = [
            {
                "chunk_id": "chunk_0",
                "page": 1,
                "text": "Section 9: Governing law shall be the State of Delaware.",
                "distance": 0.12
            }
        ]
        yield {"add": mock_add, "search": mock_search}
