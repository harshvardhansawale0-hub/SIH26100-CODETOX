from typing import Dict, Any

def classify_document(extracted_text: str) -> Dict[str, Any]:
    """
    Classifies a document based on content signals in the extracted text.
    Never relies on filename.
    """
    text_lower = extracted_text.lower()
    
    signals = {
        "GST_CERTIFICATE": ["gstin", "goods and services tax", "registration certificate", "form gst reg-06", "taxpayer trade name"],
        "PAN_CARD": ["permanent account number", "income tax department", "govt of india"],
        "UDYAM_CERTIFICATE": ["udyam", "udyam registration", "msme", "ministry of micro, small and medium enterprises"],
        "CA_TURNOVER_CERTIFICATE": ["turnover", "chartered accountant", "udin", "audited balance sheet", "profit and loss"],
        "MAKE_IN_INDIA_DECLARATION": ["make in india", "local content", "domestic value addition", "class-i local supplier", "class-ii local supplier"]
    }
    
    scores = {doc_type: 0 for doc_type in signals}
    
    for doc_type, keywords in signals.items():
        for keyword in keywords:
            if keyword in text_lower:
                scores[doc_type] += 1
                
    # Find the document type with the highest score
    best_match = max(scores, key=scores.get)
    max_score = scores[best_match]
    
    if max_score >= 2:
        confidence = min(100, max_score * 25 + 50) # simple heuristic
        return {
            "document_type": best_match,
            "classification_confidence": confidence,
            "classification_method": "content_based"
        }
    elif max_score == 1:
        return {
            "document_type": best_match,
            "classification_confidence": 40.0,
            "classification_method": "content_based"
        }
    else:
        return {
            "document_type": "UNKNOWN",
            "classification_confidence": 0.0,
            "classification_method": "content_based"
        }
