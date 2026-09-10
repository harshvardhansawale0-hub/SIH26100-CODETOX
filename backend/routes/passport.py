"""
Compliance Passport & Seller Verification API Routes
Digital credential issuance, verification, and revocation endpoints.
"""

import json
import time
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from collections import defaultdict

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import Response

from ..database import (
    get_all_vendors, get_vendor_by_id, get_verifications_for_vendor,
    create_verification, create_passport, get_passport, get_passport_by_vendor,
    revoke_passport as db_revoke_passport, log_passport_presentation,
    get_passport_presentations, get_all_passports, log_audit_event
)
from ..models import (
    DocumentVerifyRequest, PassportVerifyRequest, PassportVerifyResponse,
    PassportRevokeRequest
)
from ..services.doc_verifier import verify_document
from ..services.passport_service import (
    build_passport_payload, sign_payload, verify_signature,
    compute_payload_hash, generate_passport_qr, get_public_key_pem,
    mask_pan, mask_gstin
)

router = APIRouter(prefix="/api", tags=["Compliance Passport & Seller Verification"])

# =========================================================================
# Simple Rate Limiter (in-memory)
# =========================================================================

_rate_limit_store: Dict[str, list] = defaultdict(list)
RATE_LIMIT_MAX = 30  # requests
RATE_LIMIT_WINDOW = 60  # seconds


def _check_rate_limit(ip: str) -> bool:
    """Returns True if request is allowed, False if rate-limited."""
    now = time.time()
    # Clean old entries
    _rate_limit_store[ip] = [t for t in _rate_limit_store[ip] if now - t < RATE_LIMIT_WINDOW]
    if len(_rate_limit_store[ip]) >= RATE_LIMIT_MAX:
        return False
    _rate_limit_store[ip].append(now)
    return True


# =========================================================================
# Vendor Endpoints
# =========================================================================

@router.get("/vendors", response_model=List[Dict[str, Any]])
def list_vendors():
    """List all vendors with their passport status."""
    vendors = get_all_vendors()
    passports = get_all_passports()

    # Build vendor → passport lookup
    passport_map = {}
    for p in passports:
        if p["status"] == "active":
            passport_map[p["vendorId"]] = p

    enriched = []
    for v in vendors:
        p = passport_map.get(v["id"])
        verifications = get_verifications_for_vendor(v["id"])
        verified_count = sum(1 for vr in verifications if vr["status"] == "verified")
        enriched.append({
            **v,
            "passportId": p["id"] if p else None,
            "passportStatus": p["status"] if p else None,
            "passportExpiresAt": p["expiresAt"] if p else None,
            "verifiedDocsCount": verified_count
        })

    return enriched


@router.get("/vendors/{vendor_id}", response_model=Dict[str, Any])
def get_vendor_detail(vendor_id: int):
    """Get vendor details with verifications and passport."""
    vendor = get_vendor_by_id(vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail=f"Vendor with id {vendor_id} not found")

    verifications = get_verifications_for_vendor(vendor_id)
    passport = get_passport_by_vendor(vendor_id)
    presentations = []
    if passport:
        presentations = get_passport_presentations(passport["id"])

    return {
        "vendor": vendor,
        "verifications": verifications,
        "passport": passport,
        "presentations": presentations
    }


# =========================================================================
# Document Verification Endpoints
# =========================================================================

@router.post("/vendors/{vendor_id}/verify-documents", response_model=List[Dict[str, Any]])
def verify_vendor_documents(vendor_id: int, req: DocumentVerifyRequest):
    """
    Submit documents for verification against mock government APIs.
    Each document in req.documents should have: {"docType": "PAN", "docRef": "AABCB1234F"}
    """
    vendor = get_vendor_by_id(vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail=f"Vendor with id {vendor_id} not found")

    results = []
    for doc in req.documents:
        doc_type = doc.get("docType", "").upper()
        doc_ref = doc.get("docRef", "")

        if not doc_type or not doc_ref:
            results.append({
                "docType": doc_type, "docRef": doc_ref,
                "status": "failed", "message": "Missing docType or docRef"
            })
            continue

        # Run mock verification
        api_result = verify_document(doc_type, doc_ref)

        # Determine expiry (2 years for PAN/GST, 1 year for others)
        expires_at = None
        if api_result.get("valid"):
            from datetime import timedelta
            if doc_type in ["PAN", "GST"]:
                expires_at = (datetime.now() + timedelta(days=730)).isoformat()
            elif api_result.get("validUntil"):
                expires_at = api_result["validUntil"]
            else:
                expires_at = (datetime.now() + timedelta(days=365)).isoformat()

        verification_id = str(uuid.uuid4())
        v_status = "verified" if api_result.get("valid") else "failed"
        verified_at = datetime.now().isoformat() if api_result.get("valid") else None

        record = create_verification(
            verification_id=verification_id,
            vendor_id=vendor_id,
            doc_type=doc_type,
            doc_ref=doc_ref,
            status=v_status,
            verified_at=verified_at,
            expires_at=expires_at,
            verification_method="mock",
            details=json.dumps(api_result)
        )

        results.append(record)

        # Audit log
        log_audit_event(
            event_type="DOCUMENT_VERIFICATION",
            entity_id=f"vendor-{vendor_id}",
            user_agent="CompliancePassportService",
            details=json.dumps({
                "docType": doc_type, "docRef": doc_ref[:4] + "****",
                "result": v_status, "verificationId": verification_id
            })
        )

    return results


