import re

def validate_pan_format(pan: str) -> bool:
    if not pan:
        return False
    # Format: 5 letters, 4 digits, 1 letter
    return bool(re.match(r"^[A-Z]{5}\d{4}[A-Z]$", pan.strip().upper()))

def validate_gst_format(gstin: str) -> bool:
    if not gstin:
        return False
    # Format: 2 digits, 10 PAN characters, 1 digit/letter, Z, 1 digit/letter
    return bool(re.match(r"^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$", gstin.strip().upper()))

def validate_numeric(value: str) -> bool:
    if not value:
        return False
    val = value.replace(",", "").replace("₹", "").replace("%", "").strip()
    try:
        float(val)
        return True
    except ValueError:
        return False
