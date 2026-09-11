import os
import unittest
import tempfile
import pathlib

try:
    import pytest
except ImportError:
    pytest = None

try:
    import fitz
except ImportError:
    fitz = None

try:
    from fastapi.testclient import TestClient
    from backend.main import app
    client = TestClient(app)
except Exception:
    client = None

def create_pdf(path: str, text: str):
    if fitz:
        doc = fitz.open()
        page = doc.new_page()
        page.insert_text((50, 50), text)
        doc.save(path)
        doc.close()
    else:
        lines = text.split("\n")
        content_ops = " ".join(f"({line}) '" for line in lines)
        stream = f"BT /F1 12 Tf 50 700 Td {content_ops} ET".encode('latin1')
        pdf = (
            b"%PDF-1.4\n"
            b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
            b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
            b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
            b"4 0 obj\n<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream\nendobj\n"
            b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
            b"xref\n0 6\n0000000000 65535 f \n"
            b"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n999\n%%EOF\n"
        )
        with open(path, "wb") as f:
            f.write(pdf)

def test_full_upload_and_verify_flow(tmp_path):
    pdf_path = str(tmp_path / "test_pan_flow.pdf")
    create_pdf(pdf_path, "Income Tax Department\nPAN: ABCDE1234F\nName: John Doe")
    
    # 1. Upload PAN document
    if client is not None:
        with open(pdf_path, "rb") as f:
            res_upload = client.post("/api/verify/upload", files={"file": ("test_pan_flow.pdf", f, "application/pdf")})
        assert res_upload.status_code == 200
        data = res_upload.json()
    else:
        import asyncio
        from fastapi import UploadFile
        from backend.routes.verify import upload_and_parse_document
        with open(pdf_path, "rb") as f:
            upload_file = UploadFile(filename="test_pan_flow.pdf", file=f)
            data = asyncio.run(upload_and_parse_document(upload_file))

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
    
    if client is not None:
        res_bid = client.post("/api/verify/bid", json=payload)
        assert res_bid.status_code == 200
        bid_data = res_bid.json()
    else:
        from backend.routes.verify import verify_bid_payload, BidVerifyRequest
        req = BidVerifyRequest(**payload)
        resp = verify_bid_payload(req)
        bid_data = resp.dict() if hasattr(resp, "dict") else resp.model_dump()
    
    # 4. Confirm backend can open that exact file
    # 5. Confirm extracted PAN appears
    # 6. Compare extracted PAN with entered PAN
    # 7. Return MATCHED or NOT_MATCHED
    
    assert "pan" in bid_data["fieldMatches"]
    pan_match = bid_data["fieldMatches"]["pan"]
    
    assert pan_match["status"] == "MATCHED", f"Expected MATCHED, got {pan_match['status']}"
    assert pan_match["entered"] == "ABCDE1234F"
    assert pan_match["extracted"] == "ABCDE1234F"

class TestUploadFlowCase(unittest.TestCase):
    def setUp(self):
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.tmp_path = pathlib.Path(self.tmp_dir.name)

    def tearDown(self):
        self.tmp_dir.cleanup()

    def test_flow(self):
        test_full_upload_and_verify_flow(self.tmp_path)

if __name__ == "__main__":
    unittest.main()

