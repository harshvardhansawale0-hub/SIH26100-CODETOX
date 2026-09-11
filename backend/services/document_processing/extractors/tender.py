import re
from typing import Dict, Any, List

def extract_tender_fields(pages_text: List[str]) -> Dict[str, Any]:
    """
    Extracts Tender ID from document text.
    Format is typically GEM/YYYY/X/NNNNNN.
    """
    fields = {}
    
    # GEM/YYYY/X/NNNNNN (allow missing slashes and alphanumeric for X due to OCR artifacts)
    tender_id_pattern = re.compile(r'GEM/?\d{4}/?[A-Z0-9]/?\d{6}', re.IGNORECASE)
    
    tender_id_found = None
    
    for page in pages_text:
        text = page["text"]
        clean_text = re.sub(r'\s+', '', text)
        match = tender_id_pattern.search(clean_text)
        if match:
            tender_id_found = match.group(0).strip().upper()
            break
            
    if tender_id_found:
        fields['tender_id'] = {
            'value': tender_id_found,
            'confidence': 0.95
        }
        
    return fields
