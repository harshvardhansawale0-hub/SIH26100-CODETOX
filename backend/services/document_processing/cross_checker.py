from typing import Dict, Any
from ...models import BidVerifyRequest

import re

def normalize_pan(val: str) -> str:
    if not val: return ""
    return re.sub(r'[^A-Z0-9]', '', val.upper())

def normalize_gstin(val: str) -> str:
    if not val: return ""
    return re.sub(r'[^A-Z0-9]', '', val.upper())

def normalize_udyam(val: str) -> str:
    if not val: return ""
    cleaned = re.sub(r'[^A-Z0-9]', '', val.upper())
    if cleaned.startswith("UDYAM") and len(cleaned) >= 11:
        return f"UDYAM-{cleaned[5:7]}-{cleaned[7:9]}-{cleaned[9:]}"
    return cleaned

def normalize_tender_id(val: str) -> str:
    if not val: return ""
    cleaned = re.sub(r'[^A-Z0-9]', '', val.upper())
    if cleaned.startswith("GEM") and len(cleaned) >= 12:
        return f"GEM/{cleaned[3:7]}/{cleaned[7:8]}/{cleaned[8:]}"
    return cleaned

def get_normalizer(field_key: str):
    if field_key == "pan": return normalize_pan
    if field_key == "gstin": return normalize_gstin
    if field_key in ["udyam", "msmeRegNo"]: return normalize_udyam
    if field_key in ["tenderId", "tender_id"]: return normalize_tender_id
    return lambda x: re.sub(r'\s+', '', x.upper()) if x else ""

def normalize_id(val: str, field_key: str = None) -> str:
    if not val:
        return ""
    if field_key:
        return get_normalizer(field_key)(val)
    return ''.join(val.split()).upper()

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
