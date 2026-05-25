"""Per-IP token-bucket rate limiting middleware.

In-memory only (Phase 0). Phase 1+: swap for Memorystore-backed rate limiter
behind Cloud Armor / Cloud API Gateway with per-token quotas.

The default policy is intentionally generous to avoid breaking the demo;
expensive endpoints (AI agent, demo scenes) get a tighter bucket.
"""
from __future__ import annotations

import time
from collections import defaultdict
from dataclasses import dataclass
from typing import Iterable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


@dataclass
class Policy:
    capacity: int       # bucket size
    refill_per_sec: float


# Per-IP default + per-path overrides
DEFAULT_POLICY = Policy(capacity=120, refill_per_sec=2.0)  # 120 burst, 2 RPS sustained
PATH_POLICIES: dict[str, Policy] = {
    # AI agent calls are expensive (Gemini quota)
    "/api/ops/agent/ask": Policy(capacity=10, refill_per_sec=0.2),
    # Demo scene injects mutate sim state; cap aggressive looping
    "/api/ops/demo/scene": Policy(capacity=6, refill_per_sec=0.2),
    # Inject endpoints — same rationale
    "/api/ops/inject/surge": Policy(capacity=6, refill_per_sec=0.2),
    "/api/ops/inject/storm": Policy(capacity=6, refill_per_sec=0.2),
    "/api/ops/inject/threat": Policy(capacity=6, refill_per_sec=0.2),
    # Broadcasts are highly-impactful
    "/api/ops/comms/broadcast": Policy(capacity=6, refill_per_sec=0.2),
}


class _Bucket:
    __slots__ = ("tokens", "last")

    def __init__(self, capacity: float) -> None:
        self.tokens = float(capacity)
        self.last = time.monotonic()

    def take(self, policy: Policy) -> bool:
        now = time.monotonic()
        elapsed = now - self.last
        self.last = now
        self.tokens = min(policy.capacity, self.tokens + elapsed * policy.refill_per_sec)
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False


def _client_ip(request: Request) -> str:
    # Honour the first XFF entry only when from a trusted proxy.
    # Phase 0 trusts no upstream; use peer address directly.
    return request.client.host if request.client else "unknown"


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Token-bucket rate limit per (IP, path-policy).

    Skipped paths (no limit): `/health`, `/`, anything starting with `/static`.
    """

    def __init__(self, app, skip_paths: Iterable[str] = ("/health",)) -> None:
        super().__init__(app)
        self.skip_paths = tuple(skip_paths)
        self._buckets: dict[tuple[str, str], _Bucket] = defaultdict(
            lambda: _Bucket(DEFAULT_POLICY.capacity)
        )

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path
        if path.startswith(self.skip_paths) or request.method == "OPTIONS":
            return await call_next(request)
        policy = PATH_POLICIES.get(path, DEFAULT_POLICY)
        ip = _client_ip(request)
        bucket_key = (ip, path if path in PATH_POLICIES else "_default")
        bucket = self._buckets[bucket_key]
        if not bucket.take(policy):
            return JSONResponse(
                {"error": "rate_limited", "detail": "Too many requests"},
                status_code=429,
                headers={"Retry-After": "5"},
            )
        return await call_next(request)
