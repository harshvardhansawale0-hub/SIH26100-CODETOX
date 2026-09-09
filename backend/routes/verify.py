import os
import random
import uuid
import shutil
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any, List

from ..models import BidVerifyRequest, BidVerifyResponse, ExtractedDoc, AuditTrailEntry
from ..services.rule_engine import validate_bid_compliance
from ..database import insert_bid

from ..services.document_processing.processor import process_document
from ..services.document_processing.cross_checker import run_cross_document_checks

router = APIRouter(prefix="/api/verify", tags=["AI Verification & Rule Engine"])

TEMP_UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "temp_uploads")
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/bid", response_model=BidVerifyResponse)
def verify_bid_payload(req: BidVerifyRequest):
    """
    Submits bid parameters to the GFR 2017 & DPIIT compliance rule engine.
    If a fileId is provided, runs real document processing and cross-validation.
    Calculates instant score, status, risk classification, and persists the verified bid to the SQLite database.
    """
    doc_flags = []
    real_extracted_docs = []
    doc_ocr_conf = "N/A"
    processing_results = None
    cross_checks = None
    
    if req.fileId:
        file_path = os.path.join(TEMP_UPLOAD_DIR, req.fileId)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=400, detail="Uploaded file not found or expired.")
            
        # Run actual document processing
        processing_results = process_document(file_path, req.fileId)
        doc_type = processing_results.get("classification", {}).get("document_type", "UNKNOWN")
        confidence = processing_results.get("classification", {}).get("classification_confidence", 0)
        doc_ocr_conf = f"{confidence:.1f}%"
        
        # Run Cross-Document Checks
        cross_checks = run_cross_document_checks(processing_results.get("fields", {}), req)
        
        doc_details = f"Processed {doc_type} via {processing_results.get('processing', {}).get('method', 'Unknown')}."
        if cross_checks["status"] == "FAIL":
             doc_details += " Discrepancies found during cross-validation."
             
        real_extracted_docs.append(ExtractedDoc(
            name=f"{doc_type}.pdf",
            status="Mismatch Alert" if cross_checks["status"] == "FAIL" else "Verified",
            score=30 if cross_checks["status"] == "FAIL" else int(confidence),
            details=doc_details
        ))
        
        # Cleanup temp file
        try:
            os.remove(file_path)
        except Exception:
            pass
            
    # 2. Base rule engine evaluation (Deterministic Rules based on extraction)
    evaluation = validate_bid_compliance(req, processing_results, cross_checks)
    
    if req.fileId:
        evaluation["extractedDocs"] = real_extracted_docs
        evaluation["ocrConfidence"] = doc_ocr_conf

    
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
    Securely ingests an uploaded document and returns a fileId for verification.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {ALLOWED_EXTENSIONS}")
        
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the 10MB limit.")
        
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
        
    file_id = f"{uuid.uuid4()}{ext}"
    safe_path = os.path.join(TEMP_UPLOAD_DIR, file_id)
    
    with open(safe_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {
        "status": "success",
        "fileId": file_id,
        "file": {
            "fileName": file.filename,
            "docType": "Pending Processing",
            "confidence": "N/A",
            "tamperingDetected": False,
            "details": "File securely uploaded and awaiting verification pipeline."
        }
    }
