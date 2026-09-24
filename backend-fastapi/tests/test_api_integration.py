import io
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# Ingestion Endpoint: /api/upload
# ---------------------------------------------------------------------------
def test_upload_sample_contract_payload_structure(sync_client, mock_db, mock_gemini, mock_rag):
    """Validates the /api/upload response format and database persistence for sample contract."""
    from core.security import create_access_token
    token = create_access_token(user_id="auth-user-999", email="counsel@firm.com")
    response = sync_client.post(
        "/api/upload",
        data={"use_sample": "true"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert "document" in data
    assert "analysis" in data
    assert data["document"]["user_id"] == "auth-user-999"
    assert data["analysis"]["overall_risk_score"] == "HIGH"
    assert len(data["analysis"]["risk_flags"]) > 0
    assert "key_clauses" in data["analysis"]


def test_upload_non_pdf_file_rejected(sync_client):
    """Validates strict file extension rejection."""
    fake_txt = io.BytesIO(b"Confidential agreement text in raw format")
    response = sync_client.post(
        "/api/upload",
        files={"file": ("contract.txt", fake_txt, "text/plain")},
        data={"use_sample": "false"}
    )
    assert response.status_code == 400
    assert "pdf" in response.json()["detail"].lower()


def test_upload_corrupted_pdf_file_rejected(sync_client):
    """Validates corrupted/unparseable PDF rejection."""
    from core.security import create_access_token
    token = create_access_token(user_id="test-user-uuid", email="counsel@firm.com")
    corrupted_data = io.BytesIO(b"%PDF-1.4\nCorrupted content completely invalid \x00\xFF")
    response = sync_client.post(
        "/api/upload",
        files={"file": ("corrupt.pdf", corrupted_data, "application/pdf")},
        data={"use_sample": "false"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code in [400, 422, 500]


# ---------------------------------------------------------------------------
# Chat / RAG Endpoint: /api/ask & /api/documents/{id}/chat
# ---------------------------------------------------------------------------
def test_ask_contract_question_success(sync_client, mock_db, mock_gemini, mock_rag):
    """Validates /api/ask returns grounded citations with similarity search context."""
    from core.security import create_access_token
    owner_token = create_access_token(user_id="test-user-uuid", email="counsel@firm.com")
    payload = {
        "document_id": "doc-100",
        "question": "What is the governing law of this agreement?"
    }
    response = sync_client.post(
        "/api/ask",
        json=payload,
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    assert response.status_code == 200
    res_data = response.json()

    assert res_data["success"] is True
    assert "Delaware" in res_data["answer"]
    assert len(res_data["citations"]) > 0
    assert res_data["citations"][0]["page"] == 1


def test_ask_empty_question_rejected(sync_client, mock_db):
    """Validates 400 bad request on empty questions."""
    payload = {"document_id": "doc-100", "question": "   "}
    response = sync_client.post("/api/ask", json=payload)
    assert response.status_code == 400
    assert "cannot be empty" in response.json()["detail"].lower()


def test_ask_nonexistent_document_returns_404(sync_client, mock_db):
    """Validates 404 response when querying a non-existent document."""
    payload = {
        "document_id": "missing-uuid-000",
        "question": "Does this contract have non-compete clauses?"
    }
    response = sync_client.post("/api/ask", json=payload)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_auth_registration_and_jwt_issuance(sync_client, mock_db):
    """Verifies user registration issues a signed HMAC JWT."""
    payload = {
        "email": "counsel@firm.com",
        "password": "SecurePassword123!",
        "full_name": "Senior Legal Counsel"
    }
    response = sync_client.post("/api/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "counsel@firm.com"


def test_idor_cross_tenant_document_access_denied(sync_client, mock_db):
    """
    IDOR Security Test:
    Verifies that a user cannot access another tenant's contract.
    """
    from core.security import create_access_token
    # Attacker token
    attacker_token = create_access_token(user_id="attacker-uuid-666", email="attacker@evil.com")
    
    # Document doc-100 belongs to "test-user-uuid"
    response = sync_client.get(
        "/api/documents/doc-100",
        headers={"Authorization": f"Bearer {attacker_token}"}
    )
    # Must reject with 403 Forbidden
    assert response.status_code == 403
    assert "access denied" in response.json()["detail"].lower()


def test_idor_cross_tenant_chat_access_denied(sync_client, mock_db):
    """
    IDOR Security Test:
    Verifies that an unauthorized user cannot query another user's contract in chat.
    """
    from core.security import create_access_token
    attacker_token = create_access_token(user_id="attacker-uuid-666", email="attacker@evil.com")
    
    response = sync_client.post(
        "/api/ask",
        json={"document_id": "doc-100", "question": "What is the secret settlement?"},
        headers={"Authorization": f"Bearer {attacker_token}"}
    )
    assert response.status_code == 403
