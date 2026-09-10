# 🏛️ GeM — AI-Powered Procurement Compliance & Intelligence Platform

<p align="center">
  <img src="https://img.shields.io/badge/SIH%202026-Problem%20ID%3A%20SIH26100-0284c7?style=for-the-badge&logo=gov.uk" alt="SIH 2026" />
  <img src="https://img.shields.io/badge/Team-Codetox-f59e0b?style=for-the-badge" alt="Team Codetox" />
  <img src="https://img.shields.io/badge/Theme-Smart%20Automation-10b981?style=for-the-badge" alt="Smart Automation" />
  <img src="https://img.shields.io/badge/License-Government%20of%20India-0b1a2d?style=for-the-badge" alt="GoI" />
</p>

---

## 📌 Executive Summary

The **GeM AI Procurement Compliance Platform** is an end-to-end intelligent compliance, document verification, and anti-cartel vigilance system built for India's **Government e-Marketplace (GeM)** under **Smart India Hackathon 2026 (Problem Statement: SIH26100)**.

In conventional public procurement, reviewing bidder eligibility, CA financial turnover certificates, GST/PAN authenticity, Make-in-India declarations, and DPIIT regulations is a manual, labor-intensive, and error-prone process. Our platform automates the entire evaluation cycle using **OCR (Tesseract / EasyOCR)**, **NLP Rule Validators**, and **Graph Neural Networks for Cartel Detection**, cutting verification turnaround from days to under **4 seconds**.

---

## 👥 Team Codetox

- **Devika Patil**
- **Harshvardhan Sawale**
- **Aniket Sawarkar**
- **Krushnaprakash Bhende**
- **Sumit Deshmukh**
- **Namrata Pawar**

---

## 🚀 Key Implemented Modules & Architecture

### 1. 🏛️ Authentic GeM Multi-Tier Portal Interface
- **Primary GeM Navbar**: Integrated with search, role-based Login / Sign-Up modals, and multi-tier dropdowns for *Forward Auction*, *Bids (List of Bids, Railways, PBP Notices)*, *GRA / VA*.
- **Secondary Sub-Navbar Strip**: Features `☰ Categories` mega-menu, `Features & Benefits ▾` (red-accented), `Business Opportunities`, `Seller On GeM ▾`, `View Contracts ▾`, `CPPP ▾`, `💥 New on GeM`, and interactive `🔔 (03)` notification alerts.
- **Live Notification Marquee**: Real-time ticker broadcasting mandatory GFR 2017 advisory updates, DPIIT Make-in-India guidelines, and vigilance alerts.
- **Interactive Image Carousel**: High-resolution showcase highlighting national initiatives (*Make in India*, *Womaniya MSME*, *Startup Runway*).

---

### 2. 🔄 End-to-End Procurement Lifecycle (Tender Upload ➔ Payment)
A 6-stage autonomous procurement pipeline governing public procurement under **GFR 2017 Rule 149**:

```
[01. Tender Upload] ➔ [02. Bidder Submission & OCR] ➔ [03. AI Compliance Screening] ➔ [04. Financial Evaluation & RA] ➔ [05. Digital Contract & PO] ➔ [06. CRAC & 10-Day Payment]
```

1. **📝 01. Tender / Bid Upload**: Buyer defines technical specs, BOQ, and eligibility rules; publishes tender notice.
2. **📤 02. Bidder Submission & OCR Ingestion**: Sellers submit financial bids; CA certificates, GSTN, PAN, and UDYAM documents are ingested automatically.
3. **🤖 03. AI Compliance Screening**: OCR extracts text; NLP validates 200+ GFR 2017 & DPIIT parameters with instant risk scoring.
4. **⚖️ 04. Financial Evaluation & Reverse Auction (RA)**: Automated L1 price benchmarking, cartel anomaly checks, and dynamic RA bidding.
5. **📄 05. Digital Contract & PO Award**: Legally binding purchase orders issued instantly with DSC / e-Sign verification.
6. **💳 06. CRAC Inspection & 10-Day Payment**: Consignee Receipt and Acceptance Certificate (CRAC) triggers guaranteed digital payment within 10 days.

---

### 3. 🛍️ Popular Product Categories & AI Assistant
- **6 Studio Product Catalog Cards**: High-res isolated product showcases matching the official GeM portal:
  - *Oxygen Gas & Accessories*
  - *Medical Equipment & Supplies*
  - *SARAS Rural Artisan Handicrafts*
  - *Office Furniture & Ergonomics*
  - *Fire Safety & Protection Systems*
  - *Computers, Laptops & IT Hardware*
