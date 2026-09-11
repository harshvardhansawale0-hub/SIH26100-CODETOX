import re
from typing import Dict, Any

def extract_udyam_fields(pages_text: list) -> Dict[str, Any]:
    fields = {}
    
    for page in pages_text:
        text = page["text"]
        page_num = page["page"]
        clean_text = re.sub(r'\s+', '', text)
        
        # UDYAM Extraction
        if "udyam_reg_no" not in fields:
            match = re.search(r"(UDYAM-[A-Z]{2}-\d{2}-\d{7})", clean_text, re.IGNORECASE)
            if match:
                fields["udyam_reg_no"] = {
                    "value": match.group(1),
                    "confidence": 99.0,
                    "page": page_num,
                    "evidence": match.group(1)
                }

    return fields