# =========================================================================
# Passport Issuance
# =========================================================================

@router.post("/vendors/{vendor_id}/passport/issue", response_model=Dict[str, Any],
             status_code=status.HTTP_201_CREATED)
def issue_passport(vendor_id: int):
    """
    Issue a digitally-signed Compliance Passport after all required documents are verified.
    Required: At least PAN + GST must be verified. Udyam is optional but included if verified.
    """
    vendor = get_vendor_by_id(vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail=f"Vendor with id {vendor_id} not found")

    if vendor.get("blacklisted"):
        raise HTTPException(status_code=403, detail="Cannot issue passport to blacklisted vendor")

    verifications = get_verifications_for_vendor(vendor_id)
    verified_docs = {v["docType"]: v for v in verifications if v["status"] == "verified"}

    # Require at least PAN + GST
    if "PAN" not in verified_docs or "GST" not in verified_docs:
        missing = []
        if "PAN" not in verified_docs:
            missing.append("PAN")
        if "GST" not in verified_docs:
            missing.append("GST")
        raise HTTPException(
            status_code=400,
            detail=f"Cannot issue passport — missing verified documents: {', '.join(missing)}. "
                   f"Please verify these documents first via POST /api/vendors/{vendor_id}/verify-documents"
        )

    # Build credential payload
    payload = build_passport_payload(vendor, list(verified_docs.values()))
    payload_json = json.dumps(payload, sort_keys=True)

    # Sign the payload
    signature = sign_payload(payload_json)
    payload_hash = compute_payload_hash(payload_json)

    # Persist to database
    passport_record = create_passport(
        passport_id=payload["passportId"],
        vendor_id=vendor_id,
        issued_at=payload["issuedAt"],
        expires_at=payload["expiresAt"],
        payload_hash=payload_hash,
        signature=signature,
        signed_payload=payload_json
    )

    # Audit log
    log_audit_event(
        event_type="PASSPORT_ISSUED",
        entity_id=payload["passportId"],
        user_agent="CompliancePassportService",
        details=json.dumps({
            "vendorId": vendor_id, "vendorName": vendor["name"],
            "verifiedDocs": list(verified_docs.keys()),
            "expiresAt": payload["expiresAt"]
        })
    )

    return {
        "passport": {
            **passport_record,
            "vendorName": vendor["name"],
            "complianceScore": vendor.get("complianceScore", 0),
            "miiClassification": vendor.get("miiClassification", ""),
            "gstinMasked": payload["gstinMasked"],
            "panMasked": payload["panMasked"],
            "verifiedCredentials": payload["verifiedCredentials"],
            "signaturePreview": signature[:16] + "..."
        },
        "message": f"Compliance Passport issued successfully for {vendor['name']}"
    }


# =========================================================================
# Passport Retrieval & Verification
# =========================================================================

@router.get("/passport/{passport_id}", response_model=Dict[str, Any])
def get_passport_detail(passport_id: str):
    """Get passport details by passport ID."""
    passport = get_passport(passport_id)
    if not passport:
        raise HTTPException(status_code=404, detail=f"Passport {passport_id} not found")

    vendor = get_vendor_by_id(passport["vendorId"])
    payload = json.loads(passport["signedPayload"])
    presentations = get_passport_presentations(passport_id)

    return {
        "passport": {
            "id": passport["id"],
            "vendorId": passport["vendorId"],
            "vendorName": vendor["name"] if vendor else "Unknown",
            "issuedAt": passport["issuedAt"],
            "expiresAt": passport["expiresAt"],
            "status": passport["status"],
            "payloadHash": passport["payloadHash"],
            "signaturePreview": passport["signature"][:16] + "...",
            "complianceScore": payload.get("complianceScore", 0),
            "miiClassification": payload.get("miiClassification", ""),
            "gstinMasked": payload.get("gstinMasked", ""),
            "panMasked": payload.get("panMasked", ""),
            "udyamNo": payload.get("udyamNo"),
            "verifiedCredentials": payload.get("verifiedCredentials", []),
            "revokedAt": passport.get("revokedAt"),
            "revocationReason": passport.get("revocationReason")
        },
        "presentations": presentations
    }


