import random
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Dict, Any, Optional
from ..models import TenderItem, TenderCreateRequest
from ..database import get_all_tenders, get_tender_by_id, create_tender

router = APIRouter(prefix="/api/tenders", tags=["Tenders & BOQ Management"])

@router.get("", response_model=List[Dict[str, Any]])
def list_tenders():
    """
    Retrieve all published procurement tenders on GeM.
    """
    return get_all_tenders()

@router.get("/{tender_id}", response_model=Dict[str, Any])
def get_tender_details(tender_id: str):
    """
    Retrieve detailed tender specifications, BOQ requirements, and eligibility conditions.
    """
    t = get_tender_by_id(tender_id)
    if not t:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tender '{tender_id}' not found."
        )
    return t

@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def publish_tender(payload: TenderCreateRequest):
    """
    Publish a new public procurement tender notice with technical BOQ items under GFR 2017.
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
        "boqItems": [item.model_dump() for item in payload.boqItems]
    }
    
    created = create_tender(new_tender)
    return created
