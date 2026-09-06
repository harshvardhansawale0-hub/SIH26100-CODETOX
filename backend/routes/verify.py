import random
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any, List
from ..models import BidVerifyRequest, BidVerifyResponse
from ..services.rule_engine import validate_bid_compliance
from ..services.ocr_forensics import parse_uploaded_document
from ..database import insert_bid

router = APIRouter(prefix="/api/verify", tags=["AI Verification & Rule Engine"])

@router.post("/bid", response_model=BidVerifyResponse)
def verify_bid_payload(req: BidVerifyRequest):
    """
    Submits bid parameters to the GFR 2017 & DPIIT compliance rule engine.
    Calculates instant score, status, risk classification, and persists the verified bid to the SQLite database.
    """
    evaluation = validate_bid_compliance(req)
    
    bid_id = f"BID-{random.randint(20500, 29999)}"
    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")

    # Construct the complete verified bid record
    verified_record = {
        "id": bid_id,
        "vendor": req.vendorName,
        "category": req.category,
        "item": f"{req.category} Equipment / Solution",
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
        rulesTested=evaluation["rulesTested"],
        rulesPassed=evaluation["rulesPassed"],
        ruleBreakdown=evaluation["ruleBreakdown"],
        extractedDocs=evaluation["extractedDocs"],
        auditTrail=evaluation["auditTrail"]
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
