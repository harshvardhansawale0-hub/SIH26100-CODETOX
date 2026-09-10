import re
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

# ==========================================
# 1. Verification & Input Schemas
# ==========================================

class ExtractedEntity(BaseModel):
    entityType: str  # "PAN", "GSTIN", "UDIN", "TURNOVER", "LEGAL_NAME", "MII_PERCENT"
    fieldName: str
    parsedValue: str
    confidence: str
    sourceDoc: str

class CrossDocMatchResult(BaseModel):
    fieldName: str
    docsCompared: str
    isMatch: bool
    confidence: float
    remarks: str

class BidRequirementMatchResult(BaseModel):
    requirementName: str
    tenderRequirement: str
    bidderClaim: str
    isMet: bool
    remarks: str

class RuleCheckResult(BaseModel):
    ruleId: str
    name: str
    category: str  # e.g. "GFR 2017", "DPIIT Policy", "Statutory Compliance", "MSE Policy 2012"
    passed: bool
    details: str
    penaltyPoints: int = 0

class ExtractedDoc(BaseModel):
    name: str
    docType: str
    status: str
    score: int
    confidence: str
    details: Optional[str] = None
    tamperingDetected: bool = False

class AuditTrailEntry(BaseModel):
    timestamp: str
    action: str
    agent: str

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
    uploadedDocNames: Optional[List[str]] = Field(default=[])

class ComplianceReport(BaseModel):
    reportId: str
    generatedAt: str
    bidId: str
    tenderId: str
    vendorName: str
    score: int
    status: str  # "Compliant", "Flagged", "Non-Compliant"
    riskLevel: str
    summaryText: str
    buyerRecommendation: str
    extractedEntities: List[ExtractedEntity] = []
    crossDocMatches: List[CrossDocMatchResult] = []
    requirementMatches: List[BidRequirementMatchResult] = []
    ruleBreakdown: List[RuleCheckResult] = []
    extractedDocs: List[ExtractedDoc] = []
    flags: List[str] = []

class BidVerifyResponse(BaseModel):
    bidId: str
    vendor: str
    category: str
    tenderId: str
    tenderValue: str
    bidAmount: str
    score: int
    status: str  # "Compliant", "Flagged", "Non-Compliant"
    risk: str    # "Low Risk", "Medium Risk", "High Risk"
    flags: List[str] = []
    miiVerified: str
    ocrConfidence: str
    gstVerified: str
    panVerified: str
    rulesTested: int
    rulesPassed: int
    ruleBreakdown: List[RuleCheckResult] = []
    extractedEntities: List[ExtractedEntity] = []
    crossDocMatches: List[CrossDocMatchResult] = []
    requirementMatches: List[BidRequirementMatchResult] = []
    extractedDocs: List[ExtractedDoc] = []
    auditTrail: List[AuditTrailEntry] = []
    complianceReport: Optional[ComplianceReport] = None


# ==========================================
# 2. Bid Entity & Application Schemas
# ==========================================

class BidItem(BaseModel):
    id: str
    vendor: str
    category: str
    item: str
    tenderId: str
    tenderValue: str
    bidAmount: str
    status: str  # "Compliant", "Flagged", "Non-Compliant", "Selected"
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
    extractedEntities: List[ExtractedEntity] = []
    crossDocMatches: List[CrossDocMatchResult] = []
    requirementMatches: List[BidRequirementMatchResult] = []
    auditTrail: List[AuditTrailEntry] = []
    complianceReport: Optional[Dict[str, Any]] = None

class BidStatusUpdate(BaseModel):
    status: str  # "Compliant", "Flagged", "Non-Compliant", "Selected"
    buyerNotes: Optional[str] = None
    buyerName: Optional[str] = "Government Procuring Authority"


# ==========================================
# 3. Tenders & BOQ Schemas (Buyer Created)
# ==========================================

class BoqItem(BaseModel):
    item: str
    qty: int
    unit: str

class TenderComplianceCriteria(BaseModel):
    miiMinRequirement: str = "50% (Class-I)"
    minTurnoverRequirement: str = "₹2.0 Cr"
    minExperienceYears: int = 3
    mandatoryDocs: List[str] = [
        "PAN Card",
        "GSTIN Certificate",
        "UDYAM Certificate",
        "CA Audited Turnover Statement",
        "Make in India Declaration"
    ]
    technicalSpecsSummary: Optional[str] = "Standard OEM & ISO 9001 certified procurement quality."

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
    status: str  # "Active", "Under Evaluation", "Awarded", "Closed"
    miiMinRequirement: str
    minTurnoverRequirement: str = "₹2.0 Cr"
    minExperienceYears: int = 3
    mandatoryDocs: List[str] = []
    boqItems: List[BoqItem] = []
    applicationsCount: int = 0
    selectedBidderId: Optional[str] = None
    createdBy: Optional[str] = None
    buyerEmail: Optional[str] = None
    buyerName: Optional[str] = None
    buyerOrg: Optional[str] = None

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
    minTurnoverRequirement: str = "₹2.0 Cr"
    minExperienceYears: int = 3
    mandatoryDocs: List[str] = [
        "PAN Card",
        "GSTIN Certificate",
        "UDYAM Certificate",
        "CA Audited Turnover Statement",
        "Make in India Declaration"
    ]
    boqItems: List[BoqItem] = []
    createdBy: Optional[str] = None
    buyerEmail: Optional[str] = None
    buyerName: Optional[str] = None
    buyerOrg: Optional[str] = None


