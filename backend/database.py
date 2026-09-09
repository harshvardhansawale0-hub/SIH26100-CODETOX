import sqlite3
import json
import os
import sys
import argparse
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "gem_procure.db")

def get_connection():
    """
    Returns a configured SQLite connection with row_factory enabled and PRAGMAs applied.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    return conn

def init_db(force_recreate: bool = False):
    """
    Initializes database tables, indexes, and initial benchmark seed data.
    If force_recreate is True, drops all existing tables and re-seeds from scratch.
    """
    conn = get_connection()
    cursor = conn.cursor()

    if force_recreate:
        cursor.execute("DROP TABLE IF EXISTS audit_logs")
        cursor.execute("DROP TABLE IF EXISTS cartel_reports")
        cursor.execute("DROP TABLE IF EXISTS contracts")
        cursor.execute("DROP TABLE IF EXISTS bids")
        cursor.execute("DROP TABLE IF EXISTS tenders")
        cursor.execute("DROP TABLE IF EXISTS vendors")
        cursor.execute("DROP TABLE IF EXISTS users")

    # 1. Bids table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bids (
        id TEXT PRIMARY KEY,
        vendor TEXT NOT NULL,
        category TEXT NOT NULL,
        item TEXT NOT NULL,
        tender_id TEXT NOT NULL,
        tender_value TEXT NOT NULL,
        bid_amount TEXT NOT NULL,
        status TEXT NOT NULL,
        score INTEGER NOT NULL,
        mii_content TEXT NOT NULL,
        turnover TEXT NOT NULL,
        experience TEXT NOT NULL,
        gst_status TEXT NOT NULL,
        pan_status TEXT NOT NULL,
        msme_status TEXT NOT NULL,
        date TEXT NOT NULL,
        risk_level TEXT NOT NULL,
        ocr_confidence TEXT NOT NULL,
        flags TEXT NOT NULL, -- JSON array
        extracted_docs TEXT NOT NULL, -- JSON array
        extracted_entities TEXT, -- JSON array
        cross_doc_matches TEXT, -- JSON array
        requirement_matches TEXT, -- JSON array
        compliance_report TEXT, -- JSON object
        audit_trail TEXT NOT NULL -- JSON array
    )
    """)

    # 2. Users table (Strictly Buyer and Bidder)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        organization TEXT NOT NULL,
        gstin TEXT,
        role TEXT NOT NULL DEFAULT 'bidder', -- Strictly 'buyer' or 'bidder'
        created_at TEXT NOT NULL
    )
    """)

    # 3. Tenders table (Buyer Published with Compliance Criteria)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tenders (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        ministry TEXT NOT NULL,
        department TEXT NOT NULL,
        category TEXT NOT NULL,
        estimated_value TEXT NOT NULL,
        emd_amount TEXT NOT NULL,
        published_date TEXT NOT NULL,
        closing_date TEXT NOT NULL,
        status TEXT NOT NULL, -- 'Active', 'Under Evaluation', 'Awarded', 'Closed'
        mii_min_requirement TEXT NOT NULL,
        min_turnover_requirement TEXT DEFAULT '₹2.0 Cr',
        min_experience_years INTEGER DEFAULT 3,
        mandatory_docs TEXT DEFAULT '[]', -- JSON array
        boq_items TEXT NOT NULL, -- JSON array
        selected_bidder_id TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 4. Contracts & Purchase Orders table (GFR Stage 5 & 6)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS contracts (
        id TEXT PRIMARY KEY,
        tender_id TEXT NOT NULL,
        bid_id TEXT NOT NULL,
        vendor TEXT NOT NULL,
        buyer_org TEXT NOT NULL,
        contract_value TEXT NOT NULL,
        po_date TEXT NOT NULL,
        dsc_signed BOOLEAN NOT NULL DEFAULT 1,
        crac_status TEXT NOT NULL, -- 'Pending Inspection', 'Approved', 'Rejected'
        crac_date TEXT,
        payment_status TEXT NOT NULL, -- 'Processing (Day 4/10)', 'Settled (100%)', 'Withheld'
        payment_due_date TEXT NOT NULL,
        disbursement_ref TEXT
    )
    """)

    # 5. Cartel Detection Logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cartel_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tender_id TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        flagged_vendors TEXT NOT NULL, -- JSON array
        detected_at TEXT NOT NULL
    )
    """)

    # 6. Master Vendors Directory table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vendors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        gstin TEXT NOT NULL,
        pan TEXT NOT NULL,
        udyam_no TEXT,
        category TEXT NOT NULL,
        mii_classification TEXT NOT NULL,
        compliance_score INTEGER DEFAULT 90,
        risk_tier TEXT DEFAULT 'Low Risk',
        blacklisted BOOLEAN DEFAULT 0,
        created_at TEXT NOT NULL
    )
    """)

    # 7. System Audit Logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        user_agent TEXT NOT NULL,
        details TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)

    # Performance Indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_bids_category ON bids(category)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_bids_tender ON bids(tender_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_bids_vendor ON bids(vendor)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tenders_category ON tenders(category)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_contracts_tender ON contracts(tender_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_contracts_bid ON contracts(bid_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_cartel_tender ON cartel_reports(tender_id)")

    # Auto-seeding disabled to maintain clean database state
    conn.commit()
    conn.close()

