// Mock dataset for GeM Procurement Compliance Platform (SIH 2026 - Codetox)

export const initialBids = [];

export const platformStats = {
  gmvProcessed: "₹0 Cr",
  gmvSubtitle: "Cumulative",
  complianceAccuracy: "100%",
  accuracySubtitle: "AI verified",
  vendorsScreened: "0",
  vendorsSubtitle: "Active on GeM",
  turnaroundTime: "< 4 sec",
  turnaroundSubtitle: "Real-time"
};

export const violationBreakdown = [
  { name: "Price Cartel", percent: 0, color: "#ef4444" },
  { name: "MSE Fraud", percent: 0, color: "#f59e0b" },
  { name: "MII Non-compliance", percent: 0, color: "#3b82f6" },
  { name: "Document Forgery", percent: 0, color: "#eab308" },
  { name: "Other", percent: 0, color: "#64748b" }
];

export const summaryMetrics = {
  activeBids: "0",
  activeChange: "0%",
  compliant: "0",
  compliantPercent: "0.0%",
  flagged: "0",
  flaggedPercent: "0.0%",
  rejected: "0",
  rejectedPercent: "0.0%"
};

export const samplePreloads = {
  perfectBid: {
    vendorName: "Bharat ElectroMech Systems Ltd.",
    category: "Heavy Electricals & UPS",
    tenderId: "GEM/2026/B/901844",
    tenderValue: "₹85,00,000",
    bidAmount: "₹78,40,000",
    gstin: "27AABCB1234F1Z5",
    pan: "AABCB1234F",
    miiDeclared: "82%",
    turnoverClaim: "₹14.2 Cr",
    experienceClaim: "6 Years",
    msmeRegNo: "UDYAM-MH-03-0019284"
  },
  flaggedBid: {
    vendorName: "Delta Vertex Solutions",
    category: "CCTV & Security Surveillance",
    tenderId: "GEM/2026/B/899120",
    tenderValue: "₹45,00,000",
    bidAmount: "₹44,80,000",
    gstin: "07AAACD9981K1Z2",
    pan: "AAACD9981K",
    miiDeclared: "41%",
    turnoverClaim: "₹1.4 Cr", // Below required 2 Cr
    experienceClaim: "2 Years",
    msmeRegNo: "UDYAM-DL-02-0048123"
  },
  fraudBid: {
    vendorName: "Royal Fake Traders Pvt Ltd",
    category: "Office IT Supplies",
    tenderId: "GEM/2026/B/882100",
    tenderValue: "₹30,00,000",
    bidAmount: "₹21,00,000",
    gstin: "06ZZZZZ0000Z1Z0",
    pan: "ABCDE1234F",
    miiDeclared: "12%",
    turnoverClaim: "₹80 Lakhs",
    experienceClaim: "0.5 Year",
    msmeRegNo: "UDYAM-HR-00-INVALID"
  }
};

export const initialTenders = [];

// Stored Dummy KYC & Verification Database for Specific Users
export const verifiedKycRecords = [
  {
    id: "KYC-001",
    fullName: "SUMIT ANANDRAO DESHMUKH",
    companyName: "DESHMUKH CONSTRUCTION PVT LTD",
    aadharNo: "387055087722",
    panNo: "ISOPD1145K",
    gstNo: "GTSIN27ABCDE1234F1Z1",
    gstinClean: "27ABCDE1234F1Z1",
    category: "Infrastructure & Civil Works",
    turnoverClaim: "₹15.2 Cr",
    experienceClaim: "7 Years",
    miiDeclared: "78%",
    msmeRegNo: "UDYAM-MH-03-0098112",
    bidAmount: "₹1.45 Cr",
    docs: [
      { name: "Aadhaar_Card_387055087722.pdf", size: "1.1 MB", status: "UIDAI e-KYC Verified" },
      { name: "PAN_Card_ISOPD1145K.pdf", size: "1.2 MB", status: "NSDL Verified" },
      { name: "GST_REG06_27ABCDE1234F1Z1.pdf", size: "2.4 MB", status: "Active & 3B Compliant" },
      { name: "UDYAM_MSME_MH03.pdf", size: "850 KB", status: "MSME Verified" },
      { name: "CA_Audited_Turnover_FY25.pdf", size: "3.1 MB", status: "ICAI UDIN Active" },
      { name: "Make_In_India_Declaration.pdf", size: "640 KB", status: "Class-I (78%)" }
    ]
  },
  {
    id: "KYC-002",
    fullName: "ANIKET DNYANDEO SAWARKAR",
    companyName: "APEX TECHNOLOGY",
    aadharNo: "387055087723",
    panNo: "ISOPD1145M",
    gstNo: "GTSIN27ABCDE1234F1Z2",
    gstinClean: "27ABCDE1234F1Z2",
    category: "IT Hardware",
    turnoverClaim: "₹12.4 Cr",
    experienceClaim: "5 Years",
    miiDeclared: "72%",
    msmeRegNo: "UDYAM-MH-03-0019284",
    bidAmount: "₹1.38 Cr",
    docs: [
      { name: "Aadhaar_Card_387055087723.pdf", size: "1.0 MB", status: "UIDAI e-KYC Verified" },
      { name: "PAN_Card_ISOPD1145M.pdf", size: "1.1 MB", status: "NSDL Verified" },
      { name: "GST_REG06_27ABCDE1234F1Z2.pdf", size: "2.2 MB", status: "Active & 3B Compliant" },
      { name: "UDYAM_MSME_Apex.pdf", size: "780 KB", status: "MSME Verified" },
      { name: "CA_Audited_Turnover_FY25.pdf", size: "2.9 MB", status: "ICAI UDIN Active" },
      { name: "Make_In_India_Declaration.pdf", size: "590 KB", status: "Class-I (72%)" }
    ]
  },
  {
    id: "KYC-003",
    fullName: "KRUSHNA SANTOSH BHENDE",
    companyName: "KK PVT LTD",
    aadharNo: "387055087724",
    panNo: "ISOPD1145N",
    gstNo: "GTSIN27ABCDE1234F1Z3",
    gstinClean: "27ABCDE1234F1Z3",
    category: "Heavy Electricals",
    turnoverClaim: "₹18.6 Cr",
    experienceClaim: "6 Years",
    miiDeclared: "85%",
    msmeRegNo: "UDYAM-MH-03-0044192",
    bidAmount: "₹1.92 Cr",
    docs: [
      { name: "Aadhaar_Card_387055087724.pdf", size: "1.2 MB", status: "UIDAI e-KYC Verified" },
      { name: "PAN_Card_ISOPD1145N.pdf", size: "1.0 MB", status: "NSDL Verified" },
      { name: "GST_REG06_27ABCDE1234F1Z3.pdf", size: "2.5 MB", status: "Active & 3B Compliant" },
      { name: "UDYAM_MSME_KK.pdf", size: "900 KB", status: "MSME Verified" },
      { name: "CA_Audited_Turnover_FY25.pdf", size: "3.2 MB", status: "ICAI UDIN Active" },
      { name: "Make_In_India_Declaration.pdf", size: "620 KB", status: "Class-I (85%)" }
    ]
  }
];


