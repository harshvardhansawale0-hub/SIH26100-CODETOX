from typing import Dict, Any
from ...models import BidVerifyRequest

def normalize_id(val: str) -> str:
    """Normalizes an ID by stripping whitespace, newlines, and uppercasing."""
    if not val:
        return ""
    # Remove all whitespace characters including spaces, tabs, newlines
    normalized = ''.join(val.split()).upper()
    return normalized

def compare_strings(str1: str, str2: str) -> Dict[str, Any]:
    if not str1 or not str2:
        return {"result": "MISSING", "similarity": 0.0}
        
    s1 = normalize_id(str1)
    s2 = normalize_id(str2)
    
    if s1 == s2:
        return {"result": "MATCH", "similarity": 100.0}
        
    # Simple partial match: if one is completely inside the other
    if s1 in s2 or s2 in s1:
        return {"result": "PARTIAL_MATCH", "similarity": 80.0}
        
    return {"result": "MISMATCH", "similarity": 0.0}

def run_cross_document_checks(extracted_fields: Dict[str, Any], req: BidVerifyRequest) -> Dict[str, Any]:
    """
    Compares the submitted BidVerifyRequest claims against the extracted fields from the document.
    """
    checks = []
    status = "PASS"
    
    # GSTIN check
    if "gstin" in extracted_fields:
        doc_gstin = extracted_fields["gstin"]["value"]
        comp = compare_strings(doc_gstin, req.gstin)
        checks.append({
            "field": "gstin",
            "claimed": req.gstin,
            "extracted": doc_gstin,
            "result": comp["result"],
            "explanation": "GSTIN matches exactly." if comp["result"] == "MATCH" else "GSTIN mismatch detected."
        })
        if comp["result"] == "MISMATCH":
            status = "FAIL"

    # PAN check
    if "pan" in extracted_fields:
        doc_pan = extracted_fields["pan"]["value"]
        comp = compare_strings(doc_pan, req.pan)
        checks.append({
            "field": "pan",
            "claimed": req.pan,
            "extracted": doc_pan,
            "result": comp["result"],
            "explanation": "PAN matches exactly." if comp["result"] == "MATCH" else "PAN mismatch detected."
        })
        if comp["result"] == "MISMATCH":
            status = "FAIL"
            
    # Udyam check
    if "udyam_reg_no" in extracted_fields:
        doc_udyam = extracted_fields["udyam_reg_no"]["value"]
        comp = compare_strings(doc_udyam, req.msmeRegNo)
        checks.append({
            "field": "msmeRegNo",
            "claimed": req.msmeRegNo,
            "extracted": doc_udyam,
            "result": comp["result"]
        })
        if comp["result"] == "MISMATCH":
            status = "FAIL"

    return {
        "status": status,
        "checks": checks
    }
