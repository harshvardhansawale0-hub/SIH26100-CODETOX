-- ============================================================================
-- GeM AI Procurement Compliance & Intelligence Platform Database Schema
-- Smart India Hackathon 2026 (Problem Statement ID: SIH26100) - Team Codetox
-- Target Database: SQLite 3 / PostgreSQL / MySQL ANSI Compliant
-- ============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ----------------------------------------------------------------------------
-- 1. USERS & IDENTITY TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    organization TEXT NOT NULL,
    gstin TEXT,
    role TEXT NOT NULL DEFAULT 'seller', -- 'buyer', 'seller', 'officer', 'admin'
    is_demo BOOLEAN NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ----------------------------------------------------------------------------
-- 2. TENDERS & BOQ REQUIREMENTS TABLE
-- ----------------------------------------------------------------------------
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
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Under Evaluation', 'Awarded', 'Closed'
    mii_min_requirement TEXT NOT NULL DEFAULT '50% (Class-I)',
    boq_items TEXT NOT NULL DEFAULT '[]', -- JSON array of line items with qty and unit
    created_by TEXT DEFAULT '',
    buyer_email TEXT DEFAULT '',
    buyer_name TEXT DEFAULT '',
    buyer_org TEXT DEFAULT '',
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_category ON tenders(category);
CREATE INDEX IF NOT EXISTS idx_tenders_closing_date ON tenders(closing_date);

-- ----------------------------------------------------------------------------
-- 3. BIDS & COMPLIANCE DOSSIER TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bids (
    id TEXT PRIMARY KEY,
    vendor TEXT NOT NULL,
    category TEXT NOT NULL,
    item TEXT NOT NULL,
    tender_id TEXT NOT NULL,
    tender_value TEXT NOT NULL,
    bid_amount TEXT NOT NULL,
    status TEXT NOT NULL, -- 'Compliant', 'Flagged', 'Rejected'
    score INTEGER NOT NULL, -- 0 to 100
    mii_content TEXT NOT NULL,
    turnover TEXT NOT NULL,
    experience TEXT NOT NULL,
    gst_status TEXT NOT NULL,
    pan_status TEXT NOT NULL,
    msme_status TEXT NOT NULL,
    date TEXT NOT NULL,
    risk_level TEXT NOT NULL, -- 'Low Risk', 'Medium Risk', 'Critical High Risk'
    ocr_confidence TEXT NOT NULL,
    flags TEXT NOT NULL DEFAULT '[]', -- JSON array of warning/violation strings
    extracted_docs TEXT NOT NULL DEFAULT '[]', -- JSON array of document verification objects
    audit_trail TEXT NOT NULL DEFAULT '[]', -- JSON array of timestamped verification actions
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_category ON bids(category);
CREATE INDEX IF NOT EXISTS idx_bids_tender ON bids(tender_id);
CREATE INDEX IF NOT EXISTS idx_bids_vendor ON bids(vendor);
CREATE INDEX IF NOT EXISTS idx_bids_score ON bids(score);

-- ----------------------------------------------------------------------------
-- 4. CONTRACTS & PURCHASE ORDERS TABLE (GFR Stage 5 & 6)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    tender_id TEXT NOT NULL,
    bid_id TEXT NOT NULL,
    vendor TEXT NOT NULL,
    buyer_org TEXT NOT NULL,
    contract_value TEXT NOT NULL,
    po_date TEXT NOT NULL,
    dsc_signed BOOLEAN NOT NULL DEFAULT 1,
    crac_status TEXT NOT NULL DEFAULT 'Pending Inspection', -- 'Pending Inspection', 'Approved', 'Rejected'
    crac_date TEXT,
    payment_status TEXT NOT NULL DEFAULT 'Processing (Day 4/10)', -- 'Processing (Day 4/10)', 'Settled (100%)', 'Withheld'
    payment_due_date TEXT NOT NULL,
    disbursement_ref TEXT,
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
    FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_contracts_tender ON contracts(tender_id);
CREATE INDEX IF NOT EXISTS idx_contracts_bid ON contracts(bid_id);
CREATE INDEX IF NOT EXISTS idx_contracts_vendor ON contracts(vendor);
CREATE INDEX IF NOT EXISTS idx_contracts_crac_status ON contracts(crac_status);

-- ----------------------------------------------------------------------------
-- 5. CARTEL & COLLUSION VIGILANCE REPORTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cartel_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tender_id TEXT NOT NULL,
    severity TEXT NOT NULL, -- 'CRITICAL', 'WARNING', 'INFO'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    flagged_vendors TEXT NOT NULL DEFAULT '[]', -- JSON array
    detected_at TEXT NOT NULL,
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cartel_tender ON cartel_reports(tender_id);
CREATE INDEX IF NOT EXISTS idx_cartel_severity ON cartel_reports(severity);

-- ----------------------------------------------------------------------------
-- 6. MASTER VENDORS DIRECTORY TABLE
-- ----------------------------------------------------------------------------
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
);

CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);
CREATE INDEX IF NOT EXISTS idx_vendors_gstin ON vendors(gstin);
CREATE INDEX IF NOT EXISTS idx_vendors_risk_tier ON vendors(risk_tier);
CREATE INDEX IF NOT EXISTS idx_vendors_blacklisted ON vendors(blacklisted);

-- ----------------------------------------------------------------------------
-- 7. SYSTEM & OFFICER AUDIT LOGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL, -- 'BID_INGESTED', 'STATUS_OVERRIDE', 'CRAC_VERIFIED', 'CARTEL_FLAGGED'
    entity_id TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);

-- ============================================================================
-- SEED INITIAL MOCK & BENCHMARK DATA
-- ============================================================================

-- Users
INSERT OR IGNORE INTO users (id, full_name, email, password_hash, organization, gstin, role, is_demo, created_at) VALUES
(1, 'Nodal Procurement Officer', 'officer@gem.gov.in', 'officer123', 'GeM Quality & Vigilance Cell', '07GOVND0001A1Z1', 'officer', 1, '2026-09-01T09:00:00'),
(2, 'Buyer Desk Officer', 'buyer@drdo.gov.in', 'buyer123', 'DRDO Research Labs, Ministry of Defence', '07DRDO1234F1Z8', 'buyer', 1, '2026-09-01T09:00:00'),
(3, 'Apex Supplies Vendor', 'contact@apexsupplies.in', 'seller123', 'Apex Supplies Ltd.', '27AABCB1234F1Z5', 'seller', 1, '2026-09-01T09:00:00'),
(4, 'Kaveri Infotech Manager', 'contact@kaveri.in', 'seller123', 'Kaveri Infotech', '27KAVRI5678B1Z2', 'seller', 1, '2026-09-01T09:00:00');

-- Tenders
INSERT OR IGNORE INTO tenders (id, title, ministry, department, category, estimated_value, emd_amount, published_date, closing_date, status, mii_min_requirement, boq_items, created_at) VALUES
('GEM/2026/B/891244', 'Procurement of High-Performance AI Workstations & SAN Storage', 'Ministry of Defence', 'Defence Research & Development Organisation (DRDO)', 'IT Hardware', '₹1.45 Cr', '₹2.90 Lakhs (MSE Exempted)', '01 Sep 2026', '15 Sep 2026', 'Under Evaluation', '50% (Class-I)', '[{"item": "AI Workstations (RTX 6000 Ada, 128GB RAM)", "qty": 250, "unit": "Nos"}, {"item": "All-Flash SAN Storage 500TB", "qty": 2, "unit": "Units"}]', '2026-09-01T10:00:00'),
('GEM/2026/B/890412', 'Ergonomic Modular Office Workstations & Executive Mesh Chairs', 'Ministry of Railways', 'Northern Railway Headquarter, New Delhi', 'Furniture', '₹42.0 Lakhs', '₹84,000 (MSE Exempted)', '02 Sep 2026', '12 Sep 2026', 'Under Evaluation', '50% (Class-I)', '[{"item": "Modular 4-Seater Linear Workstations", "qty": 50, "unit": "Sets"}, {"item": "Ergonomic High-Back Chairs", "qty": 200, "unit": "Nos"}]', '2026-09-02T11:30:00'),
('GEM/2026/B/889105', 'Cloud-Based GIS Spatial Mapping & Urban Analytics Platform', 'Ministry of Housing and Urban Affairs', 'Smart Cities Mission Directorate', 'Software', '₹2.10 Cr', '₹4.20 Lakhs', '28 Aug 2026', '18 Sep 2026', 'Active', '50% (Class-I)', '[{"item": "Enterprise GIS Web Platform License (3 Years)", "qty": 1, "unit": "License"}, {"item": "Cloud Hosting & AI Analytics Module", "qty": 1, "unit": "Suite"}]', '2026-08-28T14:00:00'),
('GEM/2026/B/882100', 'Hospital Intensive Care Medical Grade Oxygen Cylinders & Regulators', 'Ministry of Health and Family Welfare', 'All India Institute of Medical Sciences (AIIMS)', 'Medical Equipment', '₹85.0 Lakhs', '₹1.70 Lakhs', '03 Sep 2026', '19 Sep 2026', 'Active', '50% (Class-I)', '[{"item": "D-Type High Pressure Medical Oxygen Cylinders (46.7L)", "qty": 400, "unit": "Units"}, {"item": "Digital Pressure Regulators & Flowmeters", "qty": 400, "unit": "Units"}]', '2026-09-03T09:15:00');

