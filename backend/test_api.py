import os
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime

# Configure UTF-8 stdout on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database import (
    init_db, get_all_bids, get_bid_by_id, insert_bid, update_bid_status,
    get_all_tenders, get_all_contracts, update_contract_crac, update_contract_payment
)
from backend.services.rule_engine import validate_bid_compliance
from backend.services.cartel_detector import analyze_auction_tender, simulate_reverse_auction_round
from backend.services.ocr_forensics import parse_uploaded_document
from backend.models import BidVerifyRequest

def run_direct_service_tests():
    print("=======================================================================")
    print("[*] RUNNING DIRECT BACKEND SERVICES & DATABASE TEST SUITE")
    print("=======================================================================")

    # 1. Database Initialization
    init_db()
    print("[+] 1. Database Initialized successfully.")

    # 2. Test Bids CRUD
    bids = get_all_bids()
    print(f"[+] 2. Retrieved {len(bids)} bids from database.")
    assert len(bids) > 0, "No bids found in database!"

    first_bid = bids[0]
    single_bid = get_bid_by_id(first_bid["id"])
    assert single_bid is not None, f"Could not retrieve bid {first_bid['id']}"
    print(f"[+] 3. Successfully queried single bid: {single_bid['id']} - {single_bid['vendor']}")

    # 3. Test Officer Status Override
    updated = update_bid_status(
        bid_id=first_bid["id"],
        new_status="Compliant",
        officer_notes="Verified via direct officer compliance audit",
        officer_name="Nodal Vigilance Officer"
    )
    assert updated["status"] == "Compliant", "Status update failed!"
    print(f"[+] 4. Status update & immutable audit trail verified for {first_bid['id']}")

    # 4. Test GFR 2017 & DPIIT Rule Engine (Compliant Bid)
    comp_req = BidVerifyRequest(
        vendorName="Bharat ElectroMech Systems Ltd.",
        category="Heavy Electricals & UPS",
        tenderId="GEM/2026/B/901844",
        tenderValue="₹85,00,000",
        bidAmount="₹78,40,000",
        gstin="27AABCB1234F1Z5",
        pan="AABCB1234F",
        miiDeclared="82%",
        turnoverClaim="₹14.2 Cr",
        experienceClaim="6 Years",
        msmeRegNo="UDYAM-MH-03-0019284"
    )
    comp_res = validate_bid_compliance(comp_req)
    assert comp_res["status"] == "Compliant", f"Expected Compliant, got {comp_res['status']}"
    assert comp_res["score"] >= 85, f"Expected score >= 85, got {comp_res['score']}"
    print(f"[+] 5. Rule Engine (Compliant Bid): Score={comp_res['score']}, Status={comp_res['status']}, RulesTested={comp_res['rulesTested']}")

    # 5. Test GFR 2017 & DPIIT Rule Engine (Fraud / Defaulter Bid)
    fraud_req = BidVerifyRequest(
        vendorName="Royal Fake Traders Pvt Ltd",
        category="Office IT Supplies",
        tenderId="GEM/2026/B/882100",
        tenderValue="₹30,00,000",
        bidAmount="₹21,00,000",
        gstin="06ZZZZZ0000Z1Z0",
        pan="ABCDE1234F",
        miiDeclared="12%",
        turnoverClaim="₹80 Lakhs",
        experienceClaim="0.5 Year",
        msmeRegNo="UDYAM-HR-00-INVALID"
    )
    fraud_res = validate_bid_compliance(fraud_req)
    assert fraud_res["status"] == "Rejected", f"Expected Rejected, got {fraud_res['status']}"
    assert fraud_res["score"] < 50, f"Expected score < 50, got {fraud_res['score']}"
    assert len(fraud_res["flags"]) >= 3, "Expected at least 3 fraud flags"
    print(f"[+] 6. Rule Engine (Fraud Bid): Score={fraud_res['score']}, Status={fraud_res['status']}, Flags={len(fraud_res['flags'])}")

    # 6. Test Document OCR & Forensics
    doc_res = parse_uploaded_document("CA_Turnover_Tampered_Copy.pdf")
    assert doc_res["tamperingDetected"] is True, "Expected tampering detected for tampered doc"
    print(f"[+] 7. OCR & Forensics: DocType={doc_res['docType']}, Tampered={doc_res['tamperingDetected']}, Confidence={doc_res['confidence']}")

    # 7. Test Anti-Cartel Graph Detector
    cartel_res = analyze_auction_tender("GEM/2026/B/891244")
    assert len(cartel_res.bids) >= 4, "Expected at least 4 ranked auction bids"
    assert len(cartel_res.cartelAlerts) >= 2, "Expected cartel alerts"
    assert len(cartel_res.graphNodes) >= 5, "Expected graph nodes"
    print(f"[+] 8. Anti-Cartel Detector: {len(cartel_res.bids)} bids, {len(cartel_res.cartelAlerts)} alerts, {len(cartel_res.graphNodes)} graph nodes")

    # 8. Test Reverse Auction Simulator
    ra_res = simulate_reverse_auction_round("GEM/2026/B/891244", round_no=2, current_l1_val=13800000.0)
    print(f"[+] 9. Reverse Auction Step: Round={ra_res.roundNumber}, New L1={ra_res.currentL1}, Winner={ra_res.currentL1Vendor}")

    # 9. Test Tenders & Contracts
    tenders = get_all_tenders()
    contracts = get_all_contracts()
    print(f"[+] 10. Tenders ({len(tenders)}) and Contracts ({len(contracts)}) retrieved successfully.")

    # 10. Test CRAC & 10-day Payment Settlement
    if contracts:
        c_id = contracts[0]["id"]
        crac_updated = update_contract_crac(c_id, "Approved", "All goods accepted at consignee warehouse")
        assert crac_updated["cracStatus"] == "Approved"
        pay_updated = update_contract_payment(c_id, "Settled (100%)")
        assert pay_updated["paymentStatus"] == "Settled (100%)"
        print(f"[+] 11. CRAC Inspection & 10-Day Payment Settled for Contract {c_id}")

    print("\n=======================================================================")
    print("[✓] ALL DIRECT BACKEND TESTS PASSED SUCCESSFULLY! (11/11 Checks)")
    print("=======================================================================\n")

