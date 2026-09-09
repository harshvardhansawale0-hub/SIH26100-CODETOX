import uuid
import hashlib
import secrets
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Header
from typing import Dict, Any, Optional
from ..models import UserLogin, UserRegister, AuthResponse
from ..database import get_connection

router = APIRouter(prefix="/api/auth", tags=["Authentication & User Management"])

# In-memory token store for demo (maps token -> user dict)
_active_sessions: Dict[str, Dict[str, Any]] = {}

def _hash_password(password: str, salt: str = None) -> tuple:
    """Hash a password with SHA-256 + salt. Returns (hash, salt)."""
    if salt is None:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return hashed, salt

def _verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored hash (format: salt$hash)."""
    if '$' not in stored_hash:
        # Legacy plain-text password fallback for existing seed data
        return password == stored_hash
    salt, hash_val = stored_hash.split('$', 1)
    computed, _ = _hash_password(password, salt)
    return computed == hash_val

@router.post("/login", response_model=AuthResponse)
def login_user(payload: UserLogin):
    """
    Authenticates a user session strictly as Buyer (Procuring Authority) or Bidder (Vendor/Company).
    Returns JWT-style token on success, or 401 on invalid credentials.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (payload.email.strip().lower(),))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account found with this email. Please register first."
        )

    if not _verify_password(payload.password, row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. Please try again."
        )

    role = "buyer" if row["role"] in ["buyer", "officer"] else "bidder"
    user_data = {
        "id": row["id"],
        "fullName": row["full_name"],
        "email": row["email"],
        "organization": row["organization"],
        "gstin": row["gstin"],
        "role": role
    }

    token = f"gem_jwt_{uuid.uuid4().hex[:16]}"
    _active_sessions[token] = user_data

    return AuthResponse(
        token=token,
        user=user_data,
        message=f"Logged in successfully as {user_data['role'].title()} ({'Government / Procuring Authority' if user_data['role'] == 'buyer' else 'Vendor / Company'})."
    )

@router.post("/register", response_model=AuthResponse)
def register_user(payload: UserRegister):
    """
    Registers a new Buyer or Bidder account with GSTIN and PAN validation with hashed password.
    """
    assigned_role = "buyer" if payload.role in ["buyer", "officer"] else "bidder"

    # Hash the password before storing
    hashed, salt = _hash_password(payload.password)
    stored_hash = f"{salt}${hashed}"

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
        INSERT INTO users (full_name, email, password_hash, organization, gstin, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            payload.fullName, payload.email.strip().lower(), stored_hash,
            payload.organization, payload.gstin, assigned_role, datetime.now().isoformat()
        ))
        conn.commit()
        user_id = cursor.lastrowid
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Registration failed. An account with this email may already exist."
        )
    finally:
        if conn:
            conn.close()

    user_data = {
        "id": user_id,
        "fullName": payload.fullName,
        "email": payload.email,
        "organization": payload.organization,
        "gstin": payload.gstin,
        "role": assigned_role
    }

    token = f"gem_jwt_{uuid.uuid4().hex[:16]}"
    _active_sessions[token] = user_data

    return AuthResponse(
        token=token,
        user=user_data,
        message=f"Account registered successfully as {assigned_role.title()}."
    )

@router.get("/me")
def get_current_user_profile(authorization: Optional[str] = Header(None)):
    """
    Retrieves the currently logged-in user profile from the token header.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated. Please login.")

    token = authorization.replace("Bearer ", "").strip()
    user = _active_sessions.get(token)

    if not user:
        raise HTTPException(status_code=401, detail="Session expired. Please login again.")

    role = user.get("role", "bidder")
    return {
        **user,
        "permissions": ["create_tenders", "review_bids", "select_bidder", "publish_criteria", "crac_verify", "stats_read"]
        if role == "buyer" else ["my_bids_read", "bid_submit", "tender_browse"]
    }

@router.post("/logout")
def logout_user(authorization: Optional[str] = Header(None)):
    """
    Invalidates the current session token.
    """
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        _active_sessions.pop(token, None)
    return {"message": "Logged out successfully."}
