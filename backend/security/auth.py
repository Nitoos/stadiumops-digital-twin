"""Bearer-token authentication for ops endpoints.

Phase 0: shared-secret token via env (`OPS_TOKEN`). Constant-time comparison.
Phase 1+: swap for Identity Platform / OIDC verification — keep the
`require_ops_token` dependency surface, change the body.

Behaviour:
  - If `OPS_TOKEN` is unset → backend refuses to start in production-like
    mode (`OPS_AUTH_ENFORCE=true`). In demo/dev it logs a loud warning
    and allows requests through (so the hackathon demo still runs).
  - WebSocket auth: token via `Authorization: Bearer <t>` header OR
    `?token=<t>` query string (browsers can't set WS headers).
"""
from __future__ import annotations

import hmac
import logging
import secrets
from typing import Annotated

from fastapi import Depends, Header, HTTPException, Query, WebSocket, status

from backend.config import settings

log = logging.getLogger(__name__)


def _constant_time_eq(a: str, b: str) -> bool:
    if not a or not b:
        return False
    return hmac.compare_digest(a.encode("utf-8"), b.encode("utf-8"))


def _verify_token(token: str | None) -> bool:
    expected = settings.ops_token
    if not expected:
        # No token configured. In enforce mode this is treated as denied.
        if settings.ops_auth_enforce:
            return False
        # In dev/demo, allow but warn once.
        if not getattr(_verify_token, "_warned", False):
            log.warning(
                "OPS_TOKEN not set and OPS_AUTH_ENFORCE=false — ops endpoints "
                "are UNAUTHENTICATED. Set OPS_TOKEN before exposing to anyone."
            )
            _verify_token._warned = True  # type: ignore[attr-defined]
        return True
    return _constant_time_eq(token or "", expected)


def _extract_bearer(authorization: str | None) -> str | None:
    if not authorization:
        return None
    parts = authorization.split(None, 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1].strip()


def require_ops_token(authorization: Annotated[str | None, Header()] = None) -> None:
    """FastAPI dependency: gate ops mutation endpoints behind a bearer token."""
    token = _extract_bearer(authorization)
    if not _verify_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing ops token",
            headers={"WWW-Authenticate": 'Bearer realm="stadiumops"'},
        )


async def authenticate_ws(websocket: WebSocket, token: str | None) -> bool:
    """Verify a WebSocket connection's bearer token. Close the socket if invalid.

    Token can be passed via:
      - `Authorization: Bearer <t>` header (some WS clients support this)
      - `?token=<t>` query string (always works in browsers)
    """
    if not token:
        token = _extract_bearer(websocket.headers.get("authorization"))
    if not _verify_token(token):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="auth failed")
        return False
    return True


def generate_token() -> str:
    """Helper for ops to mint a fresh token (URL-safe, 256-bit entropy)."""
    return secrets.token_urlsafe(32)


OpsToken = Annotated[None, Depends(require_ops_token)]
