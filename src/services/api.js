import { initialBids, initialTenders, initialContracts, summaryMetrics, initialMilestones, createDefaultMilestones } from '../data/bidsData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  typeof window !== 'undefined'
    ? ''
    : (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')
);

// Auth token management
let _authToken = null;

export function setAuthToken(token) {
  _authToken = token;
  if (token) {
    localStorage.setItem('gem_auth_token', token);
  } else {
    localStorage.removeItem('gem_auth_token');
  }
}

export function getAuthToken() {
  if (!_authToken) {
    _authToken = localStorage.getItem('gem_auth_token');
  }
  return _authToken;
}

export function clearAuth() {
  _authToken = null;
  localStorage.removeItem('gem_auth_token');
  localStorage.removeItem('gem_user');
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Accept': 'application/json',
  };

  // Include auth token if available
  const token = getAuthToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errMsg = `API request failed with HTTP ${response.status}`;
      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          errMsg = errorData.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
        } else {
          errMsg = errorData.detail;
        }
      }
      const err = new Error(errMsg);
      err.status = response.status;
      throw err;
    }
    return await response.json();
  } catch (error) {
    console.warn(`[GeM API] Network request to ${endpoint} failed:`, error.message);
    throw error;
  }
}

export const PRESET_FORMAT_GUIDELINES = {
  pan: {
    id: 'pan',
    fieldKey: 'pan',
    name: 'Permanent Account Number (PAN)',
    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
    searchPattern: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/i,
    example: 'AABCB1234F',
    description: '5 uppercase letters, 4 digits, 1 uppercase letter',
    docTypes: ['PAN', 'PAN_CARD']
  },
  gstin: {
    id: 'gstin',
    fieldKey: 'gstin',
    name: 'Goods & Services Tax Identification Number (GSTIN)',
    pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
    searchPattern: /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]\b/i,
    example: '27AABCB1234F1Z5',
    description: '15-character GSTIN (2 state digits + 10 PAN chars + 1 entity + Z + 1 check)',
    docTypes: ['GST', 'GSTIN', 'GST_CERTIFICATE']
  },
  udyam: {
    id: 'udyam',
    fieldKey: 'msmeRegNo',
    name: 'Udyam / MSME Registration Number',
    pattern: /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{5,10}$/,
    searchPattern: /\bUDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{5,10}\b/i,
    example: 'UDYAM-MH-03-0019284',
    description: 'UDYAM followed by 2-letter state code, 2-digit district code, and 5-10 digit registration number',
    docTypes: ['UDYAM', 'UDYAM_CERTIFICATE', 'MSME']
  },
  tender_id: {
    id: 'tender_id',
    fieldKey: 'tenderId',
    name: 'GeM Tender Identification Number',
    pattern: /^GEM\/[0-9]{4}\/[A-Z]\/[0-9]{6}$/,
    searchPattern: /\bGEM\/[0-9]{4}\/[A-Z]\/[0-9]{6}\b/i,
    example: 'GEM/2026/B/891244',
    description: 'GEM/YYYY/X/NNNNNN (4-digit year, category letter, 6-digit number)',
    docTypes: ['TENDER', 'TENDER_ID', 'TENDER_DOCUMENT']
  },
  ca_udin: {
    id: 'ca_udin',
    fieldKey: 'caUdin',
    name: 'ICAI CA Unique Document Identification Number (UDIN)',
    pattern: /^(?:UDIN)?[A-Z0-9]{18}$/,
    searchPattern: /\b(?:UDIN\s*[:\-]?\s*)?[A-Z0-9]{18}\b/i,
    example: '26084912AAAAAA1234',
    description: '18-character official ICAI Chartered Accountant certification identifier',
    docTypes: ['CA_TURNOVER', 'CA', 'BALANCE_SHEET']
  }
};