-- Vendors
INSERT OR IGNORE INTO vendors (id, name, gstin, pan, udyam_no, category, mii_classification, compliance_score, risk_tier, blacklisted, created_at) VALUES
(1, 'Apex Supplies Ltd.', '27AABCB1234F1Z5', 'AABCB1234F', 'UDYAM-MH-03-0019284', 'IT Hardware', 'Class-I Local Supplier (68%)', 96, 'Low Risk', 0, '2026-09-01T10:00:00'),
(2, 'Kaveri Infotech', '27KAVRI5678B1Z2', 'KAVRI5678B', 'UDYAM-MH-03-0044192', 'IT Hardware', 'Class-I Local Supplier (72%)', 94, 'Low Risk', 0, '2026-09-01T10:00:00'),
(3, 'TechForce Pvt Ltd', '07TFPL9912C1Z4', 'TFPL9912C', 'UDYAM-DL-02-0048123', 'Software', 'Class-I Local Supplier (85%)', 91, 'Low Risk', 0, '2026-09-01T10:00:00'),
(4, 'Balaji Enterprises', '27BLEP4411D1Z8', 'BLEP4411D', 'UDYAM-MH-03-0099812', 'Furniture', 'Class-II Local Supplier (42%)', 61, 'Medium Risk', 0, '2026-09-01T10:00:00'),
(5, 'Shree Ganesh Networks', '27SGNT8823E1Z9', 'SGNT8823E', 'UDYAM-MH-03-0071234', 'IT Hardware', 'Class-II Local Supplier (50%)', 54, 'Medium Risk (Cartel Alert)', 0, '2026-09-01T10:00:00'),
(6, 'UniVend Solutions', '06UNIV0000Z1Z0', 'ABCDE1234F', 'UDYAM-HR-00-INVALID', 'Stationery', 'Non-Compliant (<20%)', 22, 'Critical High Risk', 1, '2026-09-01T10:00:00');

