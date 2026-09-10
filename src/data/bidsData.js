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
    category: "IT Hardware",
    tenderId: "GEM/2026/B/891244",
    tenderValue: "₹1.45 Cr",
    bidAmount: "₹1.38 Cr",
    gstin: "27AABCB1234F1Z5",
    pan: "AABCB1234F",
    miiDeclared: "82%",
    turnoverClaim: "₹14.2 Cr",
    experienceClaim: "6 Years",
    msmeRegNo: "UDYAM-MH-03-0019284"
  },
  flaggedBid: {
    vendorName: "Delta Vertex Solutions",
    category: "Furniture",
    tenderId: "GEM/2026/B/890412",
    tenderValue: "₹38.50 Lakhs",
    bidAmount: "₹36.00 Lakhs",
    gstin: "07AAACD9981K1Z2",
    pan: "AAACD9981K",
    miiDeclared: "41%",
    turnoverClaim: "₹1.4 Cr", // Below required 2 Cr
    experienceClaim: "2 Years",
    msmeRegNo: "UDYAM-DL-02-0048123"
  },
  fraudBid: {
    vendorName: "Royal Fake Traders Pvt Ltd",
    category: "Medical Equipment",
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
  // 1. ACTIVE TENDERS
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
    riskCategory: "Active",
    riskLevel: "Low Risk",
    isMii: true,
    isStartup: true,
    isMsme: true,
    isWomaniya: false,
    initiativeTag: "Make in India (Class-I) & Startup Runway",
    miiMinRequirement: "50% (Class-I)",
    minTurnoverRequirement: "₹5.0 Cr",
    minExperienceYears: 3,
    mandatoryDocs: ["PAN Card", "GSTIN Certificate", "UDYAM MSME Certificate", "CA Audited Turnover", "Make in India Declaration"],
    boqItems: [{ item: "High-Performance Workstations (RTX 6000)", qty: 250, unit: "Nos" }]
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
    riskCategory: "Active",
    riskLevel: "Low Risk",
    isMii: true,
    isStartup: true,
    isMsme: true,
    isWomaniya: false,
    initiativeTag: "Startup Runway & Make in India",
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
    riskCategory: "Active",
    riskLevel: "Low Risk",
    isMii: true,
    isStartup: false,
    isMsme: true,
    isWomaniya: false,
    initiativeTag: "Make in India (Class-I)",
    miiMinRequirement: "50% (Class-I)",
    minTurnoverRequirement: "₹3.0 Cr",
    minExperienceYears: 2,
    mandatoryDocs: ["PAN Card", "GSTIN Certificate", "ISO 13485 Medical Device Cert", "CA Audited Turnover"],
    boqItems: [{ item: "Medical Oxygen Generation Concentrators", qty: 80, unit: "Units" }]
  },

  // 2. WOMANIYA & SHG SPECIAL INITIATIVE TENDERS
  {
    id: "GEM/2026/B/896401",
    title: "Supply of SARAS Eco-Friendly Jute Conference Folders & Terracotta Desk Artifacts",
    ministry: "Ministry of Rural Development",
    department: "Deendayal Antyodaya Yojana - DAY-NRLM",
    category: "SARAS Handicrafts",
    estimatedValue: "₹24.5 Lakhs",
    emdAmount: "Exempted (Women SHGs)",
    closingDate: "25 Sep 2026",
    status: "Active",
    riskCategory: "Active",
    riskLevel: "Low Risk",
    isMii: true,
    isStartup: false,
    isMsme: true,
    isWomaniya: true,
    initiativeTag: "Womaniya on GeM (100% Women SHG Quota)",
    miiMinRequirement: "80% (Class-I Local)",
    minTurnoverRequirement: "₹10 Lakhs (Relaxed for SHGs)",
    minExperienceYears: 1,
    mandatoryDocs: ["PAN Card", "SHG Registration / UDYAM", "SARAS Artisan Certificate", "Self-Declaration of Local Sourcing"],
    boqItems: [
      { item: "Handcrafted Jute Seminar Folders with Madhubani Art", qty: 5000, unit: "Pcs" },
      { item: "Terracotta Desk Planters & Pen Stands", qty: 1500, unit: "Pcs" }
    ]
  },
  {
    id: "GEM/2026/B/897505",
    title: "Handloom Khadi Uniforms & Organic Nutritional Food Kits by Women Producer Collectives",
    ministry: "Ministry of Women & Child Development",
    department: "Mission Poshan 2.0 Directorate",
    category: "Office Stationery",
    estimatedValue: "₹48.0 Lakhs",
    emdAmount: "Exempted (Women MSEs)",
    closingDate: "27 Sep 2026",
    status: "Active",
    riskCategory: "Active",
    riskLevel: "Low Risk",
    isMii: true,
    isStartup: false,
    isMsme: true,
    isWomaniya: true,
    initiativeTag: "Womaniya on GeM & MSE Sambandh (3% Women Quota)",
    miiMinRequirement: "90% (Class-I)",
    minTurnoverRequirement: "₹15 Lakhs",
    minExperienceYears: 1,
    mandatoryDocs: ["PAN Card", "GSTIN Certificate", "UDYAM (Women-Owned Enterprise)", "FSSAI Registration"],
    boqItems: [
      { item: "Organic Multi-Grain Nutri-Mix Packs (1kg)", qty: 8000, unit: "Packs" },
      { item: "Handwoven Cotton Stitched Aprons & Uniforms", qty: 2400, unit: "Sets" }
    ]
  },

  // 3. FIRE SAFETY & SECURITY
  {
    id: "GEM/2026/B/898210",
    title: "Automatic Clean Agent Gas Fire Suppression Systems & IoT Smoke Alarms",
    ministry: "Ministry of Home Affairs",
    department: "Directorate General Fire Services & Civil Defence",
    category: "Fire Safety",
    estimatedValue: "₹68.0 Lakhs",
    emdAmount: "₹1.36 Lakhs",
    closingDate: "21 Sep 2026",
    status: "Active",
    riskCategory: "Active",
    riskLevel: "Low Risk",
    isMii: true,
    isStartup: true,
    isMsme: true,
    isWomaniya: false,
    initiativeTag: "Make in India & Startup Runway",
    miiMinRequirement: "60% (Class-I)",
    minTurnoverRequirement: "₹2.0 Cr",
    minExperienceYears: 2,
    mandatoryDocs: ["PAN Card", "GSTIN Certificate", "BIS / UL Listing Certificate", "CA Audited Turnover"],
    boqItems: [{ item: "Modular Gas Flooding Fire Extinguisher (50L)", qty: 25, unit: "Cylinders" }]
  },

  // 4. AT RISK TENDERS (High Scrutiny / Collusion Alerts / Borderline Thresholds)
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
    riskCategory: "At Risk",
    riskLevel: "Medium Risk (Cartel Alert)",
    riskAlert: "Collusion Warning: 3 bidders detected with price variance < 0.7% and shared IP subnet cluster (192.168.4.x).",
    isMii: true,
    isStartup: false,
    isMsme: true,
    isWomaniya: false,
    initiativeTag: "Make in India (Class-I)",
    miiMinRequirement: "50% (Class-I)",
    minTurnoverRequirement: "₹2.0 Cr",
    minExperienceYears: 3,
    mandatoryDocs: ["PAN Card", "GSTIN Certificate", "UDYAM MSME Certificate", "CA Audited Turnover"],
    boqItems: [{ item: "Modular Office Workstations & Chairs", qty: 400, unit: "Sets" }]
  },
  {
    id: "GEM/2026/B/893110",
    title: "Industrial Grade High-Capacity Online UPS & Battery Banks",
    ministry: "Ministry of Power",
    department: "National Thermal Power Corporation (NTPC)",
    category: "Heavy Electricals",
    estimatedValue: "₹75.0 Lakhs",
    emdAmount: "₹1.50 Lakhs",
    closingDate: "24 Sep 2026",
    status: "Active",
    riskCategory: "At Risk",
    riskLevel: "Medium Risk (DPIIT Scrutiny)",
    riskAlert: "High Scrutiny: Class-II local supplier declarations require mandatory CA-verified UDIN certificate for local value addition.",
    isMii: true,
    isStartup: false,
    isMsme: true,
    isWomaniya: false,
    initiativeTag: "Make in India (Class-I)",
    miiMinRequirement: "60% (Class-I)",
    minTurnoverRequirement: "₹3.5 Cr",
    minExperienceYears: 3,
    mandatoryDocs: ["PAN Card", "GSTIN Certificate", "CA UDIN Local Content Certificate", "OEM Authorization"],
    boqItems: [{ item: "120 kVA Online Modular UPS System", qty: 6, unit: "Sets" }]
  },

  // 5. NON-COMPLIANT TENDERS (Disqualifications / Rule Violations)
  {
    id: "GEM/2026/B/887990",
    title: "Bulk Supply of Premium Executive Stationery & Desk Supplies",
    ministry: "Ministry of Communications",
    department: "Department of Posts",
    category: "Office Stationery",
    estimatedValue: "₹18.5 Lakhs",
    emdAmount: "₹37,000",
    closingDate: "15 Sep 2026",
    status: "Non-Compliant",
    riskCategory: "Non-Compliant",
    riskLevel: "High Risk (Critical Disqualification)",
    disqualificationReason: "Statutory Violation: Local content is 15% (<20% DPIIT limit) & GSTIN flagged as Cancelled on GST Portal.",
    failedRules: [
      "Rule GFR 173 - Annual turnover shortfall",
      "DPIIT Public Procurement Order 2017 - Class-III Ineligible",
      "GSTIN Verification API - Status: Tax Defaulter / Cancelled"
    ],
    isMii: false,
    isStartup: false,
    isMsme: false,
    isWomaniya: false,
    miiMinRequirement: "50% (Class-I)",
    minTurnoverRequirement: "₹50 Lakhs",
    minExperienceYears: 2,
    mandatoryDocs: ["PAN Card", "GSTIN Certificate", "CA Turnover Statement"],
    boqItems: [{ item: "Executive Stationery Pack Sets", qty: 2500, unit: "Packs" }]
  },
  {
    id: "GEM/2026/B/882100",
    title: "Office IT Consumables, Toners & Peripheral Supplies",
    ministry: "Ministry of Electronics & IT",
    department: "National Informatics Centre (NIC)",
    category: "IT Hardware",
    estimatedValue: "₹30.0 Lakhs",
    emdAmount: "₹60,000",
    closingDate: "12 Sep 2026",
    status: "Non-Compliant",
    riskCategory: "Non-Compliant",
    riskLevel: "High Risk (Forensic Tampering)",
    disqualificationReason: "Document Forensic Alert: OpenCV detected font irregularity on turnover certificate & UDYAM number is invalid.",
    failedRules: [
      "OpenCV Forensics - Altered typography on CA audited report",
      "UDYAM Portal API - Certificate number not found in MSME database"
    ],
    isMii: false,
    isStartup: false,
    isMsme: false,
    isWomaniya: false,
    miiMinRequirement: "50% (Class-I)",
    minTurnoverRequirement: "₹2.0 Cr",
    minExperienceYears: 2,
    mandatoryDocs: ["PAN Card", "GSTIN Certificate", "UDYAM MSME Certificate"],
    boqItems: [{ item: "High-Yield Laser Toner Cartridges", qty: 500, unit: "Units" }]
  },

  // 6. PENDING VERIFICATION TENDERS (OCR & AI Extraction In-Progress)
  {
    id: "GEM/2026/B/894520",
    title: "Supply & Installation of 75-inch 4K Interactive Smart Classroom Panels",
    ministry: "Ministry of Education",
    department: "Kendriya Vidyalaya Sangathan (KVS)",
    category: "IT Hardware",
    estimatedValue: "₹92.0 Lakhs",
    emdAmount: "₹1.84 Lakhs",
    closingDate: "26 Sep 2026",
    status: "Pending Verification",
    riskCategory: "Pending Verification",
    riskLevel: "Under AI Evaluation",
    verificationStage: "Stage 5/8: Bid Requirement & CA UDIN Cross-Match",
    ocrProgress: 68,
    ocrConfidence: "98.2%",
    isMii: true,
    isStartup: true,
    isMsme: true,
    isWomaniya: false,
    initiativeTag: "Make in India & Startup Runway",
    miiMinRequirement: "50% (Class-I)",
    minTurnoverRequirement: "₹3.0 Cr",
    minExperienceYears: 3,
    mandatoryDocs: ["PAN Card", "GSTIN Certificate", "UDYAM MSME Certificate", "CA Audited Balance Sheet", "BIS Certification"],
    boqItems: [{ item: "75\" 4K UHD Interactive Flat Panels", qty: 60, unit: "Units" }]
  },
  {
    id: "GEM/2026/B/895102",
    title: "IoT-Enabled Smart Water Quality Monitoring Sensor Network",
    ministry: "Ministry of Jal Shakti",
    department: "National Water Mission",
    category: "Medical Equipment",
    estimatedValue: "₹64.0 Lakhs",
    emdAmount: "₹1.28 Lakhs",
    closingDate: "29 Sep 2026",
    status: "Pending Verification",
    riskCategory: "Pending Verification",
    riskLevel: "Under AI Evaluation",
    verificationStage: "Stage 3/8: OpenCV Document Forensics & Tampering Analysis",
    ocrProgress: 42,
    ocrConfidence: "96.4%",
    isMii: true,
    isStartup: true,
    isMsme: true,
    isWomaniya: false,
    initiativeTag: "Startup Runway (DPIIT)",
    miiMinRequirement: "50% (Class-I)",
    minTurnoverRequirement: "₹2.5 Cr",
    minExperienceYears: 2,
    mandatoryDocs: ["PAN Card", "GSTIN Certificate", "NABL Calibration Cert", "CA Audited Turnover"],
    boqItems: [{ item: "Multi-Parameter Real-Time Water Quality Sensors", qty: 120, unit: "Sensors" }]
  }
];

