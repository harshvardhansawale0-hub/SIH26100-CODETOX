import os
from typing import Optional

try:
    import pytesseract
    HAS_TESSERACT_PKG = True
    # Configure path for Windows if not in PATH
    if os.name == 'nt' and os.path.exists(r'C:\Program Files\Tesseract-OCR\tesseract.exe'):
        pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
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
    import traceback
    tesseract_cmd = getattr(pytesseract.pytesseract, 'tesseract_cmd', 'tesseract') if pytesseract else None
    
    if not HAS_TESSERACT:
        print("[OCR] OCR engine unavailable")
        return None
    try:
        print(f"[OCR] starting")
        print(f"image_path={getattr(image, 'filename', 'in-memory')}")
        print(f"tesseract_cmd={tesseract_cmd}")
        print(f"tesseract_exists={HAS_TESSERACT}")
        
        text = pytesseract.image_to_string(image, lang=lang)
        
        print(f"[OCR] completed")
        print(f"text_length={len(text) if text else 0}")
        return text.strip()
    except Exception as e:
        print(f"[OCR] OCR failed:")
        traceback.print_exc()
        return None
