import re
from typing import Dict, Any

def extract_gst_fields(pages_text: list) -> Dict[str, Any]:
    fields = {}
    
    for page in pages_text:
        text = page["text"]
        page_num = page["page"]
        
        # GSTIN Extraction
        if "gstin" not in fields:
            match = re.search(r"([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})", text)
            if match:
                fields["gstin"] = {
                    "value": match.group(1),
                    "confidence": 98.0,
                    "page": page_num,
                    "evidence": f"Found GSTIN: {match.group(1)}"
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