- **Floating "Ask GeMMy (Powered by AI)"**: One-click AI conversational assistant launching the Live Verification Sandbox.
- **Quick-Access Social Media Dock**: Persistent navigation for official government social handles.

---

### 4. 🌐 Tri-Language Internationalization (i18n)
Full dynamic multi-language switching across the entire portal:
- **English (EN)**
- **हिन्दी (Hindi - HI)**
- **मराठी (Marathi - MR)**

---

### 5. 🔍 Live AI Bid Verification Sandbox & Officer Dossier
- **Scenario Simulator**: Test compliant bids (96 score), flagged shortfall bids, and forged/suspicious bids (22 score).
- **OCR Engine Simulation**: Multi-file document upload parser extracting text from PAN cards, GST certificates, CA turnover sheets, and UDYAM registrations.
- **GFR & Policy Engine**: Automated evaluation of GFR Rule 144(xi), Rule 153, DPIIT Make-in-India local content %, and MSE purchase preferences.
- **Officer Audit Dossier**: Printable court-admissible audit sheet with immutable timestamps and manual officer override/approval controls.

---

### 6. 📊 AI Auction, Price Benchmarking & Cartel Detection
- **Graph-Based Neural Network**: Discovers hidden vendor collusions, shared digital signature certificates (DSC), identical IP subnets, and synchronized price clustering.
- **L1 to L7 Price Benchmarking**: Compares historical price baselines to identify predatory pricing or cartel inflation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend UI/UX** | React.js (v18), HTML5, CSS3 Design System, JavaScript (ES6+), Vite |
| **Backend API** | Python (v3.10+ / 3.14), FastAPI, Uvicorn, RESTful Endpoints |
| **Database** | SQLite 3 (Structured bid tables, tenders, contracts, audit trails) |
| **AI / ML & NLP** | OCR Forensics, GFR 2017 & DPIIT Rule Engine (200+ checks), Graph Cartel Detector |
| **Styling & Icons** | Custom Glassmorphism & Vanilla CSS, HSL Curated Color Palette, Lucide Icons |
| **Interactive API Docs** | Swagger UI (`/docs`) & ReDoc (`/redoc`) |
| **Code Quality & CI/CD** | Git, GitHub, ESLint, Python Automated Test Suite |
| **Cloud Deployment** | AWS / Azure Ready |

---

## 💻 Local Setup & Installation

### Prerequisites
- **Node.js** (v18.x or higher) & **npm**
- **Python** (v3.10 or higher)

### 1. Database Setup & Initialization

```bash
# Initialize SQLite database schema and seed initial mock records
python init_db.py

# Or reset & re-seed database from scratch at any time
python init_db.py --reset

# Check current record counts across all tables
python init_db.py --stats
```
*The database file is stored at `backend/gem_procure.db`. You can also inspect the full ANSI SQL DDL schema in [schema.sql](./schema.sql).*

### 2. Start the Backend API Server (FastAPI)

```bash
# Install Python backend dependencies
pip install -r backend/requirements.txt

# Start FastAPI server on http://127.0.0.1:8000
python run_backend.py
```
- **API Server**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc UI**: `http://127.0.0.1:8000/redoc`

### 3. Run Backend Automated Test Suite

```bash
python backend/test_api.py
```
*Validates 11 core checks across Database persistence, GFR 2017 Rule Engine, OCR document forensics, Anti-Cartel Graph Detector, CRAC inspection, and live HTTP endpoints.*

### 4. Start Frontend UI (Vite + React)

```bash
# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser and navigate to `http://localhost:5173/`.

### 5. Build Production Bundle

```bash
npm run build
```

---

---

## 🛂 Digital Compliance Passport (GeM Reusable Credential)

The **Digital Compliance Passport** solves a primary operational pain point on the Government e-Marketplace: sellers having to redundantly verify PAN, GSTIN, and UDYAM certificates every time they submit a tender application. 

With this module, sellers undergo statutory verification **once**, after which the system issues an **RSA-2048 digitally signed, tamper-evident digital credential** encoded into a verifiable QR code. This credential can be presented across unlimited public tenders without repeating OCR document uploads.

```
┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│ Seller Submits  │  ──>  │ Mock/Govt API Verify  │  ──>  │ RSA-2048 Signed      │
│ PAN, GST, Udyam │       │ NSDL, GSTN, MSME     │       │ Compliance Passport  │
└─────────────────┘       └──────────────────────┘       └──────────────────────┘
                                                                    │
                                                                    ▼
┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│ Instant Bid     │  <──  │ Signature Check,     │  <──  │ Present Passport ID  │
│ Qualification   │       │ Expiry & Revocation  │       │ or QR Code on Tender │
└─────────────────┘       └──────────────────────┘       └──────────────────────┘
```

