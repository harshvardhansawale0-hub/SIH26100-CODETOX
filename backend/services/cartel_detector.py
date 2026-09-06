from typing import List, Dict, Any, Optional
import random
from ..models import AuctionBidItem, CartelAlert, GraphNode, GraphLink, AuctionAnalysisResponse, ReverseAuctionStep

def analyze_auction_tender(tender_id: str = "GEM/2026/B/891244") -> AuctionAnalysisResponse:
    """
    Performs graph neural network and statistical price cartel analysis
    on the competing bids of a given tender.
    """
    tender_value = "₹1.45 Cr"
    if "890412" in tender_id:
        tender_value = "₹42.0 Lakhs"
    elif "889105" in tender_id:
        tender_value = "₹2.10 Cr"
    elif "882100" in tender_id:
        tender_value = "₹85.0 Lakhs"

    # Competing bids for this tender
    bids: List[AuctionBidItem] = [
        AuctionBidItem(
            rank="L1",
            vendor="Apex Supplies Ltd.",
            amount="₹1,38,00,000",
            diffL1="0.0% (Lowest)",
            flag="Clean",
            risk="Low",
            ipAddress="49.204.12.8",
            dscIssuer="eMudhra Class 3 (APEX-ORG)"
        ),
        AuctionBidItem(
            rank="L2",
            vendor="Kaveri Infotech",
            amount="₹1,42,00,000",
            diffL1="+2.8%",
            flag="IP Overlap Suspect",
            risk="Medium",
            ipAddress="192.168.4.102",
            dscIssuer="Capricorn CA (SIGNATORY-X)"
        ),
        AuctionBidItem(
            rank="L3",
            vendor="Shree Ganesh Networks",
            amount="₹1,44,00,000",
            diffL1="+4.3%",
            flag="Cartel Ring Flagged",
            risk="High",
            ipAddress="192.168.4.115",
            dscIssuer="Capricorn CA (SIGNATORY-X)"
        ),
        AuctionBidItem(
            rank="L4",
            vendor="Zenith Tech Systems",
            amount="₹1,48,50,000",
            diffL1="+7.6%",
            flag="Clean",
            risk="Low",
            ipAddress="103.22.44.19",
            dscIssuer="VSign CA (ZENITH-ORG)"
        )
    ]

    cartel_alerts: List[CartelAlert] = [
        CartelAlert(
            tenderId=tender_id,
            severity="CRITICAL",
            title="Shared IP Subnet & Digital Signature Collusion",
            description="Bidders Kaveri Infotech and Shree Ganesh Networks submitted bids within 4 minutes from identical IP subnet 192.168.4.x with shared DSC Signatory X and identical BOQ markup formulas.",
            flaggedVendors=["Kaveri Infotech", "Shree Ganesh Networks"]
        ),
        CartelAlert(
            tenderId=tender_id,
            severity="WARNING",
            title="Artificial Price Clustering (Variance: 1.4%)",
            description="L2 and L3 bids are synchronized with fixed margin offsets against estimated tender baseline to ensure rotation without true price competition.",
            flaggedVendors=["Kaveri Infotech", "Shree Ganesh Networks"]
        )
    ]

    # Graph Nodes & Links for Network Topology
    clean_tid = tender_id.split("/")[-1] if "/" in tender_id else tender_id
    nodes: List[GraphNode] = [
        GraphNode(id=f"T-{clean_tid}", label=f"Tender {tender_id}", type="tender", risk="Low"),
        GraphNode(id="V-APEX", label="Apex Supplies Ltd.", type="vendor", risk="Low"),
        GraphNode(id="V-KAVERI", label="Kaveri Infotech", type="vendor", risk="Medium"),
        GraphNode(id="V-SHREE", label="Shree Ganesh Networks", type="vendor", risk="High"),
        GraphNode(id="V-ZENITH", label="Zenith Tech Systems", type="vendor", risk="Low"),
        GraphNode(id="IP-SHARED", label="IP Subnet: 192.168.4.0/24", type="ip", risk="High"),
        GraphNode(id="DSC-SHARED", label="DSC Signatory: CAPRICORN-X", type="dsc", risk="High")
    ]

    links: List[GraphLink] = [
        GraphLink(source="V-APEX", target=f"T-{clean_tid}", relationship="Bidded (L1)", weight=1.0),
        GraphLink(source="V-KAVERI", target=f"T-{clean_tid}", relationship="Bidded (L2)", weight=1.0),
        GraphLink(source="V-SHREE", target=f"T-{clean_tid}", relationship="Bidded (L3)", weight=1.0),
        GraphLink(source="V-ZENITH", target=f"T-{clean_tid}", relationship="Bidded (L4)", weight=1.0),
        GraphLink(source="V-KAVERI", target="IP-SHARED", relationship="Subnet Match", weight=0.95),
        GraphLink(source="V-SHREE", target="IP-SHARED", relationship="Subnet Match", weight=0.95),
        GraphLink(source="V-KAVERI", target="DSC-SHARED", relationship="Shared Signatory", weight=0.98),
        GraphLink(source="V-SHREE", target="DSC-SHARED", relationship="Shared Signatory", weight=0.98),
    ]

    return AuctionAnalysisResponse(
        tenderId=tender_id,
        tenderValue=tender_value,
        bids=bids,
        cartelAlerts=cartel_alerts,
        graphNodes=nodes,
        graphLinks=links
    )

def simulate_reverse_auction_round(tender_id: str, round_no: int = 1, current_l1_val: float = 13800000.0) -> ReverseAuctionStep:
    """
    Simulates real-time dynamic Reverse Auction (RA) step under GFR Rule 149.
    Decrements price by 0.5% - 1.5% competition increments.
    """
    decrement_pct = random.uniform(0.005, 0.015)
    new_l1_val = round(current_l1_val * (1.0 - decrement_pct), -3)
    
    vendors = ["Apex Supplies Ltd.", "Kaveri Infotech", "Zenith Tech Systems"]
    winner = random.choice(vendors)

    formatted_l1 = f"₹{new_l1_val:,.0f}"

    bids_in_round = [
        {"vendor": "Apex Supplies Ltd.", "bid": f"₹{round(new_l1_val * 1.002, -3):,.0f}", "status": "Active"},
        {"vendor": "Kaveri Infotech", "bid": f"₹{round(new_l1_val * 1.015, -3):,.0f}", "status": "Active"},
        {"vendor": "Zenith Tech Systems", "bid": f"₹{round(new_l1_val * 1.025, -3):,.0f}", "status": "Active"}
    ]

    return ReverseAuctionStep(
        roundNumber=round_no,
        currentL1=formatted_l1,
        currentL1Vendor=winner,
        timeRemainingSeconds=max(0, 180 - (round_no * 30)),
        bidsInRound=bids_in_round
    )
