import os
import unittest
import tempfile
import pathlib

try:
    import fitz
except ImportError:
    fitz = None

try:
    import pytest
except ImportError:
    pytest = None

from backend.services.document_processing.processor import process_document

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

def create_image_pdf(path: str):
    if fitz:
        doc = fitz.open()
        page = doc.new_page()
        doc.save(path)
        doc.close()
    else:
        pdf = (
            b"%PDF-1.4\n"
            b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
            b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
            b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n"
            b"xref\n0 4\n0000000000 65535 f \n"
            b"trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n999\n%%EOF\n"
        )
        with open(path, "wb") as f:
            f.write(pdf)

def create_empty_file(path: str):
    with open(path, "wb") as f:
        f.write(b"")

def test_extract_pan(tmp_path):
    pdf_path = str(tmp_path / "pan.pdf")
    create_pdf(pdf_path, "Income Tax Department\nPAN: ABCDE1234F\nName: John Doe")
    
    res = process_document(pdf_path, "pan.pdf")
    
    assert "pan" in res["fields"], "PAN should be extracted"
    assert res["fields"]["pan"]["value"] == "ABCDE1234F"

def test_extract_gstin(tmp_path):
    pdf_path = str(tmp_path / "gstin.pdf")
    create_pdf(pdf_path, "Government of India\nGSTIN / UIN: 27AABCB1234F1Z5\nDetails here.")
    
    res = process_document(pdf_path, "gstin.pdf")
    
    assert "gstin" in res["fields"], "GSTIN should be extracted"
    assert res["fields"]["gstin"]["value"] == "27AABCB1234F1Z5"

def test_extract_udyam(tmp_path):
    pdf_path = str(tmp_path / "udyam.pdf")
    create_pdf(pdf_path, "MSME REGISTRATION\nUdyam Registration Number: UDYAM-MH-03-0019284\nStatus: Active")
    
    res = process_document(pdf_path, "udyam.pdf")
    
    assert "udyam_reg_no" in res["fields"], "Udyam ID should be extracted"
    assert res["fields"]["udyam_reg_no"]["value"] == "UDYAM-MH-03-0019284"

def test_extract_tender_id(tmp_path):
    pdf_path = str(tmp_path / "tender.pdf")
    create_pdf(pdf_path, "Government e Marketplace\nBid Number: GEM/2026/B/891244\nDate: 01-01-2026")
    
    res = process_document(pdf_path, "tender.pdf")
    
    assert "tender_id" in res["fields"], "Tender ID should be extracted"
    assert res["fields"]["tender_id"]["value"] == "GEM/2026/B/891244"

def test_scanned_image_document(tmp_path, capsys):
    pdf_path = str(tmp_path / "scanned.pdf")
    create_image_pdf(pdf_path)
    
    res = process_document(pdf_path, "scanned.pdf")
    
    # If tesseract is not available, it should append the error
    from backend.services.document_processing.ocr_engine import HAS_TESSERACT
    if not HAS_TESSERACT:
        assert "OCR fallback needed but Tesseract is unavailable." in res["processing"]["errors"]

def test_invalid_empty_document(tmp_path):
    txt_path = str(tmp_path / "empty.txt")
    create_empty_file(txt_path)
    
    res = process_document(txt_path, "empty.txt")
    
    assert len(res["processing"]["errors"]) > 0
    assert "fields" in res
    assert len(res["fields"]) == 0

class TestExtractionCase(unittest.TestCase):
    def setUp(self):
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.tmp_path = pathlib.Path(self.tmp_dir.name)

    def tearDown(self):
        self.tmp_dir.cleanup()

    def test_pan(self):
        test_extract_pan(self.tmp_path)

    def test_gstin(self):
        test_extract_gstin(self.tmp_path)

    def test_udyam(self):
        test_extract_udyam(self.tmp_path)

    def test_tender_id(self):
        test_extract_tender_id(self.tmp_path)

    def test_empty(self):
        test_invalid_empty_document(self.tmp_path)

if __name__ == "__main__":
    unittest.main()

