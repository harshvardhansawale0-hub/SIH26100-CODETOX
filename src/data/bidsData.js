// Mock dataset for GeM Procurement Compliance Platform (SIH 2026 - Codetox)

export const initialBids = [
  {
    id: "BID-20495",
    vendor: "Apex Supplies Ltd.",
    category: "IT Hardware",
    item: "High-Performance Workstations (Qty: 250)",
    tenderId: "GEM/2026/B/891244",
    tenderValue: "₹1.45 Cr",
    bidAmount: "₹1.38 Cr",
    status: "Compliant",
    score: 96,
    miiContent: "68% (Class-I Local)",
    turnover: "₹12.4 Cr (Req: ₹5 Cr)",
    experience: "5 Years (Req: 3 Yrs)",
    gstStatus: "Active & 3B Filed",
    panStatus: "Verified",
    msmeStatus: "Medium Enterprise (UDYAM verified)",
    date: "06 Sep 2026, 11:20 AM",
    riskLevel: "Low Risk",
    ocrConfidence: "99.4%",
    flags: [],
    extractedDocs: [
      { name: "GST_Certificate_2026.pdf", status: "Verified", score: 100 },
      { name: "CA_Turnover_Audited_FY25.pdf", status: "Verified", score: 98 },
      { name: "Make_In_India_Declaration.pdf", status: "Verified (68%)", score: 95 },
      { name: "OEM_Authorization_Form.pdf", status: "Verified", score: 96 }
    ],
    auditTrail: [
      { timestamp: "06 Sep 2026, 11:20:04", action: "Bid Ingestion via GeM API", agent: "System (Webhook)" },
      { timestamp: "06 Sep 2026, 11:20:06", action: "OCR & Document Parsing Complete", agent: "EasyOCR / Tesseract Engine" },
      { timestamp: "06 Sep 2026, 11:20:07", action: "GFR 2017 & MII Rule Engine Checked (210 Rules)", agent: "NLP Rule Validator" },
      { timestamp: "06 Sep 2026, 11:20:08", action: "Scored 96/100 -> Auto Approved", agent: "GeM ML Model v4.2" }
    ]
  },
  {
    id: "BID-20494",
    vendor: "Balaji Enterprises",
    category: "Furniture",
    item: "Modular Office Workstations & Chairs",
    tenderId: "GEM/2026/B/890412",
    tenderValue: "₹42.0 Lakhs",
    bidAmount: "₹38.5 Lakhs",
    status: "Flagged",
    score: 61,
    miiContent: "42% (Class-II Local)",
    turnover: "₹1.8 Cr (Req: ₹2 Cr - Shortfall)",
    experience: "3 Years (Req: 3 Yrs)",
    gstStatus: "Active",
    panStatus: "Verified",
    msmeStatus: "Micro (UDYAM mismatch)",
    date: "06 Sep 2026, 10:45 AM",
    riskLevel: "Medium Risk",
    ocrConfidence: "94.2%",
    flags: [
      "Annual turnover falls short by ₹20 Lakhs against tender mandatory criteria (Rule GFR 173).",
      "UDYAM registration date does not match GST registration date by 14 months.",
      "Local Content Undertaking lacks CA countersignature."
    ],
    extractedDocs: [
      { name: "GST_Reg_06A.pdf", status: "Verified", score: 95 },
      { name: "Turnover_Statement.pdf", status: "Discrepancy (Turnover < Limit)", score: 55 },
      { name: "MII_Undertaking_Self.pdf", status: "Missing CA Seal", score: 45 },
      { name: "Experience_Certificates.pdf", status: "Verified", score: 90 }
    ],
    auditTrail: [
      { timestamp: "06 Sep 2026, 10:45:12", action: "Bid Ingested", agent: "System" },
      { timestamp: "06 Sep 2026, 10:45:15", action: "OCR Text Extracted with 94.2% confidence", agent: "OCR Engine" },
      { timestamp: "06 Sep 2026, 10:45:16", action: "Flagged: Rule #173 (Turnover Shortfall) & Rule #84 (CA Seal missing)", agent: "Rule Engine" },
      { timestamp: "06 Sep 2026, 10:45:17", action: "Compliance Score: 61/100 -> Routed to Officer Review", agent: "ML Scorer" }
    ]
  },
  {
    id: "BID-20493",
    vendor: "TechForce Pvt Ltd",
    category: "Software",
    item: "Cloud-Based GIS Mapping & Analytics Tool",
    tenderId: "GEM/2026/B/889105",
    tenderValue: "₹2.10 Cr",
    bidAmount: "₹1.95 Cr",
    status: "Compliant",
    score: 91,
    miiContent: "85% (Class-I Local)",
    turnover: "₹18.9 Cr (Req: ₹8 Cr)",
    experience: "6 Years (Req: 4 Yrs)",
    gstStatus: "Active & All Clear",
    panStatus: "Verified",
    msmeStatus: "Small Enterprise",
    date: "06 Sep 2026, 09:30 AM",
    riskLevel: "Low Risk",
    ocrConfidence: "98.9%",
    flags: [],
    extractedDocs: [
      { name: "GST_3B_Last6Months.pdf", status: "Verified", score: 100 },
      { name: "Audited_Balance_Sheet.pdf", status: "Verified", score: 96 },
      { name: "Class_I_MII_Cert.pdf", status: "Verified (85%)", score: 98 },
      { name: "CMMI_Level_3_Certificate.pdf", status: "Verified", score: 90 }
    ],
    auditTrail: [
      { timestamp: "06 Sep 2026, 09:30:02", action: "Bid Received", agent: "GeM Gateway" },
      { timestamp: "06 Sep 2026, 09:30:05", action: "Automated Document Validation Successful", agent: "OCR + NLP Engine" },
      { timestamp: "06 Sep 2026, 09:30:06", action: "Score 91/100 -> Compliance Verified", agent: "GeM Engine" }
    ]
  },
  {
    id: "BID-20492",
    vendor: "UniVend Solutions",
    category: "Stationery",
    item: "Executive Diaries, Pens & Desk Items (Bulk)",
    tenderId: "GEM/2026/B/887990",
    tenderValue: "₹18.5 Lakhs",
    bidAmount: "₹14.2 Lakhs",
    status: "Rejected",
    score: 22,
    miiContent: "15% (Non-compliant < 20%)",
    turnover: "₹15 Lakhs (Req: ₹50 Lakhs)",
    experience: "1 Year (Req: 2 Yrs)",
    gstStatus: "Cancelled / Tax Defaulter Notice",
    panStatus: "PAN/GST Name Mismatch",
    msmeStatus: "Invalid Certificate Number",
    date: "06 Sep 2026, 08:15 AM",
    riskLevel: "High Risk (Critical)",
    ocrConfidence: "81.0%",
    flags: [
      "CRITICAL: GSTIN status on GST Portal returned CANCELLED / SUSPENDED.",
      "Severe discrepancy: Name on PAN card does not match bidder entity registered on GeM.",
      "Local content declaration is 15%, below mandatory minimum 20% DPIIT threshold for this category.",
      "Turnover certificate font analysis indicates potential document tampering / altered figures."
    ],
    extractedDocs: [
      { name: "GST_Certificate.pdf", status: "Tampering Alert", score: 15 },
      { name: "PAN_Copy.pdf", status: "Entity Mismatch", score: 20 },
      { name: "Turnover_Cert.pdf", status: "Font Inconsistency Detected", score: 18 }
    ],
    auditTrail: [
      { timestamp: "06 Sep 2026, 08:15:01", action: "Bid Ingested", agent: "System" },
      { timestamp: "06 Sep 2026, 08:15:03", action: "OpenCV Document Forensics: Detected font irregularity on turnover figures", agent: "OpenCV Document Forensics" },
      { timestamp: "06 Sep 2026, 08:15:04", action: "External GST API: Status CANCELLED", agent: "GSTIN Verification API" },
      { timestamp: "06 Sep 2026, 08:15:05", action: "Score 22/100 -> AUTO-REJECTED & Added to Vigilance Watchlist", agent: "Rule Engine" }
    ]
  },
  {
    id: "BID-20491",
    vendor: "Kaveri Infotech",
    category: "IT Hardware",
    item: "Rack Servers & SAN Storage Solution",
    tenderId: "GEM/2026/B/891244",
    tenderValue: "₹1.45 Cr",
    bidAmount: "₹1.42 Cr",
    status: "Compliant",
    score: 94,
    miiContent: "72% (Class-I Local)",
    turnover: "₹15.2 Cr (Req: ₹5 Cr)",
    experience: "7 Years (Req: 3 Yrs)",
    gstStatus: "Active",
    panStatus: "Verified",
    msmeStatus: "Medium Enterprise",
    date: "05 Sep 2026, 04:10 PM",
    riskLevel: "Low Risk",
    ocrConfidence: "99.1%",
    flags: [],
    extractedDocs: [
      { name: "GST_3B.pdf", status: "Verified", score: 100 },
      { name: "CA_Turnover.pdf", status: "Verified", score: 96 }
    ],
    auditTrail: [
      { timestamp: "05 Sep 2026, 04:10:00", action: "Bid Ingested & Approved", agent: "GeM Engine" }
    ]
  },
  {
    id: "BID-20490",
    vendor: "Shree Ganesh Networks",
    category: "IT Hardware",
    item: "Rack Servers & Networking Switches",
    tenderId: "GEM/2026/B/891244",
    tenderValue: "₹1.45 Cr",
    bidAmount: "₹1.44 Cr",
    status: "Flagged",
    score: 54,
    miiContent: "50% (Class-II Local)",
    turnover: "₹5.1 Cr (Req: ₹5 Cr)",
    experience: "3 Years (Req: 3 Yrs)",
    gstStatus: "Active",
    panStatus: "Verified",
    msmeStatus: "Small Enterprise",
    date: "05 Sep 2026, 02:40 PM",
    riskLevel: "Medium Risk (Cartel Alert)",
    ocrConfidence: "95.0%",
    flags: [
      "Collusion Alert: Bid price is within 0.7% variance of Kaveri Infotech & Apex Supplies (Price Clustering Detected).",
      "IP Address check: Bid submitted from same subnet subnet / 192.168.4.x as Kaveri Infotech.",
      "Digital Signature (DSC) issuer linked to common authorised signatory."
    ],
    extractedDocs: [
      { name: "GST_Certificate.pdf", status: "Verified", score: 92 },
      { name: "Turnover_Doc.pdf", status: "Verified", score: 90 }
    ],
    auditTrail: [
      { timestamp: "05 Sep 2026, 02:40:11", action: "Price Rigging Analysis: Pattern Matched with Cluster #4", agent: "Graph Cartel Detector" },
      { timestamp: "05 Sep 2026, 02:40:12", action: "Score 54/100 -> Flagged for Anti-Cartel Investigation", agent: "ML Scorer" }
    ]
  }
];

