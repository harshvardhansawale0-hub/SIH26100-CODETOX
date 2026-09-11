import random
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Query, Request, Header
from typing import List, Dict, Any, Optional
from ..models import TenderItem, TenderCreateRequest
from ..database import get_all_tenders, get_tender_by_id, create_tender, delete_tender, get_all_bids
from .auth import _active_sessions

router = APIRouter(prefix="/api/tenders", tags=["Buyer Tenders & Compliance Criteria"])

@router.get("", response_model=List[Dict[str, Any]])
def list_tenders():
    """
    Retrieve all published procurement tenders created by Buyers.
    """
    tenders = get_all_tenders()
    all_bids = get_all_bids()
    for t in tenders:
        t["applicationsCount"] = len([b for b in all_bids if b.get("tenderId") == t.get("id")])
    return tenders

@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def publish_tender(payload: TenderCreateRequest, authorization: Optional[str] = Header(None)):
    """
    Buyer creates and publishes a new bid/tender with defined compliance criteria.
    """
    random_id = f"GEM/2026/B/{random.randint(900000, 999999)}"
    pub_date = payload.publishedDate or datetime.now().strftime("%d %b %Y")
    
    auth_user = None
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        auth_user = _active_sessions.get(token)

    buyer_email = (
        payload.buyerEmail
        or payload.createdBy
        or (auth_user["email"] if auth_user else "")
        or "buyer@gov.in"
    )
    created_by = (
        payload.createdBy
        or buyer_email
        or (auth_user["email"] if auth_user else "")
        or "buyer@gov.in"
    )
    buyer_name = (
        payload.buyerName
        or (auth_user["fullName"] if auth_user else "")
        or "Government Buyer"
    )
    buyer_org = (
        payload.buyerOrg
        or (auth_user["organization"] if auth_user else "")
        or payload.ministry
    )
    buyer_id = (
        payload.buyerId
        or (auth_user["id"] if auth_user else None)
    )

    new_tender = {
        "id": random_id,
        "title": payload.title,
        "ministry": payload.ministry,
        "department": payload.department,
        "category": payload.category,
        "estimatedValue": payload.estimatedValue,
        "emdAmount": payload.emdAmount,
        "publishedDate": pub_date,
        "closingDate": payload.closingDate,
        "status": "Active",
        "miiMinRequirement": payload.miiMinRequirement,
        "minTurnoverRequirement": payload.minTurnoverRequirement,
        "minExperienceYears": payload.minExperienceYears,
        "mandatoryDocs": payload.mandatoryDocs,
        "boqItems": [item.model_dump() for item in payload.boqItems],
        "applicationsCount": 0,
        "createdBy": created_by,
        "buyerEmail": buyer_email,
        "buyerName": buyer_name,
        "buyerOrg": buyer_org,
        "buyerId": buyer_id
    }
    
    created = create_tender(new_tender)
    return created

@router.delete("/{tender_id:path}", response_model=Dict[str, Any])
def remove_tender(tender_id: str):
    """
    Buyer deletes a tender by ID.
    """
    deleted = delete_tender(tender_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tender '{tender_id}' not found or could not be deleted."
        )
    return {"status": "success", "message": f"Tender '{tender_id}' deleted successfully.", "id": tender_id}

@router.get("/{tender_id:path}/applications", response_model=List[Dict[str, Any]])
def get_tender_applications(tender_id: str):
    """
    Buyer retrieves all submitted bidder applications and AI compliance reports for this tender.
    Supports slash-containing Tender IDs (e.g. GEM/2026/B/891244).
    """
    all_bids = get_all_bids()
    tender_bids = [b for b in all_bids if b.get("tenderId") == tender_id]
    return tender_bids

@router.get("/{tender_id:path}", response_model=Dict[str, Any])
def get_tender_details(tender_id: str):
    """
    Retrieve detailed tender specifications, compliance criteria, and BOQ requirements.
    Supports slash-containing Tender IDs (e.g. GEM/2026/B/891244).
    """
    t = get_tender_by_id(tender_id)
    if not t:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tender '{tender_id}' not found."
        )
    all_bids = get_all_bids()
    t["applicationsCount"] = len([b for b in all_bids if b.get("tenderId") == tender_id])
    return t
