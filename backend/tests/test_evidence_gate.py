"""
Tests for the evidence gate and compliance pipeline.
Covers: no documents, missing PAN/GST evidence, mismatch scenarios, valid documents.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def create_base_payload(**overrides):
    """Creates a valid bid payload with all required fields."""
    base = {
        "vendorName": "Test Evidence Corp",
        "category": "IT Hardware",
        "tenderId": "GEM/2026/B/891244",
        "tenderValue": "₹1.45 Cr",
        "bidAmount": "₹1.38 Cr",
        "gstin": "27AABCB1234F1Z5",
        "pan": "AABCB1234F",
        "miiDeclared": "68%",
        "turnoverClaim": "₹12.4 Cr",
        "experienceClaim": "5 Years",
        "msmeRegNo": "UDYAM-MH-03-0019284"
    }
    base.update(overrides)
    return base


class TestEvidenceGate:
    """Test Case A: No documents uploaded at all."""

    def test_no_document_returns_review_required(self):
        """A bid with no fileId should trigger DOCUMENTATION_INCOMPLETE."""
        payload = create_base_payload()  # No fileId
        response = client.post("/api/verify/bid", json=payload)
        assert response.status_code == 200
        data = response.json()

        # Score must be low enough to not mislead
        assert data["score"] <= 60, f"Score {data['score']} is misleadingly high for no-document bid"

        # Status must indicate review required, not Compliant
        assert data["status"] == "Review Required", f"Expected 'Review Required', got '{data['status']}'"

        # Risk must be elevated
        assert "High" in data["risk"], f"Expected High risk, got '{data['risk']}'"

        # Must have DOCUMENTATION_INCOMPLETE flag
        flag_text = " ".join(data["flags"])
        assert "DOCUMENTATION_INCOMPLETE" in flag_text, f"Missing DOCUMENTATION_INCOMPLETE flag in: {data['flags']}"

    def test_no_document_pan_is_missing_evidence(self):
        """PAN status must be MISSING_EVIDENCE when no document is provided."""
        payload = create_base_payload()
        response = client.post("/api/verify/bid", json=payload)
        data = response.json()
        assert data["panVerified"] == "MISSING_EVIDENCE"

    def test_no_document_gst_is_missing_evidence(self):
        """GST status must be MISSING_EVIDENCE when no document is provided."""
        payload = create_base_payload()
        response = client.post("/api/verify/bid", json=payload)
        data = response.json()
        assert data["gstVerified"] == "MISSING_EVIDENCE"

    def test_no_document_mii_not_verified(self):
        """MII should be marked as unverified claim when no document is provided."""
        payload = create_base_payload(miiDeclared="68%")
        response = client.post("/api/verify/bid", json=payload)
        data = response.json()
        # Should contain "Claim" or "Unverified" — not just the percentage as if verified
        mii = data["miiVerified"]
        assert "Claim" in mii or "Unverified" in mii, f"MII should indicate unverified claim, got: {mii}"

    def test_no_document_compliance_report_present(self):
        """The compliance report must actually be returned (not None)."""
        payload = create_base_payload()
        response = client.post("/api/verify/bid", json=payload)
        data = response.json()
        assert data.get("complianceReport") is not None, "Compliance report is None — was expected to be populated"

    def test_no_document_recommendation_not_approved(self):
        """Recommendation must NOT say approved when no documents exist."""
        payload = create_base_payload()
        response = client.post("/api/verify/bid", json=payload)
        data = response.json()
        report = data.get("complianceReport", {})
        rec = report.get("buyerRecommendation", "")
        assert "DOCUMENTATION_INCOMPLETE" in rec or "Procurement Officer" in rec, \
            f"Recommendation should indicate incomplete docs, got: {rec}"

    def test_no_document_does_not_fabricate_verification(self):
        """Must NOT produce fake government verification strings."""
        payload = create_base_payload()
        response = client.post("/api/verify/bid", json=payload)
        data = response.json()
        response_str = str(data)
        assert "VERIFIED (NSDL API)" not in response_str
        assert "ACTIVE & 3B Compliant" not in response_str
        assert "Government Verified" not in response_str


class TestClaimNotEvidence:
    """Verify that bidder claims are not confused with documentary evidence."""

    def test_claim_formats_are_not_verification(self):
        """Valid PAN/GST claim format should NOT imply document verification without a document."""
        payload = create_base_payload()
        response = client.post("/api/verify/bid", json=payload)
        data = response.json()
        # Even though the claim PAN/GST has valid format, without document they are MISSING_EVIDENCE
        assert data["panVerified"] == "MISSING_EVIDENCE"
        assert data["gstVerified"] == "MISSING_EVIDENCE"


class TestVerificationPipelineBasics:
    """Basic pipeline functionality tests."""

    def test_valid_payload_returns_200(self):
        """A properly structured payload should not cause server error."""
        payload = create_base_payload()
        response = client.post("/api/verify/bid", json=payload)
        assert response.status_code == 200

    def test_response_has_required_fields(self):
        """Response must include all expected compliance fields."""
        payload = create_base_payload()
        response = client.post("/api/verify/bid", json=payload)
        data = response.json()
        required_fields = [
            "bidId", "vendor", "score", "status", "risk",
            "flags", "panVerified", "gstVerified", "miiVerified",
            "rulesTested", "rulesPassed", "ruleBreakdown",
            "extractedDocs", "auditTrail", "complianceReport"
        ]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

    def test_audit_trail_populated(self):
        """Audit trail must contain entries."""
        payload = create_base_payload()
        response = client.post("/api/verify/bid", json=payload)
        data = response.json()
        assert len(data["auditTrail"]) > 0, "Audit trail is empty"
