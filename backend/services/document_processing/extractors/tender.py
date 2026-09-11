import re
from typing import Dict, Any, List

def extract_tender_fields(pages_text: List[str]) -> Dict[str, Any]:
    """
    Extracts Tender ID from document text.
    Format is typically GEM/YYYY/X/NNNNNN.
    """
    fields = {}
    
    # Preset Guideline Format: GEM/YYYY/X/NNNNNN (e.g. GEM/2026/B/891244)
    tender_id_pattern = re.compile(r'\bGEM\s*/\s*(\d{4})\s*/\s*([A-Z])\s*/\s*(\d{6})\b', re.IGNORECASE)
    
    tender_id_found = None
    found_page = 1
    evidence_text = ""
    
    for page in pages_text:
        text = page.get("text", "") if isinstance(page, dict) else str(page)
        page_num = page.get("page", 1) if isinstance(page, dict) else 1
        
        match = tender_id_pattern.search(text)
        if match:
            # Reconstruct standardized format GEM/YYYY/X/NNNNNN
            tender_id_found = f"GEM/{match.group(1)}/{match.group(2).upper()}/{match.group(3)}"
            found_page = page_num
            evidence_text = match.group(0).strip()
            break
            
    if tender_id_found:
        fields['tender_id'] = {
            'value': tender_id_found,
            'confidence': 99.0,
            'page': found_page,
            'evidence': f"Extracted Tender ID: {tender_id_found} (Matched: {evidence_text})"
        }
        
    return fields
