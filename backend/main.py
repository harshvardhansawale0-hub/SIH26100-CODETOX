import os
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .database import init_db
from .routes import bids, verify, auction, tenders, contracts, stats, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and seeds on startup
    init_db()
    print("[*] GeM Procurement Compliance Database Initialized Successfully.")
    yield

app = FastAPI(
    title="GeM AI Procurement Compliance & Intelligence Platform API",
    description="Backend API engine for SIH 2026 (Problem Statement: SIH26100) — Automated GFR 2017 & DPIIT Rule Engine, Anti-Cartel Graph Detector, Tender & BOQ Ingestion, and Real-time OCR Forensics.",
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

# Register Sub-Routers
app.include_router(bids.router)
app.include_router(verify.router)
app.include_router(auction.router)
app.include_router(tenders.router)
app.include_router(contracts.router)
app.include_router(stats.router)
app.include_router(auth.router)

@app.get("/", tags=["Root"])
def root_endpoint():
    return {
        "platform": "GeM AI Procurement Compliance Platform",
        "team": "Codetox (SIH 2026 - Problem ID: SIH26100)",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "gem-procure-ai-backend",
        "database": "sqlite-connected",
        "ai_engine": "active",
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
            "/api/auth/register"
        ]
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
