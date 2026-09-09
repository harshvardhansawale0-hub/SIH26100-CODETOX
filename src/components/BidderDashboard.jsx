import React, { useState, useMemo } from 'react';
import {
  Building2, Search, Filter, ShieldCheck, CheckCircle2, AlertTriangle,
  XCircle, Award, FileText, ArrowRight, UploadCloud, Eye, RefreshCw,
  Layers, Clock, AlertCircle, CheckCircle, ChevronRight, X, Cpu,
  Sparkles, ExternalLink, ShieldAlert, BarChart3, HelpCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function BidderDashboard({
  tenders = [],
  bids = [],
  onOpenVerifierWithTender,
  onSelectBid,
  currentUser = null
}) {
  const { t } = useLanguage();

  // Primary Selection & Filtering States
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('ALL'); // 'ALL', 'ACTIVE', 'AT_RISK', 'NON_COMPLIANT', 'PENDING', 'MY_SUBMISSIONS'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [inspectingTender, setInspectingTender] = useState(null);

  // Categorized Tenders Counts
  const counts = useMemo(() => {
    const activeList = tenders.filter(t => t.riskCategory === 'Active' || (!t.riskCategory && t.status === 'Active'));
    const atRiskList = tenders.filter(t => t.riskCategory === 'At Risk' || t.riskLevel?.toLowerCase().includes('risk') || t.status === 'Flagged');
    const nonCompliantList = tenders.filter(t => t.riskCategory === 'Non-Compliant' || t.status === 'Non-Compliant' || t.status === 'Rejected');
    const pendingList = tenders.filter(t => t.riskCategory === 'Pending Verification' || t.status === 'Pending Verification');
    const mySubmissions = bids.length;

    return {
      all: tenders.length,
      active: activeList.length,
      atRisk: atRiskList.length,
      nonCompliant: nonCompliantList.length,
      pending: pendingList.length,
      mySubmissions
    };
  }, [tenders, bids]);

  // Filtered Tenders based on Tab, Search and Category
  const filteredTenders = useMemo(() => {
    return tenders.filter((t) => {
      // 1. Tab filter
      let matchTab = true;
      if (selectedCategoryTab === 'ACTIVE') {
        matchTab = t.riskCategory === 'Active' || (!t.riskCategory && t.status === 'Active');
      } else if (selectedCategoryTab === 'AT_RISK') {
        matchTab = t.riskCategory === 'At Risk' || t.riskLevel?.toLowerCase().includes('risk') || t.status === 'Flagged';
      } else if (selectedCategoryTab === 'NON_COMPLIANT') {
        matchTab = t.riskCategory === 'Non-Compliant' || t.status === 'Non-Compliant' || t.status === 'Rejected';
      } else if (selectedCategoryTab === 'PENDING') {
        matchTab = t.riskCategory === 'Pending Verification' || t.status === 'Pending Verification';
      }

      // 2. Search filter
      const matchSearch =
        (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.ministry || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.department || '').toLowerCase().includes(searchQuery.toLowerCase());

      // 3. Category filter
      const matchCat = categoryFilter === 'ALL' || t.category === categoryFilter;

      return matchTab && matchSearch && matchCat;
    });
  }, [tenders, selectedCategoryTab, searchQuery, categoryFilter]);

  // Filtered My Bids
  const filteredMyBids = useMemo(() => {
    return bids.filter((b) => {
      const matchSearch =
        (b.vendor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.tenderId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || b.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [bids, searchQuery, categoryFilter]);

  const getTenderSubmission = (tenderId) => {
    return bids.find(b => b.tenderId === tenderId);
  };

  return (
    <div style={{ backgroundColor: '#071526', minHeight: '88vh', padding: '2.5rem 1.5rem', color: '#ffffff' }}>
      <div className="container-custom">
        {/* Top Header & Vendor Profile Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '0.75rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                BIDDER & SELLER PORTAL
              </span>
              <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: '600' }}>
                Vendor / Supplier Enterprise
              </span>
              {currentUser && (
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid #1e385b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Building2 size={12} style={{ color: '#34d399' }} />
                  <span>Authenticated: <strong style={{ color: '#34d399' }}>{currentUser.fullName}</strong> ({currentUser.organization || 'Vendor Enterprise'})</span>
                </span>
              )}
            </div>
            <h1 className="serif-heading" style={{ fontSize: '2.2rem', color: '#ffffff', margin: 0 }}>
              {t('bidderPortalTitle') || 'Tender Selection & AI Document Verification'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '0.3rem', maxWidth: '850px' }}>
              {t('bidderPortalDesc') || 'Select published government tenders and join active bidding. Participation strictly requires autonomous 8-stage AI document verification (PAN, GSTIN, UDYAM MSME, CA Turnover Statement & Make-in-India declarations).'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={() => onOpenVerifierWithTender(tenders[0] || null)}
              style={{
                padding: '0.7rem 1.35rem',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.88rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <Cpu size={17} />
              <span>Launch AI Document Verifier Sandbox</span>
            </button>
          </div>
        </div>

        {/* 4 Core Feature KPI Filter Cards (Requested 1. Active, 2. At Risk, 3. Non-Compliant, 4. Pending Verification) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {/* Card 1: 1. ACTIVE TENDER */}
          <div
            onClick={() => setSelectedCategoryTab('ACTIVE')}
            style={{
              backgroundColor: '#0c1f36',
              border: selectedCategoryTab === 'ACTIVE' ? '2px solid #10b981' : '1px solid #1e385b',
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedCategoryTab === 'ACTIVE' ? '0 4px 20px rgba(16, 185, 129, 0.25)' : 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('activeTendersTab') || '1. Active Tenders'}
                </span>
              </div>
              <CheckCircle2 size={18} color="#34d399" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff', lineHeight: 1.1 }}>
              {counts.active}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.3rem' }}>
              Open & ready for AI bidding
            </span>
          </div>

          {/* Card 2: 2. AT RISK TENDER */}
          <div
            onClick={() => setSelectedCategoryTab('AT_RISK')}
            style={{
              backgroundColor: '#0c1f36',
              border: selectedCategoryTab === 'AT_RISK' ? '2px solid #f59e0b' : '1px solid #1e385b',
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedCategoryTab === 'AT_RISK' ? '0 4px 20px rgba(245, 158, 11, 0.25)' : 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('atRiskTendersTab') || '2. At Risk Tenders'}
                </span>
              </div>
              <AlertTriangle size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff', lineHeight: 1.1 }}>
              {counts.atRisk}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24', display: 'block', marginTop: '0.3rem' }}>
              Cartel alert / High scrutiny
            </span>
          </div>

          {/* Card 3: 3. NON-COMPLIANT TENDER */}
          <div
            onClick={() => setSelectedCategoryTab('NON_COMPLIANT')}
            style={{
              backgroundColor: '#0c1f36',
              border: selectedCategoryTab === 'NON_COMPLIANT' ? '2px solid #ef4444' : '1px solid #1e385b',
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedCategoryTab === 'NON_COMPLIANT' ? '0 4px 20px rgba(239, 68, 68, 0.25)' : 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('nonCompliantTab') || '3. Non-Compliant'}
                </span>
              </div>
              <XCircle size={18} color="#ef4444" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff', lineHeight: 1.1 }}>
              {counts.nonCompliant}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#f87171', display: 'block', marginTop: '0.3rem' }}>
              Statutory failed criteria
            </span>
          </div>

          {/* Card 4: 4. PENDING VERIFICATION */}
          <div
            onClick={() => setSelectedCategoryTab('PENDING')}
            style={{
              backgroundColor: '#0c1f36',
              border: selectedCategoryTab === 'PENDING' ? '2px solid #38bdf8' : '1px solid #1e385b',
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedCategoryTab === 'PENDING' ? '0 4px 20px rgba(56, 189, 248, 0.25)' : 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('pendingVerificationTab') || '4. Pending Verification'}
                </span>
              </div>
              <Clock size={18} color="#38bdf8" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff', lineHeight: 1.1 }}>
              {counts.pending}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'block', marginTop: '0.3rem' }}>
              8-Stage AI OCR in-progress
            </span>
          </div>
        </div>

        {/* Tab Selection Filter Bar (Tender Selection Page vs My Submissions) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #1e385b', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategoryTab('ALL')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: selectedCategoryTab === 'ALL' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategoryTab === 'ALL' ? '#ffffff' : '#94a3b8',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <FileText size={15} /> {t('allTenders') || 'All Tenders'} ({counts.all})
            </button>

            <button
              onClick={() => setSelectedCategoryTab('ACTIVE')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: selectedCategoryTab === 'ACTIVE' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategoryTab === 'ACTIVE' ? '#ffffff' : '#34d399',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              🟢 {t('activeTendersTab') || '1. Active'} ({counts.active})
            </button>

            <button
              onClick={() => setSelectedCategoryTab('AT_RISK')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: selectedCategoryTab === 'AT_RISK' ? '#f59e0b' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategoryTab === 'AT_RISK' ? '#000000' : '#fbbf24',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              ⚠️ {t('atRiskTendersTab') || '2. At Risk'} ({counts.atRisk})
            </button>

            <button
              onClick={() => setSelectedCategoryTab('NON_COMPLIANT')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: selectedCategoryTab === 'NON_COMPLIANT' ? '#ef4444' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategoryTab === 'NON_COMPLIANT' ? '#ffffff' : '#f87171',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              🔴 {t('nonCompliantTab') || '3. Non-Compliant'} ({counts.nonCompliant})
            </button>

            <button
              onClick={() => setSelectedCategoryTab('PENDING')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: selectedCategoryTab === 'PENDING' ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategoryTab === 'PENDING' ? '#ffffff' : '#38bdf8',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              ⏳ {t('pendingVerificationTab') || '4. Pending Verification'} ({counts.pending})
            </button>

            <button
              onClick={() => setSelectedCategoryTab('MY_SUBMISSIONS')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: selectedCategoryTab === 'MY_SUBMISSIONS' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategoryTab === 'MY_SUBMISSIONS' ? '#ffffff' : '#c084fc',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <UploadCloud size={15} /> {t('mySubmittedBidsTab') || 'My Submitted Bids'} ({counts.mySubmissions})
            </button>
          </div>

          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Showing: <strong>{selectedCategoryTab === 'MY_SUBMISSIONS' ? filteredMyBids.length : filteredTenders.length} entries</strong>
          </span>
        </div>

        {/* Search & Category Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: '#0c1f36', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #1e385b', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search tenders by keyword, tender ID, ministry, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#071526',
                border: '1px solid #1e385b',
                color: '#ffffff',
                padding: '0.45rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                backgroundColor: '#071526',
                border: '1px solid #1e385b',
                color: '#ffffff',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.83rem'
              }}
            >
              <option value="ALL">All Product & Service Categories</option>
              <option value="IT Hardware">IT Hardware & Workstations</option>
              <option value="Software">Software & Cloud Solutions</option>
              <option value="Furniture">Furniture & Modular Workstations</option>
              <option value="Medical Equipment">Medical Equipment & Health</option>
              <option value="Heavy Electricals">Heavy Electricals & Power</option>
              <option value="Stationery">Stationery & Office Supplies</option>
            </select>
          </div>
        </div>

        {/* MAIN HOMEPAGE VIEW: TENDER DISCOVERY & SELECTION PAGE */}
        {selectedCategoryTab !== 'MY_SUBMISSIONS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredTenders.length === 0 ? (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center', backgroundColor: '#0c1f36', borderRadius: '12px', border: '1px solid #1e385b' }}>
                <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '0.5rem' }}>No tenders found matching the active filter.</p>
                <button
                  onClick={() => { setSelectedCategoryTab('ALL'); setSearchQuery(''); setCategoryFilter('ALL'); }}
                  style={{ padding: '0.45rem 1rem', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredTenders.map((tender) => {
                const isAtRisk = tender.riskCategory === 'At Risk';
                const isNonCompliant = tender.riskCategory === 'Non-Compliant';
                const isPending = tender.riskCategory === 'Pending Verification';
                const isActive = !isAtRisk && !isNonCompliant && !isPending;

                const existingSubmission = getTenderSubmission(tender.id);

                return (
                  <div
                    key={tender.id}
                    style={{
                      backgroundColor: '#0c1f36',
                      border: isNonCompliant
                        ? '1px solid rgba(239, 68, 68, 0.4)'
                        : (isAtRisk ? '1px solid rgba(245, 158, 11, 0.4)' : (isPending ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid #1e385b')),
                      borderRadius: '12px',
                      padding: '1.4rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.1rem',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Top Row: Tender ID, Badges & Estimated Value */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '800' }}>
                            {tender.id}
                          </span>
                          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: '#1e385b', color: '#cbd5e1', fontWeight: '600' }}>
                            {tender.category}
                          </span>

                          {/* 4 Category Badges */}
                          {isActive && (
                            <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: '800', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                              🟢 1. ACTIVE TENDER
                            </span>
                          )}
                          {isAtRisk && (
                            <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontWeight: '800', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                              ⚠️ 2. AT RISK TENDER
                            </span>
                          )}
                          {isNonCompliant && (
                            <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: '800', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
                              🔴 3. NON-COMPLIANT
                            </span>
                          )}
                          {isPending && (
                            <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem', borderRadius: '4px', backgroundColor: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', fontWeight: '800', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                              ⏳ 4. PENDING VERIFICATION
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0, fontWeight: '800', lineHeight: 1.3 }}>
                          {tender.title}
                        </h3>
                        <span style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>
                          🏛️ {tender.ministry} • {tender.department}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right', minWidth: '150px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                          Tender Estimated Value
                        </span>
                        <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#38bdf8' }}>
                          {tender.estimatedValue}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#f59e0b', display: 'block', marginTop: '2px' }}>
                          ⏰ Closes: <strong>{tender.closingDate}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Special Risk Alert / Non-Compliance Warning Box */}
                    {isAtRisk && tender.riskAlert && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.6rem',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '8px',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.82rem',
                        color: '#fbbf24'
                      }}>
                        <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Anti-Cartel & Scrutiny Alert:</strong> {tender.riskAlert}
                        </div>
                      </div>
                    )}

                    {isNonCompliant && tender.disqualificationReason && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.6rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.82rem',
                        color: '#f87171'
                      }}>
                        <XCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Statutory Disqualification Warning:</strong> {tender.disqualificationReason}
                          {tender.failedRules && (
                            <ul style={{ margin: '0.3rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.78rem' }}>
                              {tender.failedRules.map((rule, idx) => (
                                <li key={idx}>{rule}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}

                    {isPending && (
                      <div style={{
                        backgroundColor: 'rgba(2, 132, 199, 0.1)',
                        border: '1px solid rgba(2, 132, 199, 0.3)',
                        borderRadius: '8px',
                        padding: '0.75rem 0.85rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                          <span style={{ color: '#38bdf8', fontWeight: '700' }}>
                            ⚙️ AI Verification Progress: {tender.verificationStage || 'Running OCR & Rule Engine'}
                          </span>
                          <span style={{ color: '#38bdf8', fontWeight: '800' }}>
                            {tender.ocrProgress || 55}% (Confidence: {tender.ocrConfidence || '97.8%'})
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#071526', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${tender.ocrProgress || 55}%`,
                              height: '100%',
                              backgroundColor: '#38bdf8',
                              transition: 'width 0.4s ease'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Statutory Criteria Grid */}
                    <div style={{
                      backgroundColor: '#071526',
                      border: '1px solid #162c47',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                      gap: '0.75rem',
                      fontSize: '0.82rem'
                    }}>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                          Mandatory Local Content (MII):
                        </span>
                        <strong style={{ color: '#34d399' }}>{tender.miiMinRequirement || '50% (Class-I)'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                          Min Turnover Requirement:
                        </span>
                        <strong style={{ color: '#e2e8f0' }}>{tender.minTurnoverRequirement || '₹2.0 Cr'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                          Min Experience:
                        </span>
                        <strong style={{ color: '#e2e8f0' }}>{tender.minExperienceYears || 3} Years</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                          EMD Amount:
                        </span>
                        <strong style={{ color: '#e2e8f0' }}>{tender.emdAmount}</strong>
                      </div>
                    </div>

                    {/* Required Documents Checklist */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#94a3b8' }}>
                      <span style={{ color: '#cbd5e1', fontWeight: '700' }}>Required AI Verification Documents:</span>
                      {(tender.mandatoryDocs || ["PAN Card", "GSTIN Certificate", "UDYAM MSME", "CA Audited Turnover", "Make in India Declaration"]).map((doc, idx) => (
                        <span key={idx} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #1e385b', color: '#cbd5e1' }}>
                          ✓ {doc}
                        </span>
                      ))}
                    </div>

                    {/* Bottom Actions Row: Joining Bidding (Document Verification Gate) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #162c47', paddingTop: '0.85rem' }}>
                      <button
                        onClick={() => setInspectingTender(tender)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#38bdf8',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: 0
                        }}
                      >
                        <Eye size={14} /> Inspect Full Criteria & BOQ
                      </button>

                      {existingSubmission ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={16} /> Verified Proposal Submitted (Score: {existingSubmission.score}/100)
                          </span>
                          <button
                            onClick={() => onSelectBid(existingSubmission)}
                            style={{
                              padding: '0.45rem 0.85rem',
                              backgroundColor: '#071526',
                              border: '1px solid #10b981',
                              color: '#34d399',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            View AI Dossier
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onOpenVerifierWithTender(tender)}
                          style={{
                            padding: '0.65rem 1.3rem',
                            backgroundColor: isNonCompliant ? '#ef4444' : (isAtRisk ? '#f59e0b' : '#10b981'),
                            color: isAtRisk ? '#000000' : '#ffffff',
                            fontWeight: '800',
                            fontSize: '0.88rem',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            boxShadow: isNonCompliant
                              ? '0 2px 10px rgba(239, 68, 68, 0.4)'
                              : (isAtRisk ? '0 2px 10px rgba(245, 158, 11, 0.4)' : '0 2px 10px rgba(16, 185, 129, 0.4)'),
                            transition: 'all 0.2s ease'
                          }}
                          title="Mandatory step: Verify statutory documents via AI before joining bidding"
                        >
                          <UploadCloud size={16} />
                          <span>
                            {isNonCompliant
                              ? 'Inspect Discrepancies & Re-Verify via AI'
                              : (isPending ? 'Check AI Verification Pipeline (Join Bid)' : '⚡ Join Bidding (Verify Documents via AI)')}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* VIEW 2: MY SUBMITTED BID APPLICATIONS & AI DOSSIERS */}
        {selectedCategoryTab === 'MY_SUBMISSIONS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredMyBids.length === 0 ? (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center', backgroundColor: '#0c1f36', borderRadius: '12px', border: '1px solid #1e385b' }}>
                <p style={{ color: '#94a3b8', fontSize: '1rem' }}>You haven't submitted any verified bid applications yet.</p>
                <button
                  onClick={() => setSelectedCategoryTab('ACTIVE')}
                  style={{ marginTop: '0.75rem', padding: '0.55rem 1.25rem', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  Browse Active Tenders & Join Bidding
                </button>
              </div>
            ) : (
              filteredMyBids.map((bid) => {
                const isSelected = bid.status === 'Selected';
                const isCompliant = bid.status === 'Compliant' || isSelected;
                const isFlagged = bid.status === 'Flagged';

                return (
                  <div
                    key={bid.id}
                    style={{
                      backgroundColor: '#0c1f36',
                      border: isSelected ? '2px solid #f59e0b' : (isCompliant ? '1px solid #10b981' : (isFlagged ? '1px solid #f59e0b' : '1px solid #ef4444')),
                      borderRadius: '12px',
                      padding: '1.4rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: '800' }}>
                            {bid.id}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            Tender Ref: <strong>{bid.tenderId}</strong>
                          </span>
                          {isSelected && (
                            <span style={{ fontSize: '0.75rem', backgroundColor: '#f59e0b', color: '#000000', fontWeight: '900', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Award size={13} /> WON & AWARDED
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                          {bid.vendor}
                        </h3>
                        <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                          Quoted Bid: <strong style={{ color: '#38bdf8' }}>{bid.bidAmount}</strong> • Category: {bid.category} • Submitted: {bid.date}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>AI Score</span>
                          <span style={{ fontSize: '1.6rem', fontWeight: '900', color: isCompliant ? '#34d399' : (isFlagged ? '#fbbf24' : '#f87171') }}>
                            {bid.score}<span style={{ fontSize: '0.8rem', color: '#64748b' }}>/100</span>
                          </span>
                        </div>

                        <div>
                          <span
                            style={{
                              padding: '0.4rem 0.85rem',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: '800',
                              backgroundColor: isCompliant ? 'rgba(16, 185, 129, 0.2)' : (isFlagged ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
                              color: isCompliant ? '#34d399' : (isFlagged ? '#fbbf24' : '#f87171'),
                              border: `1px solid ${isCompliant ? '#10b981' : (isFlagged ? '#f59e0b' : '#ef4444')}`,
                              display: 'inline-block'
                            }}
                          >
                            {isSelected ? 'SELECTED / AWARDED' : (isCompliant ? 'COMPLIANT' : (isFlagged ? 'FLAGGED' : 'NON-COMPLIANT'))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Verification Parameters */}
                    <div style={{ backgroundColor: '#071526', border: '1px solid #162c47', borderRadius: '8px', padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Local Content (MII):</span>
                        <strong style={{ color: '#34d399' }}>{bid.miiContent}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Turnover Status:</span>
                        <strong style={{ color: '#e2e8f0' }}>{bid.turnover}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>GSTIN Status:</span>
                        <strong style={{ color: bid.gstStatus.includes('Cancel') ? '#f87171' : '#34d399' }}>{bid.gstStatus}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>OCR Confidence:</span>
                        <strong style={{ color: '#38bdf8' }}>{bid.ocrConfidence || '99.1%'}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #162c47', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: '#38bdf8' }}>
                        Autonomous AI Compliance Dossier generated & transmitted to Government Procuring Authority
                      </span>
                      <button
                        onClick={() => onSelectBid(bid)}
                        style={{
                          padding: '0.45rem 0.95rem',
                          backgroundColor: '#071526',
                          border: '1px solid #1e385b',
                          color: '#38bdf8',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Eye size={14} /> View AI Compliance Dossier
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Detailed Tender Inspection Modal */}
        {inspectingTender && (
          <div className="modal-overlay" onClick={() => setInspectingTender(null)}>
            <div className="modal-content-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
              <div className="modal-header">
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '800' }}>
                    {inspectingTender.id}
                  </span>
                  <h3 className="modal-title" style={{ fontSize: '1.25rem' }}>
                    {inspectingTender.title}
                  </h3>
                </div>
                <button className="modal-close-btn" onClick={() => setInspectingTender(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#334155' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <strong>Procuring Authority:</strong> {inspectingTender.ministry} ({inspectingTender.department})<br />
                  <strong>Estimated Tender Value:</strong> {inspectingTender.estimatedValue}<br />
                  <strong>Bid Submission Deadline:</strong> {inspectingTender.closingDate}
                </div>

                <div>
                  <strong style={{ display: 'block', marginBottom: '0.4rem', color: '#0b1a2d', fontSize: '0.88rem' }}>
                    Bill of Quantities (BOQ Items):
                  </strong>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    {(inspectingTender.boqItems || [{ item: "Standard Procurement Item Solution", qty: 1, unit: "Lot" }]).map((boq, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.82rem', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <span>{boq.item}</span>
                        <strong>{boq.qty} {boq.unit}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <strong style={{ display: 'block', marginBottom: '0.4rem', color: '#0b1a2d', fontSize: '0.88rem' }}>
                    Mandatory AI Compliance Verification Checklist:
                  </strong>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <li>Income Tax PAN Card (Auto entity name extraction)</li>
                    <li>GSTIN 3B Active Filing Certificate (GST Portal API validation)</li>
                    <li>UDYAM MSME Registration (MSE purchase preference exemption)</li>
                    <li>CA Audited Balance Sheet & Turnover Statement (Minimum {inspectingTender.minTurnoverRequirement || '₹2.0 Cr'})</li>
                    <li>Make in India (DPIIT) Local Content Declaration (Minimum {inspectingTender.miiMinRequirement || '50%'})</li>
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => {
                      const t = inspectingTender;
                      setInspectingTender(null);
                      onOpenVerifierWithTender(t);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      fontWeight: '800',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <UploadCloud size={17} />
                    <span>Proceed to AI Document Verification</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
