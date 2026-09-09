import re
from typing import Dict, Any

def extract_pan_fields(pages_text: list) -> Dict[str, Any]:
    fields = {}
    
    for page in pages_text:
        text = page["text"]
        page_num = page["page"]
        
        # PAN Extraction
        if "pan" not in fields:
            # Look for 5 letters, 4 digits, 1 letter
            match = re.search(r"([A-Z]{5}[0-9]{4}[A-Z])", text)
            if match:
                fields["pan"] = {
                    "value": match.group(1),
                    "confidence": 99.0,
                    "page": page_num,
                    "evidence": f"Extracted PAN: {match.group(1)}"
                }

    return fields
