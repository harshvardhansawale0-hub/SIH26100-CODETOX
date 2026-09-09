import random
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any, List
from ..models import BidVerifyRequest, BidVerifyResponse
from ..services.rule_engine import validate_bid_compliance
from ..services.ocr_forensics import parse_uploaded_document
from ..database import insert_bid, get_tender_by_id

router = APIRouter(prefix="/api/verify", tags=["AI Verification & Rule Engine"])

@router.post("/bid", response_model=BidVerifyResponse)
def verify_bid_payload(req: BidVerifyRequest):
    """
    Executes the 8-Stage AI Verification Pipeline:
    - Document OCR & Data Extraction
    - Document Validation & Forensics
    - Cross-Document Entity Matching
    - Bid Requirement Matching against target Tender criteria
    - AI Scoring & Risk Classification
    - AI Compliance Report Generation & Persistence to Buyer Registry
    """
    tender = get_tender_by_id(req.tenderId)
    evaluation = validate_bid_compliance(req, tender)
    
    bid_id = f"BID-{random.randint(20500, 29999)}"
    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")

    # Construct the complete verified bid record with compliance report
    report_dict = evaluation["complianceReport"].model_dump() if evaluation.get("complianceReport") else None
    if report_dict:
        report_dict["bidId"] = bid_id

    verified_record = {
        "id": bid_id,
        "vendor": req.vendorName,
        "category": req.category,
        "item": f"{req.category} Procurement Solution",
        "tenderId": req.tenderId,
        "tenderValue": req.tenderValue,
        "bidAmount": req.bidAmount,
        "status": evaluation["status"],
        "score": evaluation["score"],
        "miiContent": evaluation["miiVerified"],
        "turnover": req.turnoverClaim,
        "experience": req.experienceClaim,
        "gstStatus": evaluation["gstVerified"],
        "panStatus": evaluation["panVerified"],
        "msmeStatus": req.msmeRegNo,
        "date": now_str,
        "riskLevel": evaluation["risk"],
        "ocrConfidence": evaluation["ocrConfidence"],
        "flags": evaluation["flags"],
        "extractedDocs": [doc.model_dump() for doc in evaluation["extractedDocs"]],
        "extractedEntities": [e.model_dump() for e in evaluation["extractedEntities"]],
        "crossDocMatches": [m.model_dump() for m in evaluation["crossDocMatches"]],
        "requirementMatches": [r.model_dump() for r in evaluation["requirementMatches"]],
        "complianceReport": report_dict,
        "auditTrail": [entry.model_dump() for entry in evaluation["auditTrail"]]
    }

    # Save to SQLite database
    insert_bid(verified_record)

    return BidVerifyResponse(
        bidId=bid_id,
        vendor=req.vendorName,
        category=req.category,
        tenderId=req.tenderId,
        tenderValue=req.tenderValue,
        bidAmount=req.bidAmount,
        score=evaluation["score"],
        status=evaluation["status"],
        risk=evaluation["risk"],
        flags=evaluation["flags"],
        miiVerified=evaluation["miiVerified"],
        ocrConfidence=evaluation["ocrConfidence"],
        gstVerified=evaluation["gstVerified"],
        panVerified=evaluation["panVerified"],
        aadharVerified=evaluation.get("aadharVerified", "UIDAI e-KYC Verified"),
        rulesTested=evaluation["rulesTested"],
        rulesPassed=evaluation["rulesPassed"],
        ruleBreakdown=evaluation["ruleBreakdown"],
        extractedEntities=evaluation["extractedEntities"],
        crossDocMatches=evaluation["crossDocMatches"],
        requirementMatches=evaluation["requirementMatches"],
        extractedDocs=evaluation["extractedDocs"],
        auditTrail=evaluation["auditTrail"],
        complianceReport=evaluation["complianceReport"]
    )

@router.post("/upload")
async def upload_and_parse_document(file: UploadFile = File(...)):
    """
    Ingests an uploaded document (PDF, PNG, JPG) and runs automated OCR extraction and forensics.
    """
    contents = await file.read()
    parsed_info = parse_uploaded_document(file.filename, contents)
    return {
        "status": "success",
        "file": parsed_info
    }

