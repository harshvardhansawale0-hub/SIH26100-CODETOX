import pytest
from fastapi.testclient import TestClient
from backend.main import app
import fitz
import os

client = TestClient(app)

def create_pdf(path: str, text: str):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), text)
    doc.save(path)
    doc.close()

def test_full_upload_and_verify_flow(tmp_path):
    pdf_path = str(tmp_path / "test_pan_flow.pdf")
    create_pdf(pdf_path, "Income Tax Department\nPAN: ABCDE1234F\nName: John Doe")
    
    # 1. Upload PAN document
    with open(pdf_path, "rb") as f:
        res_upload = client.post("/api/verify/upload", files={"file": ("test_pan_flow.pdf", f, "application/pdf")})
        
    assert res_upload.status_code == 200
    data = res_upload.json()
    assert data["status"] == "success"
    
    # 2. Confirm upload returns fileId
    file_id = data["fileId"]
    assert file_id is not None
    
    # 3. Pass fileId to /api/verify/bid
    payload = {
        "vendorName": "Test Vendor",
        "tenderId": "GEM/2026/B/891244",
        "gstin": "27AABCB1234F1Z5",
        "pan": "ABCDE1234F",
        "panDocumentId": file_id
    }
    
    res_bid = client.post("/api/verify/bid", json=payload)
    
    assert res_bid.status_code == 200
    bid_data = res_bid.json()
    
    # 4. Confirm backend can open that exact file
    # 5. Confirm extracted PAN appears
    # 6. Compare extracted PAN with entered PAN
    # 7. Return MATCHED or NOT_MATCHED
    
    assert "pan" in bid_data["fieldMatches"]
    pan_match = bid_data["fieldMatches"]["pan"]
    
    assert pan_match["status"] == "MATCHED", f"Expected MATCHED, got {pan_match['status']}"
    assert pan_match["entered"] == "ABCDE1234F"
    assert pan_match["extracted"] == "ABCDE1234F"
