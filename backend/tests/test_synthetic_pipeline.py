import sys
import os
from fastapi.testclient import TestClient

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.main import app
import fitz  # PyMuPDF

def generate_synthetic_pdf(filepath):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "CODETOX UNIQUE TEST ENTITY 847291")
    page.insert_text((50, 80), "GSTIN: 27ZZZZZ8472Z1Z5")
    page.insert_text((50, 110), "PAN: ZZZZZ8472Z")
    page.insert_text((50, 140), "UDYAM: UDYAM-MH-12-1234567")
    page.insert_text((50, 170), "Turnover: ₹2.5 Cr")
    page.insert_text((50, 200), "Local Content: 60%")
    doc.save(filepath)
    doc.close()

def run_test():
    client = TestClient(app)
    pdf_path = "synthetic_test.pdf"
    
    print("Generating synthetic PDF...")
    generate_synthetic_pdf(pdf_path)
    
    print("Uploading PDF...")
    with open(pdf_path, "rb") as f:
        upload_response = client.post("/api/verify/upload", files={"file": ("synthetic_test.pdf", f, "application/pdf")})
        
    if upload_response.status_code != 200:
        print("Upload failed:", upload_response.text)
        return
        
    file_id = upload_response.json()["fileId"]
    print(f"Uploaded successfully. FileID: {file_id}")
    
    print("Verifying Bid...")
    # Intentionally mismatch the PAN to trigger cross-validation failure
    req_payload = {
        "vendorName": "CODETOX UNIQUE TEST ENTITY 847291",
        "category": "IT Hardware",
        "tenderId": "GEM/2026/B/891244",
        "tenderValue": "₹1.45 Cr",
        "bidAmount": "₹1.38 Cr",
        "gstin": "27ZZZZZ8472Z1Z5",
        "pan": "AAAAA1111A", # MISMATCH CLAIM
        "miiDeclared": "60%",
        "turnoverClaim": "2.5",
        "experienceClaim": "5 Years",
        "msmeRegNo": "UDYAM-MH-12-1234567",
        "fileId": file_id
    }
    
    verify_response = client.post("/api/verify/bid", json=req_payload)
    if verify_response.status_code != 200:
        print("Verification failed:", verify_response.text)
        return
        
    result = verify_response.json()
    print("--- VERIFICATION RESULT ---")
    import json
    print(json.dumps(result, indent=2))
    
    # Assertions
    assert "MISMATCH" in str(result["flags"]), "Mismatch flag not found!"
    assert result["panVerified"] != "VERIFIED (NSDL API)", "Fake API claim found in response!"
    assert result["panVerified"] in ["LOCAL_VALIDATION_PASSED", "LOCAL_VALIDATION_FAILED", "EXTERNAL_VERIFICATION_NOT_CONFIGURED"], f"PAN validation status unexpected: {result['panVerified']}"
    
    print("\n[SUCCESS] Synthetic E2E Test Passed Successfully!")

if __name__ == "__main__":
    run_test()
