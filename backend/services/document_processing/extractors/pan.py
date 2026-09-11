import re
from typing import Dict, Any

def extract_pan_fields(pages_text: list) -> Dict[str, Any]:
    fields = {}
    
    for page in pages_text:
        text = page.get("text", "") if isinstance(page, dict) else str(page)
        page_num = page.get("page", 1) if isinstance(page, dict) else 1
        
        # PAN Extraction (Preset Guideline: 5 uppercase letters, 4 digits, 1 uppercase letter)
        if "pan" not in fields:
            match = re.search(r"\b([A-Z]{5}[0-9]{4}[A-Z])\b", text.upper())
            if match:
                pan_val = match.group(1).upper()
                fields["pan"] = {
                    "value": pan_val,
                    "confidence": 99.0,
                    "page": page_num,
                    "evidence": f"Extracted PAN: {pan_val}"
                }

    return fields
