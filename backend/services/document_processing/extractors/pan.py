import re
from typing import Dict, Any

def extract_pan_fields(pages_text: list) -> Dict[str, Any]:
    fields = {}
    
    total_length = sum(len(page.get("text", "")) for page in pages_text)
    print(f"[EXTRACTOR]")
    print(f"type=PAN")
    print(f"text_length={total_length}")
    
    pan_found = False
    for page in pages_text:
        text = page["text"]
        page_num = page["page"]
        clean_text = re.sub(r'\s+', '', text)
        
        # PAN Extraction
        if "pan" not in fields:
            # Look for 5 letters, 4 digits, 1 letter
            match = re.search(r"([A-Z]{5}[0-9]{4}[A-Z])", clean_text)
            if match:
                fields["pan"] = {
                    "value": match.group(1),
                    "confidence": 99.0,
                    "page": page_num,
                    "evidence": f"Extracted PAN: {match.group(1)}"
                }
                pan_found = True
                print(f"[EXTRACTOR] PAN extracted successfully")
                
    print(f"pan_found={pan_found}")
    return fields