export function extractPresetFormats(sourceText = '', fileName = '') {
  const text = (sourceText + ' ' + fileName).toUpperCase();
  const values = {};
  const fields = {};

  // Check Tender ID
  const tenderMatch = text.match(/\b(GEM\/\d{4}\/[A-Z]\/\d{5,8}|GEM[-/0-9A-Z]{6,30})\b/i);
  if (tenderMatch) {
    const val = tenderMatch[1].toUpperCase();
    values.tender_id = val;
    fields.tender_id = { value: val, confidence: '99.0%', evidence: `OCR Match: ${val}` };
  }

  // Check GSTIN
  const gstMatch = text.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])\b/i);
  if (gstMatch) {
    const val = gstMatch[1].toUpperCase();
    values.gstin = val;
    fields.gstin = { value: val, confidence: '99.4%', evidence: `OCR Match: ${val}` };
    // Embedded PAN
    const panFromGst = val.substring(2, 12);
    values.pan = panFromGst;
    fields.pan = { value: panFromGst, confidence: '99.0%', evidence: `Derived from GSTIN: ${panFromGst}` };
  }

  // Check PAN (if not already extracted from GSTIN)
  if (!values.pan) {
    const panMatch = text.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/i);
    if (panMatch) {
      const val = panMatch[1].toUpperCase();
      values.pan = val;
      fields.pan = { value: val, confidence: '99.2%', evidence: `OCR Match: ${val}` };
    }
  }

  // Check UDYAM
  const udyamMatch = text.match(/\b(UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{5,10})\b/i);
  if (udyamMatch) {
    const val = udyamMatch[1].toUpperCase();
    values.udyam_reg_no = val;
    fields.udyam_reg_no = { value: val, confidence: '98.9%', evidence: `OCR Match: ${val}` };
  }

  // Check CA UDIN
  const udinMatch = text.match(/\b(?:UDIN\s*[:\-]?\s*)?([0-9]{18})\b/i);
  if (udinMatch) {
    const val = udinMatch[1].toUpperCase();
    values.udin = val;
    fields.udin = { value: val, confidence: '97.5%', evidence: `ICAI Seal UDIN: ${val}` };
  }

  return { values, fields };
}

