import re
from typing import Dict, Any

def extract_pan_fields(pages_text: list) -> Dict[str, Any]:
    fields = {}
    
    total_length = sum(len(p.get("text", "") if isinstance(p, dict) else str(p)) for p in pages_text)
    print(f"[EXTRACTOR]")
    print(f"type=PAN")
    print(f"text_length={total_length}")
    
    pan_found = False
    for page in pages_text:
        text = page.get("text", "") if isinstance(page, dict) else str(page)
        page_num = page.get("page", 1) if isinstance(page, dict) else 1
        clean_text = re.sub(r'\s+', '', text).upper()
        
        # PAN Extraction (Preset Guideline: 5 uppercase letters, 4 digits, 1 uppercase letter)
        if "pan" not in fields:
            match = re.search(r"\b([A-Z]{5}[0-9]{4}[A-Z])\b", text.upper()) or re.search(r"([A-Z]{5}[0-9]{4}[A-Z])", clean_text)
            if match:
                pan_val = match.group(1).upper()
                fields["pan"] = {
                    "value": pan_val,
                    "confidence": 99.0,
                    "page": page_num,
                    "evidence": f"Extracted PAN: {pan_val}"
                }
                pan_found = True
                print(f"[EXTRACTOR] PAN extracted successfully")
                
    print(f"pan_found={pan_found}")
    return fields
