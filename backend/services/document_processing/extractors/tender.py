import re
from typing import Dict, Any, List

def extract_tender_fields(pages_text: List[str]) -> Dict[str, Any]:
    """
    Extracts Tender ID from document text.
    Format is typically GEM/YYYY/X/NNNNNN.
    """
    fields = {}
    
    # GEM/YYYY/X/NNNNNN
    tender_id_pattern = re.compile(r'GEM/\d{4}/[A-Z]/\d{6}', re.IGNORECASE)
    
    tender_id_found = None
    
    for page in pages_text:
        match = tender_id_pattern.search(page)
        if match:
            tender_id_found = match.group(0).strip().upper()
            break
            
    if tender_id_found:
        fields['tender_id'] = {
            'value': tender_id_found,
            'confidence': 0.95
        }
        
    return fields
