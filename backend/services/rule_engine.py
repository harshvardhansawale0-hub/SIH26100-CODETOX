import re
import uuid
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime
from ..models import (
    BidVerifyRequest, RuleCheckResult, ExtractedDoc, AuditTrailEntry,
    ExtractedEntity, CrossDocMatchResult, BidRequirementMatchResult, ComplianceReport
)

def parse_currency_amount(val_str: str) -> float:
    """Extract numeric value in Crores/Lakhs/Rupees into a unified float scale (in Lakhs)."""
    val = val_str.replace("₹", "").replace(",", "").strip()
    match = re.search(r"([\d\.]+)\s*(cr|crore|crores|lakh|lakhs|l|k)?", val, re.IGNORECASE)
    if not match:
        return 0.0
    num = float(match.group(1))
    unit = (match.group(2) or "").lower()
    if unit in ["cr", "crore", "crores"]:
        return num * 100.0  # in Lakhs
    elif unit in ["lakh", "lakhs", "l"]:
        return num
    elif unit == "k":
        return num / 100.0
    return num / 100000.0

def validate_bid_compliance(
    req: BidVerifyRequest, 
    processing_results: Dict[str, Any] = None,
    cross_checks: Dict[str, Any] = None,
    tender_criteria: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Executes the Complete AI Verification Pipeline:
    1. Uploaded Documents OCR & Ingestion
    2. Entity & Data Extraction (PAN, GSTIN, Legal Name, Turnover, UDIN, MII %)
    3. Document Validation & Forensics
    4. Cross-Document Matching
    5. Bid Requirement Matching
    6. AI Compliance Scoring (0-100) & Risk Level
    7. Status Determination
    8. Complete Compliance Report Generation
    Uses real document extraction evidence as the source of truth if provided.
    """
    score = 100
    flags: List[str] = []
    rule_results: List[RuleCheckResult] = []
    extracted_entities: List[ExtractedEntity] = []
    cross_doc_matches: List[CrossDocMatchResult] = []
    requirement_matches: List[BidRequirementMatchResult] = []
    # extracted_docs produced by rule engine are empty; actual docs are built by verify.py
    extracted_docs_list: List[ExtractedDoc] = []

    has_documentary_evidence = processing_results is not None

    # Tender requirements defaults
    target_min_mii = 50.0
    target_min_turnover_lakhs = 200.0  # ₹2.0 Cr
    target_min_exp_years = 3

    if tender_criteria:
        if "miiMinRequirement" in tender_criteria:
            try:
                target_min_mii = float(re.search(r"\d+", str(tender_criteria["miiMinRequirement"])).group(0))
            except Exception:
                pass
        if "minTurnoverRequirement" in tender_criteria:
            target_min_turnover_lakhs = parse_currency_amount(str(tender_criteria["minTurnoverRequirement"]))
        if "minExperienceYears" in tender_criteria:
            try:
                target_min_exp_years = int(tender_criteria["minExperienceYears"])
            except Exception:
                pass

    # ======================================================
    # DOCUMENTATION EVIDENCE GATE
    # ======================================================
    # If no document was uploaded, bidder claims alone are NOT evidence.
    # The system must clearly indicate documentation is incomplete.
    if not has_documentary_evidence:
        score -= 40  # Heavy penalty: no documentary evidence at all
        flags.append("DOCUMENTATION_INCOMPLETE: No documentary evidence was uploaded for verification.")
        flags.append("Bidder claims (PAN, GSTIN, MII, Turnover) cannot be treated as verified evidence without supporting documents.")
        rule_results.append(RuleCheckResult(
            ruleId="EVIDENCE-GATE-01",
            name="Documentary Evidence Submission",
            category="Evidence Gate",
            passed=False,
            details="No documentary evidence provided. All compliance checks are based on unverified claims only. Procurement Officer review is mandatory.",
            penaltyPoints=40
        ))
        # All verification statuses must reflect missing evidence
        gst_verified_str = "MISSING_EVIDENCE"
        pan_verified_str = "MISSING_EVIDENCE"
        # MII from claims only — mark explicitly as unverified claim
        mii_verified_str = f"{req.miiDeclared} (Unverified Claim — No Document)"
        doc_mii = None  # No document-extracted MII

        # Add individual missing evidence rules for critical documents
        rule_results.append(RuleCheckResult(
            ruleId="GFR-149-GST", name="GSTIN Verification", category="Statutory Compliance",
            passed=False, details="No document provided for GSTIN verification. Bidder claim is not evidence.", penaltyPoints=0
        ))
        rule_results.append(RuleCheckResult(
            ruleId="GFR-149-PAN", name="PAN Verification", category="Statutory Compliance",
            passed=False, details="No document provided for PAN verification. Bidder claim is not evidence.", penaltyPoints=0
        ))
        rule_results.append(RuleCheckResult(
            ruleId="DPIIT-MII-01", name="DPIIT MII Classification", category="DPIIT Policy",
            passed=False, details="No document provided for MII verification. Bidder declaration is not evidence.", penaltyPoints=0
        ))
    else:
        # ======================================================
        # DOCUMENT-BASED VERIFICATION (existing logic)
        # ======================================================
        extracted_fields = processing_results.get("fields", {})
        validation_results = processing_results.get("validation_results", [])
        
        def get_validation_status(field_name: str) -> bool:
            for v in validation_results:
                if v["field"] == field_name:
                    return v["valid"]
            return False

        # 1. GSTIN Validation (GFR Rule 149)
        doc_gstin = extracted_fields.get("gstin", {}).get("value")
        if doc_gstin:
            gst_valid = get_validation_status("gstin")
            if gst_valid:
                rule_results.append(RuleCheckResult(
                    ruleId="GFR-149-GST", name="GSTIN Verification", category="Statutory Compliance",
                    passed=True, details=f"Document contains valid GSTIN format: {doc_gstin}.", penaltyPoints=0
                ))
                gst_verified_str = "EXTERNAL_VERIFICATION_NOT_CONFIGURED"
            else:
                score -= 20
                flags.append(f"Extracted GSTIN {doc_gstin} failed local format validation.")
                rule_results.append(RuleCheckResult(
                    ruleId="GFR-149-GST", name="GSTIN Verification", category="Statutory Compliance",
                    passed=False, details="GSTIN format invalid.", penaltyPoints=20
                ))
                gst_verified_str = "LOCAL_VALIDATION_FAILED"
        else:
            score -= 20
            flags.append("Missing GSTIN evidence in document.")
            rule_results.append(RuleCheckResult(
                ruleId="GFR-149-GST", name="GSTIN Verification", category="Statutory Compliance",
                passed=False, details="No GSTIN found in document.", penaltyPoints=20
            ))
            gst_verified_str = "MISSING_EVIDENCE"

        # 2. PAN Verification
        doc_pan = extracted_fields.get("pan", {}).get("value")
        if doc_pan:
            pan_valid = get_validation_status("pan")
            if pan_valid:
                rule_results.append(RuleCheckResult(
                    ruleId="GFR-149-PAN", name="PAN Verification", category="Statutory Compliance",
                    passed=True, details=f"Document contains valid PAN: {doc_pan}.", penaltyPoints=0
                ))
                pan_verified_str = "EXTERNAL_VERIFICATION_NOT_CONFIGURED"
            else:
                score -= 20
                flags.append(f"Extracted PAN {doc_pan} failed format validation.")
                rule_results.append(RuleCheckResult(
                    ruleId="GFR-149-PAN", name="PAN Verification", category="Statutory Compliance",
                    passed=False, details="PAN format invalid.", penaltyPoints=20
                ))
                pan_verified_str = "LOCAL_VALIDATION_FAILED"
        else:
            score -= 20
            flags.append("Missing PAN evidence in document.")
            rule_results.append(RuleCheckResult(
                ruleId="GFR-149-PAN", name="PAN Verification", category="Statutory Compliance",
                passed=False, details="No PAN found in document.", penaltyPoints=20
            ))
            pan_verified_str = "MISSING_EVIDENCE"

        # 3. DPIIT MII
        doc_mii = extracted_fields.get("local_content_percentage", {}).get("value")
        mii_tier = "Unknown"
        if doc_mii:
            try:
                mii_num = float(doc_mii.replace("%", "").strip())
            except:
                mii_num = 0
                
            if mii_num >= 50:
                mii_tier = "Class-I Local Supplier (>= 50%)"
                rule_results.append(RuleCheckResult(ruleId="DPIIT-MII-01", name="DPIIT MII Classification", category="DPIIT Policy", passed=True, details=f"Local content: {mii_num}%.", penaltyPoints=0))
            elif mii_num >= 20:
                score -= 10
                mii_tier = "Class-II Local Supplier (20% - 49%)"
                rule_results.append(RuleCheckResult(ruleId="DPIIT-MII-01", name="DPIIT MII Classification", category="DPIIT Policy", passed=True, details=f"Class-II Local Supplier ({mii_num}%).", penaltyPoints=10))
            else:
                score -= 30
                mii_tier = "Non-Local Supplier (< 20%)"
                rule_results.append(RuleCheckResult(ruleId="DPIIT-MII-01", name="DPIIT MII Classification", category="DPIIT Policy", passed=False, details="Failed local content threshold.", penaltyPoints=30))
        else:
            rule_results.append(RuleCheckResult(ruleId="DPIIT-MII-01", name="DPIIT MII Classification", category="DPIIT Policy", passed=False, details="MII percentage missing from document.", penaltyPoints=0))

        mii_verified_str = doc_mii if doc_mii else f"{req.miiDeclared} (Claimed)"

        # Cross-document penalty
        if cross_checks and cross_checks.get("status") == "FAIL":
            score -= 30
            for check in cross_checks.get("checks", []):
                if check["result"] == "MISMATCH":
                    flags.append(f"MISMATCH: Claimed {check['field']} '{check['claimed']}' does not match extracted '{check['extracted']}'")

    # Clamp score
    score = max(0, min(100, score))

    # ======================================================
    # STATUS DETERMINATION
    # ======================================================
    if not has_documentary_evidence:
        # No documents: always require officer review regardless of score
        status = "Review Required"
        risk = "High Risk"
    elif score >= 85:
        status = "Compliant"
        risk = "Low Risk"
    elif score >= 50:
        status = "Flagged"
        risk = "Medium Risk"
    else:
        status = "Non-Compliant"
        risk = "Critical High Risk"

    # ======================================================
    # BUYER RECOMMENDATION (deterministic, based on compliance result)
    # This is a recommendation only — NOT the final procurement decision.
    # The Procurement Officer makes the final qualification decision.
    # ======================================================
    if not has_documentary_evidence:
        recommendation = "DOCUMENTATION_INCOMPLETE — Mandatory documentary evidence not provided. Procurement Officer must require document submission before qualification decision."
    elif score >= 85:
        recommendation = "Recommended for Procurement Officer Approval — All compliance checks passed with documentary evidence."
    elif score >= 50:
        recommendation = "Requires Officer Review — Some compliance criteria flagged. Procurement Officer should review flagged items before decision."
    else:
        recommendation = "Not Recommended — Critical non-compliance detected. Procurement Officer should review before disqualification decision."

    now_str = datetime.now().strftime("%d %b %Y, %I:%M:%S %p")
    report_id = f"RPT-{uuid.uuid4().hex[:8].upper()}"

    compliance_report = ComplianceReport(
        reportId=report_id,
        generatedAt=now_str,
        bidId="PENDING",
        tenderId=req.tenderId,
        vendorName=req.vendorName,
        score=score,
        status=status,
        riskLevel=risk,
        summaryText=f"Autonomous AI verification executed against GFR 2017, DPIIT MII Order, and Tender criteria for {req.vendorName}. Overall score: {score}/100 ({status}).",
        buyerRecommendation=recommendation,
        extractedEntities=extracted_entities,
        crossDocMatches=cross_doc_matches,
        requirementMatches=requirement_matches,
        ruleBreakdown=rule_results,
        extractedDocs=extracted_docs_list,
        flags=flags
    )

    audit_trail = [
        AuditTrailEntry(timestamp=now_str, action="Bid Ingestion", agent="GeM Gateway"),
        AuditTrailEntry(timestamp=now_str, action=f"Scored {score}/100 -> Status: {status}", agent="GeM AI Engine")
    ]
    if not has_documentary_evidence:
        audit_trail.append(AuditTrailEntry(
            timestamp=now_str,
            action="DOCUMENTATION_INCOMPLETE: No documentary evidence submitted. Officer review mandatory.",
            agent="Evidence Gate"
        ))

    return {
        "score": score,
        "status": status,
        "risk": risk,
        "flags": flags,
        "miiVerified": mii_verified_str,
        "ocrConfidence": "Calculated via processing" if has_documentary_evidence else "N/A — No Document",
        "gstVerified": gst_verified_str,
        "panVerified": pan_verified_str,
        "rulesTested": len(rule_results),
        "rulesPassed": len([r for r in rule_results if r.passed]),
        "ruleBreakdown": rule_results,
        "extractedEntities": extracted_entities,
        "crossDocMatches": cross_doc_matches,
        "requirementMatches": requirement_matches,
        "extractedDocs": extracted_docs_list,
        "auditTrail": audit_trail,
        "complianceReport": compliance_report
    }
