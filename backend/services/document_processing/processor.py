from typing import Dict, Any
import os

from .pdf_extractor import extract_text_from_pdf
from .classifier import classify_document
from .extractors.gst import extract_gst_fields
from .extractors.pan import extract_pan_fields
from .extractors.udyam import extract_udyam_fields
from .extractors.turnover import extract_turnover_fields
from .extractors.make_in_india import extract_mii_fields

def process_document(file_path: str, original_filename: str = "") -> Dict[str, Any]:
    """
    Main orchestration function for processing an uploaded document.
    """
    # 1. Extract text (PyMuPDF with Tesseract OCR fallback)
    extraction_result = extract_text_from_pdf(file_path)
    
    # 2. Classify document
    classification_result = classify_document(extraction_result["extracted_text"])
    
    # 3. Extract specific fields based on classification (now runs all for bundle support)
    extracted_fields = {}
    doc_type = classification_result["document_type"]
    
    pages_text = extraction_result["pages_text"]
    
    # Run all extractors and merge results to support multi-document bundles
    extracted_fields.update(extract_gst_fields(pages_text))
    extracted_fields.update(extract_pan_fields(pages_text))
    extracted_fields.update(extract_udyam_fields(pages_text))
    extracted_fields.update(extract_turnover_fields(pages_text))
    extracted_fields.update(extract_mii_fields(pages_text))

        
    from .validators import validate_pan_format, validate_gst_format, validate_numeric
    
    validation_results = []
    for field_name, field_data in extracted_fields.items():
        val = field_data["value"]
        is_valid = False
        if field_name == "pan":
            is_valid = validate_pan_format(val)
        elif field_name == "gstin":
            is_valid = validate_gst_format(val)
        elif field_name in ["turnover", "local_content_percentage"]:
            is_valid = validate_numeric(val)
        else:
            is_valid = bool(val) # fallback for udyam or others
            
        validation_results.append({
            "field": field_name,
            "value": val,
            "valid": is_valid,
            "validation_status": "LOCAL_VALIDATION_PASSED" if is_valid else "LOCAL_VALIDATION_FAILED",
            "checks": [f"Format validation for {field_name}"]
        })
        
    return {
        "original_filename": original_filename,
        "processing": {
            "method": extraction_result["extraction_method"],
            "ocr_used": extraction_result["ocr_used"],
            "page_count": extraction_result["page_count"],
            "errors": extraction_result["errors"]
        },
        "classification": classification_result,
        "fields": extracted_fields,
        "validation_results": validation_results,
        "extracted_text_preview": extraction_result["extracted_text"][:500] if extraction_result["extracted_text"] else ""
    }
