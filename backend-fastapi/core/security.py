import os
import json
import base64
import hmac
import hashlib
import time
from typing import Optional, Dict, Any
from fastapi import HTTPException, Security, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.supabase_client import db_client

JWT_SECRET = os.getenv("JWT_SECRET") or os.getenv("SUPABASE_KEY") or "legal-ai-secure-internal-hmac-key-2026"
ALGORITHM = "HS256"
TOKEN_EXPIRY_SECONDS = 7 * 24 * 3600  # 7 days

security_scheme = HTTPBearer(auto_error=False)


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4)) if len(data) % 4 != 0 else ''
    return base64.urlsafe_b64decode(data + padding)


def create_access_token(user_id: str, email: str, role: str = "Legal Counsel") -> str:
    """Creates a cryptographically signed HMAC-SHA256 JWT access token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "iat": int(time.time()),
        "exp": int(time.time()) + TOKEN_EXPIRY_SECONDS
    }
    
    header_b64 = _base64url_encode(json.dumps(header, separators=(',', ':')).encode("utf-8"))
    payload_b64 = _base64url_encode(json.dumps(payload, separators=(',', ':')).encode("utf-8"))
    
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_b64 = _base64url_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> Dict[str, Any]:
    """Validates signature and claims of the access token."""
    try:
        parts = token.strip().split(".")
        if len(parts) != 3:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format")
            
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
        
        provided_sig = _base64url_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, provided_sig):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token signature verification failed")
            
        payload = json.loads(_base64url_decode(payload_b64).decode("utf-8"))
        if payload.get("exp") and payload["exp"] < time.time():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired. Please log in again.")
            
        return payload
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid authentication token: {str(e)}")


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme)
) -> Dict[str, Any]:
    """
    Strict authentication dependency.
    Extracts and verifies Bearer token, then retrieves user from database.
    """
    token = None
    if credentials:
        token = credentials.credentials
    else:
        # Fallback to Authorization header directly
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
            
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token payload missing subject identifier")
        
    user = db_client.get_user_by_id(user_id)
    if not user:
        # Guest or fallback user support
        if user_id.startswith("usr_guest"):
            return {
                "id": user_id,
                "email": payload.get("email", "guest@legal.ai"),
                "name": "Guest Reviewer",
                "role": "Guest Counsel"
            }
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account no longer exists.")
        
    return user


async def get_optional_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme)
) -> Optional[Dict[str, Any]]:
    """
    Permissive authentication dependency for endpoints that allow unauthenticated demo usage.
    """
    try:
        return await get_current_user(request, credentials)
    except HTTPException:
        return None


def verify_document_ownership(doc: Dict[str, Any], user: Optional[Dict[str, Any]]) -> bool:
    """
    IDOR/BOLA Protection:
    Ensures a document can ONLY be accessed by its owner or if it is an unassigned public sample.
    """
    doc_user_id = doc.get("user_id")
    if not doc_user_id:
        # Public sample/demo document
        return True
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You must be authenticated to view this contract."
        )
        
    if str(user.get("id")) != str(doc_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied (IDOR Violation): You do not have permission to access this contract."
        )
        
    return True
