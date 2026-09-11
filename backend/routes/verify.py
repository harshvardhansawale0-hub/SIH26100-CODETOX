import os
import random
import uuid
import shutil
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any, List, Optional

from ..models import BidVerifyRequest, BidVerifyResponse, ExtractedDoc, AuditTrailEntry, FieldMatch
from ..services.rule_engine import validate_bid_compliance
from ..database import insert_bid, get_tender_by_id
from ..services.ocr_forensics import parse_uploaded_document

from ..services.document_processing.processor import process_document
from ..services.document_processing.cross_checker import run_cross_document_checks

router = APIRouter(prefix="/api/verify", tags=["AI Verification & Rule Engine"])

TEMP_UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "temp_uploads")
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def process_single_doc(file_id: str, expected_type: str, doc_name_label: str) -> Dict[str, Any]:
    file_path = os.path.join(TEMP_UPLOAD_DIR, file_id)
    if not os.path.exists(file_path):
        return {"error": f"{doc_name_label} file not found."}
    
    try:
        res = process_document(file_path, file_id)
        doc_type = res.get("classification", {}).get("document_type", "UNKNOWN")
        confidence = res.get("classification", {}).get("classification_confidence", 0)
        
        # Tag fields with source doc
        fields = res.get("fields", {})
        for k, v in fields.items():
            v["source_doc"] = doc_name_label
            v["source_doc_type"] = doc_type
            v["file_id"] = file_id
            
        return {
            "success": True,
            "doc_type": doc_type,
            "confidence": f"{confidence:.1f}%",
            "fields": fields,
            "validation_results": res.get("validation_results", []),
            "method": res.get("processing", {}).get("method", "Unknown"),
            "file_id": file_id
        }
    except Exception as e:
        print(f"[!] Error processing {doc_name_label}: {e}")
        return {"error": f"Failed to process {doc_name_label}."}
    finally:
        try:
            os.remove(file_path)
        except Exception:
            pass

