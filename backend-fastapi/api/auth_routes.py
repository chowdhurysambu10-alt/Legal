import hashlib
import secrets
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from core.supabase_client import db_client

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}:{key.hex()}"


def verify_password(stored_password_hash: str, provided_password: str) -> bool:
    if not stored_password_hash or ":" not in stored_password_hash:
        return False
    try:
        salt, key_hex = stored_password_hash.split(":", 1)
        new_key = hashlib.pbkdf2_hmac("sha256", provided_password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return secrets.compare_digest(key_hex, new_key.hex())
    except Exception:
        return False


from core.security import create_access_token, get_current_user


@router.post("/register")
async def register(req: RegisterRequest):
    email = req.email.strip().lower()
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    existing = db_client.get_user_by_email(email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists. Please sign in.")

    pwd_hash = hash_password(req.password)
    user = db_client.create_user(email=email, password_hash=pwd_hash, full_name=req.full_name)
    access_token = create_access_token(user_id=user["id"], email=user["email"], role="Legal Counsel")

    return {
        "status": "success",
        "message": "Account created successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["full_name"],
            "role": "Legal Counsel",
            "created_at": user["created_at"]
        }
    }


@router.post("/login")
async def login(req: LoginRequest):
    email = req.email.strip().lower()
    user = db_client.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=401, detail="No account found with this email. Please check your email or create an account.")

    stored_hash = user.get("password_hash")
    if not stored_hash or not verify_password(stored_hash, req.password):
        raise HTTPException(status_code=401, detail="Invalid password. Please try again.")

    access_token = create_access_token(user_id=user["id"], email=user["email"], role="Legal Counsel")

    return {
        "status": "success",
        "message": "Signed in successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user.get("full_name") or email.split("@")[0].capitalize(),
            "role": "Legal Counsel",
            "created_at": user.get("created_at")
        }
    }


@router.get("/me")
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Returns the authenticated user derived strictly from the verified session token."""
    return {
        "user": {
            "id": current_user["id"],
            "email": current_user["email"],
            "name": current_user.get("full_name") or current_user.get("name"),
            "created_at": current_user.get("created_at")
        }
    }


@router.get("/user/{user_id}")
async def get_user_profile(user_id: str, current_user: dict = Depends(get_current_user)):
    """Verifies that the user can only query their own account information (IDOR Prevention)."""
    if str(current_user.get("id")) != str(user_id):
        raise HTTPException(status_code=403, detail="Forbidden: You can only access your own profile.")
    return {
        "user": {
            "id": current_user["id"],
            "email": current_user["email"],
            "name": current_user.get("full_name") or current_user.get("name"),
            "created_at": current_user.get("created_at")
        }
    }


@router.delete("/user/{user_id}")
async def delete_user_account(user_id: str, current_user: dict = Depends(get_current_user)):
    """
    Permanently deletes a user account with strict authorization check.
    Prevents unauthorized account deletion attacks.
    """
    if str(current_user.get("id")) != str(user_id):
        raise HTTPException(status_code=403, detail="Forbidden: You can only delete your own account.")
    success = db_client.delete_user(user_id)
    return {
        "status": "success",
        "message": f"User {user_id} and all associated data permanently deleted from database."
    }