def clear_all_data():
    """
    Deletes all records from all database tables (users, bids, tenders, contracts, vendors, cartel_reports, audit_logs).
    """
    conn = get_connection()
    cursor = conn.cursor()
    for tbl in ["audit_logs", "cartel_reports", "contracts", "bids", "tenders", "vendors", "users"]:
        cursor.execute(f"DELETE FROM {tbl}")
    conn.commit()
    conn.close()

def reset_db():
    """
    Wipes the SQLite database completely and re-initializes clean empty tables.
    """
    init_db(force_recreate=True)

def seed_initial_bids(cursor):
    initial_bids = [
        {
            "id": "BID-20495",
            "vendor": "Apex Supplies Ltd.",
            "category": "IT Hardware",
            "item": "High-Performance Workstations (Qty: 250)",
            "tenderId": "GEM/2026/B/891244",
            "tenderValue": "₹1.45 Cr",
            "bidAmount": "₹1.38 Cr",
            "status": "Compliant",
            "score": 96,
            "miiContent": "68% (Class-I Local)",
            "turnover": "₹12.4 Cr (Req: ₹5 Cr)",
            "experience": "5 Years (Req: 3 Yrs)",
            "gstStatus": "Active & 3B Filed",
            "panStatus": "Verified",
            "msmeStatus": "Medium Enterprise (UDYAM verified)",
            "date": "06 Sep 2026, 11:20 AM",
            "riskLevel": "Low Risk",
            "ocrConfidence": "99.4%",
            "flags": [],
            "extractedDocs": [
                {"name": "GST_Certificate_2026.pdf", "status": "Verified", "score": 100},
                {"name": "CA_Turnover_Audited_FY25.pdf", "status": "Verified", "score": 98},
                {"name": "Make_In_India_Declaration.pdf", "status": "Verified (68%)", "score": 95},
                {"name": "OEM_Authorization_Form.pdf", "status": "Verified", "score": 96}
            ],
            "auditTrail": [
                {"timestamp": "06 Sep 2026, 11:20:04", "action": "Bid Ingestion via GeM API", "agent": "System (Webhook)"},
                {"timestamp": "06 Sep 2026, 11:20:06", "action": "OCR & Document Parsing Complete", "agent": "EasyOCR / Tesseract Engine"},
                {"timestamp": "06 Sep 2026, 11:20:07", "action": "GFR 2017 & MII Rule Engine Checked (210 Rules)", "agent": "NLP Rule Validator"},
                {"timestamp": "06 Sep 2026, 11:20:08", "action": "Scored 96/100 -> Auto Approved", "agent": "GeM ML Model v4.2"}
            ]
        },
        {
            "id": "BID-20494",
            "vendor": "Balaji Enterprises",
            "category": "Furniture",
            "item": "Modular Office Workstations & Chairs",
            "tenderId": "GEM/2026/B/890412",
            "tenderValue": "₹42.0 Lakhs",
            "bidAmount": "₹38.5 Lakhs",
            "status": "Flagged",
            "score": 61,
            "miiContent": "42% (Class-II Local)",
            "turnover": "₹1.8 Cr (Req: ₹2 Cr - Shortfall)",
            "experience": "3 Years (Req: 3 Yrs)",
            "gstStatus": "Active",
            "panStatus": "Verified",
            "msmeStatus": "Micro (UDYAM mismatch)",
            "date": "06 Sep 2026, 10:45 AM",
            "riskLevel": "Medium Risk",
            "ocrConfidence": "94.2%",
            "flags": [
                "Annual turnover falls short by ₹20 Lakhs against tender mandatory criteria (Rule GFR 173).",
                "UDYAM registration date does not match GST registration date by 14 months.",
                "Local Content Undertaking lacks CA countersignature."
            ],
            "extractedDocs": [
                {"name": "GST_Reg_06A.pdf", "status": "Verified", "score": 95},
                {"name": "Turnover_Statement.pdf", "status": "Discrepancy (Turnover < Limit)", "score": 55},
                {"name": "MII_Undertaking_Self.pdf", "status": "Missing CA Seal", "score": 45},
                {"name": "Experience_Certificates.pdf", "status": "Verified", "score": 90}
            ],
            "auditTrail": [
                {"timestamp": "06 Sep 2026, 10:45:12", "action": "Bid Ingested", "agent": "System"},
                {"timestamp": "06 Sep 2026, 10:45:15", "action": "OCR Text Extracted with 94.2% confidence", "agent": "OCR Engine"},
                {"timestamp": "06 Sep 2026, 10:45:16", "action": "Flagged: Rule #173 (Turnover Shortfall) & Rule #84 (CA Seal missing)", "agent": "Rule Engine"},
                {"timestamp": "06 Sep 2026, 10:45:17", "action": "Compliance Score: 61/100 -> Routed to Officer Review", "agent": "ML Scorer"}
            ]
        },
        {
            "id": "BID-20493",
            "vendor": "TechForce Pvt Ltd",
            "category": "Software",
            "item": "Cloud-Based GIS Mapping & Analytics Tool",
            "tenderId": "GEM/2026/B/889105",
            "tenderValue": "₹2.10 Cr",
            "bidAmount": "₹1.95 Cr",
            "status": "Compliant",
            "score": 91,
            "miiContent": "85% (Class-I Local)",
            "turnover": "₹18.9 Cr (Req: ₹8 Cr)",
            "experience": "6 Years (Req: 4 Yrs)",
            "gstStatus": "Active & All Clear",
            "panStatus": "Verified",
            "msmeStatus": "Small Enterprise",
            "date": "06 Sep 2026, 09:30 AM",
            "riskLevel": "Low Risk",
            "ocrConfidence": "98.9%",
            "flags": [],
            "extractedDocs": [
                {"name": "GST_3B_Last6Months.pdf", "status": "Verified", "score": 100},
                {"name": "Audited_Balance_Sheet.pdf", "status": "Verified", "score": 96},
                {"name": "Class_I_MII_Cert.pdf", "status": "Verified (85%)", "score": 98},
                {"name": "CMMI_Level_3_Certificate.pdf", "status": "Verified", "score": 90}
            ],
            "auditTrail": [
                {"timestamp": "06 Sep 2026, 09:30:02", "action": "Bid Received", "agent": "GeM Gateway"},
                {"timestamp": "06 Sep 2026, 09:30:05", "action": "Automated Document Validation Successful", "agent": "OCR + NLP Engine"},
                {"timestamp": "06 Sep 2026, 09:30:06", "action": "Score 91/100 -> Compliance Verified", "agent": "GeM Engine"}
            ]
        },
        {
            "id": "BID-20492",
            "vendor": "UniVend Solutions",
            "category": "Stationery",
            "item": "Executive Diaries, Pens & Desk Items (Bulk)",
            "tenderId": "GEM/2026/B/887990",
            "tenderValue": "₹18.5 Lakhs",
            "bidAmount": "₹14.2 Lakhs",
            "status": "Rejected",
            "score": 22,
            "miiContent": "15% (Non-compliant < 20%)",
            "turnover": "₹15 Lakhs (Req: ₹50 Lakhs)",
            "experience": "1 Year (Req: 2 Yrs)",
            "gstStatus": "Cancelled / Tax Defaulter Notice",
            "panStatus": "PAN/GST Name Mismatch",
            "msmeStatus": "Invalid Certificate Number",
            "date": "06 Sep 2026, 08:15 AM",
            "riskLevel": "Critical High Risk",
            "ocrConfidence": "81.0%",
            "flags": [
                "CRITICAL: GSTIN status on GST Portal returned CANCELLED / SUSPENDED.",
                "Severe discrepancy: Name on PAN card does not match bidder entity registered on GeM.",
                "Local content declaration is 15%, below mandatory minimum 20% DPIIT threshold for this category.",
                "Turnover certificate font analysis indicates potential document tampering / altered figures."
            ],
            "extractedDocs": [
                {"name": "GST_Certificate.pdf", "status": "Tampering Alert", "score": 15},
                {"name": "PAN_Copy.pdf", "status": "Entity Mismatch", "score": 20},
                {"name": "Turnover_Cert.pdf", "status": "Font Inconsistency Detected", "score": 18}
            ],
            "auditTrail": [
                {"timestamp": "06 Sep 2026, 08:15:01", "action": "Bid Ingested", "agent": "System"},
                {"timestamp": "06 Sep 2026, 08:15:03", "action": "OpenCV Document Forensics: Detected font irregularity on turnover figures", "agent": "OpenCV Document Forensics"},
                {"timestamp": "06 Sep 2026, 08:15:04", "action": "External GST API: Status CANCELLED", "agent": "GSTIN Verification API"},
                {"timestamp": "06 Sep 2026, 08:15:05", "action": "Score 22/100 -> AUTO-REJECTED & Added to Vigilance Watchlist", "agent": "Rule Engine"}
            ]
        },
        {
            "id": "BID-20491",
            "vendor": "Kaveri Infotech",
            "category": "IT Hardware",
            "item": "Rack Servers & SAN Storage Solution",
            "tenderId": "GEM/2026/B/891244",
            "tenderValue": "₹1.45 Cr",
            "bidAmount": "₹1.42 Cr",
            "status": "Compliant",
            "score": 94,
            "miiContent": "72% (Class-I Local)",
            "turnover": "₹15.2 Cr (Req: ₹5 Cr)",
            "experience": "7 Years (Req: 3 Yrs)",
            "gstStatus": "Active",
            "panStatus": "Verified",
            "msmeStatus": "Medium Enterprise",
            "date": "05 Sep 2026, 04:10 PM",
            "riskLevel": "Low Risk",
            "ocrConfidence": "99.1%",
            "flags": [],
            "extractedDocs": [
                {"name": "GST_3B.pdf", "status": "Verified", "score": 100},
                {"name": "CA_Turnover.pdf", "status": "Verified", "score": 96}
            ],
            "auditTrail": [
                {"timestamp": "05 Sep 2026, 04:10:00", "action": "Bid Ingested & Approved", "agent": "GeM Engine"}
            ]
        },
        {
            "id": "BID-20490",
            "vendor": "Shree Ganesh Networks",
            "category": "IT Hardware",
            "item": "Rack Servers & Networking Switches",
            "tenderId": "GEM/2026/B/891244",
            "tenderValue": "₹1.45 Cr",
            "bidAmount": "₹1.44 Cr",
            "status": "Flagged",
            "score": 54,
            "miiContent": "50% (Class-II Local)",
            "turnover": "₹5.1 Cr (Req: ₹5 Cr)",
            "experience": "3 Years (Req: 3 Yrs)",
            "gstStatus": "Active",
            "panStatus": "Verified",
            "msmeStatus": "Small Enterprise",
            "date": "05 Sep 2026, 02:40 PM",
            "riskLevel": "Medium Risk (Cartel Alert)",
            "ocrConfidence": "95.0%",
            "flags": [
                "Collusion Alert: Bid price is within 0.7% variance of Kaveri Infotech & Apex Supplies (Price Clustering Detected).",
                "IP Address check: Bid submitted from same subnet / 192.168.4.x as Kaveri Infotech.",
                "Digital Signature (DSC) issuer linked to common authorised signatory."
            ],
            "extractedDocs": [
                {"name": "GST_Certificate.pdf", "status": "Verified", "score": 92},
                {"name": "Turnover_Doc.pdf", "status": "Verified", "score": 90}
            ],
            "auditTrail": [
                {"timestamp": "05 Sep 2026, 02:40:11", "action": "Price Rigging Analysis: Pattern Matched with Cluster #4", "agent": "Graph Cartel Detector"},
                {"timestamp": "05 Sep 2026, 02:40:12", "action": "Score 54/100 -> Flagged for Anti-Cartel Investigation", "agent": "ML Scorer"}
            ]
        }
    ]

    for b in initial_bids:
        cursor.execute("""
        INSERT OR IGNORE INTO bids (
            id, vendor, category, item, tender_id, tender_value, bid_amount,
            status, score, mii_content, turnover, experience, gst_status, pan_status,
            msme_status, date, risk_level, ocr_confidence, flags, extracted_docs, audit_trail
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            b["id"], b["vendor"], b["category"], b["item"], b["tenderId"], b["tenderValue"], b["bidAmount"],
            b["status"], b["score"], b["miiContent"], b["turnover"], b["experience"], b["gstStatus"], b["panStatus"],
            b["msmeStatus"], b["date"], b["riskLevel"], b["ocrConfidence"],
            json.dumps(b["flags"]), json.dumps(b["extractedDocs"]), json.dumps(b["auditTrail"])
        ))

def seed_initial_users(cursor):
    demo_users = [
        ("National Procurement Authority", "buyer@gov.in", "buyer123", "Defence & Space Procurement Cell", "07GOVND0001A1Z1", "buyer"),
        ("Smart Cities Mission Buyer", "buyer@smartcities.gov.in", "buyer123", "Ministry of Housing and Urban Affairs", "07DRDO1234F1Z8", "buyer"),
        ("Apex Supplies Ltd. (Bidder)", "bidder@apex.in", "bidder123", "Apex Supplies Ltd.", "27AABCB1234F1Z5", "bidder"),
        ("Kaveri Infotech (Bidder)", "bidder@kaveri.in", "bidder123", "Kaveri Infotech", "27KAVRI5678B1Z2", "bidder")
    ]
    for u in demo_users:
        cursor.execute("""
        INSERT OR IGNORE INTO users (full_name, email, password_hash, organization, gstin, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (u[0], u[1], u[2], u[3], u[4], u[5], datetime.now().isoformat()))

def seed_initial_tenders(cursor):
    tenders = [
        {
            "id": "GEM/2026/B/891244",
            "title": "Procurement of High-Performance AI Workstations & SAN Storage",
            "ministry": "Ministry of Defence",
            "department": "Defence Research & Development Organisation (DRDO)",
            "category": "IT Hardware",
            "estimated_value": "₹1.45 Cr",
            "emd_amount": "₹2.90 Lakhs (MSE Exempted)",
            "published_date": "01 Sep 2026",
            "closing_date": "15 Sep 2026",
            "status": "Active",
            "mii_min_requirement": "50% (Class-I)",
            "min_turnover_requirement": "₹2.0 Cr",
            "min_experience_years": 3,
            "mandatory_docs": json.dumps(["PAN Card", "GSTIN Certificate", "UDYAM Certificate", "CA Audited Turnover Statement", "Make in India Declaration"]),
            "boq_items": json.dumps([
                {"item": "AI Workstations (RTX 6000 Ada, 128GB RAM)", "qty": 250, "unit": "Nos"},
                {"item": "All-Flash SAN Storage 500TB", "qty": 2, "unit": "Units"}
            ]),
            "created_at": "2026-09-01T10:00:00"
        },
        {
            "id": "GEM/2026/B/890412",
            "title": "Ergonomic Modular Office Workstations & Executive Mesh Chairs",
            "ministry": "Ministry of Railways",
            "department": "Northern Railway Headquarter, New Delhi",
            "category": "Furniture",
            "estimated_value": "₹42.0 Lakhs",
            "emd_amount": "₹84,000 (MSE Exempted)",
            "published_date": "02 Sep 2026",
            "closing_date": "12 Sep 2026",
            "status": "Active",
            "mii_min_requirement": "50% (Class-I)",
            "min_turnover_requirement": "₹50.0 Lakhs",
            "min_experience_years": 2,
            "mandatory_docs": json.dumps(["PAN Card", "GSTIN Certificate", "UDYAM Certificate", "CA Audited Turnover Statement"]),
            "boq_items": json.dumps([
                {"item": "Modular 4-Seater Linear Workstations", "qty": 50, "unit": "Sets"},
                {"item": "Ergonomic High-Back Chairs", "qty": 200, "unit": "Nos"}
            ]),
            "created_at": "2026-09-02T11:30:00"
        },
        {
            "id": "GEM/2026/B/889105",
            "title": "Cloud-Based GIS Spatial Mapping & Urban Analytics Platform",
            "ministry": "Ministry of Housing and Urban Affairs",
            "department": "Smart Cities Mission Directorate",
            "category": "Software",
            "estimated_value": "₹2.10 Cr",
            "emd_amount": "₹4.20 Lakhs",
            "published_date": "28 Aug 2026",
            "closing_date": "18 Sep 2026",
            "status": "Active",
            "mii_min_requirement": "50% (Class-I)",
            "min_turnover_requirement": "₹3.0 Cr",
            "min_experience_years": 4,
            "mandatory_docs": json.dumps(["PAN Card", "GSTIN Certificate", "CMMI Level 3 / ISO 27001", "CA Audited Turnover Statement"]),
            "boq_items": json.dumps([
                {"item": "Enterprise GIS Web Platform License (3 Years)", "qty": 1, "unit": "License"},
                {"item": "Cloud Hosting & AI Analytics Module", "qty": 1, "unit": "Suite"}
            ]),
            "created_at": "2026-08-28T14:00:00"
        },
        {
            "id": "GEM/2026/B/882100",
            "title": "Hospital Intensive Care Medical Grade Oxygen Cylinders & Regulators",
            "ministry": "Ministry of Health and Family Welfare",
            "department": "All India Institute of Medical Sciences (AIIMS)",
            "category": "Medical Equipment",
            "estimated_value": "₹85.0 Lakhs",
            "emd_amount": "₹1.70 Lakhs",
            "published_date": "03 Sep 2026",
            "closing_date": "19 Sep 2026",
            "status": "Active",
            "mii_min_requirement": "50% (Class-I)",
            "min_turnover_requirement": "₹1.5 Cr",
            "min_experience_years": 3,
            "mandatory_docs": json.dumps(["PAN Card", "GSTIN Certificate", "Drug Controller License / ISO 13485", "CA Statement"]),
            "boq_items": json.dumps([
                {"item": "D-Type High Pressure Medical Oxygen Cylinders (46.7L)", "qty": 400, "unit": "Units"},
                {"item": "Digital Pressure Regulators & Flowmeters", "qty": 400, "unit": "Units"}
            ]),
            "created_at": "2026-09-03T09:15:00"
        }
    ]
    for t in tenders:
        cursor.execute("""
        INSERT OR IGNORE INTO tenders (
            id, title, ministry, department, category, estimated_value,
            emd_amount, published_date, closing_date, status, mii_min_requirement,
            min_turnover_requirement, min_experience_years, mandatory_docs, boq_items, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            t["id"], t["title"], t["ministry"], t["department"], t["category"],
            t["estimated_value"], t["emd_amount"], t["published_date"], t["closing_date"],
            t["status"], t["mii_min_requirement"], t["min_turnover_requirement"],
            t["min_experience_years"], t["mandatory_docs"], t["boq_items"], t["created_at"]
        ))

def seed_initial_contracts(cursor):
    contracts = [
        {
            "id": "PO-GEM-2026-9901",
            "tender_id": "GEM/2026/B/891244",
            "bid_id": "BID-20495",
            "vendor": "Apex Supplies Ltd.",
            "buyer_org": "DRDO Research Labs, Min of Defence",
            "contract_value": "₹1.38 Cr",
            "po_date": "06 Sep 2026",
            "dsc_signed": 1,
            "crac_status": "Approved",
            "crac_date": "06 Sep 2026, 03:30 PM",
            "payment_status": "Processing (Day 4/10)",
            "payment_due_date": "16 Sep 2026",
            "disbursement_ref": "PFMS-TXN-2026-0906-8812"
        }
    ]
    for c in contracts:
        cursor.execute("""
        INSERT OR IGNORE INTO contracts (
            id, tender_id, bid_id, vendor, buyer_org, contract_value, po_date,
            dsc_signed, crac_status, crac_date, payment_status, payment_due_date, disbursement_ref
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            c["id"], c["tender_id"], c["bid_id"], c["vendor"], c["buyer_org"],
            c["contract_value"], c["po_date"], c["dsc_signed"], c["crac_status"],
            c["crac_date"], c["payment_status"], c["payment_due_date"], c["disbursement_ref"]
        ))

def seed_initial_cartel_reports(cursor):
    reports = [
        {
            "id": 1,
            "tender_id": "GEM/2026/B/891244",
            "severity": "CRITICAL",
            "title": "Shared IP Subnet & Digital Signature Collusion",
            "description": "Bidders Kaveri Infotech and Shree Ganesh Networks submitted bids within 4 minutes from identical IP subnet 192.168.4.x with shared DSC Signatory X and identical BOQ markup formulas.",
            "flagged_vendors": json.dumps(["Kaveri Infotech", "Shree Ganesh Networks"]),
            "detected_at": "06 Sep 2026, 02:45 PM"
        }
    ]
    for r in reports:
        cursor.execute("""
        INSERT OR IGNORE INTO cartel_reports (id, tender_id, severity, title, description, flagged_vendors, detected_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (r["id"], r["tender_id"], r["severity"], r["title"], r["description"], r["flagged_vendors"], r["detected_at"]))

def seed_initial_vendors(cursor):
    vendors = [
        ("Apex Supplies Ltd.", "27AABCB1234F1Z5", "AABCB1234F", "UDYAM-MH-03-0019284", "IT Hardware", "Class-I Local Supplier (68%)", 96, "Low Risk", 0),
        ("Kaveri Infotech", "27KAVRI5678B1Z2", "KAVRI5678B", "UDYAM-MH-03-0044192", "IT Hardware", "Class-I Local Supplier (72%)", 94, "Low Risk", 0),
        ("TechForce Pvt Ltd", "07TFPL9912C1Z4", "TFPL9912C", "UDYAM-DL-02-0048123", "Software", "Class-I Local Supplier (85%)", 91, "Low Risk", 0),
        ("Balaji Enterprises", "27BLEP4411D1Z8", "BLEP4411D", "UDYAM-MH-03-0099812", "Furniture", "Class-II Local Supplier (42%)", 61, "Medium Risk", 0),
        ("UniVend Solutions", "06UNIV0000Z1Z0", "ABCDE1234F", "UDYAM-HR-00-INVALID", "Stationery", "Non-Compliant (<20%)", 22, "High Risk", 1)
    ]
    for v in vendors:
        cursor.execute("""
        INSERT OR IGNORE INTO vendors (name, gstin, pan, udyam_no, category, mii_classification, compliance_score, risk_tier, blacklisted, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], v[8], datetime.now().isoformat()))

