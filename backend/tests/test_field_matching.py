import pytest
from typing import Dict, Any
import os
import uuid
from backend.routes.verify import verify_bid_payload
from backend.models import BidVerifyRequest

class MockFileDoc:
    def __init__(self, doc_type: str, content: str):
        self.doc_type = doc_type
        self.content = content

MOCK_DOCS = {}

def mock_process_single_doc(doc_id: str, expected_type: str, label: str) -> Dict[str, Any]:
    if doc_id not in MOCK_DOCS:
        return {"error": f"{label} file not found."}
    
    mock_doc = MOCK_DOCS[doc_id]
    
    # Simulate extractors
    import re
    fields = {}
    raw_text = mock_doc.content
    clean_text = re.sub(r'\s+', '', raw_text)
    
    if "PAN" in raw_text or "AABCB" in raw_text:
        match = re.search(r"\b([A-Z]{5}[0-9]{4}[A-Z])\b", raw_text) or re.search(r"([A-Z]{5}[0-9]{4}[A-Z])", clean_text)
        if match:
            fields["pan"] = {"value": match.group(1)}
    
    if "GSTIN" in raw_text or "27AABCB" in raw_text:
        match = re.search(r"\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])\b", raw_text) or re.search(r"([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])", clean_text)
        if match:
            fields["gstin"] = {"value": match.group(1)}
            
    if "UDYAM" in raw_text.upper():
        match = re.search(r"\b(UDYAM-[A-Z]{2}-\d{2}-\d{5,10})\b", raw_text.upper()) or re.search(r"(UDYAM-[A-Z]{2}-\d{2}-\d{5,10})", clean_text, re.IGNORECASE)
        if match:
            fields["udyam_reg_no"] = {"value": match.group(1).upper()}
            
    if "GEM" in raw_text.upper():
        match = re.search(r'\bGEM\s*/?\s*(\d{4})\s*/?\s*([A-Z0-9])\s*/?\s*(\d{6})\b', raw_text, re.IGNORECASE) or re.search(r'\bGEM\s*/?\s*(\d{4})\s*/?\s*([A-Z0-9])\s*/?\s*(\d{6})\b', clean_text, re.IGNORECASE)
        if match:
            fields["tender_id"] = {"value": f"GEM/{match.group(1)}/{match.group(2).upper()}/{match.group(3)}"}

    return {
        "success": True,
        "doc_type": mock_doc.doc_type,
        "confidence": "99.0%",
        "fields": fields,
        "validation_results": [],
        "method": "mock_ocr",
        "file_id": doc_id,
        "raw_text": raw_text
    }

@pytest.fixture(autouse=True)
def mock_processor(monkeypatch):
    monkeypatch.setattr("backend.routes.verify.process_single_doc", mock_process_single_doc)
    # Clear docs before each test
    MOCK_DOCS.clear()

def create_req(tender_doc=None, gst_doc=None, pan_doc=None, udyam_doc=None, 
               tender_id="GEM/2026/B/891244", gstin="27AABCB1234F1Z5", 
               pan="AABCB1234F", udyam="UDYAM-MH-03-0019284"):
    return BidVerifyRequest(
        vendorName="Test Vendor",
        tenderId=tender_id,
        gstin=gstin,
        pan=pan,
        msmeRegNo=udyam,
        tenderDocumentId=tender_doc,
        gstDocumentId=gst_doc,
        panDocumentId=pan_doc,
        udyamDocumentId=udyam_doc
    )

def test_1_pan_correct():
    MOCK_DOCS["doc_pan"] = MockFileDoc("PAN_CARD", "Name: Tester PAN: AABCB1234F")
    req = create_req(pan_doc="doc_pan", pan="AABCB1234F")
    resp = verify_bid_payload(req)
    assert resp.fieldMatches["pan"].status == "MATCHED"

def test_2_pan_wrong():
    MOCK_DOCS["doc_pan"] = MockFileDoc("PAN_CARD", "Name: Tester PAN: AABCB1234F")
    req = create_req(pan_doc="doc_pan", pan="AABCB1234X")
    resp = verify_bid_payload(req)
    assert resp.fieldMatches["pan"].status == "NOT_MATCHED"

