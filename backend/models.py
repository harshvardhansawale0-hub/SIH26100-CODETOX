import re
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

# ==========================================
# 1. Verification & Input Schemas
# ==========================================

class BidVerifyRequest(BaseModel):
    vendorName: str = Field(..., example="Apex Supplies Ltd.")
    category: str = Field(default="IT Hardware", example="IT Hardware")
    tenderId: str = Field(..., example="GEM/2026/B/891244")
    
    @field_validator('tenderId')
    @classmethod
    def validate_tender_id(cls, v):
        if not re.match(r'^GEM/[0-9]{4}/[A-Z]/[0-9]{6}$', v):
            raise ValueError('Invalid Tender ID format. Expected GEM/YYYY/X/NNNNNN, e.g. GEM/2026/B/891244.')
        return v
        
    tenderValue: str = Field(default="₹1.45 Cr", example="₹1.45 Cr")
    bidAmount: str = Field(default="₹1.38 Cr", example="₹1.38 Cr")
    gstin: str = Field(..., example="27AABCB1234F1Z5")
    
    @field_validator('gstin')
    @classmethod
    def validate_gstin(cls, v):
        if not re.match(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$', v):
            raise ValueError('Invalid GSTIN format. Enter a valid 15-character GSTIN.')
        return v
        
    pan: str = Field(..., example="AABCB1234F")
    
    @field_validator('pan')
    @classmethod
    def validate_pan(cls, v):
        if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]$', v):
            raise ValueError('Invalid PAN format. Expected 5 letters, 4 digits, and 1 letter (e.g. ABCDE1234F).')
        return v
    miiDeclared: str = Field(default="68%", example="68%")
    turnoverClaim: str = Field(default="₹12.4 Cr", example="₹12.4 Cr")
    experienceClaim: str = Field(default="5 Years", example="5 Years")
    msmeRegNo: str = Field(default="UDYAM-MH-03-0019284", example="UDYAM-MH-03-0019284")
    ipAddress: Optional[str] = Field(default="49.204.12.8", example="49.204.12.8")
    dscSerial: Optional[str] = Field(default="DSC-2026-APEX-001", example="DSC-2026-APEX-001")
    fileId: Optional[str] = Field(default=None, description="UUID of the uploaded document to process")


class RuleCheckResult(BaseModel):
    ruleId: str
    name: str
    category: str  # e.g. "GFR 2017", "DPIIT", "Statutory Compliance", "MSE Policy"
    passed: bool
    details: str
    penaltyPoints: int = 0


class ExtractedDoc(BaseModel):
    name: str
    status: str
    score: int
    details: Optional[str] = None


class AuditTrailEntry(BaseModel):
    timestamp: str
    action: str
    agent: str


class BidVerifyResponse(BaseModel):
    bidId: str
    vendor: str
    category: str
    tenderId: str
    tenderValue: str
    bidAmount: str
    score: int
    status: str  # "Compliant", "Flagged", "Rejected"
    risk: str    # "Low Risk", "Medium Risk", "Critical High Risk"
    flags: List[str] = []
    miiVerified: str
    ocrConfidence: str
    gstVerified: str
    panVerified: str
    rulesTested: int
    rulesPassed: int
    ruleBreakdown: List[RuleCheckResult] = []
    extractedDocs: List[ExtractedDoc] = []
    auditTrail: List[AuditTrailEntry] = []


# ==========================================
# 2. Bid Entity & Management Schemas
# ==========================================

class BidItem(BaseModel):
    id: str
    vendor: str
    category: str
    item: str
    tenderId: str
    tenderValue: str
    bidAmount: str
    status: str
    score: int
    miiContent: str
    turnover: str
    experience: str
    gstStatus: str
    panStatus: str
    msmeStatus: str
    date: str
    riskLevel: str
    ocrConfidence: str
    flags: List[str] = []
    extractedDocs: List[ExtractedDoc] = []
    auditTrail: List[AuditTrailEntry] = []


class BidStatusUpdate(BaseModel):
    status: str
    officerNotes: Optional[str] = None
    officerName: Optional[str] = "Nodal Procurement Officer (GeM)"


