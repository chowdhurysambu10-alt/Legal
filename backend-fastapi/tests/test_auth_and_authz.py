import pytest
import time
from core.security import create_access_token, decode_access_token


# ---------------------------------------------------------------------------
# 1. Authentication Tests
# ---------------------------------------------------------------------------
def test_auth_login_valid_credentials(sync_client, mock_db):
    """Verifies that user can login with valid credentials and receive token."""
    from api.auth_routes import hash_password
    # Seed user in mock db
    mock_db.get_user_by_email.side_effect = None
    mock_db.get_user_by_email.return_value = {
        "id": "user-login-test",
        "email": "lawyer@firm.com",
        "password_hash": hash_password("ValidPassword123!"),
        "full_name": "Partner Attorney",
        "created_at": "2026-09-01T00:00:00Z"
    }

    response = sync_client.post("/api/auth/login", json={
        "email": "lawyer@firm.com",
        "password": "ValidPassword123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "access_token" in data
    assert data["user"]["email"] == "lawyer@firm.com"


def test_auth_login_invalid_password_returns_401(sync_client, mock_db):
    """Verifies 401 response on incorrect password."""
    from api.auth_routes import hash_password
    mock_db.get_user_by_email.side_effect = None
    mock_db.get_user_by_email.return_value = {
        "id": "user-login-test",
        "email": "lawyer@firm.com",
        "password_hash": hash_password("CorrectPassword!"),
        "full_name": "Partner Attorney"
    }

    response = sync_client.post("/api/auth/login", json={
        "email": "lawyer@firm.com",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401
    assert "invalid password" in response.json()["detail"].lower()


def test_auth_login_unknown_email_returns_401(sync_client, mock_db):
    """Verifies 401 response when user email is not registered."""
    mock_db.get_user_by_email.side_effect = None
    mock_db.get_user_by_email.return_value = None

    response = sync_client.post("/api/auth/login", json={
        "email": "unknown@firm.com",
        "password": "AnyPassword123!"
    })
    assert response.status_code == 401
    assert "no account found" in response.json()["detail"].lower()


def test_auth_token_tampered_signature_returns_401(sync_client, mock_db):
    """Verifies that tokens with tampered signatures are rejected."""
    token = create_access_token(user_id="test-user-uuid", email="test@firm.com")
    tampered_token = token[:-4] + "abcd"

    response = sync_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {tampered_token}"}
    )
    assert response.status_code == 401
    assert "verification failed" in response.json()["detail"].lower() or "invalid" in response.json()["detail"].lower()


def test_auth_unauthenticated_request_to_protected_me_returns_401(sync_client, mock_db):
    """Verifies 401 when calling /api/auth/me without an Authorization header."""
    response = sync_client.get("/api/auth/me")
    assert response.status_code == 401
    assert "authentication required" in response.json()["detail"].lower()


# ---------------------------------------------------------------------------
# 2. Authorization & IDOR Tests
# ---------------------------------------------------------------------------
def test_authorization_user_can_access_own_document(sync_client, mock_db):
    """Verifies that an authenticated owner can view their own document."""
    token = create_access_token(user_id="test-user-uuid", email="owner@legal.ai")
    response = sync_client.get(
        "/api/documents/doc-100",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["document"]["id"] == "doc-100"


def test_authorization_user_cannot_access_another_users_document(sync_client, mock_db):
    """IDOR check: user A cannot view document owned by user B."""
    foreign_token = create_access_token(user_id="intruder-user-id", email="intruder@firm.com")
    response = sync_client.get(
        "/api/documents/doc-100",
        headers={"Authorization": f"Bearer {foreign_token}"}
    )
    assert response.status_code == 403
    assert "access denied" in response.json()["detail"].lower()


def test_authorization_user_cannot_delete_another_users_document(sync_client, mock_db):
    """IDOR check: user A cannot delete document owned by user B."""
    foreign_token = create_access_token(user_id="intruder-user-id", email="intruder@firm.com")
    response = sync_client.delete(
        "/api/documents/doc-100",
        headers={"Authorization": f"Bearer {foreign_token}"}
    )
    assert response.status_code == 403
    assert "access denied" in response.json()["detail"].lower()


def test_authorization_user_cannot_access_another_users_analysis(sync_client, mock_db):
    """IDOR check: user A cannot query analysis of document owned by user B."""
    foreign_token = create_access_token(user_id="intruder-user-id", email="intruder@firm.com")
    response = sync_client.get(
        "/api/documents/doc-100/analysis",
        headers={"Authorization": f"Bearer {foreign_token}"}
    )
    assert response.status_code == 403
    assert "access denied" in response.json()["detail"].lower()


def test_authorization_user_cannot_access_another_users_chat_history(sync_client, mock_db):
    """IDOR check: user A cannot read chat history of contract owned by user B."""
    foreign_token = create_access_token(user_id="intruder-user-id", email="intruder@firm.com")
    response = sync_client.get(
        "/api/documents/doc-100/chat",
        headers={"Authorization": f"Bearer {foreign_token}"}
    )
    assert response.status_code == 403
    assert "access denied" in response.json()["detail"].lower()


def test_authorization_user_cannot_delete_another_users_account(sync_client, mock_db):
    """IDOR check: user A cannot trigger deletion of user B's account."""
    mock_db._db_store["users"]["user-a"] = {
        "id": "user-a",
        "email": "a@firm.com",
        "full_name": "Counsel A",
        "role": "Legal Counsel"
    }
    token_a = create_access_token(user_id="user-a", email="a@firm.com")
    response = sync_client.delete(
        "/api/auth/user/user-b",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert response.status_code == 403
    assert "forbidden" in response.json()["detail"].lower()


# ---------------------------------------------------------------------------
# 3. Upload Authentication & Identity Integrity Tests
# ---------------------------------------------------------------------------
def test_unauthenticated_contract_upload_rejected_with_401(sync_client):
    """Verifies that uploading a custom contract without authentication returns 401."""
    import io
    from pypdf import PdfWriter
    writer = PdfWriter()
    writer.add_blank_page(width=72, height=72)
    stream = io.BytesIO()
    writer.write(stream)
    pdf_bytes = stream.getvalue()

    response = sync_client.post(
        "/api/upload",
        files={"file": ("contract.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"use_sample": "false"}
    )
    assert response.status_code == 401
    assert "authentication required" in response.json()["detail"].lower()


def test_authenticated_contract_upload_success(sync_client, mock_db, mock_gemini, mock_rag):
    """Verifies that an authenticated user can upload contracts successfully."""
    import io
    from pypdf import PdfWriter
    writer = PdfWriter()
    writer.add_blank_page(width=72, height=72)
    stream = io.BytesIO()
    writer.write(stream)
    pdf_bytes = stream.getvalue()

    token = create_access_token(user_id="valid-counsel-uuid", email="counsel@firm.com")
    response = sync_client.post(
        "/api/upload",
        files={"file": ("contract.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"use_sample": "false"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["document"]["user_id"] == "valid-counsel-uuid"


def test_forged_client_user_id_cannot_change_authenticated_identity(sync_client, mock_db, mock_gemini, mock_rag):
    """Verifies that client cannot forge document ownership via user_id parameter."""
    import io
    from pypdf import PdfWriter
    writer = PdfWriter()
    writer.add_blank_page(width=72, height=72)
    stream = io.BytesIO()
    writer.write(stream)
    pdf_bytes = stream.getvalue()

    real_token = create_access_token(user_id="real-owner-uuid", email="real@firm.com")
    response = sync_client.post(
        "/api/upload",
        files={"file": ("contract.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"use_sample": "false", "user_id": "victim-user-id"},
        headers={"Authorization": f"Bearer {real_token}"}
    )
    assert response.status_code == 200
    # Document owner MUST be derived from real_token, completely ignoring forged user_id
    assert response.json()["document"]["user_id"] == "real-owner-uuid"
    assert response.json()["document"]["user_id"] != "victim-user-id"


def test_cors_rejects_unauthorized_external_origin(sync_client):
    """Verifies that unauthorized origins are not granted CORS access headers."""
    response = sync_client.options(
        "/api/documents",
        headers={
            "Origin": "https://malicious-phishing-site.com",
            "Access-Control-Request-Method": "GET"
        }
    )
    # The Access-Control-Allow-Origin header must NOT be returned for untrusted origins
    assert response.headers.get("access-control-allow-origin") != "https://malicious-phishing-site.com"

