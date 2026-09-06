# AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement

**Smart India Hackathon 2026**

| | |
|---|---|
| **Problem Statement ID** | SIH26100 |
| **Theme** | Smart Automation |
| **PS Category** | Software |
| **Team Name** | Codetox |

## Team Members

- Devika Patil
- Harshvardhan Sawale
- Aniket Sawarkar
- Krushnaprakash Bhende
- Sumit Deshmukh
- Namrata Pawar

## Problem Statement

Verifying bidder compliance for GeM (Government e-Marketplace) tenders is currently a manual, time-consuming, and error-prone process. Procurement officers must cross-check numerous bidder documents against tender eligibility requirements, making it difficult to consistently detect missing information, discrepancies, or non-compliant bids.

## Proposed Solution

An AI-driven platform that automatically:
- **Extracts** data from bidder documents (using OCR/NLP)
- **Validates** documents against GeM tender requirements
- **Cross-verifies** submitted information for consistency
- **Scores** bids based on compliance and risk
- **Detects** discrepancies and missing/non-compliant documents
- **Generates** transparent, auditable compliance reports for procurement officers

### Bidder User Journey (Integrated Flow)

1. Access e-Procurement Portal → Search Tenders & Read Requirements
2. Prepare Bid Documents → Navigate to Bid Submission Panel
3. Upload Mandatory Bid Documents
4. Receive Preliminary Compliance Feedback (AI-generated)
5. Missing/Non-compliant Documents Detected → Correct or Obtain Missing Documents
6. Score & Generate Report
7. Confirm Final Bid Submission → Receive Final Submission Confirmation
8. Await Evaluation Results

### Platform Lifecycle

**Tender Initiation** → **Document Submission & Processing** (Bidder Document Upload, OCR + AI Document Processing, Data & Eligibility Extraction, Cross-Verification) → **Cross-Verification & Compliance** (Rule-Based Compliance Engine, AI Risk & Compliance Scoring, Discrepancy/Missing Document Detection) → **Analysis & Dashboard** (Officer Dashboard: Risk Scoring, Discrepancy Detection) → **Reporting & Finalization** (Final Compliance Report)

## Technical Approach

| Layer | Technologies |
|---|---|
| **Frontend** | React.js, HTML5, CSS, JavaScript |
| **Backend** | Python, FastAPI |
| **Database** | SQL / MySQL |
| **AI/ML** | OCR (Tesseract / EasyOCR), NLP/LLM, Pandas, OpenCV |
| **Integration** | REST APIs |
| **Deployment** | AWS / Azure (cloud); no special hardware required — a standard computer with internet access is sufficient |
| **Code Quality & Security** | Git / GitHub |

## Feasibility and Viability

**Feasibility:**
- Uses existing, proven AI, OCR, and database technologies
- Can automate document verification and compliance scoring
- Easily scalable through cloud-based web architecture

**Challenges:**
- Inaccurate or incomplete document data
- Integration with government verification portals

**Mitigations:**
- Combine AI validation with human review
- Develop secure APIs and modular integrations

## Impact and Benefits

**Potential Impact:**
- Significantly reduces time required for bid verification and evaluation
- Minimizes human errors while checking multiple bidder documents
- Improves transparency, accuracy, and consistency in procurement decisions
- Helps procurement officers quickly identify non-compliant or suspicious bids

**Benefits:**
- **Economic:** Saves administrative costs and reduces manual workload
- **Social:** Ensures fair, transparent, and consistent bidder evaluation
- **Environmental:** Reduces paper usage through digital document processing

## Research and References

1. An Automated Approach to Contractual Compliance Analysis in Public Bidding Contracts — Correia & Dornelles, 2026
2. Dataset and Baseline Implementation for Retrieval-Augmented Procurement Validation — Skadiņš et al., 2026
3. Inherent Risks Identification in a Contract Document through Automated Rule Generation — Kim et al., 2025
4. An Automated Framework for Detection and Resolution of Cross References in Legal Texts — Sannier et al., 2017
