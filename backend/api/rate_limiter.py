import time
from collections import defaultdict
import threading
from fastapi import Request, HTTPException
import hashlib

class RateLimiter:
    """
    Thread-safe, in-memory sliding-window rate limiter.
    """
    def __init__(self, rate_limit: int, window_seconds: int = 60):
        self.rate_limit = rate_limit
        self.window_seconds = window_seconds
        self.history = defaultdict(list)
        self.lock = threading.Lock()

    def is_allowed(self, key: str) -> tuple[bool, int]:
        """
        Checks if the request is allowed under the rate limit for the given key.
        Returns a tuple of (allowed: bool, retry_after: int).
        """
        now = time.time()
        with self.lock:
            # Filter out timestamps older than the window
            cutoff = now - self.window_seconds
            self.history[key] = [t for t in self.history[key] if t > cutoff]
            
            # Clean up empty list to prevent memory growth
            if not self.history[key]:
                self.history.pop(key, None)
                self.history[key].append(now)
                return True, 0

            if len(self.history[key]) < self.rate_limit:
                self.history[key].append(now)
                return True, 0
            else:
                oldest_timestamp = self.history[key][0]
                retry_after = int(self.window_seconds - (now - oldest_timestamp))
                return False, max(1, retry_after)

# Global rate limiter instances with sensible defaults
general_limiter = RateLimiter(rate_limit=60, window_seconds=60)
ai_limiter = RateLimiter(rate_limit=15, window_seconds=60)

def get_rate_limit_key(request: Request) -> str:
    """
    Identifies the requester using IP + User-based attributes:
    1. Authorization Bearer token (hashed for security/privacy)
    2. Custom X-User-ID header
    3. Client IP address (with X-Forwarded-For resolution)
    """
    # 1. Check Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.lower().startswith("bearer "):
        try:
            token = auth_header.split(" ", 1)[1]
            return f"user:{hashlib.sha256(token.encode('utf-8')).hexdigest()}"
        except IndexError:
            pass

    # 2. Check X-User-ID header
    user_id = request.headers.get("X-User-ID")
    if user_id:
        return f"user:{user_id}"

    # 3. Fallback to client IP address
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        ip = forwarded_for.split(",")[0].strip()
    else:
        ip = request.client.host if request.client else "unknown"
    return f"ip:{ip}"

def rate_limit_general(request: Request):
    """
    FastAPI dependency for general endpoints (60 req/min).
    """
    key = get_rate_limit_key(request)
    allowed, retry_after = general_limiter.is_allowed(key)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Please try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)}
        )

def rate_limit_ai(request: Request):
    """
    FastAPI dependency for resource-intensive AI endpoints (15 req/min).
    """
    key = get_rate_limit_key(request)
    allowed, retry_after = ai_limiter.is_allowed(key)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"AI rate limit exceeded. Please try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)}
        )