-- Bids
INSERT OR IGNORE INTO bids (id, vendor, category, item, tender_id, tender_value, bid_amount, status, score, mii_content, turnover, experience, gst_status, pan_status, msme_status, date, risk_level, ocr_confidence, flags, extracted_docs, audit_trail) VALUES
('BID-20495', 'Apex Supplies Ltd.', 'IT Hardware', 'High-Performance Workstations (Qty: 250)', 'GEM/2026/B/891244', '₹1.45 Cr', '₹1.38 Cr', 'Compliant', 96, '68% (Class-I Local)', '₹12.4 Cr (Req: ₹5 Cr)', '5 Years (Req: 3 Yrs)', 'Active & 3B Filed', 'Verified', 'Medium Enterprise (UDYAM verified)', '06 Sep 2026, 11:20 AM', 'Low Risk', '99.4%', '[]', '[{"name": "GST_Certificate_2026.pdf", "status": "Verified", "score": 100}, {"name": "CA_Turnover_Audited_FY25.pdf", "status": "Verified", "score": 98}, {"name": "Make_In_India_Declaration.pdf", "status": "Verified (68%)", "score": 95}, {"name": "OEM_Authorization_Form.pdf", "status": "Verified", "score": 96}]', '[{"timestamp": "06 Sep 2026, 11:20:04", "action": "Bid Ingestion via GeM API", "agent": "System (Webhook)"}, {"timestamp": "06 Sep 2026, 11:20:06", "action": "OCR & Document Parsing Complete", "agent": "EasyOCR / Tesseract Engine"}, {"timestamp": "06 Sep 2026, 11:20:07", "action": "GFR 2017 & MII Rule Engine Checked (210 Rules)", "agent": "NLP Rule Validator"}, {"timestamp": "06 Sep 2026, 11:20:08", "action": "Scored 96/100 -> Auto Approved", "agent": "GeM ML Model v4.2"}]'),
('BID-20494', 'Balaji Enterprises', 'Furniture', 'Modular Office Workstations & Chairs', 'GEM/2026/B/890412', '₹42.0 Lakhs', '₹38.5 Lakhs', 'Flagged', 61, '42% (Class-II Local)', '₹1.8 Cr (Req: ₹2 Cr - Shortfall)', '3 Years (Req: 3 Yrs)', 'Active', 'Verified', 'Micro (UDYAM mismatch)', '06 Sep 2026, 10:45 AM', 'Medium Risk', '94.2%', '["Annual turnover falls short by ₹20 Lakhs against tender mandatory criteria (Rule GFR 173).", "UDYAM registration date does not match GST registration date by 14 months.", "Local Content Undertaking lacks CA countersignature."]', '[{"name": "GST_Reg_06A.pdf", "status": "Verified", "score": 95}, {"name": "Turnover_Statement.pdf", "status": "Discrepancy (Turnover < Limit)", "score": 55}, {"name": "MII_Undertaking_Self.pdf", "status": "Missing CA Seal", "score": 45}, {"name": "Experience_Certificates.pdf", "status": "Verified", "score": 90}]', '[{"timestamp": "06 Sep 2026, 10:45:12", "action": "Bid Ingested", "agent": "System"}, {"timestamp": "06 Sep 2026, 10:45:15", "action": "OCR Text Extracted with 94.2% confidence", "agent": "OCR Engine"}, {"timestamp": "06 Sep 2026, 10:45:16", "action": "Flagged: Rule #173 (Turnover Shortfall) & Rule #84 (CA Seal missing)", "agent": "Rule Engine"}, {"timestamp": "06 Sep 2026, 10:45:17", "action": "Compliance Score: 61/100 -> Routed to Officer Review", "agent": "ML Scorer"}]'),
('BID-20493', 'TechForce Pvt Ltd', 'Software', 'Cloud-Based GIS Mapping & Analytics Tool', 'GEM/2026/B/889105', '₹2.10 Cr', '₹1.95 Cr', 'Compliant', 91, '85% (Class-I Local)', '₹18.9 Cr (Req: ₹8 Cr)', '6 Years (Req: 4 Yrs)', 'Active & All Clear', 'Verified', 'Small Enterprise', '06 Sep 2026, 09:30 AM', 'Low Risk', '98.9%', '[]', '[{"name": "GST_3B_Last6Months.pdf", "status": "Verified", "score": 100}, {"name": "Audited_Balance_Sheet.pdf", "status": "Verified", "score": 96}, {"name": "Class_I_MII_Cert.pdf", "status": "Verified (85%)", "score": 98}, {"name": "CMMI_Level_3_Certificate.pdf", "status": "Verified", "score": 90}]', '[{"timestamp": "06 Sep 2026, 09:30:02", "action": "Bid Received", "agent": "GeM Gateway"}, {"timestamp": "06 Sep 2026, 09:30:05", "action": "Automated Document Validation Successful", "agent": "OCR + NLP Engine"}, {"timestamp": "06 Sep 2026, 09:30:06", "action": "Score 91/100 -> Compliance Verified", "agent": "GeM Engine"}]'),
('BID-20492', 'UniVend Solutions', 'Stationery', 'Executive Diaries, Pens & Desk Items (Bulk)', 'GEM/2026/B/887990', '₹18.5 Lakhs', '₹14.2 Lakhs', 'Rejected', 22, '15% (Non-compliant < 20%)', '₹15 Lakhs (Req: ₹50 Lakhs)', '1 Year (Req: 2 Yrs)', 'Cancelled / Tax Defaulter Notice', 'PAN/GST Name Mismatch', 'Invalid Certificate Number', '06 Sep 2026, 08:15 AM', 'Critical High Risk', '81.0%', '["CRITICAL: GSTIN status on GST Portal returned CANCELLED / SUSPENDED.", "Severe discrepancy: Name on PAN card does not match bidder entity registered on GeM.", "Local content declaration is 15%, below mandatory minimum 20% DPIIT threshold for this category.", "Turnover certificate font analysis indicates potential document tampering / altered figures."]', '[{"name": "GST_Certificate.pdf", "status": "Tampering Alert", "score": 15}, {"name": "PAN_Copy.pdf", "status": "Entity Mismatch", "score": 20}, {"name": "Turnover_Cert.pdf", "status": "Font Inconsistency Detected", "score": 18}]', '[{"timestamp": "06 Sep 2026, 08:15:01", "action": "Bid Ingested", "agent": "System"}, {"timestamp": "06 Sep 2026, 08:15:03", "action": "OpenCV Document Forensics: Detected font irregularity on turnover figures", "agent": "OpenCV Document Forensics"}, {"timestamp": "06 Sep 2026, 08:15:04", "action": "External GST API: Status CANCELLED", "agent": "GSTIN Verification API"}, {"timestamp": "06 Sep 2026, 08:15:05", "action": "Score 22/100 -> AUTO-REJECTED & Added to Vigilance Watchlist", "agent": "Rule Engine"}]'),
('BID-20491', 'Kaveri Infotech', 'IT Hardware', 'Rack Servers & SAN Storage Solution', 'GEM/2026/B/891244', '₹1.45 Cr', '₹1.42 Cr', 'Compliant', 94, '72% (Class-I Local)', '₹15.2 Cr (Req: ₹5 Cr)', '7 Years (Req: 3 Yrs)', 'Active', 'Verified', 'Medium Enterprise', '05 Sep 2026, 04:10 PM', 'Low Risk', '99.1%', '[]', '[{"name": "GST_3B.pdf", "status": "Verified", "score": 100}, {"name": "CA_Turnover.pdf", "status": "Verified", "score": 96}]', '[{"timestamp": "05 Sep 2026, 04:10:00", "action": "Bid Ingested & Approved", "agent": "GeM Engine"}]'),
('BID-20490', 'Shree Ganesh Networks', 'IT Hardware', 'Rack Servers & Networking Switches', 'GEM/2026/B/891244', '₹1.45 Cr', '₹1.44 Cr', 'Flagged', 54, '50% (Class-II Local)', '₹5.1 Cr (Req: ₹5 Cr)', '3 Years (Req: 3 Yrs)', 'Active', 'Verified', 'Small Enterprise', '05 Sep 2026, 02:40 PM', 'Medium Risk (Cartel Alert)', '95.0%', '["Collusion Alert: Bid price is within 0.7% variance of Kaveri Infotech & Apex Supplies (Price Clustering Detected).", "IP Address check: Bid submitted from same subnet / 192.168.4.x as Kaveri Infotech.", "Digital Signature (DSC) issuer linked to common authorised signatory."]', '[{"name": "GST_Certificate.pdf", "status": "Verified", "score": 92}, {"name": "Turnover_Doc.pdf", "status": "Verified", "score": 90}]', '[{"timestamp": "05 Sep 2026, 02:40:11", "action": "Price Rigging Analysis: Pattern Matched with Cluster #4", "agent": "Graph Cartel Detector"}, {"timestamp": "05 Sep 2026, 02:40:12", "action": "Score 54/100 -> Flagged for Anti-Cartel Investigation", "agent": "ML Scorer"}]');

