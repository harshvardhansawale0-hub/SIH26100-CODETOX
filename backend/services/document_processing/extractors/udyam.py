import re
from typing import Dict, Any

def extract_udyam_fields(pages_text: list) -> Dict[str, Any]:
    fields = {}
    
    for page in pages_text:
        text = page.get("text", "") if isinstance(page, dict) else str(page)
        page_num = page.get("page", 1) if isinstance(page, dict) else 1
        clean_text = re.sub(r'\s+', '', text)
        
        # Udyam Registration Number Extraction (Preset Guideline: UDYAM-[2 State Letters]-[2 Digits]-[5 to 10 Digits])
        if "udyam_reg_no" not in fields:
            match = re.search(r"\b(UDYAM-[A-Z]{2}-\d{2}-\d{5,10})\b", text.upper()) or re.search(r"(UDYAM-[A-Z]{2}-\d{2}-\d{5,10})", clean_text, re.IGNORECASE)
            if match:
                udyam_val = match.group(1).upper()
                fields["udyam_reg_no"] = {
                    "value": udyam_val,
                    "confidence": 99.0,
                    "page": page_num,
                    "evidence": f"Extracted Udyam Reg No: {udyam_val}"
                }

    return fields
