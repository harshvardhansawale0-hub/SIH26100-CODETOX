#!/usr/bin/env python
"""
GeM AI Procurement Compliance Platform - Backend Runner
SIH 2026 (Problem Statement: SIH26100) - Team Codetox
"""
import sys
import uvicorn

if __name__ == "__main__":
    print("=======================================================================")
    print("[*] Starting GeM AI Procurement Compliance Backend (FastAPI)")
    print("[*] API Server:  http://127.0.0.1:8000")
    print("[*] Swagger UI:  http://127.0.0.1:8000/docs")
    print("=======================================================================\n")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
