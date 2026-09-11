import os
import fitz
import pytest
from backend.services.document_processing.processor import process_document

def create_pdf(path: str, text: str):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), text)
    doc.save(path)
    doc.close()

def create_image_pdf(path: str):
    # create a PDF with no text, just an image
    doc = fitz.open()
    page = doc.new_page()
    # just an empty page that might look like an image without text
    doc.save(path)
    doc.close()

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
