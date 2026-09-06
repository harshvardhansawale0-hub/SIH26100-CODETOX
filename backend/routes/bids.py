from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Dict, Any, Optional
from ..database import get_all_bids, get_bid_by_id, insert_bid, update_bid_status, delete_bid
from ..models import BidItem, BidStatusUpdate

router = APIRouter(prefix="/api/bids", tags=["Bids Management"])

@router.get("", response_model=List[Dict[str, Any]])
def list_bids(
    status: Optional[str] = Query(None, description="Filter by status ('Compliant', 'Flagged', 'Rejected', 'ALL')"),
    category: Optional[str] = Query(None, description="Filter by category ('IT Hardware', 'Furniture', 'Software', 'Stationery', 'ALL')"),
    search: Optional[str] = Query(None, description="Search keyword in vendor, ID, category, or tender ID")
):
    """
    Retrieve all ingested bids in the GeM procurement database with optional filtering and search.
    """
    return get_all_bids(status_filter=status, category_filter=category, search=search)

@router.get("/{bid_id}", response_model=Dict[str, Any])
def get_single_bid(bid_id: str):
    """
    Retrieve detailed compliance dossier, extracted documents, and immutable audit trail for a single bid.
    """
    bid = get_bid_by_id(bid_id)
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bid with ID '{bid_id}' not found in procurement records."
        )
    return bid

@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_or_upsert_bid(bid: Dict[str, Any]):
    """
    Insert or update a verified bid directly into the SQLite database.
    """
    if not bid.get("id"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bid must have a valid 'id' identifier (e.g., 'BID-20496')."
        )
    created = insert_bid(bid)
    return created

@router.patch("/{bid_id}/status", response_model=Dict[str, Any])
def change_bid_status(bid_id: str, update: BidStatusUpdate):
    """
    Nodal Procurement Officer override to approve, flag, or reject a bid with mandatory audit trail log.
    """
    updated = update_bid_status(
        bid_id=bid_id,
        new_status=update.status,
        officer_notes=update.officerNotes,
        officer_name=update.officerName
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bid with ID '{bid_id}' not found."
        )
    return updated

@router.delete("/{bid_id}", response_model=Dict[str, Any])
def remove_bid(bid_id: str):
    """
    Archive/Delete a bid from the active procurement pool.
    """
    success = delete_bid(bid_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bid with ID '{bid_id}' not found or already deleted."
        )
    return {"status": "success", "message": f"Bid '{bid_id}' removed from active registry."}