# ==========================================
# 3. Tenders & BOQ Schemas
# ==========================================

class BoqItem(BaseModel):
    item: str
    qty: int
    unit: str


class TenderItem(BaseModel):
    id: str
    title: str
    ministry: str
    department: str
    category: str
    estimatedValue: str
    emdAmount: str
    publishedDate: str
    closingDate: str
    status: str
    miiMinRequirement: str
    boqItems: List[BoqItem] = []


class TenderCreateRequest(BaseModel):
    title: str
    ministry: str
    department: str
    category: str
    estimatedValue: str
    emdAmount: str
    publishedDate: Optional[str] = None
    closingDate: str
    miiMinRequirement: str = "50% (Class-I)"
    boqItems: List[BoqItem] = []


# ==========================================
# 4. Contracts & CRAC Schemas (GFR Stage 5 & 6)
# ==========================================

class ContractItem(BaseModel):
    id: str
    tenderId: str
    bidId: str
    vendor: str
    buyerOrg: str
    contractValue: str
    poDate: str
    dscSigned: bool
    cracStatus: str
    cracDate: Optional[str] = None
    paymentStatus: str
    paymentDueDate: str
    disbursementRef: Optional[str] = None


class CracUpdateRequest(BaseModel):
    cracStatus: str = "Approved"  # "Approved", "Rejected", "Pending Inspection"
    inspectionNotes: Optional[str] = "Goods inspected and found compliant with tender BOQ specifications."


class PaymentUpdateRequest(BaseModel):
    paymentStatus: str = "Settled (100%)"  # "Settled (100%)", "Processing (Day 4/10)", "Withheld"
    disbursementRef: Optional[str] = None


# ==========================================
# 5. Auction & Anti-Cartel Schemas
# ==========================================

class AuctionBidItem(BaseModel):
    rank: str
    vendor: str
    amount: str
    diffL1: str
    flag: str
    risk: str
    ipAddress: Optional[str] = None
    dscIssuer: Optional[str] = None


class CartelAlert(BaseModel):
    tenderId: str
    severity: str
    title: str
    description: str
    flaggedVendors: List[str]


class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # "vendor", "tender", "ip", "dsc"
    risk: str


class GraphLink(BaseModel):
    source: str
    target: str
    relationship: str
    weight: float


class AuctionAnalysisResponse(BaseModel):
    tenderId: str
    tenderValue: str
    bids: List[AuctionBidItem]
    cartelAlerts: List[CartelAlert]
    graphNodes: List[GraphNode]
    graphLinks: List[GraphLink]


class ReverseAuctionStep(BaseModel):
    roundNumber: int
    currentL1: str
    currentL1Vendor: str
    timeRemainingSeconds: int
    bidsInRound: List[Dict[str, Any]]


# ==========================================
# 6. Overview & Stats Schemas
# ==========================================

class ViolationItem(BaseModel):
    name: str
    percent: int
    color: str


class PlatformStats(BaseModel):
    gmvProcessed: str
    gmvSubtitle: str
    complianceAccuracy: str
    accuracySubtitle: str
    vendorsScreened: str
    vendorsSubtitle: str
    turnaroundTime: str
    turnaroundSubtitle: str


class SummaryMetrics(BaseModel):
    activeBids: str
    activeChange: str
    compliant: str
    compliantPercent: str
    flagged: str
    flaggedPercent: str
    rejected: str
    rejectedPercent: str


class StatsOverviewResponse(BaseModel):
    platformStats: PlatformStats
    summaryMetrics: SummaryMetrics
    violationBreakdown: List[ViolationItem]


# ==========================================
# 7. Auth Schemas
# ==========================================

class UserLogin(BaseModel):
    email: str
    password: str
    role: Optional[str] = "buyer"  # "buyer", "seller", "officer"


class UserRegister(BaseModel):
    fullName: str
    email: str
    organization: str
    gstin: Optional[str] = None
    role: str = "seller"
    password: str


class AuthResponse(BaseModel):
    token: str
    user: Dict[str, Any]
    message: str