@router.post("/bid", response_model=BidVerifyResponse)
def verify_bid_payload(req: BidVerifyRequest):
    doc_flags = []
    real_extracted_docs = []
    overall_confidence = []
    processing_results = {"fields": {}, "validation_results": []}
    cross_checks = None
    
    field_matches: Dict[str, FieldMatch] = {}
    
    def check_field_match(doc_id: Optional[str], field_key: str, expected_val: str, expected_type: str, label: str):
        if not doc_id:
            field_matches[field_key] = FieldMatch(status="DOCUMENT_MISSING", entered=expected_val)
            return None
            
        res = process_single_doc(doc_id, expected_type, label)
        if "error" in res:
            doc_flags.append(res["error"])
            field_matches[field_key] = FieldMatch(status="EXTRACTION_FAILED", entered=expected_val)
            return None
            
        doc_type = res["doc_type"]
        overall_confidence.append(float(res["confidence"].strip("%")))
        
        is_mismatch = (expected_type != "UNKNOWN" and doc_type != "UNKNOWN" and doc_type != expected_type)
        if is_mismatch:
            doc_details = f"DOCUMENT TYPE MISMATCH: Expected {expected_type} but detected {doc_type}."
            doc_flags.append(f"{label} Evidence -> NOT FOUND / DOCUMENT TYPE MISMATCH")
            real_extracted_docs.append(ExtractedDoc(
                name=f"{label}.pdf",
                docType=doc_type,
                status="Mismatch Alert",
                score=30,
                confidence=res["confidence"],
                details=doc_details
            ))
            field_matches[field_key] = FieldMatch(status="EXTRACTION_FAILED", entered=expected_val)
            return None
            
        doc_details = f"Processed {doc_type} via {res['method']}."
        processing_results["fields"].update(res["fields"])
        processing_results["validation_results"].extend(res["validation_results"])
        
        real_extracted_docs.append(ExtractedDoc(
            name=f"{label}.pdf",
            docType=doc_type,
            status="Verified",
            score=int(float(res["confidence"].strip("%"))),
            confidence=res["confidence"],
            details=doc_details
        ))
        
        return res
        
    def do_match(res: Optional[Dict[str, Any]], field_key: str, entered_val: str, extract_key: str):
        if field_key in field_matches and field_matches[field_key].status in ["DOCUMENT_MISSING", "EXTRACTION_FAILED"]:
            return
            
        if not res:
            return
            
        extracted_val = res.get("fields", {}).get(extract_key, {}).get("value")
        if not extracted_val:
            field_matches[field_key] = FieldMatch(status="EXTRACTION_FAILED", entered=entered_val)
            return
            
        from ..services.document_processing.cross_checker import normalize_id
        if normalize_id(entered_val) == normalize_id(extracted_val):
            field_matches[field_key] = FieldMatch(status="MATCHED", entered=entered_val, extracted=extracted_val)
        else:
            field_matches[field_key] = FieldMatch(status="NOT_MATCHED", entered=entered_val, extracted=extracted_val)

    tender_res = check_field_match(req.tenderDocumentId, "tenderId", req.tenderId, "TENDER_DOCUMENT", "Tender Document")
    do_match(tender_res, "tenderId", req.tenderId, "tender_id")
    
    gst_res = check_field_match(req.gstDocumentId, "gstin", req.gstin, "GST_CERTIFICATE", "GST Certificate")
    do_match(gst_res, "gstin", req.gstin, "gstin")
    
    pan_res = check_field_match(req.panDocumentId, "pan", req.pan, "PAN_CARD", "PAN Card")
    do_match(pan_res, "pan", req.pan, "pan")
    
    udyam_res = check_field_match(req.udyamDocumentId, "udyam", req.msmeRegNo, "UDYAM_CERTIFICATE", "Udyam Certificate")
    do_match(udyam_res, "udyam", req.msmeRegNo, "udyam_reg_no")
    
    # Backward compatibility if only fileId is sent
    if req.fileId and not any([req.tenderDocumentId, req.gstDocumentId, req.panDocumentId, req.udyamDocumentId]):
        # This is a legacy path, we process it but don't do strict field matching
        check_field_match(req.fileId, "legacy", "", "UNKNOWN", "Uploaded Document")

    has_any_doc = bool(req.tenderDocumentId or req.gstDocumentId or req.panDocumentId or req.udyamDocumentId or req.fileId)

    avg_conf = f"{sum(overall_confidence)/len(overall_confidence):.1f}%" if overall_confidence else "N/A"
    
    # Run Cross-Document Checks
    if has_any_doc:
        cross_checks = run_cross_document_checks(processing_results.get("fields", {}), req)
        if cross_checks and cross_checks.get("status") == "FAIL":
            for doc in real_extracted_docs:
                doc.status = "Mismatch Alert"
                doc.details += " Discrepancies found during cross-validation."
                doc.score = min(doc.score, 30)

    tender = get_tender_by_id(req.tenderId)
    
    # Rule engine needs processing_results to be None if no docs
    eval_pr = processing_results if has_any_doc else None
    
    evaluation = validate_bid_compliance(req, eval_pr, cross_checks, tender, field_matches)
    
    if has_any_doc:
        evaluation["extractedDocs"] = real_extracted_docs
        evaluation["ocrConfidence"] = avg_conf
        # append mismatch flags
        evaluation["flags"].extend(doc_flags)
    
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
        "submittedBy": req.submittedBy,
        "vendorEmail": req.vendorEmail,
        "flags": evaluation["flags"],
        "extractedDocs": [doc.model_dump() for doc in evaluation["extractedDocs"]],
        "extractedEntities": [e.model_dump() for e in evaluation["extractedEntities"]],
        "crossDocMatches": [m.model_dump() for m in evaluation["crossDocMatches"]],
        "requirementMatches": [r.model_dump() for r in evaluation["requirementMatches"]],
        "complianceReport": report_dict,
        "auditTrail": [entry.model_dump() for entry in evaluation["auditTrail"]],
        "fieldMatches": {k: v.model_dump() for k, v in field_matches.items()}
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
        extractedEntities=evaluation["extractedEntities"],
        crossDocMatches=evaluation["crossDocMatches"],
        requirementMatches=evaluation["requirementMatches"],
        extractedDocs=evaluation["extractedDocs"],
        auditTrail=evaluation["auditTrail"],
        complianceReport=evaluation["complianceReport"],
        submittedBy=req.submittedBy,
        vendorEmail=req.vendorEmail,
        fieldMatches=field_matches
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

