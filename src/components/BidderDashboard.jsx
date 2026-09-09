import React, { useState, useMemo } from 'react';
import {
  Building2, Search, Filter, ShieldCheck, CheckCircle2, AlertTriangle,
  XCircle, Award, FileText, ArrowRight, UploadCloud, Eye, RefreshCw, Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function BidderDashboard({
  tenders,
  bids,
  onOpenVerifierWithTender,
  onSelectBid
}) {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState('available'); // 'available' or 'mybids'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Bidder Summary KPIs
  const kpis = useMemo(() => {
    const availableTenders = tenders.filter(t => t.status === 'Active' || !t.status).length;
    const mySubmissions = bids.length;
    const compliantCount = bids.filter(b => b.status === 'Compliant' || b.status === 'Selected').length;
    const wonCount = bids.filter(b => b.status === 'Selected').length;
    return {
      availableTenders,
      mySubmissions,
      compliantCount,
      wonCount
    };
  }, [tenders, bids]);

  // Filtered available tenders
  const filteredTenders = useMemo(() => {
    return tenders.filter((t) => {
      const matchSearch =
        (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.ministry || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || t.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [tenders, searchQuery, categoryFilter]);

  // Filtered My Bids
  const filteredMyBids = useMemo(() => {
    return bids.filter((b) => {
      const matchSearch =
        (b.vendor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.tenderId || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || b.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [bids, searchQuery, categoryFilter]);

  return (
    <div style={{ backgroundColor: '#071526', minHeight: '88vh', padding: '2.5rem 1.5rem', color: '#ffffff' }}>
      <div className="container-custom">
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '0.75rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                BIDDER PORTAL
              </span>
              <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: '600' }}>
                Vendor / Supplier Enterprise
              </span>
            </div>
            <h1 className="serif-heading" style={{ fontSize: '2.2rem', color: '#ffffff', margin: 0 }}>
              Discover Bids & Submit Verified Applications
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '0.3rem' }}>
              Browse published government tenders, upload required documents (PAN, GST, Udyam, CA Statement), and run autonomous AI verification.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={() => onOpenVerifierWithTender(tenders[0] || null)}
              style={{
                padding: '0.7rem 1.4rem',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.9rem',
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
              <UploadCloud size={18} /> Apply for Bid (OCR & AI Check)
            </button>
          </div>
        </div>

        {/* 4 Stat KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#0c1f36', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>Available Tenders to Apply</span>
              <FileText size={18} color="#38bdf8" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffffff' }}>
              {kpis.availableTenders}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Open for vendor bidding</span>
          </div>

          <div style={{ backgroundColor: '#0c1f36', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>My Applications</span>
              <UploadCloud size={18} color="#a855f7" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffffff' }}>
              {kpis.mySubmissions}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#c084fc' }}>Submitted to Buyers</span>
          </div>

          <div style={{ backgroundColor: '#0c1f36', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>Passed AI Verifications</span>
              <CheckCircle2 size={18} color="#34d399" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#34d399' }}>
              {kpis.compliantCount}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#34d399' }}>100% GFR 2017 compliant</span>
          </div>

          <div style={{ backgroundColor: '#0c1f36', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>Won / Selected Bids</span>
              <Award size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#f59e0b' }}>
              {kpis.wonCount}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Final contracts awarded</span>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #1e385b', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveSubTab('available')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeSubTab === 'available' ? '#10b981' : 'transparent',
              color: activeSubTab === 'available' ? '#ffffff' : '#94a3b8',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <FileText size={16} /> 1. Available Bids Catalog ({tenders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('mybids')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeSubTab === 'mybids' ? '#10b981' : 'transparent',
              color: activeSubTab === 'mybids' ? '#ffffff' : '#94a3b8',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <CheckCircle2 size={16} /> 2. My Submitted Applications ({bids.length})
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: '#0c1f36', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #1e385b', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search tenders by keyword, tender ID, or ministry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#071526',
                border: '1px solid #1e385b',
                color: '#ffffff',
                padding: '0.4rem 0.65rem',
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
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.83rem'
              }}
            >
              <option value="ALL">All Categories</option>
              <option value="IT Hardware">IT Hardware</option>
              <option value="Furniture">Furniture</option>
              <option value="Software">Software</option>
              <option value="Medical Equipment">Medical Equipment</option>
            </select>
          </div>
        </div>

        {/* View 1: Available Bids Catalog */}
        {activeSubTab === 'available' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredTenders.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#0c1f36', borderRadius: '8px', border: '1px solid #1e385b' }}>
                <p style={{ color: '#94a3b8' }}>No available tenders found.</p>
              </div>
            ) : (
              filteredTenders.map((tender) => (
                <div
                  key={tender.id}
                  style={{
                    backgroundColor: '#0c1f36',
                    border: '1px solid #1e385b',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '700' }}>
                          {tender.id}
                        </span>
                        <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: '#1e385b', color: '#94a3b8', fontWeight: '600' }}>
                          {tender.category}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: 0, fontWeight: '700' }}>
                        {tender.title}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>
                        {tender.ministry} • {tender.department}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Estimated Value</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#38bdf8' }}>{tender.estimatedValue}</span>
                      <span style={{ fontSize: '0.72rem', color: '#f59e0b', display: 'block' }}>Closing: {tender.closingDate}</span>
                    </div>
                  </div>

                  {/* Compliance Criteria defined by Buyer */}
                  <div style={{ backgroundColor: '#071526', border: '1px solid #162c47', borderRadius: '8px', padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Required Local Content (MII):</span>
                      <strong style={{ color: '#34d399' }}>{tender.miiMinRequirement}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Min Turnover Required:</span>
                      <strong style={{ color: '#e2e8f0' }}>{tender.minTurnoverRequirement || '₹2.0 Cr'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Min Experience:</span>
                      <strong style={{ color: '#e2e8f0' }}>{tender.minExperienceYears || 3} Years</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>EMD Amount:</span>
                      <strong style={{ color: '#e2e8f0' }}>{tender.emdAmount}</strong>
                    </div>
                  </div>

                  {/* Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #162c47', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      Requires: PAN, GSTIN, UDYAM MSME, CA Turnover Statement, MII Undertaking
                    </span>
                    <button
                      onClick={() => onOpenVerifierWithTender(tender)}
                      style={{
                        padding: '0.55rem 1.15rem',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <UploadCloud size={16} /> Apply & Upload Documents
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* View 2: My Submitted Applications */}
        {activeSubTab === 'mybids' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredMyBids.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#0c1f36', borderRadius: '8px', border: '1px solid #1e385b' }}>
                <p style={{ color: '#94a3b8' }}>You haven't submitted any bid applications yet.</p>
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
                      borderRadius: '10px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: '700' }}>
                            {bid.id}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            Tender: <strong>{bid.tenderId}</strong>
                          </span>
                          {isSelected && (
                            <span style={{ fontSize: '0.75rem', backgroundColor: '#f59e0b', color: '#000000', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Award size={12} /> WON & AWARDED
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                          {bid.vendor}
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          Quoted Bid Amount: <strong style={{ color: '#38bdf8' }}>{bid.bidAmount}</strong> • Submitted: {bid.date}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>AI Score</span>
                          <span style={{ fontSize: '1.5rem', fontWeight: '900', color: isCompliant ? '#34d399' : (isFlagged ? '#fbbf24' : '#f87171') }}>
                            {bid.score}<span style={{ fontSize: '0.8rem', color: '#64748b' }}>/100</span>
                          </span>
                        </div>

                        <div>
                          <span
                            style={{
                              padding: '0.35rem 0.75rem',
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #162c47', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: '#38bdf8' }}>
                        AI Compliance Report sent to Buyer
                      </span>
                      <button
                        onClick={() => onSelectBid(bid)}
                        style={{
                          padding: '0.45rem 0.85rem',
                          backgroundColor: '#0c1f36',
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
      </div>
    </div>
  );
}
