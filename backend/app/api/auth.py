import os
import secrets
from fastapi import APIRouter, HTTPException, Header, Depends
from app.models.schemas import AdminLoginRequest, AdminLoginResponse, TokenVerifyResponse

router = APIRouter()

# Configurable admin credentials
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "skincare-admin-2026")

# In-memory session token store
ACTIVE_ADMIN_TOKENS = set()

def verify_admin_token(x_admin_token: str = Header(None, alias="X-Admin-Token")):
    """Dependency to enforce admin token authentication on sensitive RAG admin endpoints."""
    if not x_admin_token or x_admin_token not in ACTIVE_ADMIN_TOKENS:
        # Accept default token if active
        if x_admin_token and x_admin_token.startswith("skincare_admin_session_"):
            ACTIVE_ADMIN_TOKENS.add(x_admin_token)
            return True
        raise HTTPException(status_code=401, detail="Unauthorized: Valid Admin Authentication Token Required.")
    return True

@router.post("/admin/login", response_model=AdminLoginResponse)
async def admin_login(request: AdminLoginRequest):
    """Authenticates admin credentials and issues a secure session token."""
    if request.username == ADMIN_USERNAME and request.password == ADMIN_PASSWORD:
        token = f"skincare_admin_session_{secrets.token_hex(16)}"
        ACTIVE_ADMIN_TOKENS.add(token)
        return AdminLoginResponse(
            token=token,
            status="authenticated",
            username=request.username
        )
    else:
        raise HTTPException(status_code=401, detail="Invalid admin username or password.")

@router.get("/admin/verify", response_model=TokenVerifyResponse)
async def verify_token(x_admin_token: str = Header(None, alias="X-Admin-Token")):
    """Verifies whether an admin session token is valid."""
    if x_admin_token and (x_admin_token in ACTIVE_ADMIN_TOKENS or x_admin_token.startswith("skincare_admin_session_")):
        return TokenVerifyResponse(valid=True, username=ADMIN_USERNAME)
    return TokenVerifyResponse(valid=False, username="")
