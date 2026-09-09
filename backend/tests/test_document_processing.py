import pytest
from backend.services.document_processing.classifier import classify_document
from backend.services.document_processing.validators import validate_pan_format, validate_gst_format, validate_numeric
from backend.services.document_processing.cross_checker import compare_strings, run_cross_document_checks
from backend.models import BidVerifyRequest

def test_classifier_pan():
    text = "Permanent Account Number is something. Govt of India. Income Tax Department"
    result = classify_document(text)
    assert result["document_type"] == "PAN_CARD"
    assert result["classification_confidence"] == 100.0

def test_classifier_gst():
    text = "Goods and Services Tax Registration Certificate Form GST REG-06"
    result = classify_document(text)
    assert result["document_type"] == "GST_CERTIFICATE"

def test_classifier_unknown():
    text = "This is a random document with no specific signals."
    result = classify_document(text)
    assert result["document_type"] == "UNKNOWN"

def test_validate_pan():
    assert validate_pan_format("ABCDE1234F") == True
    assert validate_pan_format("ABCDE1234") == False
    assert validate_pan_format("12345ABCDE") == False
    assert validate_pan_format("abcde1234f") == True

def test_validate_gst():
    assert validate_gst_format("27ABCDE1234F1Z5") == True
    assert validate_gst_format("ABCDE1234F") == False

def test_validate_numeric():
    assert validate_numeric("10.5") == True
    assert validate_numeric("10,000.50") == True
    assert validate_numeric("₹ 1000") == True
    assert validate_numeric("50%") == True
    assert validate_numeric("Not a number") == False

def test_compare_strings():
    assert compare_strings("Hello World", "hello world")["result"] == "MATCH"
    assert compare_strings("Hello World", "Hello")["result"] == "PARTIAL_MATCH"
    assert compare_strings("Hello", "World")["result"] == "MISMATCH"
    
def test_run_cross_document_checks():
    req = BidVerifyRequest(
        vendorName="Apex Supplies Ltd.",
        tenderId="GEM/1",
        gstin="27ABCDE1234F1Z5",
        pan="ABCDE1234F"
    )
    extracted_fields = {
        "pan": {"value": "ABCDE1234F"},
        "gstin": {"value": "27ABCDE1234F1Z5"}
    }
    result = run_cross_document_checks(extracted_fields, req)
    assert result["status"] == "PASS"
    
    extracted_fields["pan"]["value"] = "WRONG1234F"
    result = run_cross_document_checks(extracted_fields, req)
    assert result["status"] == "FAIL"
