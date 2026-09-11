import pytest
from backend.models import BidVerifyRequest, ExtractedDoc, FieldMatch
from backend.services.rule_engine import validate_bid_compliance
from backend.services.document_processing.cross_checker import normalize_id

def test_normalize_id():
    assert normalize_id(" ABC  DEF ") == "ABCDEF"
    assert normalize_id("abc\nDEF") == "ABCDEF"
    assert normalize_id("  ") == ""
    assert normalize_id(None) == ""

def test_document_matching_success():
    req = BidVerifyRequest(
        vendorName="Test Vendor",
        tenderId="GEM/2026/A/123456",
        gstin="27AABCB1234F1Z5",
        pan="AABCB1234F",
        msmeRegNo="UDYAM-MH-03-0019284"
    )
    
    # Simulate processing results indicating everything matched perfectly
    field_matches = {
        "tenderId": FieldMatch(status="MATCHED", entered="GEM/2026/A/123456", extracted="GEM/2026/A/123456"),
        "gstin": FieldMatch(status="MATCHED", entered="27AABCB1234F1Z5", extracted="27AABCB1234F1Z5"),
        "pan": FieldMatch(status="MATCHED", entered="AABCB1234F", extracted="AABCB1234F"),
        "udyam": FieldMatch(status="MATCHED", entered="UDYAM-MH-03-0019284", extracted="UDYAM-MH-03-0019284")
    }
    
    # We pass some dummy processing results just so has_documentary_evidence is True in rule engine
    processing_results = {
        "fields": {
            "gstin": {"value": "27AABCB1234F1Z5"},
            "pan": {"value": "AABCB1234F"},
            "local_content_percentage": {"value": "60%"},
            "udyam_reg_no": {"value": "UDYAM-MH-03-0019284"}
        },
        "validation_results": [
            {"field": "gstin", "valid": True},
            {"field": "pan", "valid": True}
        ]
    }
    
    evaluation = validate_bid_compliance(req, processing_results=processing_results, field_matches=field_matches)
    
    # No mismatch flags should exist
    assert not any("CRITICAL MISMATCH" in flag for flag in evaluation["flags"])
    # Status should not be Review Required due to mismatch (might be Review Required if score < 85, but with 100 it should be Compliant)
    assert evaluation["status"] == "Compliant"

def test_document_matching_mismatch_penalty():
    req = BidVerifyRequest(
        vendorName="Test Vendor",
        tenderId="GEM/2026/A/123456",
        gstin="27AABCB1234F1Z5",
        pan="AABCB1234F",
        msmeRegNo="UDYAM-MH-03-0019284"
    )
    
    field_matches = {
        "tenderId": FieldMatch(status="MATCHED", entered="GEM/2026/A/123456", extracted="GEM/2026/A/123456"),
        "gstin": FieldMatch(status="MATCHED", entered="27AABCB1234F1Z5", extracted="27AABCB1234F1Z5"),
        "pan": FieldMatch(status="NOT_MATCHED", entered="AABCB1234F", extracted="ZZZZZ9999Z"), # Mismatch!
        "udyam": FieldMatch(status="MATCHED", entered="UDYAM-MH-03-0019284", extracted="UDYAM-MH-03-0019284")
    }
    
    processing_results = {
        "fields": {
            "gstin": {"value": "27AABCB1234F1Z5"},
            "pan": {"value": "AABCB1234F"},
            "local_content_percentage": {"value": "60%"},
            "udyam_reg_no": {"value": "UDYAM-MH-03-0019284"}
        },
        "validation_results": [
            {"field": "gstin", "valid": True},
            {"field": "pan", "valid": True}
        ]
    }
    
    evaluation = validate_bid_compliance(req, processing_results=processing_results, field_matches=field_matches)
    
    # The penalty should force it to Review Required and High Risk
    assert evaluation["status"] == "Review Required"
    assert evaluation["risk"] == "High Risk"
    assert any("CRITICAL MISMATCH" in flag and "PAN" in flag for flag in evaluation["flags"])

def test_document_matching_missing_and_extraction_failure():
    req = BidVerifyRequest(
        vendorName="Test Vendor",
        tenderId="GEM/2026/A/123456",
        gstin="27AABCB1234F1Z5",
        pan="AABCB1234F",
        msmeRegNo="UDYAM-MH-03-0019284"
    )
    
    field_matches = {
        "tenderId": FieldMatch(status="DOCUMENT_MISSING", entered="GEM/2026/A/123456"),
        "gstin": FieldMatch(status="EXTRACTION_FAILED", entered="27AABCB1234F1Z5")
    }
    
    processing_results = {
        "fields": {
            "gstin": {"value": "27AABCB1234F1Z5"},
            "pan": {"value": "AABCB1234F"},
            "local_content_percentage": {"value": "60%"},
            "udyam_reg_no": {"value": "UDYAM-MH-03-0019284"}
        },
        "validation_results": [
            {"field": "gstin", "valid": True},
            {"field": "pan", "valid": True}
        ]
    }
    
    evaluation = validate_bid_compliance(req, processing_results=processing_results, field_matches=field_matches)
    
    # Missing/Extraction failed doesn't trigger the CRITICAL MISMATCH hard penalty directly,
    # but missing docs should be handled by the evidence gate logic (which we simulate via processing_results).
    assert not any("CRITICAL MISMATCH" in flag for flag in evaluation["flags"])