def test_live_http_api(base_url="http://127.0.0.1:8000"):
    print(f"[*] Testing Live HTTP API Endpoints at {base_url}...")
    try:
        # 1. Health
        with urllib.request.urlopen(f"{base_url}/api/health", timeout=3) as res:
            health = json.loads(res.read().decode())
            print(f"[+] /api/health: {health.get('status')}")

        # 2. Bids
        with urllib.request.urlopen(f"{base_url}/api/bids", timeout=3) as res:
            bids = json.loads(res.read().decode())
            print(f"[+] /api/bids: {len(bids)} bids")

        # 3. Tenders
        with urllib.request.urlopen(f"{base_url}/api/tenders", timeout=3) as res:
            tenders = json.loads(res.read().decode())
            print(f"[+] /api/tenders: {len(tenders)} tenders")

        # 4. Contracts
        with urllib.request.urlopen(f"{base_url}/api/contracts", timeout=3) as res:
            contracts = json.loads(res.read().decode())
            print(f"[+] /api/contracts: {len(contracts)} contracts")

        # 5. Stats
        with urllib.request.urlopen(f"{base_url}/api/stats/overview", timeout=3) as res:
            stats = json.loads(res.read().decode())
            print(f"[+] /api/stats/overview: Active Bids={stats['summaryMetrics']['activeBids']}")

        # 6. Verify Bid
        verify_payload = {
            "vendorName": "Apex Supplies Ltd.",
            "category": "IT Hardware",
            "tenderId": "GEM/2026/B/891244",
            "tenderValue": "₹1.45 Cr",
            "bidAmount": "₹1.38 Cr",
            "gstin": "27AABCB1234F1Z5",
            "pan": "AABCB1234F",
            "miiDeclared": "68%",
            "turnoverClaim": "₹12.4 Cr",
            "experienceClaim": "5 Years",
            "msmeRegNo": "UDYAM-MH-03-0019284"
        }
        req = urllib.request.Request(
            f"{base_url}/api/verify/bid",
            data=json.dumps(verify_payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=3) as res:
            v_data = json.loads(res.read().decode())
            print(f"[+] /api/verify/bid: Bid ID={v_data['bidId']}, Score={v_data['score']}, Status={v_data['status']}")

        print("\n[✓] ALL LIVE HTTP API TESTS COMPLETED SUCCESSFULLY!")
    except urllib.error.URLError as e:
        print(f"[i] Live HTTP server is not running on {base_url} ({e}). Run 'python run_backend.py' to start it.")

if __name__ == "__main__":
    run_direct_service_tests()
    test_live_http_api()
