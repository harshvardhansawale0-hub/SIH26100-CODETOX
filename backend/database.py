import json
import os
import sys
import argparse
from datetime import datetime
from typing import List, Dict, Any, Optional

# ===========================================================================
# Database Connection — PostgreSQL (Neon) with SQLite fallback for local dev
# ===========================================================================

DATABASE_URL = os.environ.get("DATABASE_URL")

# Determine which driver to use
if DATABASE_URL:
    import psycopg2
    import psycopg2.extras
    _USE_PG = True
    print(f"[*] Using PostgreSQL (Neon): {DATABASE_URL[:40]}...")
else:
    import sqlite3
    _USE_PG = False
    DB_PATH = os.path.join(os.path.dirname(__file__), "gem_procure.db")
    print(f"[*] DATABASE_URL not set. Falling back to SQLite: {DB_PATH}")


def get_connection():
    """
    Returns a database connection.
    - If DATABASE_URL is set: PostgreSQL via psycopg2 (RealDictCursor)
    - Otherwise: SQLite with row_factory (local dev fallback)
    """
    if _USE_PG:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
        conn.autocommit = False
        return conn
    else:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA journal_mode = WAL;")
        return conn


def _ph(n: int = 1) -> str:
    """Returns the correct placeholder for the current DB engine."""
    if _USE_PG:
        return ", ".join(["%s"] * n)
    else:
        return ", ".join(["?"] * n)


def _p() -> str:
    """Single parameter placeholder."""
    return "%s" if _USE_PG else "?"


def _count_result(row):
    """Extract count from a COUNT(*) query result (works for both drivers)."""
    if _USE_PG:
        return row["count"]
    else:
        return row[0]