-- Contracts
INSERT OR IGNORE INTO contracts (id, tender_id, bid_id, vendor, buyer_org, contract_value, po_date, dsc_signed, crac_status, crac_date, payment_status, payment_due_date, disbursement_ref) VALUES
('PO-GEM-2026-9901', 'GEM/2026/B/891244', 'BID-20495', 'Apex Supplies Ltd.', 'DRDO Research Labs, Min of Defence', '₹1.38 Cr', '06 Sep 2026', 1, 'Approved', '06 Sep 2026, 03:30 PM', 'Processing (Day 4/10)', '16 Sep 2026', 'PFMS-TXN-2026-0906-8812'),
('PO-GEM-2026-9874', 'GEM/2026/B/889105', 'BID-20493', 'TechForce Pvt Ltd', 'Smart Cities Mission Directorate', '₹1.95 Cr', '04 Sep 2026', 1, 'Approved', '05 Sep 2026, 11:00 AM', 'Settled (100%)', '14 Sep 2026', 'PFMS-TXN-2026-0905-1102');

-- Cartel Reports
INSERT OR IGNORE INTO cartel_reports (id, tender_id, severity, title, description, flagged_vendors, detected_at) VALUES
(1, 'GEM/2026/B/891244', 'CRITICAL', 'Shared IP Subnet & Digital Signature Collusion', 'Bidders Kaveri Infotech and Shree Ganesh Networks submitted bids within 4 minutes from identical IP subnet 192.168.4.x with shared DSC Signatory X and identical BOQ markup formulas.', '["Kaveri Infotech", "Shree Ganesh Networks"]', '06 Sep 2026, 02:45 PM'),
(2, 'GEM/2026/B/891244', 'WARNING', 'Artificial Price Clustering (Variance: 1.4%)', 'L2 and L3 bids are synchronized with fixed margin offsets against estimated tender baseline to ensure rotation without true price competition.', '["Kaveri Infotech", "Shree Ganesh Networks"]', '06 Sep 2026, 02:46 PM');