def test_3_gst_correct():
    MOCK_DOCS["doc_gst"] = MockFileDoc("GST_CERTIFICATE", "GSTIN: 27AABCB1234F1Z5")
    req = create_req(gst_doc="doc_gst", gstin="27AABCB1234F1Z5")
    resp = verify_bid_payload(req)
    assert resp.fieldMatches["gstin"].status == "MATCHED"

def test_4_gst_wrong():
    MOCK_DOCS["doc_gst"] = MockFileDoc("GST_CERTIFICATE", "GSTIN: 27AABCB1234F1Z5")
    req = create_req(gst_doc="doc_gst", gstin="27AABCB1234F1Z9")
    resp = verify_bid_payload(req)
    assert resp.fieldMatches["gstin"].status == "NOT_MATCHED"

def test_5_udyam_correct():
    MOCK_DOCS["doc_udyam"] = MockFileDoc("UDYAM_CERTIFICATE", "Reg: UDYAM-MH-03-0019284")
    req = create_req(udyam_doc="doc_udyam", udyam="UDYAM-MH-03-0019284")
    resp = verify_bid_payload(req)
    assert resp.fieldMatches["udyam"].status == "MATCHED"

def test_6_udyam_wrong():
    MOCK_DOCS["doc_udyam"] = MockFileDoc("UDYAM_CERTIFICATE", "Reg: UDYAM-MH-03-0019284")
    req = create_req(udyam_doc="doc_udyam", udyam="UDYAM-MH-03-9999999")
    resp = verify_bid_payload(req)
    assert resp.fieldMatches["udyam"].status == "NOT_MATCHED"

def test_7_tender_correct():
    MOCK_DOCS["doc_tender"] = MockFileDoc("TENDER_DOCUMENT", "Tender: GEM/2026/B/891244")
    req = create_req(tender_doc="doc_tender", tender_id="GEM/2026/B/891244")
    resp = verify_bid_payload(req)
    assert resp.fieldMatches["tenderId"].status == "MATCHED"

def test_8_tender_wrong():
    MOCK_DOCS["doc_tender"] = MockFileDoc("TENDER_DOCUMENT", "Tender: GEM/2026/B/891244")
    req = create_req(tender_doc="doc_tender", tender_id="GEM/2026/B/111111")
    resp = verify_bid_payload(req)
    assert resp.fieldMatches["tenderId"].status == "NOT_MATCHED"

def test_9_no_gst_document():
    req = create_req(gst_doc=None)
    resp = verify_bid_payload(req)
    assert resp.fieldMatches["gstin"].status == "DOCUMENT_MISSING"

def test_10_unreadable_gst_document():
    MOCK_DOCS["doc_gst"] = MockFileDoc("GST_CERTIFICATE", "Some random unreadable text without any IDs")
    req = create_req(gst_doc="doc_gst")
    resp = verify_bid_payload(req)
    assert resp.fieldMatches["gstin"].status == "EXTRACTION_FAILED"

def test_11_ocr_spacing_gst():
    MOCK_DOCS["doc_gst"] = MockFileDoc("GST_CERTIFICATE", "GSTIN: 27 AABCB 1234 F 1 Z 5")
    req = create_req(gst_doc="doc_gst", gstin="27AABCB1234F1Z5")
    resp = verify_bid_payload(req)
    assert resp.fieldMatches["gstin"].status == "MATCHED"

def test_12_ocr_spacing_pan():
    MOCK_DOCS["doc_pan"] = MockFileDoc("PAN_CARD", "PAN: AABCB 1234 F")
    req = create_req(pan_doc="doc_pan", pan="AABCB1234F")
    resp = verify_bid_payload(req)
    assert resp.fieldMatches["pan"].status == "MATCHED"

def test_13_ocr_spacing_udyam():
    MOCK_DOCS["doc_udyam"] = MockFileDoc("UDYAM_CERTIFICATE", "UDYAM MH 03 0019284")
    req = create_req(udyam_doc="doc_udyam", udyam="UDYAM-MH-03-0019284")
    resp = verify_bid_payload(req)
    assert resp.fieldMatches["udyam"].status == "MATCHED"

def test_14_ocr_spacing_tender():
    MOCK_DOCS["doc_tender"] = MockFileDoc("TENDER_DOCUMENT", "GEM / 2026 / B / 891244")
    req = create_req(tender_doc="doc_tender", tender_id="GEM/2026/B/891244")
    resp = verify_bid_payload(req)
    assert resp.fieldMatches["tenderId"].status == "MATCHED"

