import os
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .database import init_db
from .routes import bids, verify, auction, tenders, contracts, stats, auth, gemmy, passport

# Resolve paths relative to the project root (one level up from backend/)
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
DIST_DIR = PROJECT_ROOT / "dist"

# Load environment variables from .env if present
env_file = PROJECT_ROOT / ".env"
if env_file.exists():
    try:
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())
    except Exception as e:
        print(f"[!] Warning reading .env file: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and seeds on startup
    init_db()
    print("[*] GeM Procurement Compliance Database Initialized Successfully.")
    print(f"[*] Ask GeMMy AI Router Loaded (Groq model: {os.environ.get('GROQ_MODEL', 'qwen/qwen3.8-27b')}).")
    print(f"[*] Serving frontend from: {DIST_DIR}")
    print(f"[*] Frontend dist exists: {DIST_DIR.exists()}")
    yield

app = FastAPI(
    title="GeM AI Procurement Compliance & Intelligence Platform API",
    description="Backend API engine for SIH 2026 (Problem Statement: SIH26100) — Automated GFR 2017 & DPIIT Rule Engine, Anti-Cartel Graph Detector, Tender & BOQ Ingestion, Real-time OCR Forensics, and Ask GeMMy AI Assistant.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for Vite React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev & production preview
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Sub-Routers (all API routes under /api/)
app.include_router(bids.router)
app.include_router(verify.router)
app.include_router(auction.router)
app.include_router(tenders.router)
app.include_router(contracts.router)
app.include_router(stats.router)
app.include_router(auth.router)
app.include_router(gemmy.router)
app.include_router(passport.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "gem-procure-ai-backend",
        "database": "sqlite-connected",
        "ai_engine": "active",
        "frontend": "served" if DIST_DIR.exists() else "not-built",
        "endpoints": [
            "/api/bids",
            "/api/verify/bid",
            "/api/verify/upload",
            "/api/auction/analysis",
            "/api/auction/reverse-auction/round",
            "/api/tenders",
            "/api/contracts",
            "/api/stats/overview",
            "/api/auth/login",
            "/api/auth/register",
            "/api/vendors",
            "/api/passport/{id}",
            "/api/passport/{id}/verify",
            "/api/passport/{id}/qrcode",
            "/api/passport/public-key"
        ]
    }

# Mount dist/assets for JS/CSS bundles (must come before the catch-all)
if DIST_DIR.exists() and (DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets"), headers={"Cache-Control": "public, max-age=31536000, immutable"}), name="static-assets")

# Catch-all: serve React SPA index.html for all non-API routes
@app.get("/{full_path:path}")
async def serve_spa(request: Request, full_path: str):
    """
    Serves the React SPA. Any route that doesn't match /api/* or /docs or /redoc
    will return index.html so React Router can handle client-side navigation.
    """
    # If dist/index.html exists, serve the React app
    index_file = DIST_DIR / "index.html"
    if index_file.exists():
        # Check if the request is for a specific static file in dist/
        requested_file = DIST_DIR / full_path
        if requested_file.exists() and requested_file.is_file():
            return FileResponse(str(requested_file))
        # Otherwise return index.html for SPA routing
        return FileResponse(str(index_file))
    
    # Fallback: if frontend isn't built yet, show API info
    return JSONResponse({
        "platform": "GeM AI Procurement Compliance Platform",
        "team": "Codetox (SIH 2026 - Problem ID: SIH26100)",
        "status": "online",
        "version": "1.0.0",
        "message": "Frontend not built yet. Run 'npm run build' to generate dist/. API docs available at /docs",
        "docs": "/docs",
        "health": "/api/health"
    })

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