# =========================================================================
# Query Helpers
# =========================================================================

def row_to_bid_dict(row) -> Dict[str, Any]:
    return {
        "id": row["id"],
        "vendor": row["vendor"],
        "category": row["category"],
        "item": row["item"],
        "tenderId": row["tender_id"],
        "tenderValue": row["tender_value"],
        "bidAmount": row["bid_amount"],
        "status": row["status"],
        "score": row["score"],
        "miiContent": row["mii_content"],
        "turnover": row["turnover"],
        "experience": row["experience"],
        "gstStatus": row["gst_status"],
        "panStatus": row["pan_status"],
        "msmeStatus": row["msme_status"],
        "date": row["date"],
        "riskLevel": row["risk_level"],
        "ocrConfidence": row["ocr_confidence"],
        "flags": json.loads(row["flags"]) if row["flags"] else [],
        "extractedDocs": json.loads(row["extracted_docs"]) if row["extracted_docs"] else [],
        "extractedEntities": json.loads(row["extracted_entities"]) if "extracted_entities" in row.keys() and row["extracted_entities"] else [],
        "crossDocMatches": json.loads(row["cross_doc_matches"]) if "cross_doc_matches" in row.keys() and row["cross_doc_matches"] else [],
        "requirementMatches": json.loads(row["requirement_matches"]) if "requirement_matches" in row.keys() and row["requirement_matches"] else [],
        "complianceReport": json.loads(row["compliance_report"]) if "compliance_report" in row.keys() and row["compliance_report"] else None,
        "auditTrail": json.loads(row["audit_trail"]) if row["audit_trail"] else []
    }

