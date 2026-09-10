import { initialBids, initialTenders, initialContracts, summaryMetrics } from '../data/bidsData';

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
      throw new Error(errMsg);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[GeM API] Network request to ${endpoint} failed:`, error.message);
    throw error;
  }
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
      console.error('[GeM API] Verification request failed:', err);
      throw err;
    }
  },

  async uploadDocument(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await request('/api/verify/upload', {
        method: 'POST',
        body: formData
      });
    } catch (err) {
      console.error('[GeM API] Upload service unavailable:', err);
      throw new Error("Upload service unavailable. Please ensure backend is running.");
    }
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
      return (data && data.length > 0) ? data : initialTenders;
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
    return await request('/api/tenders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
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
    return await request(`/api/contracts/${poId}/crac`, {
      method: 'PATCH',
      body: JSON.stringify({ cracStatus: 'Approved', inspectionNotes: notes })
    });
  },

  async processPayment(poId) {
    return await request(`/api/contracts/${poId}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus: 'Settled (100%)', disbursementRef: `PFMS-${Date.now()}` })
    });
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
    return await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    });
  },

  async register(userData) {
    return await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
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
    return await request(`/api/vendors/${vendorId}/verify-documents`, {
      method: 'POST',
      body: JSON.stringify({ documents })
    });
  },

  async issuePassport(vendorId) {
    return await request(`/api/vendors/${vendorId}/passport/issue`, {
      method: 'POST'
    });
  },

  async getPassport(passportId) {
    try {
      return await request(`/api/passport/${passportId}`);
    } catch {
      return null;
    }
  },

  async verifyPassport(passportId, body = {}) {
    return await request(`/api/passport/${passportId}/verify`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async revokePassport(passportId, reason = 'Administrative revocation') {
    return await request(`/api/passport/${passportId}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
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

