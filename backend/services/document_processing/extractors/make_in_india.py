import re
from typing import Dict, Any

def extract_mii_fields(pages_text: list) -> Dict[str, Any]:
    fields = {}
    
    for page in pages_text:
        text = page["text"]
        page_num = page["page"]
        
        # Local Content Extraction
        if "local_content_percentage" not in fields:
            match = re.search(r"Local\s*Content[^\d]+(\d{1,3})\s*%", text, re.IGNORECASE)
            if match:
                fields["local_content_percentage"] = {
                    "value": f"{match.group(1)}%",
                    "confidence": 92.0,
                    "page": page_num,
                    "evidence": match.group(0)
                }

    return fields
