import random
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Query, Request
from typing import List, Dict, Any, Optional
from ..models import TenderItem, TenderCreateRequest
from ..database import get_all_tenders, get_tender_by_id, create_tender, delete_tender, get_all_bids

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
def publish_tender(payload: TenderCreateRequest):
    """
    Buyer creates and publishes a new bid/tender with defined compliance criteria.
    """
    random_id = f"GEM/2026/B/{random.randint(900000, 999999)}"
    pub_date = payload.publishedDate or datetime.now().strftime("%d %b %Y")
    
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
        "createdBy": payload.createdBy,
        "buyerEmail": payload.buyerEmail,
        "buyerName": payload.buyerName,
        "buyerOrg": payload.buyerOrg
    }
    
    created = create_tender(new_tender)
    return created

@router.delete("/{tender_id}", response_model=Dict[str, Any])
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
