import fitz  # PyMuPDF
from PIL import Image
from typing import Dict, Any, List
from .ocr_engine import perform_ocr_on_image, HAS_TESSERACT
from .image_preprocessor import preprocess_image_for_ocr

def extract_text_from_pdf(file_path: str) -> Dict[str, Any]:
    """
    Safely opens a PDF, attempts embedded text extraction.
    If text is missing/poor, attempts OCR via Tesseract (if available) by rendering pages to images.
    """
    result = {
        "page_count": 0,
        "extracted_text": "",
        "extraction_method": "embedded_text",
        "ocr_used": False,
        "ocr_confidence": 100.0,
        "pages_text": [],
        "errors": []
    }
    
    try:
        doc = fitz.open(file_path)
        result["page_count"] = len(doc)
        
        full_text = ""
        poor_text_pages = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text").strip()
            
            # Simple heuristic: if a page has very few characters but might contain an image,
            # it might be a scanned page.
            if len(text) < 50:
                poor_text_pages.append(page_num)
            
            full_text += text + "\n"
            result["pages_text"].append({"page": page_num + 1, "text": text})
            
        result["extracted_text"] = full_text
        
        # If we have mostly empty pages, try OCR fallback
        if len(poor_text_pages) > 0 and (len(full_text.strip()) < 100):
            if HAS_TESSERACT:
                result["extraction_method"] = "ocr_fallback"
                result["ocr_used"] = True
                result["extracted_text"] = ""
                result["pages_text"] = []
                
                for page_num in range(len(doc)):
                    page = doc[page_num]
                    # Render page to an image (zoom 2x for better OCR)
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    # Convert to PIL Image
                    mode = "RGBA" if pix.alpha else "RGB"
                    img = Image.frombytes(mode, [pix.width, pix.height], pix.samples)
                    
                    processed_img = preprocess_image_for_ocr(img)
                    ocr_text = perform_ocr_on_image(processed_img)
                    if ocr_text:
                        result["extracted_text"] += ocr_text + "\n"
                        result["pages_text"].append({"page": page_num + 1, "text": ocr_text})
            else:
                result["errors"].append("OCR fallback needed but Tesseract is unavailable.")
                
        doc.close()
        
    except Exception as e:
        result["errors"].append(str(e))
        
    return result