### Key Capabilities
1. **Multi-Source Verification Engine**: Mock API stubs simulating **NSDL** (PAN format and legal entity checks), **GSTN** (state jurisdiction & active return checks), and **Udyam Registry** (micro/small/medium enterprise validation).
2. **Cryptographic Signing (RSA-2048 PSS + SHA-256)**: Each passport is signed on the backend using an RSA keypair. Any modification to the payload invalidates the signature immediately.
3. **Privacy-Preserving QR Generation**: Raw PAN and GSTIN numbers are **masked** (`27XXXX1234X1Z5`, `XXXCB1234X`) in the QR payload. Bids reference the unique Passport UUID for server-side cryptographic lookup.
4. **Presentation Audit Trail**: Every instance of a passport being presented for a tender is logged immutably in `passport_presentations` with timestamp, bid ID, ip address, and verification verdict.
5. **Instant Revocation & TTL Management**: Procuring authorities can revoke non-compliant passports in $O(1)$ time with documented justification. Passports enforce a 12-month time-to-live (TTL) tied to underlying certificate validity.

---

## 📡 Backend API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and database connectivity |
| `GET` | `/api/bids` | List all bids with filters (`status`, `category`, `search`) |
| `GET` | `/api/bids/{bid_id}` | Detailed compliance dossier and immutable audit trail |
| `POST` | `/api/bids` | Ingest or upsert a bid into the database |
| `PATCH` | `/api/bids/{bid_id}/status` | Procurement Officer manual override with audit logging |
| `POST` | `/api/verify/bid` | AI compliance screening against 200+ GFR 2017 & DPIIT rules |
| `POST` | `/api/verify/upload` | Document upload & OCR tampering forensic analysis |
| `GET` | `/api/auction/analysis` | L1-L4 price benchmarking & graph-based cartel ring detection |
| `POST` | `/api/auction/reverse-auction/round` | Dynamic Reverse Auction (RA) bidding simulation |
| `GET` | `/api/tenders` | List published public procurement tenders with BOQ specs |
| `GET` | `/api/contracts` | List awarded purchase orders, CRAC status, and payments |
| `PATCH` | `/api/contracts/{id}/crac` | Consignee Receipt and Acceptance Certificate (CRAC) inspection |
| `PATCH` | `/api/contracts/{id}/payment` | 10-day guaranteed digital payment settlement |
| `GET` | `/api/stats/overview` | Platform KPI metrics and compliance breakdown |
| `POST` | `/api/auth/login` | SSO login for Officers, Buyers, and Sellers |
| `POST` | `/api/auth/register` | User and vendor registration |
| `GET` | `/api/vendors` | Master directory of registered vendors with passport status |
| `GET` | `/api/vendors/{id}` | Complete vendor dossier with verified documents and passport |
| `POST` | `/api/vendors/{id}/verify-documents` | Submit PAN, GSTIN, UDYAM for automated verification |
| `POST` | `/api/vendors/{id}/passport/issue` | Generate, RSA-sign, and issue reusable Compliance Passport |
| `GET` | `/api/passport/{id}` | Retrieve signed passport credential and metadata |
| `POST` | `/api/passport/{id}/verify` | Rate-limited signature, expiry, and revocation validation |
| `POST` | `/api/passport/{id}/revoke` | Administrative revocation with statutory audit log |
| `GET` | `/api/passport/{id}/qrcode` | Stream high-density PNG QR code containing signed payload |
| `GET` | `/api/passport/{id}/presentations` | Audit trail of all tenders where the passport was presented |
| `GET` | `/api/passport/public-key` | Export PEM public key for offline / third-party verification |


---

## 📋 Research & Policy Citations

1. **General Financial Rules (GFR) 2017**: Rules 144, 149, 153, and 161 governing public procurement for Central & State Government entities.
2. **DPIIT Public Procurement Order**: Make in India (Preference to Make in India) Order for Class-I (≥ 50%) and Class-II (≥ 20%) suppliers.
3. **Public Procurement Policy for Micro and Small Enterprises (MSEs) Order, 2012**.
4. *An Automated Approach to Contractual Compliance Analysis in Public Bidding Contracts* — Correia & Dornelles, 2026.
5. *Dataset and Baseline Implementation for Retrieval-Augmented Procurement Validation* — Skadiņš et al., 2026.

---

## 📜 License & Acknowledgments

Developed by **Team Codetox** for **Smart India Hackathon (SIH) 2026**.  
*Ministry of Commerce and Industry, Government of India.*
