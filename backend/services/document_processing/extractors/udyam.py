import re
from typing import Dict, Any

def extract_udyam_fields(pages_text: list) -> Dict[str, Any]:
    fields = {}
    
    for page in pages_text:
        text = page["text"]
        page_num = page["page"]
        
        # Udyam Registration Number Extraction
        if "udyam_reg_no" not in fields:
            match = re.search(r"(UDYAM-[A-Z]{2}-\d{2}-\d{7})", text)
            if match:
                fields["udyam_reg_no"] = {
                    "value": match.group(1),
                    "confidence": 99.0,
                    "page": page_num,
                    "evidence": match.group(1)
                }

    return fields
