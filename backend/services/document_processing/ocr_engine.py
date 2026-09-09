import os
from typing import Optional

try:
    import pytesseract
    HAS_TESSERACT_PKG = True
except ImportError:
    pytesseract = None
    HAS_TESSERACT_PKG = False

def check_tesseract_availability() -> bool:
    if not HAS_TESSERACT_PKG or pytesseract is None:
        return False
    try:
        pytesseract.get_tesseract_version()
        return True
    except Exception:
        return False

HAS_TESSERACT = check_tesseract_availability()

def perform_ocr_on_image(image, lang: str = "eng") -> Optional[str]:
    """
    Runs Tesseract OCR on a PIL Image or numpy array if Tesseract is available.
    Returns the extracted text, or None if Tesseract is missing/fails.
    """
    if not HAS_TESSERACT:
        return None
    try:
        text = pytesseract.image_to_string(image, lang=lang)
        return text.strip()
    except Exception as e:
        print(f"[OCR_ENGINE] OCR failed: {e}")
        return None
