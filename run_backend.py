#!/usr/bin/env python
"""
GeM AI Procurement Compliance Platform - Backend Runner
SIH 2026 (Problem Statement: SIH26100) - Team Codetox
"""
import os
import sys
import uvicorn

# Ensure repository root is in Python path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print("=======================================================================")
    print(f"[*] Starting GeM AI Procurement Compliance Backend (FastAPI)")
    print(f"[*] Host:        {host}")
    print(f"[*] Port:        {port}")
    print(f"[*] API Server:  http://{host}:{port}")
    print(f"[*] Swagger UI:  http://{host}:{port}/docs")
    print("=======================================================================\n")
    uvicorn.run("backend.main:app", host=host, port=port, reload=False)
