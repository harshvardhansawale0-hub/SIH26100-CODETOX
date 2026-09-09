import re
from typing import Dict, Any

def extract_turnover_fields(pages_text: list) -> Dict[str, Any]:
    fields = {}
    
    for page in pages_text:
        text = page["text"]
        page_num = page["page"]
        
        # CA UDIN Extraction
        if "udin" not in fields:
            match = re.search(r"UDIN\s*[:\-]?\s*([0-9A-Z]{18})", text)
            if match:
                fields["udin"] = {
                    "value": match.group(1),
                    "confidence": 95.0,
                    "page": page_num,
                    "evidence": match.group(0)
                }

    return fields
