import cv2
import numpy as np
from PIL import Image

def preprocess_image_for_ocr(image: Image.Image) -> np.ndarray:
    """
    Takes a PIL Image, applies OpenCV preprocessing (grayscale, thresholding, etc.)
    and returns a numpy array ready for OCR.
    """
    # Convert PIL Image to OpenCV format (numpy array)
    img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    # Convert to grayscale
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)

    # Resize image to improve OCR accuracy if it's too small
    height, width = gray.shape
    if height < 1000 or width < 1000:
        gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    # Apply adaptive thresholding to handle varying illumination
    # Alternatively, Otsu's thresholding
    # thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 2)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Simple noise removal
    kernel = np.ones((1, 1), np.uint8)
    processed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    
    return processed