# ===========================================================================
# Schema Initialization
# ===========================================================================

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

    if _USE_PG:
        # PostgreSQL table definitions
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
            flags TEXT NOT NULL,
            extracted_docs TEXT NOT NULL,
            extracted_entities TEXT,
            cross_doc_matches TEXT,
            requirement_matches TEXT,
            compliance_report TEXT,
            audit_trail TEXT NOT NULL,
            submitted_by TEXT,
            vendor_email TEXT,
            _row_order SERIAL
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            organization TEXT NOT NULL,
            gstin TEXT,
            role TEXT NOT NULL DEFAULT 'bidder',
            created_at TEXT NOT NULL
        )
        """)

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
            status TEXT NOT NULL,
            mii_min_requirement TEXT NOT NULL,
            min_turnover_requirement TEXT DEFAULT '₹2.0 Cr',
            min_experience_years INTEGER DEFAULT 3,
            mandatory_docs TEXT DEFAULT '[]',
            boq_items TEXT NOT NULL,
            selected_bidder_id TEXT,
            created_by TEXT DEFAULT '',
            buyer_email TEXT DEFAULT '',
            buyer_name TEXT DEFAULT '',
            buyer_org TEXT DEFAULT '',
            created_at TEXT NOT NULL
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS contracts (
            id TEXT PRIMARY KEY,
            tender_id TEXT NOT NULL,
            bid_id TEXT NOT NULL,
            vendor TEXT NOT NULL,
            buyer_org TEXT NOT NULL,
            contract_value TEXT NOT NULL,
            po_date TEXT NOT NULL,
            dsc_signed BOOLEAN NOT NULL DEFAULT TRUE,
            crac_status TEXT NOT NULL,
            crac_date TEXT,
            payment_status TEXT NOT NULL,
            payment_due_date TEXT NOT NULL,
            disbursement_ref TEXT,
            _row_order SERIAL
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS cartel_reports (
            id SERIAL PRIMARY KEY,
            tender_id TEXT NOT NULL,
            severity TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            flagged_vendors TEXT NOT NULL,
            detected_at TEXT NOT NULL
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS vendors (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            gstin TEXT NOT NULL,
            pan TEXT NOT NULL,
            udyam_no TEXT,
            category TEXT NOT NULL,
            mii_classification TEXT NOT NULL,
            compliance_score INTEGER DEFAULT 90,
            risk_tier TEXT DEFAULT 'Low Risk',
            blacklisted BOOLEAN DEFAULT FALSE,
            created_at TEXT NOT NULL
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id SERIAL PRIMARY KEY,
            event_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            user_agent TEXT NOT NULL,
            details TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS verifications (
            id TEXT PRIMARY KEY,
            vendor_id INTEGER NOT NULL,
            doc_type TEXT NOT NULL,
            doc_ref TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            verified_at TEXT,
            expires_at TEXT,
            verification_method TEXT DEFAULT 'mock',
            details TEXT DEFAULT '{}',
            created_at TEXT NOT NULL
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS passports (
            id TEXT PRIMARY KEY,
            vendor_id INTEGER NOT NULL,
            issued_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            payload_hash TEXT NOT NULL,
            signature TEXT NOT NULL,
            signed_payload TEXT NOT NULL,
            revoked_at TEXT,
            revocation_reason TEXT,
            created_at TEXT NOT NULL
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS passport_presentations (
            id SERIAL PRIMARY KEY,
            passport_id TEXT NOT NULL,
            bid_id TEXT,
            tender_id TEXT,
            presented_at TEXT NOT NULL,
            verification_result TEXT NOT NULL,
            verified_by TEXT,
            ip_address TEXT,
            details TEXT DEFAULT '{}'
        )
        """)
    else:
        # SQLite table definitions (original)
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
            flags TEXT NOT NULL,
            extracted_docs TEXT NOT NULL,
            extracted_entities TEXT,
            cross_doc_matches TEXT,
            requirement_matches TEXT,
            compliance_report TEXT,
            audit_trail TEXT NOT NULL,
            submitted_by TEXT,
            vendor_email TEXT
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            organization TEXT NOT NULL,
            gstin TEXT,
            role TEXT NOT NULL DEFAULT 'bidder',
            created_at TEXT NOT NULL
        )
        """)

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
            status TEXT NOT NULL,
            mii_min_requirement TEXT NOT NULL,
            min_turnover_requirement TEXT DEFAULT '₹2.0 Cr',
            min_experience_years INTEGER DEFAULT 3,
            mandatory_docs TEXT DEFAULT '[]',
            boq_items TEXT NOT NULL,
            selected_bidder_id TEXT,
            created_by TEXT DEFAULT '',
            buyer_email TEXT DEFAULT '',
            buyer_name TEXT DEFAULT '',
            buyer_org TEXT DEFAULT '',
            created_at TEXT NOT NULL
        )
        """)

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
            crac_status TEXT NOT NULL,
            crac_date TEXT,
            payment_status TEXT NOT NULL,
            payment_due_date TEXT NOT NULL,
            disbursement_ref TEXT
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS cartel_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tender_id TEXT NOT NULL,
            severity TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            flagged_vendors TEXT NOT NULL,
            detected_at TEXT NOT NULL
        )
        """)

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

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS verifications (
            id TEXT PRIMARY KEY,
            vendor_id INTEGER NOT NULL,
            doc_type TEXT NOT NULL,
            doc_ref TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            verified_at TEXT,
            expires_at TEXT,
            verification_method TEXT DEFAULT 'mock',
            details TEXT DEFAULT '{}',
            created_at TEXT NOT NULL,
            FOREIGN KEY (vendor_id) REFERENCES vendors(id)
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS passports (
            id TEXT PRIMARY KEY,
            vendor_id INTEGER NOT NULL,
            issued_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            payload_hash TEXT NOT NULL,
            signature TEXT NOT NULL,
            signed_payload TEXT NOT NULL,
            revoked_at TEXT,
            revocation_reason TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (vendor_id) REFERENCES vendors(id)
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS passport_presentations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            passport_id TEXT NOT NULL,
            bid_id TEXT,
            tender_id TEXT,
            presented_at TEXT NOT NULL,
            verification_result TEXT NOT NULL,
            verified_by TEXT,
            ip_address TEXT,
            details TEXT DEFAULT '{}',
            FOREIGN KEY (passport_id) REFERENCES passports(id)
        )
        """)

    # Performance Indexes (same syntax for both)
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
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_verifications_vendor ON verifications(vendor_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_passports_vendor ON passports(vendor_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_passports_status ON passports(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_presentations_passport ON passport_presentations(passport_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_presentations_bid ON passport_presentations(bid_id)")

    # Dynamic schema migration for tenders table: ensure buyer columns exist in any pre-existing database
    for col_name in ["created_by", "buyer_email", "buyer_name", "buyer_org", "buyer_id"]:
        try:
            if _USE_PG:
                cursor.execute(f"ALTER TABLE tenders ADD COLUMN IF NOT EXISTS {col_name} TEXT DEFAULT ''")
            else:
                cursor.execute(f"ALTER TABLE tenders ADD COLUMN {col_name} TEXT DEFAULT ''")
        except Exception:
            pass

    # Dynamic schema migration for bids table: ensure AI analysis and vendor attribution columns exist
    for col_name in ["extracted_entities", "cross_doc_matches", "requirement_matches", "compliance_report", "submitted_by", "vendor_email"]:
        try:
            if _USE_PG:
                cursor.execute(f"ALTER TABLE bids ADD COLUMN IF NOT EXISTS {col_name} TEXT")
            else:
                cursor.execute(f"ALTER TABLE bids ADD COLUMN {col_name} TEXT")
        except Exception:
            pass

    # Seed benchmark initial data if tables are empty
    try:
        cursor.execute("SELECT COUNT(*) FROM users")
        if _count_result(cursor.fetchone()) == 0:
            seed_initial_users(cursor)

        cursor.execute("SELECT COUNT(*) FROM tenders")
        if _count_result(cursor.fetchone()) == 0:
            seed_initial_tenders(cursor)

        cursor.execute("SELECT COUNT(*) FROM bids")
        if _count_result(cursor.fetchone()) == 0:
            seed_initial_bids(cursor)

        cursor.execute("SELECT COUNT(*) FROM contracts")
        if _count_result(cursor.fetchone()) == 0:
            seed_initial_contracts(cursor)

        cursor.execute("SELECT COUNT(*) FROM vendors")
        if _count_result(cursor.fetchone()) == 0:
            seed_initial_vendors(cursor)
    except Exception as e:
        print(f"[!] Warning during initial seeding: {e}")

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
    Wipes the database completely and re-initializes clean empty tables.
    """
    init_db(force_recreate=True)

def seed_initial_bids(cursor):
    p = _p()
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
        if _USE_PG:
            cursor.execute("""
            INSERT INTO bids (
                id, vendor, category, item, tender_id, tender_value, bid_amount,
                status, score, mii_content, turnover, experience, gst_status, pan_status,
                msme_status, date, risk_level, ocr_confidence, flags, extracted_docs, audit_trail
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
            """, (
                b["id"], b["vendor"], b["category"], b["item"], b["tenderId"], b["tenderValue"], b["bidAmount"],
                b["status"], b["score"], b["miiContent"], b["turnover"], b["experience"], b["gstStatus"], b["panStatus"],
                b["msmeStatus"], b["date"], b["riskLevel"], b["ocrConfidence"],
                json.dumps(b["flags"]), json.dumps(b["extractedDocs"]), json.dumps(b["auditTrail"])
            ))
        else:
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
        ("Dir. Rajesh Verma", "procurement.officer@nic.in", "buyer123", "Ministry of Electronics & IT (MeitY)", "07AAAGM0289C1ZU", "buyer"),
        ("Smart Cities Mission Buyer", "buyer@smartcities.gov.in", "buyer123", "Ministry of Housing and Urban Affairs", "07DRDO1234F1Z8", "buyer"),
        ("Apex Supplies Ltd. (Bidder)", "bidder@apex.in", "bidder123", "Apex Supplies Ltd.", "27AABCB1234F1Z5", "bidder"),
        ("Harshvardhan Sawale", "vendor.contact@apextech.com", "bidder123", "Apex Technologies & Supplies Ltd.", "27AABCB1234F1Z5", "bidder"),
        ("Kaveri Infotech (Bidder)", "bidder@kaveri.in", "bidder123", "Kaveri Infotech", "27KAVRI5678B1Z2", "bidder")
    ]
    for u in demo_users:
        if _USE_PG:
            cursor.execute("""
            INSERT INTO users (full_name, email, password_hash, organization, gstin, role, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (email) DO NOTHING
            """, (u[0], u[1], u[2], u[3], u[4], u[5], datetime.now().isoformat()))
        else:
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
        buyer_mail = "buyer@gov.in"
        buyer_name = "National Procurement Authority"
        buyer_org = t.get("ministry", "Ministry of Defence")
        if _USE_PG:
            cursor.execute("""
            INSERT INTO tenders (
                id, title, ministry, department, category, estimated_value,
                emd_amount, published_date, closing_date, status, mii_min_requirement,
                min_turnover_requirement, min_experience_years, mandatory_docs, boq_items,
                created_by, buyer_email, buyer_name, buyer_org, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
            """, (
                t["id"], t["title"], t["ministry"], t["department"], t["category"],
                t["estimated_value"], t["emd_amount"], t["published_date"], t["closing_date"],
                t["status"], t["mii_min_requirement"], t["min_turnover_requirement"],
                t["min_experience_years"], t["mandatory_docs"], t["boq_items"],
                buyer_mail, buyer_mail, buyer_name, buyer_org, t["created_at"]
            ))
        else:
            cursor.execute("""
            INSERT OR IGNORE INTO tenders (
                id, title, ministry, department, category, estimated_value,
                emd_amount, published_date, closing_date, status, mii_min_requirement,
                min_turnover_requirement, min_experience_years, mandatory_docs, boq_items,
                created_by, buyer_email, buyer_name, buyer_org, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                t["id"], t["title"], t["ministry"], t["department"], t["category"],
                t["estimated_value"], t["emd_amount"], t["published_date"], t["closing_date"],
                t["status"], t["mii_min_requirement"], t["min_turnover_requirement"],
                t["min_experience_years"], t["mandatory_docs"], t["boq_items"],
                buyer_mail, buyer_mail, buyer_name, buyer_org, t["created_at"]
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
            "dsc_signed": True if _USE_PG else 1,
            "crac_status": "Approved",
            "crac_date": "06 Sep 2026, 03:30 PM",
            "payment_status": "Processing (Day 4/10)",
            "payment_due_date": "16 Sep 2026",
            "disbursement_ref": "PFMS-TXN-2026-0906-8812"
        }
    ]
    for c in contracts:
        if _USE_PG:
            cursor.execute("""
            INSERT INTO contracts (
                id, tender_id, bid_id, vendor, buyer_org, contract_value, po_date,
                dsc_signed, crac_status, crac_date, payment_status, payment_due_date, disbursement_ref
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
            """, (
                c["id"], c["tender_id"], c["bid_id"], c["vendor"], c["buyer_org"],
                c["contract_value"], c["po_date"], c["dsc_signed"], c["crac_status"],
                c["crac_date"], c["payment_status"], c["payment_due_date"], c["disbursement_ref"]
            ))
        else:
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
        if _USE_PG:
            cursor.execute("""
            INSERT INTO cartel_reports (id, tender_id, severity, title, description, flagged_vendors, detected_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
            """, (r["id"], r["tender_id"], r["severity"], r["title"], r["description"], r["flagged_vendors"], r["detected_at"]))
        else:
            cursor.execute("""
            INSERT OR IGNORE INTO cartel_reports (id, tender_id, severity, title, description, flagged_vendors, detected_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (r["id"], r["tender_id"], r["severity"], r["title"], r["description"], r["flagged_vendors"], r["detected_at"]))

def seed_initial_vendors(cursor):
    vendors = [
        ("Apex Supplies Ltd.", "27AABCB1234F1Z5", "AABCB1234F", "UDYAM-MH-03-0019284", "IT Hardware", "Class-I Local Supplier (68%)", 96, "Low Risk", False if _USE_PG else 0),
        ("Kaveri Infotech", "27KAVRI5678B1Z2", "KAVRI5678B", "UDYAM-MH-03-0044192", "IT Hardware", "Class-I Local Supplier (72%)", 94, "Low Risk", False if _USE_PG else 0),
        ("TechForce Pvt Ltd", "07TFPL9912C1Z4", "TFPL9912C", "UDYAM-DL-02-0048123", "Software", "Class-I Local Supplier (85%)", 91, "Low Risk", False if _USE_PG else 0),
        ("Balaji Enterprises", "27BLEP4411D1Z8", "BLEP4411D", "UDYAM-MH-03-0099812", "Furniture", "Class-II Local Supplier (42%)", 61, "Medium Risk", False if _USE_PG else 0),
        ("UniVend Solutions", "06UNIV0000Z1Z0", "ABCDE1234F", "UDYAM-HR-00-INVALID", "Stationery", "Non-Compliant (<20%)", 22, "High Risk", True if _USE_PG else 1)
    ]
    for v in vendors:
        if _USE_PG:
            cursor.execute("""
            INSERT INTO vendors (name, gstin, pan, udyam_no, category, mii_classification, compliance_score, risk_tier, blacklisted, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (name) DO NOTHING
            """, (v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], v[8], datetime.now().isoformat()))
        else:
            cursor.execute("""
            INSERT OR IGNORE INTO vendors (name, gstin, pan, udyam_no, category, mii_classification, compliance_score, risk_tier, blacklisted, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], v[8], datetime.now().isoformat()))

# =========================================================================
# Query Helpers
# =========================================================================

def _row_get(row, key, default=None):
    """Safely get a value from a row dict (works for both RealDictCursor and sqlite3.Row)."""
    if _USE_PG:
        return row.get(key, default)
    else:
        if key in row.keys():
            return row[key] if row[key] is not None else default
        return default

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
        "submittedBy": _row_get(row, "submitted_by", None),
        "vendorEmail": _row_get(row, "vendor_email", None),
        "flags": json.loads(row["flags"]) if row["flags"] else [],
        "extractedDocs": json.loads(row["extracted_docs"]) if row["extracted_docs"] else [],
        "extractedEntities": json.loads(_row_get(row, "extracted_entities", "[]")) if _row_get(row, "extracted_entities") else [],
        "crossDocMatches": json.loads(_row_get(row, "cross_doc_matches", "[]")) if _row_get(row, "cross_doc_matches") else [],
        "requirementMatches": json.loads(_row_get(row, "requirement_matches", "[]")) if _row_get(row, "requirement_matches") else [],
        "complianceReport": json.loads(_row_get(row, "compliance_report", "null")) if _row_get(row, "compliance_report") else None,
        "auditTrail": json.loads(row["audit_trail"]) if row["audit_trail"] else []
    }

def get_all_bids(status_filter: Optional[str] = None, category_filter: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    p = _p()

    query = "SELECT * FROM bids WHERE 1=1"
    params = []

    if status_filter and status_filter.upper() != "ALL":
        query += f" AND UPPER(status) = {p}"
        params.append(status_filter.upper())

    if category_filter and category_filter.upper() != "ALL":
        query += f" AND category = {p}"
        params.append(category_filter)

    if search:
        s = f"%{search.lower()}%"
        query += f" AND (LOWER(vendor) LIKE {p} OR LOWER(id) LIKE {p} OR LOWER(category) LIKE {p} OR LOWER(tender_id) LIKE {p})"
        params.extend([s, s, s, s])

    if _USE_PG:
        query += " ORDER BY _row_order DESC"
    else:
        query += " ORDER BY rowid DESC"

    cursor.execute(query, params if _USE_PG else params)
    rows = cursor.fetchall()
    bids = [row_to_bid_dict(r) for r in rows]
    conn.close()
    return bids

def get_bid_by_id(bid_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    p = _p()
    cursor.execute(f"SELECT * FROM bids WHERE id = {p}", (bid_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return row_to_bid_dict(row)
    return None

def insert_bid(bid: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()

    bid_id = bid.get("id")
    vendor = bid.get("vendor") or "Apex Supplies Ltd."
    category = bid.get("category") or "IT Hardware"
    item = bid.get("item") or f"{category} Procurement Solution"
    tender_id = bid.get("tenderId") or bid.get("tender_id") or "GEM/2026/B/891244"
    tender_value = str(bid.get("tenderValue") or bid.get("tender_value") or "₹1.45 Cr")
    bid_amount = str(bid.get("bidAmount") or bid.get("bid_amount") or "₹1.38 Cr")
    status = bid.get("status") or "Compliant"
    score = int(bid.get("score") if bid.get("score") is not None else 95)
    mii_content = str(bid.get("miiContent") or bid.get("mii_content") or "75% (Class-I)")
    turnover = str(bid.get("turnover") or "Verified via CA Statement OCR")
    experience = str(bid.get("experience") or "Verified")
    gst_status = str(bid.get("gstStatus") or bid.get("gst_status") or "ACTIVE")
    pan_status = str(bid.get("panStatus") or bid.get("pan_status") or "MATCHED")
    msme_status = str(bid.get("msmeStatus") or bid.get("msme_status") or "Verified (UDYAM)")
    date_val = str(bid.get("date") or "Just Now")
    risk_level = str(bid.get("riskLevel") or bid.get("risk_level") or "Low Risk")
    ocr_confidence = str(bid.get("ocrConfidence") or bid.get("ocr_confidence") or "99.1%")
    submitted_by = bid.get("submittedBy") or bid.get("submitted_by")
    vendor_email = bid.get("vendorEmail") or bid.get("vendor_email")
    flags_val = json.dumps(bid.get("flags") or [])
    extracted_docs_val = json.dumps(bid.get("extractedDocs") or [])
    extracted_entities_val = json.dumps(bid.get("extractedEntities") or [])
    cross_doc_matches_val = json.dumps(bid.get("crossDocMatches") or [])
    requirement_matches_val = json.dumps(bid.get("requirementMatches") or [])
    compliance_report_val = json.dumps(bid.get("complianceReport")) if bid.get("complianceReport") is not None else None
    audit_trail_val = json.dumps(bid.get("auditTrail") or [])

    if _USE_PG:
        cursor.execute("""
        INSERT INTO bids (
            id, vendor, category, item, tender_id, tender_value, bid_amount,
            status, score, mii_content, turnover, experience, gst_status, pan_status,
            msme_status, date, risk_level, ocr_confidence, submitted_by, vendor_email,
            flags, extracted_docs, extracted_entities, cross_doc_matches, requirement_matches,
            compliance_report, audit_trail
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET
            vendor = EXCLUDED.vendor, category = EXCLUDED.category, item = EXCLUDED.item,
            tender_id = EXCLUDED.tender_id, tender_value = EXCLUDED.tender_value, bid_amount = EXCLUDED.bid_amount,
            status = EXCLUDED.status, score = EXCLUDED.score, mii_content = EXCLUDED.mii_content,
            turnover = EXCLUDED.turnover, experience = EXCLUDED.experience, gst_status = EXCLUDED.gst_status,
            pan_status = EXCLUDED.pan_status, msme_status = EXCLUDED.msme_status, date = EXCLUDED.date,
            risk_level = EXCLUDED.risk_level, ocr_confidence = EXCLUDED.ocr_confidence,
            submitted_by = EXCLUDED.submitted_by, vendor_email = EXCLUDED.vendor_email,
            flags = EXCLUDED.flags, extracted_docs = EXCLUDED.extracted_docs,
            extracted_entities = EXCLUDED.extracted_entities, cross_doc_matches = EXCLUDED.cross_doc_matches,
            requirement_matches = EXCLUDED.requirement_matches, compliance_report = EXCLUDED.compliance_report,
            audit_trail = EXCLUDED.audit_trail
        """, (
            bid_id, vendor, category, item, tender_id, tender_value, bid_amount,
            status, score, mii_content, turnover, experience, gst_status, pan_status,
            msme_status, date_val, risk_level, ocr_confidence, submitted_by, vendor_email,
            flags_val, extracted_docs_val, extracted_entities_val, cross_doc_matches_val,
            requirement_matches_val, compliance_report_val, audit_trail_val
        ))
    else:
        cursor.execute("""
        INSERT OR REPLACE INTO bids (
            id, vendor, category, item, tender_id, tender_value, bid_amount,
            status, score, mii_content, turnover, experience, gst_status, pan_status,
            msme_status, date, risk_level, ocr_confidence, submitted_by, vendor_email,
            flags, extracted_docs, extracted_entities, cross_doc_matches, requirement_matches,
            compliance_report, audit_trail
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            bid_id, vendor, category, item, tender_id, tender_value, bid_amount,
            status, score, mii_content, turnover, experience, gst_status, pan_status,
            msme_status, date_val, risk_level, ocr_confidence, submitted_by, vendor_email,
            flags_val, extracted_docs_val, extracted_entities_val, cross_doc_matches_val,
            requirement_matches_val, compliance_report_val, audit_trail_val
        ))
    conn.commit()
    conn.close()
    return get_bid_by_id(bid_id) or bid

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
    p = _p()
    cursor.execute(f"""
    UPDATE bids SET
        status = {p},
        risk_level = {p},
        audit_trail = {p}
    WHERE id = {p}
    """, (bid["status"], bid["riskLevel"], json.dumps(bid["auditTrail"]), bid_id))

    # If final selection / awarded, also update tender record
    if new_status == "Selected":
        cursor.execute(f"""
        UPDATE tenders SET
            status = 'Awarded',
            selected_bidder_id = {p}
        WHERE id = {p}
        """, (bid_id, bid["tenderId"]))

    conn.commit()
    conn.close()
    return bid

def delete_bid(bid_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    p = _p()
    cursor.execute(f"DELETE FROM bids WHERE id = {p}", (bid_id,))
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
            "minTurnoverRequirement": _row_get(r, "min_turnover_requirement", "₹2.0 Cr"),
            "minExperienceYears": _row_get(r, "min_experience_years", 3),
            "mandatoryDocs": json.loads(_row_get(r, "mandatory_docs", "[]")) if _row_get(r, "mandatory_docs") else ["PAN Card", "GSTIN Certificate", "UDYAM Certificate", "CA Audited Turnover Statement", "Make in India Declaration"],
            "boqItems": json.loads(r["boq_items"]) if r["boq_items"] else [],
            "selectedBidderId": _row_get(r, "selected_bidder_id", None),
            "createdBy": _row_get(r, "created_by", ""),
            "buyerEmail": _row_get(r, "buyer_email", ""),
            "buyerName": _row_get(r, "buyer_name", "Government Buyer"),
            "buyerOrg": _row_get(r, "buyer_org", r["ministry"]),
            "buyerId": _row_get(r, "buyer_id", None)
        })
    conn.close()
    return tenders

def get_tender_by_id(tender_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    p = _p()
    cursor.execute(f"SELECT * FROM tenders WHERE id = {p}", (tender_id,))
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
        "minTurnoverRequirement": _row_get(r, "min_turnover_requirement", "₹2.0 Cr"),
        "minExperienceYears": _row_get(r, "min_experience_years", 3),
        "mandatoryDocs": json.loads(_row_get(r, "mandatory_docs", "[]")) if _row_get(r, "mandatory_docs") else ["PAN Card", "GSTIN Certificate", "UDYAM Certificate", "CA Audited Turnover Statement", "Make in India Declaration"],
        "boqItems": json.loads(r["boq_items"]) if r["boq_items"] else [],
        "selectedBidderId": _row_get(r, "selected_bidder_id", None),
        "createdBy": _row_get(r, "created_by", ""),
        "buyerEmail": _row_get(r, "buyer_email", ""),
        "buyerName": _row_get(r, "buyer_name", "Government Buyer"),
        "buyerOrg": _row_get(r, "buyer_org", r["ministry"]),
        "buyerId": _row_get(r, "buyer_id", None)
    }

def create_tender(t: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    created_by = t.get("createdBy") or t.get("buyerEmail") or ""
    buyer_email = t.get("buyerEmail") or t.get("createdBy") or ""
    buyer_name = t.get("buyerName") or "Government Buyer"
    buyer_org = t.get("buyerOrg") or t.get("ministry") or ""
    buyer_id = str(t.get("buyerId") or "")

    if _USE_PG:
        cursor.execute("""
        INSERT INTO tenders (
            id, title, ministry, department, category, estimated_value,
            emd_amount, published_date, closing_date, status, mii_min_requirement,
            min_turnover_requirement, min_experience_years, mandatory_docs, boq_items,
            created_by, buyer_email, buyer_name, buyer_org, buyer_id, created_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            t["id"], t["title"], t["ministry"], t["department"], t["category"],
            t["estimatedValue"], t["emdAmount"], t["publishedDate"], t["closingDate"],
            t.get("status", "Active"), t["miiMinRequirement"],
            t.get("minTurnoverRequirement", "₹2.0 Cr"),
            t.get("minExperienceYears", 3),
            json.dumps(t.get("mandatoryDocs", ["PAN Card", "GSTIN Certificate", "UDYAM Certificate", "CA Audited Turnover Statement", "Make in India Declaration"])),
            json.dumps(t.get("boqItems", [])),
            created_by, buyer_email, buyer_name, buyer_org, buyer_id,
            datetime.now().isoformat()
        ))
    else:
        cursor.execute("""
        INSERT INTO tenders (
            id, title, ministry, department, category, estimated_value,
            emd_amount, published_date, closing_date, status, mii_min_requirement,
            min_turnover_requirement, min_experience_years, mandatory_docs, boq_items,
            created_by, buyer_email, buyer_name, buyer_org, buyer_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            t["id"], t["title"], t["ministry"], t["department"], t["category"],
            t["estimatedValue"], t["emdAmount"], t["publishedDate"], t["closingDate"],
            t.get("status", "Active"), t["miiMinRequirement"],
            t.get("minTurnoverRequirement", "₹2.0 Cr"),
            t.get("minExperienceYears", 3),
            json.dumps(t.get("mandatoryDocs", ["PAN Card", "GSTIN Certificate", "UDYAM Certificate", "CA Audited Turnover Statement", "Make in India Declaration"])),
            json.dumps(t.get("boqItems", [])),
            created_by, buyer_email, buyer_name, buyer_org, buyer_id,
            datetime.now().isoformat()
        ))
    conn.commit()
    conn.close()

    t["createdBy"] = created_by
    t["buyerEmail"] = buyer_email
    t["buyerName"] = buyer_name
    t["buyerOrg"] = buyer_org
    t["buyerId"] = buyer_id
    return t

def delete_tender(tender_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    p = _p()
    cursor.execute(f"DELETE FROM tenders WHERE id = {p}", (tender_id,))
    deleted = cursor.rowcount > 0
    # Also remove associated bids for this tender
    cursor.execute(f"DELETE FROM bids WHERE tender_id = {p}", (tender_id,))
    conn.commit()
    conn.close()
    return deleted

def get_all_contracts() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    if _USE_PG:
        cursor.execute("SELECT * FROM contracts ORDER BY _row_order DESC")
    else:
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
    p = _p()
    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
    cursor.execute(f"""
    UPDATE contracts SET
        crac_status = {p},
        crac_date = {p}
    WHERE id = {p}
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
    p = _p()
    ref = disbursement_ref or f"PFMS-TXN-{datetime.now().strftime('%Y-%m%d')}-{po_id[-4:]}"
    cursor.execute(f"""
    UPDATE contracts SET
        payment_status = {p},
        disbursement_ref = {p}
    WHERE id = {p}
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
    p = _p()
    cursor.execute(f"""
    INSERT INTO audit_logs (event_type, entity_id, user_agent, details, timestamp)
    VALUES ({p}, {p}, {p}, {p}, {p})
    """, (event_type, entity_id, user_agent, details, datetime.now().isoformat()))
    conn.commit()
    conn.close()

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Retrieve a user by email address (case-insensitive)."""
    conn = get_connection()
    cursor = conn.cursor()
    p = _p()
    cursor.execute(f"SELECT * FROM users WHERE LOWER(email) = LOWER({p})", (email.strip().lower(),))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)

def create_user(full_name: str, email: str, password_hash: str, organization: str, gstin: Optional[str], role: str) -> Dict[str, Any]:
    """Inserts a new user record supporting both PostgreSQL (Neon) and SQLite."""
    conn = get_connection()
    cursor = conn.cursor()
    created_at = datetime.now().isoformat()
    clean_email = email.strip().lower()

    if _USE_PG:
        cursor.execute("""
        INSERT INTO users (full_name, email, password_hash, organization, gstin, role, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id, full_name, email, organization, gstin, role, created_at
        """, (
            full_name, clean_email, password_hash, organization, gstin, role, created_at
        ))
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        return dict(row)
    else:
        cursor.execute("""
        INSERT INTO users (full_name, email, password_hash, organization, gstin, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            full_name, clean_email, password_hash, organization, gstin, role, created_at
        ))
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return {
            "id": user_id,
            "full_name": full_name,
            "email": clean_email,
            "organization": organization,
            "gstin": gstin,
            "role": role,
            "created_at": created_at
        }

def get_db_stats() -> Dict[str, int]:
    conn = get_connection()
    cursor = conn.cursor()
    stats = {}
    tables = ["bids", "tenders", "contracts", "vendors", "users", "cartel_reports", "audit_logs", "verifications", "passports", "passport_presentations"]
    for t in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) as count FROM {t}")
            row = cursor.fetchone()
            stats[t] = _count_result(row)
        except Exception:
            stats[t] = 0
    conn.close()
    return stats

# =========================================================================
# Compliance Passport CRUD Helpers
# =========================================================================

def get_vendor_by_id(vendor_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vendors WHERE id = ?", (vendor_id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        return None
    return {
        "id": r["id"],
        "name": r["name"],
        "gstin": r["gstin"],
        "pan": r["pan"],
        "udyamNo": r["udyam_no"],
        "category": r["category"],
        "miiClassification": r["mii_classification"],
        "complianceScore": r["compliance_score"],
        "riskTier": r["risk_tier"],
        "blacklisted": bool(r["blacklisted"]),
        "createdAt": r["created_at"]
    }


def create_verification(verification_id: str, vendor_id: int, doc_type: str, doc_ref: str,
                        status: str, verified_at: str = None, expires_at: str = None,
                        verification_method: str = "mock", details: str = "{}") -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    cursor.execute("""
    INSERT OR REPLACE INTO verifications (id, vendor_id, doc_type, doc_ref, status, verified_at, expires_at, verification_method, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (verification_id, vendor_id, doc_type, doc_ref, status, verified_at, expires_at, verification_method, details, now))
    conn.commit()
    conn.close()
    return {
        "id": verification_id, "vendorId": vendor_id, "docType": doc_type,
        "docRef": doc_ref, "status": status, "verifiedAt": verified_at,
        "expiresAt": expires_at, "verificationMethod": verification_method,
        "details": json.loads(details) if isinstance(details, str) else details,
        "createdAt": now
    }


def get_verifications_for_vendor(vendor_id: int) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM verifications WHERE vendor_id = ? ORDER BY created_at DESC", (vendor_id,))
    rows = cursor.fetchall()
    conn.close()
    results = []
    for r in rows:
        results.append({
            "id": r["id"], "vendorId": r["vendor_id"], "docType": r["doc_type"],
            "docRef": r["doc_ref"], "status": r["status"], "verifiedAt": r["verified_at"],
            "expiresAt": r["expires_at"], "verificationMethod": r["verification_method"],
            "details": json.loads(r["details"]) if r["details"] else {},
            "createdAt": r["created_at"]
        })
    return results


def create_passport(passport_id: str, vendor_id: int, issued_at: str, expires_at: str,
                    payload_hash: str, signature: str, signed_payload: str) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    # Revoke any existing active passport for this vendor
    cursor.execute("UPDATE passports SET status = 'superseded', revoked_at = ?, revocation_reason = 'Replaced by new passport' WHERE vendor_id = ? AND status = 'active'",
                   (now, vendor_id))
    cursor.execute("""
    INSERT INTO passports (id, vendor_id, issued_at, expires_at, status, payload_hash, signature, signed_payload, created_at)
    VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?)
    """, (passport_id, vendor_id, issued_at, expires_at, payload_hash, signature, signed_payload, now))
    conn.commit()
    conn.close()
    return {
        "id": passport_id, "vendorId": vendor_id, "issuedAt": issued_at,
        "expiresAt": expires_at, "status": "active", "payloadHash": payload_hash,
        "signature": signature, "signedPayload": signed_payload, "createdAt": now
    }


def get_passport(passport_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM passports WHERE id = ?", (passport_id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        return None
    return {
        "id": r["id"], "vendorId": r["vendor_id"], "issuedAt": r["issued_at"],
        "expiresAt": r["expires_at"], "status": r["status"], "payloadHash": r["payload_hash"],
        "signature": r["signature"], "signedPayload": r["signed_payload"],
        "revokedAt": r["revoked_at"], "revocationReason": r["revocation_reason"],
        "createdAt": r["created_at"]
    }


def get_passport_by_vendor(vendor_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM passports WHERE vendor_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1", (vendor_id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        return None
    return {
        "id": r["id"], "vendorId": r["vendor_id"], "issuedAt": r["issued_at"],
        "expiresAt": r["expires_at"], "status": r["status"], "payloadHash": r["payload_hash"],
        "signature": r["signature"], "signedPayload": r["signed_payload"],
        "revokedAt": r["revoked_at"], "revocationReason": r["revocation_reason"],
        "createdAt": r["created_at"]
    }


def revoke_passport(passport_id: str, reason: str = "Administrative revocation") -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    cursor.execute("UPDATE passports SET status = 'revoked', revoked_at = ?, revocation_reason = ? WHERE id = ? AND status = 'active'",
                   (now, reason, passport_id))
    conn.commit()
    conn.close()
    return get_passport(passport_id)


def log_passport_presentation(passport_id: str, bid_id: str = None, tender_id: str = None,
                               verification_result: str = "valid", verified_by: str = "system",
                               ip_address: str = None, details: str = "{}"):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    cursor.execute("""
    INSERT INTO passport_presentations (passport_id, bid_id, tender_id, presented_at, verification_result, verified_by, ip_address, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (passport_id, bid_id, tender_id, now, verification_result, verified_by, ip_address, details))
    conn.commit()
    conn.close()


def get_passport_presentations(passport_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM passport_presentations WHERE passport_id = ? ORDER BY presented_at DESC", (passport_id,))
    rows = cursor.fetchall()
    conn.close()
    results = []
    for r in rows:
        results.append({
            "id": r["id"], "passportId": r["passport_id"], "bidId": r["bid_id"],
            "tenderId": r["tender_id"], "presentedAt": r["presented_at"],
            "verificationResult": r["verification_result"], "verifiedBy": r["verified_by"],
            "ipAddress": r["ip_address"],
            "details": json.loads(r["details"]) if r["details"] else {}
        })
    return results


def get_all_passports() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM passports ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    results = []
    for r in rows:
        results.append({
            "id": r["id"], "vendorId": r["vendor_id"], "issuedAt": r["issued_at"],
            "expiresAt": r["expires_at"], "status": r["status"], "payloadHash": r["payload_hash"],
            "signature": r["signature"], "signedPayload": r["signed_payload"],
            "revokedAt": r["revoked_at"], "revocationReason": r["revocation_reason"],
            "createdAt": r["created_at"]
        })
    return results


# =========================================================================
# CLI Entry Point
# =========================================================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GeM AI Procurement Compliance - Database Manager")
    parser.add_argument("--init", action="store_true", help="Initialize tables and seeds if not already created")
    parser.add_argument("--reset", action="store_true", help="Drop and re-create all tables with fresh seeds")
    parser.add_argument("--stats", action="store_true", help="Display record counts for all database tables")
    args = parser.parse_args()

    print("=======================================================================")
    print("🏛️  GeM AI PROCUREMENT DATABASE MANAGER (SIH26100 - TEAM CODETOX)")
    if _USE_PG:
        print(f"[*] Database: PostgreSQL (Neon) — {DATABASE_URL[:40]}...")
    else:
        print(f"[*] Database file: {DB_PATH}")
    print("=======================================================================")

    if args.reset:
        print("[*] Resetting and re-seeding database from scratch...")
        reset_db()
        print("[✓] Database reset successfully!")
    else:
        print("[*] Initializing database...")
        init_db()
        print("[✓] Database initialized successfully!")

    stats = get_db_stats()
    print("\n📊 Database Summary:")
    print("--------------------------------------------------")
    for tbl, count in stats.items():
        print(f"  • {tbl.ljust(18)} : {count} records")
    print("--------------------------------------------------\n")