export const platformStats = {
  gmvProcessed: "₹4.5L Cr",
  gmvSubtitle: "Cumulative",
  complianceAccuracy: "98.7%",
  accuracySubtitle: "AI verified",
  vendorsScreened: "3.2M+",
  vendorsSubtitle: "Active on GeM",
  turnaroundTime: "< 4 sec",
  turnaroundSubtitle: "Real-time"
};

export const violationBreakdown = [
  { name: "Price Cartel", percent: 34, color: "#ef4444" },
  { name: "MSE Fraud", percent: 27, color: "#f59e0b" },
  { name: "MII Non-compliance", percent: 19, color: "#3b82f6" },
  { name: "Document Forgery", percent: 12, color: "#eab308" },
  { name: "Other", percent: 8, color: "#64748b" }
];

export const summaryMetrics = {
  activeBids: "2,847",
  activeChange: "+12%",
  compliant: "2,541",
  compliantPercent: "89.3%",
  flagged: "243",
  flaggedPercent: "8.5%",
  rejected: "63",
  rejectedPercent: "2.2%"
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

export const initialTenders = [
  {
    id: "GEM/2026/B/891244",
    title: "Procurement of High-Performance AI Workstations & Edge Servers",
    ministry: "Ministry of Defence",
    department: "Defence Research & Development Organisation (DRDO)",
    category: "IT Hardware",
    estimatedValue: "₹1.45 Cr",
    emdAmount: "₹2.90 Lakhs (MSE Exempted)",
    closingDate: "28 Sep 2026",
    status: "Active",
    miiMinRequirement: "50% (Class-I)",
    minTurnoverRequirement: "₹5.0 Cr",
    minExperienceYears: 3,
    mandatoryDocs: ["PAN Card", "GSTIN Certificate", "UDYAM MSME Certificate", "CA Audited Turnover", "Make in India Declaration"],
    boqItems: [{ item: "High-Performance Workstations (RTX 6000)", qty: 250, unit: "Nos" }]
  },
  {
    id: "GEM/2026/B/890412",
    title: "Supply and Installation of Ergonomic Modular Office Furniture",
    ministry: "Ministry of Railways",
    department: "Railway Board & Northern Railway HQ",
    category: "Furniture",
    estimatedValue: "₹42.0 Lakhs",
    emdAmount: "₹84,000",
    closingDate: "22 Sep 2026",
    status: "Active",
    miiMinRequirement: "50% (Class-I)",
    minTurnoverRequirement: "₹2.0 Cr",
    minExperienceYears: 3,
    mandatoryDocs: ["PAN Card", "GSTIN Certificate", "UDYAM MSME Certificate", "CA Audited Turnover"],
    boqItems: [{ item: "Modular Office Workstations & Chairs", qty: 400, unit: "Sets" }]
  },
  {
    id: "GEM/2026/B/889105",
    title: "Cloud-Based GIS Geospatial Mapping & Telemetry Software Solution",
    ministry: "Department of Space",
    department: "Indian Space Research Organisation (ISRO)",
    category: "Software",
    estimatedValue: "₹2.10 Cr",
    emdAmount: "₹4.20 Lakhs",
    closingDate: "30 Sep 2026",
    status: "Active",
    miiMinRequirement: "50% (Class-I)",
    minTurnoverRequirement: "₹8.0 Cr",
    minExperienceYears: 4,
    mandatoryDocs: ["PAN Card", "GSTIN Certificate", "CMMI Level 3+", "CA Audited Turnover", "Make in India Declaration"],
    boqItems: [{ item: "GIS Enterprise License with API Gateway", qty: 1, unit: "License" }]
  },
  {
    id: "GEM/2026/B/892301",
    title: "Supply of High-Flow Oxygen Generation & Critical Medical Gear",
    ministry: "Ministry of Health & Family Welfare",
    department: "All India Institute of Medical Sciences (AIIMS)",
    category: "Medical Equipment",
    estimatedValue: "₹1.15 Cr",
    emdAmount: "₹2.30 Lakhs",
    closingDate: "18 Sep 2026",
    status: "Active",
    miiMinRequirement: "50% (Class-I)",
    minTurnoverRequirement: "₹3.0 Cr",
    minExperienceYears: 2,
    mandatoryDocs: ["PAN Card", "GSTIN Certificate", "ISO 13485 Medical Device Cert", "CA Audited Turnover"],
    boqItems: [{ item: "Medical Oxygen Generation Concentrators", qty: 80, unit: "Units" }]
  }
];