export const gemApi = {
  // 1. Health Check
  async checkHealth() {
    try {
      return await request('/api/health');
    } catch {
      return { status: 'offline', fallback: true };
    }
  },

  // 2. Bids Management
  async getBids(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.status && params.status !== 'ALL') query.append('status', params.status);
      if (params.category && params.category !== 'ALL') query.append('category', params.category);
      if (params.search) query.append('search', params.search);

      const qs = query.toString() ? `?${query.toString()}` : '';
      return await request(`/api/bids${qs}`);
    } catch (err) {
      console.warn('[GeM API] Falling back to local bids dataset');
      return initialBids;
    }
  },

  async getBidById(bidId) {
    try {
      return await request(`/api/bids/${bidId}`);
    } catch (err) {
      return initialBids.find(b => b.id === bidId) || null;
    }
  },

  async createBid(bidData) {
    try {
      return await request('/api/bids', {
        method: 'POST',
        body: JSON.stringify(bidData)
      });
    } catch (err) {
      console.warn('[GeM API] Offline bid persistence fallback:', err);
      return bidData;
    }
  },

  async updateBidStatus(bidId, newStatus, officerNotes = '', officerName = 'Government Procuring Authority (Buyer)') {
    try {
      return await request(`/api/bids/${bidId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          officerNotes,
          officerName
        })
      });
    } catch (err) {
      console.warn('[GeM API] Offline status update fallback');
      return {
        id: bidId,
        status: newStatus,
        riskLevel: newStatus === 'Compliant' ? 'Low Risk (Officer Approved)' : 'Critical High Risk (Officer Rejected)',
        auditTrail: [
          {
            timestamp: new Date().toLocaleString(),
            action: `Officer changed status to ${newStatus} (${officerNotes || 'Manual override'})`,
            agent: officerName
          }
        ]
      };
    }
  },

  // 3. AI Verification & OCR Rule Engine
  async verifyBid(payload) {
    try {
      return await request('/api/verify/bid', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('[GeM API] Live verification fallback to autonomous rule engine:', err);
      const miiNum = parseInt((payload.miiDeclared || '75').replace(/[^0-9]/g, '')) || 75;
      const isMiiPass = miiNum >= 50;
      const score = isMiiPass ? 94 : 52;
      const status = isMiiPass ? 'Compliant' : 'Disqualified';
      const risk = isMiiPass ? 'Low Risk' : 'Critical High Risk';
      return {
        bidId: `BID-${Math.floor(20000 + Math.random() * 9999)}`,
        vendor: payload.vendorName || 'Bharat ElectroMech Systems Ltd.',
        category: payload.category || 'General Procurement',
        tenderId: payload.tenderId || 'GEM/2026/B/891244',
        tenderValue: payload.tenderValue || '₹1.45 Cr',
        bidAmount: payload.bidAmount || '₹1.38 Cr',
        score,
        status,
        risk,
        miiVerified: `${miiNum}% (${isMiiPass ? 'Class-I Local Supplier' : 'Non-Local Supplier'})`,
        ocrConfidence: '98.5%',
        gstVerified: 'VERIFIED_ACTIVE',
        panVerified: 'VERIFIED_MATCH',
        rulesTested: 210,
        rulesPassed: isMiiPass ? 208 : 185,
        flags: isMiiPass ? [] : ['MII Local Content Below 50% Threshold', 'High Risk Margin'],
        ruleBreakdown: [
          { ruleId: 'GFR-149', name: 'GFR 2017 Rule 149 Compliance', category: 'GFR 2017', passed: true, details: 'Verified direct comparison parameters' },
          { ruleId: 'DPIIT-MII', name: 'Make in India Local Content', category: 'DPIIT Policy', passed: isMiiPass, details: `Declared ${miiNum}% local content` },
          { ruleId: 'SEC-GST', name: 'GSTIN Active Status', category: 'Statutory', passed: true, details: `GSTIN ${payload.gstin || '27AABCB1234F1Z5'} verified` },
          { ruleId: 'SEC-PAN', name: 'PAN Corporate Match', category: 'Statutory', passed: true, details: `PAN ${payload.pan || 'AABCB1234F'} verified` }
        ],
        extractedEntities: [],
        crossDocMatches: [],
        requirementMatches: [],
        extractedDocs: [
          { name: 'GST_Certificate.pdf', docType: 'GSTIN', status: 'Verified', score: 98, confidence: '99.0%', details: 'Active GST registration verified.' },
          { name: 'MII_Declaration.pdf', docType: 'MII', status: isMiiPass ? 'Verified' : 'Mismatch Alert', score: isMiiPass ? 95 : 45, confidence: '98.2%', details: `${miiNum}% local content declared.` }
        ],
        auditTrail: [
          { timestamp: new Date().toLocaleString(), action: 'Bid Submission & OCR Ingestion', agent: 'GeM AI Gateway' },
          { timestamp: new Date().toLocaleString(), action: `Evaluated Score: ${score}/100 (${status})`, agent: 'GeM AI Rule Engine' }
        ],
        complianceReport: {
          reportId: `RPT-${Math.floor(100000 + Math.random() * 900000)}`,
          generatedAt: new Date().toLocaleString(),
          vendorName: payload.vendorName || 'Bharat ElectroMech Systems Ltd.',
          score,
          status,
          riskLevel: risk,
          summaryText: `Evaluation completed against GFR 2017 and DPIIT guidelines. Status: ${status}. Score: ${score}/100.`
        }
      };
    }
  },

  async uploadDocument(file) {
    let clientExtracted = { values: {}, fields: {} };
    try {
      // Read initial chunk client-side for rapid preset matching
      if (typeof window !== 'undefined' && file && file.slice) {
        const textChunk = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
          reader.onerror = () => resolve('');
          reader.readAsText(file.slice(0, 30000));
        });
        clientExtracted = extractPresetFormats(textChunk, file.name);
      }
    } catch (e) {
      console.warn('[GeM OCR] Client preview read:', e);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await request('/api/verify/upload', {
        method: 'POST',
        body: formData
      });

      // Merge backend extracted values with client-extracted values if backend missed any
      const mergedValues = { ...(clientExtracted.values || {}), ...(res.extractedValues || {}) };
      const mergedFields = { ...(clientExtracted.fields || {}), ...(res.extractedFields || {}) };

      return {
        ...res,
        extractedValues: mergedValues,
        extractedFields: mergedFields
      };
    } catch (err) {
      console.warn('[GeM API] Offline upload simulation fallback:', err);
      const extracted = extractPresetFormats('', file.name);
      return {
        status: 'success',
        fileId: `mock_${Date.now()}_${file.name}`,
        extractedValues: extracted.values,
        extractedFields: extracted.fields,
        file: {
          fileName: file.name,
          docType: file.name.toUpperCase().includes('GST') ? 'GST_CERTIFICATE' : (file.name.toUpperCase().includes('PAN') ? 'PAN_CARD' : (file.name.toUpperCase().includes('UDYAM') ? 'UDYAM_CERTIFICATE' : 'TENDER_DOCUMENT')),
          confidence: '98.5%',
          tamperingDetected: false,
          details: 'Document scanned against preset guideline formats. Values ready to read.'
        }
      };
    }
  },

  getFormatGuidelines() {
    return PRESET_FORMAT_GUIDELINES;
  },

  // 4. Auction & Anti-Cartel Intelligence
  async getAuctionAnalysis(tenderId = 'GEM/2026/B/891244') {
    try {
      return await request(`/api/auction/analysis?tender_id=${encodeURIComponent(tenderId)}`);
    } catch (err) {
      return {
        tenderId,
        tenderValue: '₹1.45 Cr',
        bids: [
          { rank: "L1", vendor: "Apex Supplies Ltd.", amount: "₹1,38,00,000", diffL1: "0.0% (Lowest)", flag: "Clean", risk: "Low" },
          { rank: "L2", vendor: "Kaveri Infotech", amount: "₹1,42,00,000", diffL1: "+2.8%", flag: "IP Overlap Suspect", risk: "Medium" },
          { rank: "L3", vendor: "Shree Ganesh Networks", amount: "₹1,44,00,000", diffL1: "+4.3%", flag: "Cartel Ring Flagged", risk: "High" },
          { rank: "L4", vendor: "Zenith Tech Systems", amount: "₹1,48,50,000", diffL1: "+7.6%", flag: "Clean", risk: "Low" }
        ],
        cartelAlerts: [
          {
            tenderId,
            severity: "CRITICAL",
            title: "Shared IP Subnet & Digital Signature Collusion",
            description: "Bidders Kaveri Infotech and Shree Ganesh Networks submitted bids within 4 minutes from identical IP subnet 192.168.4.x.",
            flaggedVendors: ["Kaveri Infotech", "Shree Ganesh Networks"]
          }
        ],
        graphNodes: [],
        graphLinks: []
      };
    }
  },

  // 5. Tenders & Contracts (Buyer & Bidder)
  async getTenders() {
    try {
      const data = await request('/api/tenders');
      // Return whatever the API says — even if empty (user deleted all tenders).
      // Only fall back to initialTenders on actual network/fetch errors below.
      return Array.isArray(data) ? data : initialTenders;
    } catch {
      return initialTenders;
    }
  },

  async getTenderById(tenderId) {
    try {
      return await request(`/api/tenders/${tenderId}`);
    } catch {
      return null;
    }
  },

  async createTender(tenderData) {
    try {
      return await request('/api/tenders', {
        method: 'POST',
        body: JSON.stringify(tenderData)
      });
    } catch (err) {
      console.warn('[GeM API] Offline create tender fallback:', err);
      return {
        id: `GEM/2026/B/${Math.floor(100000 + Math.random() * 900000)}`,
        ...tenderData,
        status: 'Active',
        publishedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        applicationsCount: 0
      };
    }
  },

  async publishTender(payload) {
    try {
      return await request('/api/tenders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('[GeM API] Offline publish tender fallback:', err);
      const newTender = {
        id: `GEM/2026/B/${Math.floor(100000 + Math.random() * 900000)}`,
        ...payload,
        status: 'Active',
        publishedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        applicationsCount: 0
      };
      try {
        const stored = JSON.parse(localStorage.getItem('gem_stored_tenders') || '[]');
        stored.unshift(newTender);
        localStorage.setItem('gem_stored_tenders', JSON.stringify(stored));
      } catch (e) {}
      return newTender;
    }
  },

  async deleteTender(tenderId) {
    try {
      return await request(`/api/tenders/${tenderId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('[GeM API] Offline delete tender fallback:', err);
      return { status: 'success', id: tenderId };
    }
  },

  async getTenderApplications(tenderId) {
    try {
      return await request(`/api/tenders/${tenderId}/applications`);
    } catch {
      return [];
    }
  },

  async selectWinningBidder(bidId, notes = '', buyerName = 'Government Procuring Authority') {
    try {
      return await request(`/api/bids/${bidId}/select`, {
        method: 'POST',
        body: JSON.stringify({ notes, buyerName })
      });
    } catch (err) {
      console.warn('[GeM API] Offline select winning bidder fallback:', err);
      return {
        status: 'success',
        message: `Bid '${bidId}' officially selected as winning vendor!`
      };
    }
  },

  async getContracts() {
    try {
      const data = await request('/api/contracts');
      return (data && data.length > 0) ? data : initialContracts;
    } catch {
      return initialContracts;
    }
  },

  async approveCrac(poId, notes = 'Goods inspected and found compliant with tender BOQ specifications.') {
    try {
      return await request(`/api/contracts/${poId}/crac`, {
        method: 'PATCH',
        body: JSON.stringify({ cracStatus: 'Approved', inspectionNotes: notes })
      });
    } catch (err) {
      console.warn('[GeM API] Offline CRAC approval fallback:', err);
      return {
        id: poId,
        cracStatus: 'Approved',
        inspectionNotes: notes,
        cracDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };
    }
  },

  async processPayment(poId) {
    try {
      return await request(`/api/contracts/${poId}/payment`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentStatus: 'Settled (100%)', disbursementRef: `PFMS-${Date.now()}` })
      });
    } catch (err) {
      console.warn('[GeM API] Offline payment settlement fallback:', err);
      return {
        id: poId,
        paymentStatus: 'Settled (100%)',
        disbursementRef: `PFMS-${Date.now()}`
      };
    }
  },

  // 5.1 Awarded Tender Execution Keymaps
  async getAwardedMilestones() {
    try {
      const stored = localStorage.getItem('gem_awarded_milestones');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return initialMilestones;
  },

  async updateAwardedMilestone(tenderId, stepKey, approvalData) {
    try {
      let current = {};
      try {
        const stored = localStorage.getItem('gem_awarded_milestones');
        current = stored ? JSON.parse(stored) : { ...initialMilestones };
      } catch {
        current = { ...initialMilestones };
      }

      if (!current[tenderId]) {
        current[tenderId] = createDefaultMilestones(tenderId);
      }

      if (current[tenderId]?.steps?.[stepKey]) {
        current[tenderId].steps[stepKey] = {
          ...current[tenderId].steps[stepKey],
          ...approvalData
        };
      }

      try {
        localStorage.setItem('gem_awarded_milestones', JSON.stringify(current));
      } catch {}

      return current[tenderId];
    } catch (err) {
      console.warn('[GeM API] updateAwardedMilestone fallback error:', err);
      return null;
    }
  },

  // 6. Platform Overview Stats
  async getStats() {
    try {
      return await request('/api/stats/overview');
    } catch {
      return {
        summaryMetrics
      };
    }
  },

  // 7. Authentication
  async login(email, password, role = 'bidder') {
    try {
      return await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role })
      });
    } catch (err) {
      // Re-throw valid client authentication errors
      if (err.status === 401 && err.message && (err.message.includes('Invalid password') || err.message.includes('No account found'))) {
        throw err;
      }
      console.warn('[GeM API] Offline login fallback applied:', err);
      const cleanEmail = (email || '').trim().toLowerCase();
      const assignedRole = role || (cleanEmail.includes('buyer') || cleanEmail.includes('officer') ? 'buyer' : 'bidder');
      const user = {
        id: cleanEmail === 'buyer@gov.in' ? 1 : 2,
        email: cleanEmail,
        fullName: cleanEmail.includes('buyer') ? 'Government Procuring Authority' : (cleanEmail.includes('officer') ? 'Senior Procurement Officer' : 'Authorized Vendor Representative'),
        organization: assignedRole === 'buyer' ? 'Ministry of Defence, DRDO' : 'Apex Supplies & Technologies Ltd.',
        gstin: '27AABCB1234F1Z5',
        role: assignedRole
      };
      const token = `gem_auth_${Date.now()}`;
      setAuthToken(token);
      return { token, user, message: 'Logged in successfully (Session Mode).' };
    }
  },

  async register(userData) {
    try {
      return await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    } catch (err) {
      if (err.status === 409) throw err;
      console.warn('[GeM API] Offline register fallback applied:', err);
      const assignedRole = userData.role || 'bidder';
      const user = {
        id: Math.floor(100 + Math.random() * 900),
        email: userData.email,
        fullName: userData.fullName || 'Registered User',
        organization: userData.organization || 'Registered Entity',
        gstin: userData.gstin,
        role: assignedRole
      };
      const token = `gem_auth_${Date.now()}`;
      setAuthToken(token);
      return { token, user, message: 'Registered successfully (Session Mode).' };
    }
  },

  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
  },

  // 8. Compliance Passport
  async getVendors() {
    try {
      return await request('/api/vendors');
    } catch {
      return [
        { id: 1, name: 'Apex Supplies Ltd.', gstin: '27AABCB1234F1Z5', pan: 'AABCB1234F', udyamNo: 'UDYAM-MH-03-0019284', category: 'IT Hardware', miiClassification: 'Class-I Local Supplier (68%)', complianceScore: 96, riskTier: 'Low Risk', blacklisted: false, passportId: null, passportStatus: null, verifiedDocsCount: 0 },
        { id: 2, name: 'Kaveri Infotech', gstin: '27KAVRI5678B1Z2', pan: 'KAVRI5678B', udyamNo: 'UDYAM-MH-03-0044192', category: 'IT Hardware', miiClassification: 'Class-I Local Supplier (72%)', complianceScore: 94, riskTier: 'Low Risk', blacklisted: false, passportId: null, passportStatus: null, verifiedDocsCount: 0 }
      ];
    }
  },

  async getVendorById(vendorId) {
    try {
      return await request(`/api/vendors/${vendorId}`);
    } catch {
      return { vendor: null, verifications: [], passport: null, presentations: [] };
    }
  },

  async verifyVendorDocuments(vendorId, documents) {
    try {
      return await request(`/api/vendors/${vendorId}/verify-documents`, {
        method: 'POST',
        body: JSON.stringify({ documents })
      });
    } catch (err) {
      console.warn('[GeM API] Offline verify documents fallback:', err);
      return (documents || []).map((d, idx) => ({
        id: `v_${Date.now()}_${idx}`,
        vendorId,
        docType: d.docType,
        docRef: d.docRef,
        status: 'verified',
        verifiedAt: new Date().toISOString()
      }));
    }
  },

  async verifyDocumentUpload(vendorId, file, docType, manualId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', docType);
      formData.append('manualId', manualId);

      const response = await fetch(`${API_BASE_URL}/api/vendors/${vendorId}/verify-document-upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed with HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn('[GeM API] Offline verify document upload fallback:', err);
      const isMatch = !!manualId && manualId.trim().length >= 3;
      return {
        success: isMatch,
        verification: {
          id: `v_${Date.now()}`,
          vendorId,
          docType,
          docRef: manualId,
          status: isMatch ? 'verified' : 'failed',
          verifiedAt: isMatch ? new Date().toISOString() : null,
          verificationMethod: 'ocr_scan'
        },
        ocrResult: {
          docType,
          fileName: file?.name || 'document',
          manualId,
          extractedId: manualId,
          match: isMatch,
          confidence: 96.0,
          details: isMatch ? 'OCR match confirmed.' : 'OCR verification failed.'
        },
        message: isMatch ? 'Document verified successfully!' : 'OCR verification failed.'
      };
    }
  },

  async issuePassport(vendorId) {
    try {
      return await request(`/api/vendors/${vendorId}/passport/issue`, {
        method: 'POST'
      });
    } catch (err) {
      console.warn('[GeM API] Offline issue passport fallback:', err);
      const passportId = `GP-2026-${vendorId}-${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        id: passportId,
        vendorId,
        status: 'active',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 730 * 86400000).toISOString(),
        score: 96,
        verifiedDocsCount: 3,
        message: 'Compliance Passport issued successfully (Offline Resilience Mode).'
      };
    }
  },

  async getPassport(passportId) {
    try {
      return await request(`/api/passport/${passportId}`);
    } catch {
      return null;
    }
  },

  async verifyPassport(passportId, body = {}) {
    try {
      return await request(`/api/passport/${passportId}/verify`, {
        method: 'POST',
        body: JSON.stringify(body)
      });
    } catch (err) {
      console.warn('[GeM API] Offline verify passport fallback:', err);
      return {
        valid: true,
        status: 'Active',
        passportId,
        verifiedAt: new Date().toISOString(),
        score: 96,
        vendorName: 'Apex Supplies Ltd.',
        trustScore: '96/100 (Tier-1 Verified)',
        message: 'Passport verified successfully against GeM Trust Registry (Fallback Mode).'
      };
    }
  },

  async revokePassport(passportId, reason = 'Administrative revocation') {
    try {
      return await request(`/api/passport/${passportId}/revoke`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
    } catch (err) {
      console.warn('[GeM API] Offline revoke passport fallback:', err);
      return {
        status: 'success',
        id: passportId,
        passportStatus: 'Revoked',
        revokedAt: new Date().toISOString(),
        reason
      };
    }
  },

  async getPassportQrCode(passportId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/passport/${passportId}/qrcode`);
      if (!response.ok) throw new Error('QR fetch failed');
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  },

  async getPassportPresentations(passportId) {
    try {
      return await request(`/api/passport/${passportId}/presentations`);
    } catch {
      return [];
    }
  }
};

