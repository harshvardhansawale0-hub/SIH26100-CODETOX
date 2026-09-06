from fastapi import APIRouter, Query
from ..models import AuctionAnalysisResponse, ReverseAuctionStep
from ..services.cartel_detector import analyze_auction_tender, simulate_reverse_auction_round

router = APIRouter(prefix="/api/auction", tags=["Auction & Anti-Cartel Intelligence"])

@router.get("/analysis", response_model=AuctionAnalysisResponse)
def get_auction_analysis(tender_id: str = Query("GEM/2026/B/891244", description="Tender ID to analyze")):
    """
    Performs real-time price benchmarking (L1-L4) and runs graph-based
    cartel ring detection (IP subnets, shared DSC signatories, price clustering).
    """
    return analyze_auction_tender(tender_id)

@router.post("/reverse-auction/round", response_model=ReverseAuctionStep)
def step_reverse_auction(
    tender_id: str = Query("GEM/2026/B/891244", description="Tender ID"),
    round_no: int = Query(1, description="Round number (1-5)"),
    current_l1: float = Query(13800000.0, description="Current L1 price in Rupees")
):
    """
    Simulates dynamic Reverse Auction bidding rounds with automated price decrement.
    """
    return simulate_reverse_auction_round(tender_id=tender_id, round_no=round_no, current_l1_val=current_l1)
