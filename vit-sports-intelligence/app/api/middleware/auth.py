# app/api/middleware/auth.py
import os
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY", "")
_auth_env = os.getenv("AUTH_ENABLED", "").lower()
# Auto-enable auth when a real API key has been configured and AUTH_ENABLED is not
# explicitly set to "false"
if _auth_env == "true":
    AUTH_ENABLED = True
elif _auth_env == "false":
    AUTH_ENABLED = False
else:
    # Auto-detect: enable if the key is non-default
    AUTH_ENABLED = API_KEY not in ("", "your_api_key_here")

# Only enforce auth on these API route prefixes — everything else is static frontend
_PROTECTED_PREFIXES = (
    "/analytics", "/history", "/predict", "/result",
    "/training", "/ai", "/odds", "/ai-feed", "/admin",
)


class APIKeyMiddleware(BaseHTTPMiddleware):
    """
    API Key authentication middleware.
    Only enforces on known API routes — never on static frontend files.
    """

    async def dispatch(self, request: Request, call_next):
        if not AUTH_ENABLED:
            return await call_next(request)

        path = request.url.path

        always_open = ("/health", "/docs", "/openapi.json", "/redoc", "/favicon.ico")
        if path in always_open:
            return await call_next(request)

        # Pass static frontend assets through without auth
        if not any(path.startswith(pfx) for pfx in _PROTECTED_PREFIXES):
            return await call_next(request)

        api_key = request.headers.get("x-api-key")

        if not api_key:
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing API key. Please provide x-api-key header"}
            )

        expected_api_key = os.getenv("API_KEY", API_KEY)
        if api_key != expected_api_key:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid API key"}
            )

        return await call_next(request)


async def verify_api_key(request: Request):
    """Dependency for route-level API key validation"""
    if not AUTH_ENABLED:
        return True

    api_key = request.headers.get("x-api-key")

    if not api_key:
        raise HTTPException(status_code=401, detail="Missing API key")

    expected_api_key = os.getenv("API_KEY", API_KEY)
    if api_key != expected_api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")

    return True
