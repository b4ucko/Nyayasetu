from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from api.routes import router as api_router
from api.gemini_routes import router as gemini_router
from api.rate_limiter import rate_limit_general, rate_limit_ai

app = FastAPI(title="Nyayasetu API", version="1.0")

# Register Gzip compression middleware to compress response payloads
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Register security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Configure CSP to be strict but allow Swagger UI assets on documentation routes
    if request.url.path in ["/docs", "/redoc"]:
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net; "
            "img-src 'self' data: fastapi.tiangolo.com;"
        )
    else:
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none';"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Apply rate limiting dependencies to respective routers
app.include_router(api_router, prefix="/api", dependencies=[Depends(rate_limit_general)])
app.include_router(gemini_router, prefix="/api", dependencies=[Depends(rate_limit_ai)])

@app.get("/")
def root():
    return {"message": "Nyayasetu API is running."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
