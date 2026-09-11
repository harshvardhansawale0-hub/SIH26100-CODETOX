import re

def validate_pan_format(pan: str) -> bool:
    if not pan:
        return False
    # Preset Format: 5 letters, 4 digits, 1 letter (e.g. AABCB1234F)
    return bool(re.match(r"^[A-Z]{5}\d{4}[A-Z]$", pan.strip().upper()))

def validate_gst_format(gstin: str) -> bool:
    if not gstin:
        return False
    # Preset Format: 2 digits state code, 10-char PAN, 1 entity code, 'Z', 1 checksum (e.g. 27AABCB1234F1Z5)
    return bool(re.match(r"^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$", gstin.strip().upper()))

def validate_udyam_format(udyam: str) -> bool:
    if not udyam:
        return False
    # Preset Format: UDYAM-[2 State Letters]-[2 Digits]-[5 to 10 Digits] (e.g. UDYAM-MH-03-0019284)
    return bool(re.match(r"^UDYAM-[A-Z]{2}-\d{2}-\d{5,10}$", udyam.strip().upper()))

def validate_tender_format(tender_id: str) -> bool:
    if not tender_id:
        return False
    # Preset Format: GEM/YYYY/X/NNNNNN (e.g. GEM/2026/B/891244)
    return bool(re.match(r"^GEM/\d{4}/[A-Z]/\d{6}$", tender_id.strip().upper()))

def validate_ca_udin_format(udin: str) -> bool:
    if not udin:
        return False
    # Preset Format: UDIN: 18-character alphanumeric ICAI identifier (e.g. 26084912AAAAAA1234)
    cleaned = re.sub(r'[^A-Z0-9]', '', udin.strip().upper())
    return bool(re.match(r"^(?:UDIN)?[A-Z0-9]{18}$", cleaned))

def validate_numeric(value: str) -> bool:
    if not value:
        return False
    val = value.replace(",", "").replace("₹", "").replace("%", "").strip()
    try:
        float(val)
        return True
    except ValueError:
        return False

PRESET_GUIDELINES = {
    "pan": {
        "name": "Permanent Account Number (PAN)",
        "pattern": r"^[A-Z]{5}\d{4}[A-Z]$",
        "search_pattern": r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",
        "example": "AABCB1234F",
        "description": "5 uppercase letters, 4 digits, 1 uppercase letter",
        "validator": validate_pan_format
    },
    "gstin": {
        "name": "Goods & Services Tax Identification Number (GSTIN)",
        "pattern": r"^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$",
        "search_pattern": r"\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]\b",
        "example": "27AABCB1234F1Z5",
        "description": "2-digit state code, 10-char PAN, 1 entity code, 'Z', 1 checksum character",
        "validator": validate_gst_format
    },
    "udyam": {
        "name": "Udyam / MSME Registration Number",
        "pattern": r"^UDYAM-[A-Z]{2}-\d{2}-\d{5,10}$",
        "search_pattern": r"\bUDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{5,10}\b",
        "example": "UDYAM-MH-03-0019284",
        "description": "UDYAM followed by 2-letter state code, 2-digit district code, and 5-10 digit registration number",
        "validator": validate_udyam_format
    },
    "tender_id": {
        "name": "GeM Tender Identification Number",
        "pattern": r"^GEM/\d{4}/[A-Z]/\d{6}$",
        "search_pattern": r"\bGEM/\d{4}/[A-Z]/\d{6}\b",
        "example": "GEM/2026/B/891244",
        "description": "GEM followed by 4-digit year, single uppercase category letter, and 6-digit serial number",
        "validator": validate_tender_format
    },
    "ca_udin": {
        "name": "ICAI CA Unique Document Identification Number (UDIN)",
        "pattern": r"^(?:UDIN)?[A-Z0-9]{18}$",
        "search_pattern": r"\b(?:UDIN\s*[:\-]?\s*)?[A-Z0-9]{18}\b",
        "example": "26084912AAAAAA1234",
        "description": "18-character official ICAI Chartered Accountant certification identifier",
        "validator": validate_ca_udin_format
    }
}
