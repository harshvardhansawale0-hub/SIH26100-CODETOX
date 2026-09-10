"""
Mock Document Verification Service
Simulates NSDL PAN, GSTN GST, and Udyam Portal verification APIs.
For production, replace these stubs with actual government API integrations.
"""

import re
import time
import random
from datetime import datetime, timedelta


def verify_pan(pan: str) -> dict:
    """
    Simulates NSDL PAN verification API.
    Valid PAN format: 5 uppercase letters + 4 digits + 1 uppercase letter (e.g. AABCB1234F)
    """
    time.sleep(random.uniform(0.1, 0.3))  # Simulated latency

    pan = pan.strip().upper()
    pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]$'

    if not re.match(pattern, pan):
        return {
            "valid": False,
            "pan": pan,
            "status": "failed",
            "errorCode": "INVALID_FORMAT",
            "message": "PAN does not match the expected format [A-Z]{5}[0-9]{4}[A-Z]",
            "verifiedAt": datetime.now().isoformat()
        }

    # Simulate known invalid PANs
    blacklisted = ["XXXXX0000X", "AAAAA0000A"]
    if pan in blacklisted:
        return {
            "valid": False,
            "pan": pan,
            "status": "blacklisted",
            "errorCode": "PAN_BLACKLISTED",
            "message": "This PAN has been flagged by Income Tax authorities",
            "verifiedAt": datetime.now().isoformat()
        }

    # PAN type based on 4th character
    pan_types = {
        'P': 'Individual', 'C': 'Company', 'H': 'HUF',
        'A': 'AOP', 'B': 'BOI', 'G': 'Government',
        'J': 'Artificial Juridical Person', 'L': 'Local Authority',
        'F': 'Firm/LLP', 'T': 'Trust'
    }
    pan_type = pan_types.get(pan[3], 'Company')

    return {
        "valid": True,
        "pan": pan,
        "panType": pan_type,
        "holderName": f"Verified Entity ({pan[:5]})",
        "status": "verified",
        "registrationStatus": "Active",
        "verifiedAt": datetime.now().isoformat(),
        "source": "NSDL e-Gov (Mock)"
    }


def verify_gst(gstin: str) -> dict:
    """
    Simulates GSTN API verification.
    Valid GSTIN format: 2-digit state code + 10-char PAN + 1 entity + 1 check char + 'Z' + 1 char
    Total 15 characters.
    """
    time.sleep(random.uniform(0.1, 0.3))

    gstin = gstin.strip().upper()

    if len(gstin) != 15:
        return {
            "valid": False,
            "gstin": gstin,
            "status": "failed",
            "errorCode": "INVALID_LENGTH",
            "message": f"GSTIN must be exactly 15 characters (got {len(gstin)})",
            "verifiedAt": datetime.now().isoformat()
        }

    # Validate state code (01-37 are valid Indian state codes)
    try:
        state_code = int(gstin[:2])
        if state_code < 1 or state_code > 37:
            raise ValueError()
    except ValueError:
        return {
            "valid": False,
            "gstin": gstin,
            "status": "failed",
            "errorCode": "INVALID_STATE_CODE",
            "message": f"Invalid state code '{gstin[:2]}' — must be 01-37",
            "verifiedAt": datetime.now().isoformat()
        }

    # Simulate known cancelled GSTINs
    if gstin.startswith("00") or "INVALID" in gstin:
        return {
            "valid": False,
            "gstin": gstin,
            "status": "cancelled",
            "errorCode": "GST_CANCELLED",
            "message": "This GSTIN has been cancelled by tax authorities",
            "verifiedAt": datetime.now().isoformat()
        }

    state_names = {
        '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
        '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
        '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
        '10': 'Bihar', '27': 'Maharashtra', '29': 'Karnataka',
        '33': 'Tamil Nadu', '36': 'Telangana'
    }

    return {
        "valid": True,
        "gstin": gstin,
        "tradeName": f"Registered Entity ({gstin[2:7]})",
        "legalName": f"Legal Entity ({gstin[2:12]})",
        "registrationDate": "2019-07-01",
        "status": "Active",
        "gstType": "Regular",
        "stateJurisdiction": state_names.get(gstin[:2], f"State-{gstin[:2]}"),
        "lastReturnFiled": (datetime.now() - timedelta(days=random.randint(15, 60))).strftime("%Y-%m"),
        "verifiedAt": datetime.now().isoformat(),
        "source": "GSTN Portal (Mock)"
    }