def test_15_change_input_reusable_doc():
    MOCK_DOCS["doc_pan"] = MockFileDoc("PAN_CARD", "PAN: AABCB1234F")
    
    # 1. Correct
    req1 = create_req(pan_doc="doc_pan", pan="AABCB1234F")
    resp1 = verify_bid_payload(req1)
    assert resp1.fieldMatches["pan"].status == "MATCHED"
    
    # 2. Wrong input
    req2 = create_req(pan_doc="doc_pan", pan="AABCB1234X")
    resp2 = verify_bid_payload(req2)
    assert resp2.fieldMatches["pan"].status == "NOT_MATCHED"
    
    # 3. Correct again
    req3 = create_req(pan_doc="doc_pan", pan="AABCB1234F")
    resp3 = verify_bid_payload(req3)
    assert resp3.fieldMatches["pan"].status == "MATCHED"

def test_16_four_different_docs():
    MOCK_DOCS["doc_pan"] = MockFileDoc("PAN_CARD", "PAN: AABCB1234F")
    MOCK_DOCS["doc_gst"] = MockFileDoc("GST_CERTIFICATE", "GSTIN: 27AABCB1234F1Z5")
    MOCK_DOCS["doc_tender"] = MockFileDoc("TENDER_DOCUMENT", "Tender: GEM/2026/B/891244")
    MOCK_DOCS["doc_udyam"] = MockFileDoc("UDYAM_CERTIFICATE", "Reg: UDYAM-MH-03-0019284")
    
    req = create_req(tender_doc="doc_tender", gst_doc="doc_gst", pan_doc="doc_pan", udyam_doc="doc_udyam")
    resp = verify_bid_payload(req)
    
    assert resp.fieldMatches["pan"].status == "MATCHED"
    assert resp.fieldMatches["gstin"].status == "MATCHED"
    assert resp.fieldMatches["tenderId"].status == "MATCHED"
    assert resp.fieldMatches["udyam"].status == "MATCHED"

def test_17_replace_pan_doc():
    MOCK_DOCS["doc_pan1"] = MockFileDoc("PAN_CARD", "PAN: AABCB1234F")
    MOCK_DOCS["doc_pan2"] = MockFileDoc("PAN_CARD", "PAN: AABCB1234F")
    req1 = create_req(pan_doc="doc_pan1")
    resp1 = verify_bid_payload(req1)
    
    req2 = create_req(pan_doc="doc_pan2")
    resp2 = verify_bid_payload(req2)
    
    assert req1.panDocumentId == "doc_pan1"
    assert req2.panDocumentId == "doc_pan2"

def test_18_remove_gst_doc():
    MOCK_DOCS["doc_gst"] = MockFileDoc("GST_CERTIFICATE", "GSTIN: 27AABCB1234F1Z5")
    req1 = create_req(gst_doc="doc_gst")
    assert verify_bid_payload(req1).fieldMatches["gstin"].status == "MATCHED"
    
    req2 = create_req(gst_doc=None)
    assert verify_bid_payload(req2).fieldMatches["gstin"].status == "DOCUMENT_MISSING"

def test_19_pan_in_gst_slot_isolation():
    MOCK_DOCS["doc_pan"] = MockFileDoc("PAN_CARD", "PAN: AABCB1234F")
    req = create_req(pan_doc=None, gst_doc="doc_pan", gstin="27AABCB1234F1Z5", pan="AABCB1234F")
    resp = verify_bid_payload(req)
    
    assert resp.fieldMatches["pan"].status == "DOCUMENT_MISSING"
    assert resp.fieldMatches["gstin"].status == "EXTRACTION_FAILED"

def test_20_combined_document():
    combined_text = "PAN: AABCB1234F | GSTIN: 27AABCB1234F1Z5 | UDYAM-MH-03-0019284 | GEM/2026/B/891244"
    MOCK_DOCS["doc_combined"] = MockFileDoc("BUNDLE", combined_text)
    
    req = create_req(tender_doc="doc_combined", gst_doc="doc_combined", pan_doc="doc_combined", udyam_doc="doc_combined")
    resp = verify_bid_payload(req)
    
    assert resp.fieldMatches["pan"].status == "MATCHED"
    assert resp.fieldMatches["gstin"].status == "MATCHED"
    assert resp.fieldMatches["tenderId"].status == "MATCHED"
    assert resp.fieldMatches["udyam"].status == "MATCHED"
