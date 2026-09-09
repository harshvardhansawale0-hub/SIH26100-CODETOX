import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def create_payload(overrides):
    base_payload = {
        "vendorName": "Test Vendor",
        "category": "IT",
        "tenderId": "GEM/2026/B/891244",
        "gstin": "27AABCB1234F1Z5",
        "pan": "ABCDE1234F"
    }
    base_payload.update(overrides)
    return base_payload

def test_valid_payload():
    payload = create_payload({})
    response = client.post("/api/verify/bid", json=payload)
    assert response.status_code == 200

# PAN VALIDATION TESTS
@pytest.mark.parametrize("pan, expected_status", [
    ("ABCDE1234F", 200),  # valid
    ("abcde1234f", 422),  # lowercase
    ("ABCDE123F", 422),   # too short
    ("ABCDE12345F", 422), # too long
    ("1234567890", 422),  # numbers only
    ("12345ABCDE", 422),  # invalid character placement
])
def test_pan_validation(pan, expected_status):
    payload = create_payload({"pan": pan})
    response = client.post("/api/verify/bid", json=payload)
    assert response.status_code == expected_status

# GSTIN VALIDATION TESTS
@pytest.mark.parametrize("gstin, expected_status", [
    ("27AABCB1234F1Z5", 200),  # valid
    ("27aabcb1234f1z5", 422),  # lowercase
    ("27AABCB1234F1Z", 422),   # wrong length (14)
    ("27AABCB1234F1Z55", 422), # wrong length (16)
    ("27-AABCB-1234-F", 422),  # separators
    ("ABCDE1234F1Z527", 422),  # invalid structure
])
def test_gstin_validation(gstin, expected_status):
    payload = create_payload({"gstin": gstin})
    response = client.post("/api/verify/bid", json=payload)
    assert response.status_code == expected_status

# TENDER ID VALIDATION TESTS
@pytest.mark.parametrize("tender_id, expected_status", [
    ("GEM/2026/B/891244", 200), # valid
    ("gem/2026/b/891244", 422), # lowercase
    ("GEM/26/B/891244", 422),   # wrong year format
    ("GEM/2026/12/891244", 422),# wrong segment
    ("GEM/2026/B/12345", 422),  # wrong digit count
    ("GEM-2026-B-891244", 422), # missing separators (using dashes instead of slashes)
])
def test_tender_id_validation(tender_id, expected_status):
    payload = create_payload({"tenderId": tender_id})
    response = client.post("/api/verify/bid", json=payload)
    assert response.status_code == expected_status

def test_missing_required_identifier():
    payload = create_payload({})
    del payload["pan"]
    response = client.post("/api/verify/bid", json=payload)
    assert response.status_code == 422