def verify_udyam(udyam_no: str) -> dict:
    """
    Simulates Udyam Registration Portal verification.
    Valid format: UDYAM-XX-00-0000000 (XX = state code, 00 = district code)
    """
    time.sleep(random.uniform(0.1, 0.3))

    udyam_no = udyam_no.strip().upper()

    if not udyam_no.startswith("UDYAM-"):
        return {
            "valid": False,
            "udyamNo": udyam_no,
            "status": "failed",
            "errorCode": "INVALID_PREFIX",
            "message": "Udyam registration number must start with 'UDYAM-'",
            "verifiedAt": datetime.now().isoformat()
        }

    if "INVALID" in udyam_no:
        return {
            "valid": False,
            "udyamNo": udyam_no,
            "status": "rejected",
            "errorCode": "UDYAM_NOT_FOUND",
            "message": "This Udyam registration number is not found in the registry",
            "verifiedAt": datetime.now().isoformat()
        }

    parts = udyam_no.split("-")
    if len(parts) < 4:
        return {
            "valid": False,
            "udyamNo": udyam_no,
            "status": "failed",
            "errorCode": "INVALID_FORMAT",
            "message": "Udyam format must be UDYAM-XX-00-0000000",
            "verifiedAt": datetime.now().isoformat()
        }

    # Classify enterprise based on district code
    district_code = parts[2] if len(parts) > 2 else "00"
    classifications = {"00": "Micro", "01": "Micro", "02": "Small", "03": "Medium"}
    classification = classifications.get(district_code, "Small")

    state_map = {
        "MH": "Maharashtra", "DL": "Delhi", "KA": "Karnataka",
        "TN": "Tamil Nadu", "HR": "Haryana", "GJ": "Gujarat",
        "UP": "Uttar Pradesh", "RJ": "Rajasthan"
    }

    return {
        "valid": True,
        "udyamNo": udyam_no,
        "enterpriseName": f"MSME Enterprise ({parts[1]})",
        "classification": classification,
        "state": state_map.get(parts[1], f"State-{parts[1]}"),
        "investmentInPlant": f"₹{random.randint(10, 50)} Lakh",
        "annualTurnover": f"₹{random.randint(1, 25)} Cr",
        "registrationDate": "2021-04-01",
        "status": "Active",
        "verifiedAt": datetime.now().isoformat(),
        "source": "Udyam Portal (Mock)"
    }


def verify_msme(cert_no: str) -> dict:
    """Simulates MSME certificate verification."""
    time.sleep(random.uniform(0.05, 0.15))
    return {
        "valid": True,
        "certNo": cert_no,
        "status": "verified",
        "category": "MSME Registered",
        "verifiedAt": datetime.now().isoformat(),
        "source": "MSME Registry (Mock)"
    }


def verify_iso(cert_no: str) -> dict:
    """Simulates ISO certification verification."""
    time.sleep(random.uniform(0.05, 0.15))
    return {
        "valid": True,
        "certNo": cert_no,
        "status": "verified",
        "standard": "ISO 9001:2015",
        "certBody": "Bureau of Indian Standards",
        "validUntil": (datetime.now() + timedelta(days=365 * 2)).isoformat(),
        "verifiedAt": datetime.now().isoformat(),
        "source": "ISO Registry (Mock)"
    }


def verify_ca_turnover(cert_no: str) -> dict:
    """Simulates CA-certified turnover statement verification."""
    time.sleep(random.uniform(0.05, 0.15))
    return {
        "valid": True,
        "certNo": cert_no,
        "status": "verified",
        "auditorUDIN": f"UDIN-{random.randint(10000000, 99999999)}",
        "verifiedAt": datetime.now().isoformat(),
        "source": "ICAI UDIN Portal (Mock)"
    }


def verify_document(doc_type: str, doc_ref: str) -> dict:
    """
    Main router — dispatches to the correct verifier based on doc_type.
    
    Supported doc_types: PAN, GST, UDYAM, MSME, ISO, CA_TURNOVER
    """
    verifiers = {
        "PAN": verify_pan,
        "GST": verify_gst,
        "UDYAM": verify_udyam,
        "MSME": verify_msme,
        "ISO": verify_iso,
        "CA_TURNOVER": verify_ca_turnover
    }

    doc_type_upper = doc_type.strip().upper()
    verifier = verifiers.get(doc_type_upper)

    if not verifier:
        return {
            "valid": False,
            "docType": doc_type,
            "docRef": doc_ref,
            "status": "unsupported",
            "errorCode": "UNSUPPORTED_DOC_TYPE",
            "message": f"Document type '{doc_type}' is not supported. Supported: {', '.join(verifiers.keys())}",
            "verifiedAt": datetime.now().isoformat()
        }

    result = verifier(doc_ref)
    result["docType"] = doc_type_upper
    result["docRef"] = doc_ref
    return result