# ==========================================
# 4. Contracts & CRAC Schemas
# ==========================================

class ContractItem(BaseModel):
    id: str
    tenderId: str
    bidId: str
    vendor: str
    buyerOrg: str
    contractValue: str
    poDate: str
    dscSigned: bool = True
    cracStatus: str
    cracDate: Optional[str] = None
    paymentStatus: str
    paymentDueDate: str
    disbursementRef: Optional[str] = None

class CracUpdateRequest(BaseModel):
    cracStatus: str  # "Approved", "Rejected", "Pending Inspection"
    inspectionNotes: Optional[str] = None

class PaymentUpdateRequest(BaseModel):
    paymentStatus: str  # "Processing (Day 4/10)", "Settled (100%)", "Withheld"
    disbursementRef: Optional[str] = None


# ==========================================
# 5. Anti-Cartel Schemas
# ==========================================

class CartelVendorInfo(BaseModel):
    vendorName: str
    ipAddress: str
    dscSerial: str
    bankBranch: str
    bidAmount: str

class CartelDetectionAlert(BaseModel):
    tenderId: str
    severity: str
    title: str
    description: str
    flaggedVendors: List[str]
    detectedAt: Optional[str] = None

class CartelAlert(BaseModel):
    tenderId: str
    severity: str
    title: str
    description: str
    flaggedVendors: List[str]

class AuctionBidItem(BaseModel):
    rank: str
    vendor: str
    amount: str
    diffL1: str
    flag: str
    risk: str
    ipAddress: Optional[str] = None
    dscIssuer: Optional[str] = None

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

class ReverseAuctionStep(BaseModel):
    roundNumber: int
    currentL1: str
    currentL1Vendor: str
    timeRemainingSeconds: int
    bidsInRound: List[Dict[str, Any]]

class AuctionAnalysisResponse(BaseModel):
    tenderId: str
    tenderValue: str
    bids: List[Any]
    cartelAlerts: List[Any]
    graphNodes: List[Any]
    graphLinks: List[Any]


# ==========================================
# 6. Platform Overview & Summary Metrics
# ==========================================

class ViolationItem(BaseModel):
    type: str
    count: int
    percentage: str
    riskWeight: str

class PlatformStats(BaseModel):
    verifiedVolume: str
    verifiedSubtitle: str
    accuracyRate: str
    accuracySubtitle: str
    activeVendors: str
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
# 7. Authentication Schemas (Strictly Buyer & Bidder)
# ==========================================

class UserLogin(BaseModel):
    email: str
    password: str
    role: Optional[str] = "buyer"  # Strictly "buyer" or "bidder"

class UserRegister(BaseModel):
    fullName: str
    email: str
    organization: str
    gstin: Optional[str] = None
    role: str = "bidder"  # Strictly "buyer" or "bidder"
    password: str

class AuthResponse(BaseModel):
    token: str
    user: Dict[str, Any]
    message: str


# ==========================================
# 8. Compliance Passport Schemas
# ==========================================

class DocumentVerifyRequest(BaseModel):
    """Request to verify one or more seller documents."""
    documents: List[Dict[str, str]]  # [{"docType": "PAN", "docRef": "AABCB1234F"}, ...]

class VerificationRecord(BaseModel):
    """Single document verification result."""
    id: str
    vendorId: int
    docType: str
    docRef: str
    status: str
    verifiedAt: Optional[str] = None
    expiresAt: Optional[str] = None
    verificationMethod: str = "mock"
    details: Optional[Dict[str, Any]] = None

class PassportPayload(BaseModel):
    """The credential payload that gets digitally signed."""
    passportId: str
    vendorId: int
    vendorName: str
    gstinMasked: str
    panMasked: str
    udyamNo: Optional[str] = None
    miiClassification: str
    verifiedCredentials: List[Dict[str, str]]
    issuedAt: str
    expiresAt: str
    complianceScore: int

class PassportItem(BaseModel):
    """Full passport record returned to clients."""
    id: str
    vendorId: int
    vendorName: str
    issuedAt: str
    expiresAt: str
    status: str
    complianceScore: int
    miiClassification: str
    verifiedCredentials: List[Dict[str, str]]
    gstinMasked: str
    panMasked: str
    udyamNo: Optional[str] = None
    signaturePreview: str
    payloadHash: str

class PassportVerifyRequest(BaseModel):
    """Request to verify a passport (e.g., during bid submission)."""
    bidId: Optional[str] = None
    tenderId: Optional[str] = None

class PassportVerifyResponse(BaseModel):
    """Result of passport verification."""
    valid: bool
    passportId: str
    vendorName: str
    status: str
    signatureValid: bool
    expiresAt: str
    verifiedCredentials: List[Dict[str, str]]
    complianceScore: int
    message: str

class PassportRevokeRequest(BaseModel):
    """Request to revoke a passport."""
    reason: str = "Administrative revocation"

class VendorWithPassport(BaseModel):
    """Vendor record enriched with passport status."""
    id: int
    name: str
    gstin: str
    pan: str
    udyamNo: Optional[str] = None
    category: str
    miiClassification: str
    complianceScore: int
    riskTier: str
    blacklisted: bool
    passportId: Optional[str] = None
    passportStatus: Optional[str] = None
    passportExpiresAt: Optional[str] = None
    verifiedDocsCount: int = 0

