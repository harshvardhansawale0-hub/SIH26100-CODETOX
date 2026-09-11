import re
from typing import Dict, Any

def extract_gst_fields(pages_text: list) -> Dict[str, Any]:
    fields = {}
    
    for page in pages_text:
        text = page.get("text", "") if isinstance(page, dict) else str(page)
        page_num = page.get("page", 1) if isinstance(page, dict) else 1
        upper_text = text.upper()
        clean_text = re.sub(r'\s+', '', upper_text)
        
        # GSTIN Extraction (Preset Guideline: 2 digits, 5 letters, 4 digits, 1 letter, 1 alphanumeric, Z, 1 alphanumeric)
        if "gstin" not in fields:
            match = re.search(r"\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])\b", upper_text) or re.search(r"([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])", clean_text)
            if match:
                gstin_val = match.group(1)
                fields["gstin"] = {
                    "value": gstin_val,
                    "confidence": 98.5,
                    "page": page_num,
                    "evidence": f"Found GSTIN: {gstin_val}"
                }
                # Also extract embedded PAN (chars 3 to 12: 5 letters + 4 digits + 1 letter)
                embedded_pan = gstin_val[2:12]
                if "pan" not in fields:
                    fields["pan"] = {
                        "value": embedded_pan,
                        "confidence": 98.0,
                        "page": page_num,
                        "evidence": f"Extracted PAN from GSTIN: {embedded_pan}"
                    }
                
        # Legal Name Extraction (Very simplified regex for demo)
        if "legal_name" not in fields:
            match = re.search(r"(?:Legal Name|Name)\s*[:\-]?\s*([A-Z\s]+)", text, re.IGNORECASE)
            if match and len(match.group(1).strip()) > 3:
                fields["legal_name"] = {
                    "value": match.group(1).strip(),
                    "confidence": 85.0,
                    "page": page_num,
                    "evidence": match.group(0).strip()
                }

    return fields