@router.post("/passport/{passport_id}/verify", response_model=PassportVerifyResponse)
def verify_passport(passport_id: str, req: PassportVerifyRequest, request: Request):
    """
    Verify a passport's validity — signature, expiry, revocation status.
    Used during bid submission or by buyer/officer to check seller credentials.
    Rate-limited to 30 requests/min per IP.
    """
    # Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if not _check_rate_limit(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Maximum 30 verification requests per minute."
        )

    passport = get_passport(passport_id)
    if not passport:
        raise HTTPException(status_code=404, detail=f"Passport {passport_id} not found")

    vendor = get_vendor_by_id(passport["vendorId"])
    payload = json.loads(passport["signedPayload"])

    # Check signature
    sig_valid = verify_signature(passport["signedPayload"], passport["signature"])

    # Check expiry
    now = datetime.now()
    try:
        expires_at = datetime.fromisoformat(passport["expiresAt"])
        expired = now > expires_at
    except (ValueError, TypeError):
        expired = False

    # Determine current effective status
    effective_status = passport["status"]
    if effective_status == "active" and expired:
        effective_status = "expired"

    # Determine verification result
    if not sig_valid:
        result = "invalid_signature"
        valid = False
        message = "⚠️ SIGNATURE INVALID — Passport payload has been tampered with!"
    elif effective_status == "revoked":
        result = "revoked"
        valid = False
        message = f"❌ PASSPORT REVOKED — Reason: {passport.get('revocationReason', 'Not specified')}"
    elif effective_status == "expired" or expired:
        result = "expired"
        valid = False
        message = f"⏰ PASSPORT EXPIRED on {passport['expiresAt'][:10]}. Seller must renew."
    else:
        result = "valid"
        valid = True
        message = f"✅ PASSPORT VALID — Compliance Score: {payload.get('complianceScore', 0)}, " \
                  f"Verified Credentials: {len(payload.get('verifiedCredentials', []))}"

    # Log presentation
    log_passport_presentation(
        passport_id=passport_id,
        bid_id=req.bidId,
        tender_id=req.tenderId,
        verification_result=result,
        verified_by="api_verify",
        ip_address=client_ip,
        details=json.dumps({"signatureValid": sig_valid, "expired": expired})
    )

    # Audit log
    log_audit_event(
        event_type="PASSPORT_VERIFIED",
        entity_id=passport_id,
        user_agent=f"IP:{client_ip}",
        details=json.dumps({
            "result": result, "bidId": req.bidId, "tenderId": req.tenderId,
            "vendorName": vendor["name"] if vendor else "Unknown"
        })
    )

    return PassportVerifyResponse(
        valid=valid,
        passportId=passport_id,
        vendorName=vendor["name"] if vendor else "Unknown",
        status=effective_status,
        signatureValid=sig_valid,
        expiresAt=passport["expiresAt"],
        verifiedCredentials=payload.get("verifiedCredentials", []),
        complianceScore=payload.get("complianceScore", 0),
        message=message
    )


# =========================================================================
# Passport Revocation
# =========================================================================

@router.post("/passport/{passport_id}/revoke", response_model=Dict[str, Any])
def revoke_passport_endpoint(passport_id: str, req: PassportRevokeRequest):
    """Revoke an active passport. Admin/system action."""
    passport = get_passport(passport_id)
    if not passport:
        raise HTTPException(status_code=404, detail=f"Passport {passport_id} not found")

    if passport["status"] != "active":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot revoke passport — current status is '{passport['status']}'"
        )

    updated = db_revoke_passport(passport_id, req.reason)

    log_audit_event(
        event_type="PASSPORT_REVOKED",
        entity_id=passport_id,
        user_agent="Admin",
        details=json.dumps({"reason": req.reason, "vendorId": passport["vendorId"]})
    )

    return {
        "passport": updated,
        "message": f"Passport {passport_id} has been revoked. Reason: {req.reason}"
    }


# =========================================================================
# QR Code Generation
# =========================================================================

@router.get("/passport/{passport_id}/qrcode")
def get_passport_qrcode(passport_id: str):
    """Generate and return a QR code PNG image for the passport."""
    passport = get_passport(passport_id)
    if not passport:
        raise HTTPException(status_code=404, detail=f"Passport {passport_id} not found")

    payload = json.loads(passport["signedPayload"])
    qr_bytes = generate_passport_qr(payload)

    return Response(
        content=qr_bytes,
        media_type="image/png",
        headers={"Content-Disposition": f'inline; filename="passport-{passport_id[:8]}.png"'}
    )


# =========================================================================
# Passport Presentation Audit Trail
# =========================================================================

@router.get("/passport/{passport_id}/presentations", response_model=List[Dict[str, Any]])
def get_presentations(passport_id: str):
    """Get the audit trail of all passport presentations."""
    passport = get_passport(passport_id)
    if not passport:
        raise HTTPException(status_code=404, detail=f"Passport {passport_id} not found")

    return get_passport_presentations(passport_id)


# =========================================================================
# Public Key Endpoint
# =========================================================================

@router.get("/passport/public-key")
def get_public_key():
    """
    Get the RSA public key PEM for independent signature verification.
    Third parties can use this to verify passport signatures without calling our API.
    """
    return {
        "algorithm": "RSA-PSS with SHA-256",
        "keySize": 2048,
        "format": "PEM (SubjectPublicKeyInfo)",
        "publicKey": get_public_key_pem(),
        "usage": "Use this key to verify the 'signature' field of any passport's 'signedPayload'"
    }
