"""
Compliance Passport Signing & QR Code Generation Service
RSA-2048 PSS digital signatures for tamper-proof credential issuance.
"""

import os
import json
import hashlib
import base64
import io
from datetime import datetime, timedelta
from typing import Optional

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature

import qrcode
from qrcode.constants import ERROR_CORRECT_H


# =========================================================================
# Key Management
# =========================================================================

KEYS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "keys")
PRIVATE_KEY_PATH = os.path.join(KEYS_DIR, "private_key.pem")

_private_key_cache = None


def _ensure_keys_dir():
    """Create the keys directory if it doesn't exist."""
    os.makedirs(KEYS_DIR, exist_ok=True)


def _get_private_key():
    """
    Load or auto-generate RSA-2048 keypair.
    Private key is PEM-encoded and stored at backend/keys/private_key.pem.
    For production, replace with KMS integration.
    """
    global _private_key_cache
    if _private_key_cache is not None:
        return _private_key_cache

    _ensure_keys_dir()

    if os.path.exists(PRIVATE_KEY_PATH):
        with open(PRIVATE_KEY_PATH, "rb") as f:
            _private_key_cache = serialization.load_pem_private_key(
                f.read(), password=None, backend=default_backend()
            )
    else:
        # Auto-generate new RSA-2048 keypair
        _private_key_cache = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        pem = _private_key_cache.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        with open(PRIVATE_KEY_PATH, "wb") as f:
            f.write(pem)
        print(f"[*] Generated new RSA-2048 keypair at {PRIVATE_KEY_PATH}")

    return _private_key_cache


def get_public_key_pem() -> str:
    """Derive and return PEM-encoded public key string."""
    private_key = _get_private_key()
    public_key = private_key.public_key()
    pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    return pem.decode("utf-8")


# =========================================================================
# Digital Signing & Verification
# =========================================================================

def sign_payload(payload_json: str) -> str:
    """
    RSA-PSS sign a JSON payload string with SHA-256.
    Returns base64-encoded signature.
    """
    private_key = _get_private_key()
    signature = private_key.sign(
        payload_json.encode("utf-8"),
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    return base64.b64encode(signature).decode("utf-8")


def verify_signature(payload_json: str, signature_b64: str) -> bool:
    """
    Verify RSA-PSS signature against the payload.
    Returns True if valid, False if tampered or invalid.
    """
    try:
        private_key = _get_private_key()
        public_key = private_key.public_key()
        signature = base64.b64decode(signature_b64)
        public_key.verify(
            signature,
            payload_json.encode("utf-8"),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return True
    except (InvalidSignature, Exception):
        return False


# =========================================================================
# PII Masking
# =========================================================================

def mask_pan(pan: str) -> str:
    """Mask PAN: AABCB1234F → XXXCB1234X"""
    if not pan or len(pan) < 10:
        return "XXXXXXXXXX"
    return "XXX" + pan[3:9] + "X"


def mask_gstin(gstin: str) -> str:
    """Mask GSTIN: 27AABCB1234F1Z5 → 27XXXX1234X1Z5"""
    if not gstin or len(gstin) < 15:
        return "XXXXXXXXXXXXXXX"
    return gstin[:2] + "XXXX" + gstin[6:10] + "X" + gstin[11:]


# =========================================================================
# Payload Builder
# =========================================================================

def build_passport_payload(vendor: dict, verifications: list) -> dict:
    """
    Assemble the credential payload from vendor + verification records.
    This payload gets digitally signed.
    """
    import uuid

    passport_id = str(uuid.uuid4())
    now = datetime.now()

    # Calculate expiry: 12 months or earliest cert expiry, whichever is sooner
    default_expiry = now + timedelta(days=365)
    earliest_cert_expiry = default_expiry

    verified_credentials = []
    for v in verifications:
        if v.get("status") == "verified":
            cred = {
                "type": v["docType"],
                "verifiedAt": v.get("verifiedAt", now.isoformat()),
            }
            if v.get("expiresAt"):
                cred["expiresAt"] = v["expiresAt"]
                try:
                    cert_exp = datetime.fromisoformat(v["expiresAt"])
                    if cert_exp < earliest_cert_expiry:
                        earliest_cert_expiry = cert_exp
                except (ValueError, TypeError):
                    pass
            verified_credentials.append(cred)

    expires_at = min(default_expiry, earliest_cert_expiry)

    payload = {
        "passportId": passport_id,
        "vendorId": vendor.get("id"),
        "vendorName": vendor.get("name", "Unknown Vendor"),
        "gstinMasked": mask_gstin(vendor.get("gstin", "")),
        "panMasked": mask_pan(vendor.get("pan", "")),
        "udyamNo": vendor.get("udyamNo") or vendor.get("udyam_no"),
        "miiClassification": vendor.get("miiClassification") or vendor.get("mii_classification", "Not Classified"),
        "complianceScore": vendor.get("complianceScore") or vendor.get("compliance_score", 0),
        "verifiedCredentials": verified_credentials,
        "issuedAt": now.isoformat(),
        "expiresAt": expires_at.isoformat(),
    }

    return payload


def compute_payload_hash(payload_json: str) -> str:
    """SHA-256 hex digest of the payload JSON string."""
    return hashlib.sha256(payload_json.encode("utf-8")).hexdigest()


# =========================================================================
# QR Code Generation
# =========================================================================

def generate_qr_code(data: str) -> bytes:
    """
    Generate a PNG QR code image from a string.
    Returns raw PNG bytes.
    """
    qr = qrcode.QRCode(
        version=None,  # Auto-size
        error_correction=ERROR_CORRECT_H,
        box_size=8,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#0b1a2d", back_color="#ffffff")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer.getvalue()


def generate_passport_qr(passport_payload: dict, verification_url_base: str = "/api/passport") -> bytes:
    """
    Generate a QR code for a compliance passport.
    QR contains compact JSON with passport ID, vendor name, score, and verification URL.
    Does NOT include raw PII — only masked values and a lookup reference.
    """
    qr_data = {
        "passportId": passport_payload["passportId"],
        "vendor": passport_payload["vendorName"],
        "score": passport_payload["complianceScore"],
        "mii": passport_payload["miiClassification"],
        "issued": passport_payload["issuedAt"][:10],
        "expires": passport_payload["expiresAt"][:10],
        "verify": f"{verification_url_base}/{passport_payload['passportId']}/verify",
        "hash": compute_payload_hash(json.dumps(passport_payload, sort_keys=True))[:16]
    }

    return generate_qr_code(json.dumps(qr_data, separators=(',', ':')))