export const initialContracts = [
  {
    id: "PO-GEM-2026-9901",
    tenderId: "GEM/2026/B/891244",
    bidId: "BID-20495",
    vendorName: "Apex Supplies Ltd.",
    buyerOrg: "DRDO Research Labs, Min of Defence",
    value: 13800000,
    poDate: "06 Sep 2026",
    dscSigned: true,
    cracStatus: "Approved",
    cracDate: "06 Sep 2026, 03:30 PM",
    paymentStatus: "Payment Processing (Day 4/10)",
    paymentDueDate: "16 Sep 2026",
    disbursementRef: "PFMS-TXN-2026-0906-8812"
  },
  {
    id: "PO-GEM-2026-9874",
    tenderId: "GEM/2026/B/889105",
    bidId: "BID-20493",
    vendorName: "TechForce Pvt Ltd",
    buyerOrg: "Smart Cities Mission Directorate",
    value: 19500000,
    poDate: "04 Sep 2026",
    dscSigned: true,
    cracStatus: "Approved",
    cracDate: "05 Sep 2026, 11:00 AM",
    paymentStatus: "Settled (100%)",
    paymentDueDate: "14 Sep 2026",
    disbursementRef: "PFMS-TXN-2026-0905-1102"
  },
  {
    id: "PO-GEM-2026-9780",
    tenderId: "GEM/2026/B/892301",
    bidId: "BID-20497",
    vendorName: "Bharat Medical Gas Solutions",
    buyerOrg: "AIIMS New Delhi, Health Ministry",
    value: 11200000,
    poDate: "02 Sep 2026",
    dscSigned: true,
    cracStatus: "Pending Inspection",
    cracDate: "Under Delivery Inspection",
    paymentStatus: "Awaiting CRAC Clearance",
    paymentDueDate: "22 Sep 2026",
    disbursementRef: "Pending"
  },
  {
    id: "PO-GEM-2026-9652",
    tenderId: "GEM/2026/B/890412",
    bidId: "BID-20494",
    vendorName: "Balaji Enterprises",
    buyerOrg: "Northern Railway HQ, Ministry of Railways",
    value: 3850000,
    poDate: "29 Aug 2026",
    dscSigned: true,
    cracStatus: "Approved",
    cracDate: "01 Sep 2026",
    paymentStatus: "Settled (100%)",
    paymentDueDate: "10 Sep 2026",
    disbursementRef: "PFMS-TXN-2026-0829-4419"
  }
];


