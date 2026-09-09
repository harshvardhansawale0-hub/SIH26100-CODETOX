from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Dict, Any, Optional
from ..database import get_all_bids, get_bid_by_id, insert_bid, update_bid_status, delete_bid
from ..models import BidItem, BidStatusUpdate

router = APIRouter(prefix="/api/bids", tags=["Buyer Review & Bidder Applications"])

@router.get("", response_model=List[Dict[str, Any]])
def list_bids(
    status: Optional[str] = Query(None, description="Filter by status ('Compliant', 'Flagged', 'Non-Compliant', 'Selected', 'ALL')"),
    category: Optional[str] = Query(None, description="Filter by category ('IT Hardware', 'Furniture', 'Software', 'Medical Equipment', 'ALL')"),
    tender_id: Optional[str] = Query(None, description="Filter by tender ID"),
    search: Optional[str] = Query(None, description="Search keyword in vendor, ID, category, or tender ID")
):
    """
    Retrieve all submitted bids and AI compliance dossiers with optional filtering and search.
    """
    bids = get_all_bids(status_filter=status, category_filter=category, search=search)
    if tender_id:
        bids = [b for b in bids if b.get("tenderId") == tender_id]
    return bids

@router.get("/{bid_id}", response_model=Dict[str, Any])
def get_single_bid(bid_id: str):
    """
    Retrieve detailed AI compliance dossier, extracted documents, requirement matches, and audit trail.
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
    Insert or update a verified bid application directly into the database.
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
    Buyer action to review, flag, reject, or mark a bid as Compliant with mandatory audit trail log.
    """
    updated = update_bid_status(
        bid_id=bid_id,
        new_status=update.status,
        buyer_notes=update.buyerNotes,
        buyer_name=update.buyerName or "Government Procuring Authority"
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bid with ID '{bid_id}' not found."
        )
    return updated

@router.post("/{bid_id}/select", response_model=Dict[str, Any])
def select_winning_bidder(bid_id: str, payload: Optional[Dict[str, Any]] = None):
    """
    Final Bidder Selection: Buyer officially selects/awards the tender to the winning qualified compliant bidder.
    """
    notes = (payload or {}).get("notes", "Officially selected as winning L1 compliant bidder under GFR 2017.")
    buyer_name = (payload or {}).get("buyerName", "Procuring Authority (Buyer)")
    
    updated = update_bid_status(
        bid_id=bid_id,
        new_status="Selected",
        buyer_notes=notes,
        buyer_name=buyer_name
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bid with ID '{bid_id}' not found."
        )
    return {
        "status": "success",
        "message": f"Bid '{bid_id}' officially selected as winning vendor!",
        "bid": updated
    }

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

