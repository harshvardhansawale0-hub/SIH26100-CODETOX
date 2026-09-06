import os
import random
from typing import Dict, Any, List

def parse_uploaded_document(file_name: str, file_bytes: bytes = b"") -> Dict[str, Any]:
    """
    Simulates OCR document parsing & forensic tampering detection.
    Extracts simulated text, confidence, metadata, and tampering alerts.
    """
    name_lower = file_name.lower()
    
    doc_type = "Generic Procurement Document"
    extracted_text = "Standard bid submission document verified under GFR 2017 guidelines."
    confidence = 98.5
    tampering_detected = False
    details = "Document passed automated OCR & metadata forensics."

    if "gst" in name_lower:
        doc_type = "GST Registration Certificate (FORM GST REG-06)"
        extracted_text = "FORM GST REG-06 | Government of India | Registration Certificate | Taxpayer Legal Name Verified | Active Status Confirmed"
        if "fake" in name_lower or "tamper" in name_lower or "suspect" in name_lower:
            tampering_detected = True
            confidence = 62.0
            details = "OpenCV Forensics: Inconsistent pixel gradient detected near Registration Date and Legal Entity field."
        else:
            confidence = 99.4
            details = "Verified with GSTN API gateway (Active & 3B Compliant)."
            
    elif "turnover" in name_lower or "ca" in name_lower or "balance" in name_lower:
        doc_type = "CA Audited Turnover Statement"
        extracted_text = "Chartered Accountant Certificate | UDIN: 26084912AAAAAA1234 | Audited Balance Sheet & P&L Statement | FY 2024-25"
        if "tamper" in name_lower or "short" in name_lower or "fake" in name_lower:
            tampering_detected = True
            confidence = 74.0
            details = "Font anomaly detected: Turnover numeric characters have differing DPI from document header."
        else:
            confidence = 98.8
            details = "Audited turnover meets required minimum threshold with valid ICAI UDIN seal."
            
    elif "pan" in name_lower:
        doc_type = "Income Tax PAN Card"
        extracted_text = "INCOME TAX DEPARTMENT | GOVT OF INDIA | PERMANENT ACCOUNT NUMBER | Verified via NSDL Database"
        confidence = 99.1
        details = "PAN number matches registered legal entity."
        
    elif "mii" in name_lower or "make_in_india" in name_lower or "local" in name_lower:
        doc_type = "DPIIT Make in India Declaration (Local Content)"
        extracted_text = "Undertaking under DPIIT Public Procurement Order 2017 | Local Value Addition >= 50% | Class-I Local Supplier"
        confidence = 97.8
        details = "Local content self-declaration validated against CA certificate."
        
    elif "udyam" in name_lower or "msme" in name_lower:
        doc_type = "UDYAM MSME Registration Certificate"
        extracted_text = "MINISTRY OF MICRO, SMALL AND MEDIUM ENTERPRISES | UDYAM REGISTRATION CERTIFICATE | Enterprise Category: Verified"
        confidence = 98.2
        details = "UDYAM registration active and verified against Ministry of MSME portal."

    return {
        "fileName": file_name,
        "docType": doc_type,
        "confidence": f"{confidence:.1f}%",
        "tamperingDetected": tampering_detected,
        "extractedText": extracted_text,
        "details": details,
        "score": 25 if tampering_detected else int(confidence)
    }
