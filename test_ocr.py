import requests
import time
from PIL import Image, ImageDraw, ImageFont

# Generate pan.jpeg
img = Image.new('RGB', (400, 100), color=(255, 255, 255))
d = ImageDraw.Draw(img)
d.text((50, 40), "AABCB1234F", fill=(0, 0, 0))
img.save('pan.jpeg')
print("Generated pan.jpeg")

print("Checking diagnostics...")
diag = requests.get("http://127.0.0.1:8000/api/diagnostics/ocr")
print("OCR Diagnostics:", diag.json())

print("Uploading pan.jpeg...")
with open("pan.jpeg", "rb") as f:
    res = requests.post("http://127.0.0.1:8000/api/verify/upload", files={"file": ("pan.jpeg", f, "image/jpeg")})
    
upload_data = res.json()
print("Upload Response:", upload_data)

file_id = upload_data.get("fileId")

print("Verifying bid...")
bid_payload = {
    "vendorName": "Apex Supplies Ltd.",
    "category": "IT Hardware",
    "tenderId": "GEM/2026/B/891244",
    "tenderValue": "1.45 Cr",
    "bidAmount": "1.38 Cr",
    "pan": "AABCB1234F",
    "panDocumentId": file_id,
    "gstin": "27AABCB1234F1Z5",
    "msmeRegNo": "",
    "turnoverClaim": "2.5 Cr",
    "experienceClaim": "3 Years",
    "miiDeclared": "75%",
    "submittedBy": "Vendor Representative",
    "vendorEmail": "vendor@apex.com"
}
verify_res = requests.post("http://127.0.0.1:8000/api/verify/bid", json=bid_payload)
print("Verify Response:", verify_res.json())

print("Testing 1. Entered = AABCB1234F")
bid_payload["pan"] = "AABCB1234F"
bid_payload["panDocumentId"] = file_id
verify_res_1 = requests.post("http://127.0.0.1:8000/api/verify/bid", json=bid_payload)
print("1. Result:", verify_res_1.json().get("fieldMatches", {}).get("pan"))

print("Testing 2. Entered = AABCB9999F")
bid_payload["pan"] = "AABCB9999F"
verify_res_2 = requests.post("http://127.0.0.1:8000/api/verify/bid", json=bid_payload)
print("2. Result:", verify_res_2.json().get("fieldMatches", {}).get("pan"))

print("Testing 3. Entered = XYZAB5678C")
bid_payload["pan"] = "XYZAB5678C"
verify_res_3 = requests.post("http://127.0.0.1:8000/api/verify/bid", json=bid_payload)
print("3. Result:", verify_res_3.json().get("fieldMatches", {}).get("pan"))

print("Testing 4. Entered = AABCB1234F")
bid_payload["pan"] = "AABCB1234F"
verify_res_4 = requests.post("http://127.0.0.1:8000/api/verify/bid", json=bid_payload)
print("4. Result:", verify_res_4.json().get("fieldMatches", {}).get("pan"))