def get_all_bids(status_filter: Optional[str] = None, category_filter: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM bids WHERE 1=1"
    params = []

    if status_filter and status_filter.upper() != "ALL":
        query += " AND UPPER(status) = ?"
        params.append(status_filter.upper())

    if category_filter and category_filter.upper() != "ALL":
        query += " AND category = ?"
        params.append(category_filter)

    if search:
        s = f"%{search.lower()}%"
        query += " AND (LOWER(vendor) LIKE ? OR LOWER(id) LIKE ? OR LOWER(category) LIKE ? OR LOWER(tender_id) LIKE ?)"
        params.extend([s, s, s, s])

    query += " ORDER BY rowid DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    bids = [row_to_bid_dict(r) for r in rows]
    conn.close()
    return bids

def get_bid_by_id(bid_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bids WHERE id = ?", (bid_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return row_to_bid_dict(row)
    return None

def insert_bid(bid: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO bids (
        id, vendor, category, item, tender_id, tender_value, bid_amount,
        status, score, mii_content, turnover, experience, gst_status, pan_status,
        msme_status, date, risk_level, ocr_confidence, flags, extracted_docs,
        extracted_entities, cross_doc_matches, requirement_matches, compliance_report, audit_trail
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        bid["id"], bid["vendor"], bid["category"], bid.get("item", f"{bid['category']} Procurement"),
        bid["tenderId"], bid["tenderValue"], bid["bidAmount"],
        bid["status"], bid["score"], bid["miiContent"], bid["turnover"], bid["experience"],
        bid["gstStatus"], bid["panStatus"], bid["msmeStatus"], bid["date"],
        bid["riskLevel"], bid["ocrConfidence"],
        json.dumps(bid["flags"]), json.dumps(bid["extractedDocs"]),
        json.dumps(bid.get("extractedEntities", [])),
        json.dumps(bid.get("crossDocMatches", [])),
        json.dumps(bid.get("requirementMatches", [])),
        json.dumps(bid.get("complianceReport", None)),
        json.dumps(bid["auditTrail"])
    ))
    conn.commit()
    conn.close()
    return bid

def update_bid_status(bid_id: str, new_status: str, buyer_notes: Optional[str] = None, buyer_name: Optional[str] = "Government Procuring Authority", officer_notes: Optional[str] = None, officer_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
    bid = get_bid_by_id(bid_id)
    if not bid:
        return None
    
    effective_notes = buyer_notes or officer_notes
    effective_name = officer_name or buyer_name or "Government Procuring Authority"
    timestamp = datetime.now().strftime("%d %b %Y, %I:%M %p")
    note = effective_notes if effective_notes else f"Authority transitioned status to '{new_status}'."
    bid["status"] = new_status
    if new_status == "Compliant" or new_status == "Selected":
        bid["riskLevel"] = "Low Risk (Approved / Selected)"
    elif new_status == "Non-Compliant" or new_status == "Rejected":
        bid["riskLevel"] = "High Risk (Rejected)"
    elif new_status == "Flagged":
        bid["riskLevel"] = "Medium Risk (Clarification Requested)"
    
    bid["auditTrail"].append({
        "timestamp": timestamp,
        "action": f"Authority Action: Marked as {new_status} - {note}",
        "agent": effective_name
    })

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE bids SET
        status = ?,
        risk_level = ?,
        audit_trail = ?
    WHERE id = ?
    """, (bid["status"], bid["riskLevel"], json.dumps(bid["auditTrail"]), bid_id))
    
    # If final selection / awarded, also update tender record
    if new_status == "Selected":
        cursor.execute("""
        UPDATE tenders SET
            status = 'Awarded',
            selected_bidder_id = ?
        WHERE id = ?
        """, (bid_id, bid["tenderId"]))

    conn.commit()
    conn.close()
    return bid

def delete_bid(bid_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM bids WHERE id = ?", (bid_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

# =========================================================================
# Tenders Helpers
# =========================================================================

def get_all_tenders() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tenders ORDER BY created_at DESC")
    rows = cursor.fetchall()
    tenders = []
    for r in rows:
        tenders.append({
            "id": r["id"],
            "title": r["title"],
            "ministry": r["ministry"],
            "department": r["department"],
            "category": r["category"],
            "estimatedValue": r["estimated_value"],
            "emdAmount": r["emd_amount"],
            "publishedDate": r["published_date"],
            "closingDate": r["closing_date"],
            "status": r["status"],
            "miiMinRequirement": r["mii_min_requirement"],
            "minTurnoverRequirement": r["min_turnover_requirement"] if "min_turnover_requirement" in r.keys() and r["min_turnover_requirement"] else "₹2.0 Cr",
            "minExperienceYears": r["min_experience_years"] if "min_experience_years" in r.keys() and r["min_experience_years"] else 3,
            "mandatoryDocs": json.loads(r["mandatory_docs"]) if "mandatory_docs" in r.keys() and r["mandatory_docs"] else ["PAN Card", "GSTIN Certificate", "UDYAM Certificate", "CA Audited Turnover Statement", "Make in India Declaration"],
            "boqItems": json.loads(r["boq_items"]) if r["boq_items"] else [],
            "selectedBidderId": r["selected_bidder_id"] if "selected_bidder_id" in r.keys() else None
        })
    conn.close()
    return tenders

def get_tender_by_id(tender_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tenders WHERE id = ?", (tender_id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        return None
    return {
        "id": r["id"],
        "title": r["title"],
        "ministry": r["ministry"],
        "department": r["department"],
        "category": r["category"],
        "estimatedValue": r["estimated_value"],
        "emdAmount": r["emd_amount"],
        "publishedDate": r["published_date"],
        "closingDate": r["closing_date"],
        "status": r["status"],
        "miiMinRequirement": r["mii_min_requirement"],
        "minTurnoverRequirement": r["min_turnover_requirement"] if "min_turnover_requirement" in r.keys() and r["min_turnover_requirement"] else "₹2.0 Cr",
        "minExperienceYears": r["min_experience_years"] if "min_experience_years" in r.keys() and r["min_experience_years"] else 3,
        "mandatoryDocs": json.loads(r["mandatory_docs"]) if "mandatory_docs" in r.keys() and r["mandatory_docs"] else ["PAN Card", "GSTIN Certificate", "UDYAM Certificate", "CA Audited Turnover Statement", "Make in India Declaration"],
        "boqItems": json.loads(r["boq_items"]) if r["boq_items"] else [],
        "selectedBidderId": r["selected_bidder_id"] if "selected_bidder_id" in r.keys() else None
    }

def create_tender(t: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO tenders (
        id, title, ministry, department, category, estimated_value,
        emd_amount, published_date, closing_date, status, mii_min_requirement,
        min_turnover_requirement, min_experience_years, mandatory_docs, boq_items, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        t["id"], t["title"], t["ministry"], t["department"], t["category"],
        t["estimatedValue"], t["emdAmount"], t["publishedDate"], t["closingDate"],
        t.get("status", "Active"), t["miiMinRequirement"],
        t.get("minTurnoverRequirement", "₹2.0 Cr"),
        t.get("minExperienceYears", 3),
        json.dumps(t.get("mandatoryDocs", ["PAN Card", "GSTIN Certificate", "UDYAM Certificate", "CA Audited Turnover Statement", "Make in India Declaration"])),
        json.dumps(t.get("boqItems", [])),
        datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()
    return t

def get_all_contracts() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM contracts ORDER BY rowid DESC")
    rows = cursor.fetchall()
    contracts = []
    for r in rows:
        contracts.append({
            "id": r["id"],
            "tenderId": r["tender_id"],
            "bidId": r["bid_id"],
            "vendor": r["vendor"],
            "buyerOrg": r["buyer_org"],
            "contractValue": r["contract_value"],
            "poDate": r["po_date"],
            "dscSigned": bool(r["dsc_signed"]),
            "cracStatus": r["crac_status"],
            "cracDate": r["crac_date"],
            "paymentStatus": r["payment_status"],
            "paymentDueDate": r["payment_due_date"],
            "disbursementRef": r["disbursement_ref"]
        })
    conn.close()
    return contracts

def update_contract_crac(po_id: str, crac_status: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
    cursor.execute("""
    UPDATE contracts SET
        crac_status = ?,
        crac_date = ?
    WHERE id = ?
    """, (crac_status, now_str, po_id))
    conn.commit()
    conn.close()
    
    for c in get_all_contracts():
        if c["id"] == po_id:
            return c
    return None

def update_contract_payment(po_id: str, payment_status: str, disbursement_ref: Optional[str] = None) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    ref = disbursement_ref or f"PFMS-TXN-{datetime.now().strftime('%Y-%m%d')}-{po_id[-4:]}"
    cursor.execute("""
    UPDATE contracts SET
        payment_status = ?,
        disbursement_ref = ?
    WHERE id = ?
    """, (payment_status, ref, po_id))
    conn.commit()
    conn.close()

    for c in get_all_contracts():
        if c["id"] == po_id:
            return c
    return None

def get_all_vendors() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vendors ORDER BY compliance_score DESC")
    rows = cursor.fetchall()
    vendors = []
    for r in rows:
        vendors.append({
            "id": r["id"],
            "name": r["name"],
            "gstin": r["gstin"],
            "pan": r["pan"],
            "udyamNo": r["udyam_no"],
            "category": r["category"],
            "miiClassification": r["mii_classification"],
            "complianceScore": r["compliance_score"],
            "riskTier": r["risk_tier"],
            "blacklisted": bool(r["blacklisted"])
        })
    conn.close()
    return vendors

def get_all_cartel_reports() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cartel_reports ORDER BY id DESC")
    rows = cursor.fetchall()
    reports = []
    for r in rows:
        reports.append({
            "id": r["id"],
            "tenderId": r["tender_id"],
            "severity": r["severity"],
            "title": r["title"],
            "description": r["description"],
            "flaggedVendors": json.loads(r["flagged_vendors"]) if r["flagged_vendors"] else [],
            "detectedAt": r["detected_at"]
        })
    conn.close()
    return reports

def log_audit_event(event_type: str, entity_id: str, user_agent: str, details: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO audit_logs (event_type, entity_id, user_agent, details, timestamp)
    VALUES (?, ?, ?, ?, ?)
    """, (event_type, entity_id, user_agent, details, datetime.now().isoformat()))
    conn.commit()
    conn.close()

def get_db_stats() -> Dict[str, int]:
    conn = get_connection()
    cursor = conn.cursor()
    stats = {}
    tables = ["bids", "tenders", "contracts", "vendors", "users", "cartel_reports", "audit_logs"]
    for t in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {t}")
            stats[t] = cursor.fetchone()[0]
        except Exception:
            stats[t] = 0
    conn.close()
    return stats

# =========================================================================
# CLI Entry Point
# =========================================================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GeM AI Procurement Compliance - Database Manager")
    parser.add_argument("--init", action="store_true", help="Initialize tables without dummy data")
    parser.add_argument("--clear", action="store_true", help="Clear all dummy data and delete all users")
    parser.add_argument("--reset", action="store_true", help="Drop and re-create all tables (clean empty state)")
    parser.add_argument("--stats", action="store_true", help="Display record counts for all database tables")
    args = parser.parse_args()

    print("=======================================================================")
    print("[*] GeM AI PROCUREMENT DATABASE MANAGER (SIH26100 - TEAM CODETOX)")
    print(f"[*] Database file: {DB_PATH}")
    print("=======================================================================")

    if args.clear:
        print("[*] Clearing all dummy data and deleting all users...")
        clear_all_data()
        print("[OK] All database records cleared!")
    elif args.reset:
        print("[*] Resetting database tables from scratch (clean empty state)...")
        reset_db()
        print("[OK] Database reset successfully!")
    else:
        print("[*] Initializing database tables...")
        init_db()
        print("[OK] Database initialized successfully!")

    stats = get_db_stats()
    print("\nDatabase Record Counts:")
    print("--------------------------------------------------")
    for tbl, count in stats.items():
        print(f"  * {tbl.ljust(18)} : {count} records")
    print("--------------------------------------------------\n")
