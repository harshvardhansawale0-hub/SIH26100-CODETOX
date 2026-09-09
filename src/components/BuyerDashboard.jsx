import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2, PlusCircle, FileText, CheckCircle2, AlertTriangle, XCircle,
  Award, Eye, RefreshCw, Filter, Search, ShieldCheck, ChevronRight,
  TrendingUp, Users, FileCheck, Layers, ArrowRight, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { gemApi } from '../services/api';
import CreateBidModal from './CreateBidModal';

export default function BuyerDashboard({
  bids,
  tenders,
  onSelectBid,
  onTenderCreated,
  onBidSelected
}) {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState('tenders'); // 'tenders' or 'applications'
  const [selectedTenderId, setSelectedTenderId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  // Buyer Summary KPIs
  const kpis = useMemo(() => {
    const totalTenders = tenders.length;
    const totalApps = bids.length;
    const compliantCount = bids.filter(b => b.status === 'Compliant' || b.status === 'Selected').length;
    const awardedCount = tenders.filter(t => t.status === 'Awarded' || bids.some(b => b.status === 'Selected')).length;
    return {
      totalTenders,
      totalApps,
      compliantCount,
      awardedCount
    };
  }, [tenders, bids]);

  // Filtered Tenders
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

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return bids.filter((b) => {
      const matchTender = selectedTenderId === 'ALL' || b.tenderId === selectedTenderId;
      const matchSearch =
        (b.vendor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
      const matchCat = categoryFilter === 'ALL' || b.category === categoryFilter;
      return matchTender && matchSearch && matchStatus && matchCat;
    });
  }, [bids, selectedTenderId, searchQuery, statusFilter, categoryFilter]);

  const handleSelectWinningBid = async (bid) => {
    if (!window.confirm(`Are you sure you want to officially select and award Tender ${bid.tenderId} to ${bid.vendor} (${bid.bidAmount})?`)) {
      return;
    }
    setIsSelecting(true);
    try {
      await gemApi.selectWinningBidder(bid.id, `Officially awarded to ${bid.vendor} as qualified L1 compliant bidder.`);
      if (onBidSelected) {
        onBidSelected(bid.id);
      }
    } catch (err) {
      console.warn('Select bidder error:', err);
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#071526', minHeight: '88vh', padding: '2.5rem 1.5rem', color: '#ffffff' }}>
      <div className="container-custom">
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ backgroundColor: '#0284c7', color: '#ffffff', fontSize: '0.75rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                BUYER PORTAL
              </span>
              <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: '600' }}>
                Government / Procuring Authority
              </span>
            </div>
            <h1 className="serif-heading" style={{ fontSize: '2.2rem', color: '#ffffff', margin: 0 }}>
              Autonomous Procurement & Bidder Selection
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '0.3rem' }}>
              Create tenders, define compliance requirements, review AI verification dossiers, and make final bidder awards.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                padding: '0.7rem 1.4rem',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.9rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <PlusCircle size={18} /> Create New Bid / Tender
            </button>
          </div>
        </div>

        {/* 4 Stat KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#0c1f36', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>Published Tenders</span>
              <FileText size={18} color="#38bdf8" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffffff' }}>
              {kpis.totalTenders}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Active in Buyer catalog</span>
          </div>

          <div style={{ backgroundColor: '#0c1f36', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>Applications Received</span>
              <Users size={18} color="#a855f7" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffffff' }}>
              {kpis.totalApps}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#c084fc' }}>Verified via OCR & GFR rules</span>
          </div>

          <div style={{ backgroundColor: '#0c1f36', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>AI Compliant Bids</span>
              <CheckCircle2 size={18} color="#34d399" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#34d399' }}>
              {kpis.compliantCount}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Eligible for L1 Award</span>
          </div>

          <div style={{ backgroundColor: '#0c1f36', border: '1px solid #1e385b', borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>Bids Awarded / Won</span>
              <Award size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#f59e0b' }}>
              {kpis.awardedCount}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Final selections executed</span>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #1e385b', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => { setActiveSubTab('tenders'); setSelectedTenderId('ALL'); }}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeSubTab === 'tenders' ? '#0284c7' : 'transparent',
              color: activeSubTab === 'tenders' ? '#ffffff' : '#94a3b8',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <FileText size={16} /> 1. Published Bids / Tenders ({tenders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('applications')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeSubTab === 'applications' ? '#0284c7' : 'transparent',
              color: activeSubTab === 'applications' ? '#ffffff' : '#94a3b8',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Users size={16} /> 2. Received Bidder Applications & AI Reports ({bids.length})
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: '#0c1f36', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #1e385b', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by tender ID, vendor name, or title..."
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

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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

            {activeSubTab === 'applications' && (
              <>
                <select
                  value={selectedTenderId}
                  onChange={(e) => setSelectedTenderId(e.target.value)}
                  style={{
                    backgroundColor: '#071526',
                    border: '1px solid #1e385b',
                    color: '#38bdf8',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.83rem',
                    fontWeight: '600'
                  }}
                >
                  <option value="ALL">Filter by Tender: All Tenders</option>
                  {tenders.map((t) => (
                    <option key={t.id} value={t.id}>{t.id} — {t.title.slice(0, 35)}...</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    backgroundColor: '#071526',
                    border: '1px solid #1e385b',
                    color: '#ffffff',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.83rem'
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Compliant">Compliant</option>
                  <option value="Flagged">Flagged</option>
                  <option value="Non-Compliant">Non-Compliant</option>
                  <option value="Selected">Awarded / Selected</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* View 1: Published Tenders */}
        {activeSubTab === 'tenders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredTenders.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#0c1f36', borderRadius: '8px', border: '1px solid #1e385b' }}>
                <p style={{ color: '#94a3b8' }}>No published tenders match your search criteria.</p>
              </div>
            ) : (
              filteredTenders.map((tender) => {
                const tenderBids = bids.filter(b => b.tenderId === tender.id);
                const hasCompliant = tenderBids.some(b => b.status === 'Compliant' || b.status === 'Selected');
                const isAwarded = tender.status === 'Awarded' || tenderBids.some(b => b.status === 'Selected');

                return (
                  <div
                    key={tender.id}
                    style={{
                      backgroundColor: '#0c1f36',
                      border: isAwarded ? '1px solid #f59e0b' : '1px solid #1e385b',
                      borderRadius: '10px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '700' }}>
                            {tender.id}
                          </span>
                          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: '#1e385b', color: '#94a3b8', fontWeight: '600' }}>
                            {tender.category}
                          </span>
                          {isAwarded ? (
                            <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Award size={12} /> Awarded
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontWeight: '700' }}>
                              Active Bidding
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0, fontWeight: '700' }}>
                          {tender.title}
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>
                          {tender.ministry} • {tender.department}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Estimated Value</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#38bdf8' }}>{tender.estimatedValue}</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Closing: {tender.closingDate}</span>
                      </div>
                    </div>

                    {/* Compliance Criteria Defined by Buyer */}
                    <div style={{ backgroundColor: '#071526', border: '1px solid #162c47', borderRadius: '8px', padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Min MII Requirement:</span>
                        <strong style={{ color: '#e2e8f0' }}>{tender.miiMinRequirement}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Min Annual Turnover:</span>
                        <strong style={{ color: '#e2e8f0' }}>{tender.minTurnoverRequirement || '₹2.0 Cr'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Commercial Experience:</span>
                        <strong style={{ color: '#e2e8f0' }}>{tender.minExperienceYears || 3} Years Minimum</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>EMD Specification:</span>
                        <strong style={{ color: '#e2e8f0' }}>{tender.emdAmount}</strong>
                      </div>
                    </div>

                    {/* Applications & Actions Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #162c47', paddingTop: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.84rem' }}>
                        <span style={{ color: '#94a3b8' }}>
                          Applications Received: <strong style={{ color: '#ffffff' }}>{tenderBids.length}</strong>
                        </span>
                        {tenderBids.length > 0 && (
                          <span style={{ color: hasCompliant ? '#34d399' : '#fbbf24', fontSize: '0.78rem', fontWeight: '600' }}>
                            {hasCompliant ? '✓ Qualified L1 Candidates Available' : '⚠️ Under Evaluation / Review Required'}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setSelectedTenderId(tender.id);
                            setActiveSubTab('applications');
                          }}
                          style={{
                            padding: '0.45rem 0.9rem',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            fontWeight: '700',
                            fontSize: '0.82rem',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <Users size={14} /> Review Applications ({tenderBids.length})
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* View 2: Received Bidder Applications & AI Compliance Dossiers */}
        {activeSubTab === 'applications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {selectedTenderId !== 'ALL' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0284c7', color: '#ffffff', padding: '0.6rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                <span>Showing applications for Tender: <strong>{selectedTenderId}</strong></span>
                <button
                  onClick={() => setSelectedTenderId('ALL')}
                  style={{ backgroundColor: '#ffffff', color: '#0284c7', border: 'none', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  Clear Filter (Show All)
                </button>
              </div>
            )}

            {filteredApplications.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#0c1f36', borderRadius: '8px', border: '1px solid #1e385b' }}>
                <p style={{ color: '#94a3b8' }}>No bidder applications found for the selected filter.</p>
              </div>
            ) : (
              filteredApplications.map((bid) => {
                const isSelected = bid.status === 'Selected';
                const isCompliant = bid.status === 'Compliant' || isSelected;
                const isFlagged = bid.status === 'Flagged';
                const isNonCompliant = bid.status === 'Non-Compliant' || bid.status === 'Rejected';

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
                      gap: '1rem',
                      boxShadow: isSelected ? '0 0 20px rgba(245, 158, 11, 0.2)' : 'none'
                    }}
                  >
                    {/* Header Strip */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: '700' }}>
                            {bid.id}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            Applied for Tender: <strong>{bid.tenderId}</strong>
                          </span>
                          {isSelected && (
                            <span style={{ fontSize: '0.75rem', backgroundColor: '#f59e0b', color: '#000000', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Award size={12} /> WINNING BIDDER (AWARDED)
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                          {bid.vendor}
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          Category: {bid.category} • Quoted: <strong style={{ color: '#38bdf8' }}>{bid.bidAmount}</strong> (Tender Est: {bid.tenderValue})
                        </span>
                      </div>

                      {/* Score & Status Pill */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>AI Score</span>
                          <span style={{ fontSize: '1.6rem', fontWeight: '900', color: isCompliant ? '#34d399' : (isFlagged ? '#fbbf24' : '#f87171') }}>
                            {bid.score}<span style={{ fontSize: '0.85rem', color: '#64748b' }}>/100</span>
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

                    {/* Key Verification Parameter Badges */}
                    <div style={{ backgroundColor: '#071526', borderRadius: '8px', border: '1px solid #162c47', padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Make in India (MII):</span>
                        <strong style={{ color: '#e2e8f0' }}>{bid.miiContent}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Audited Turnover:</span>
                        <strong style={{ color: '#e2e8f0' }}>{bid.turnover}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>GSTIN & PAN Status:</span>
                        <strong style={{ color: bid.gstStatus?.includes('ACTIVE') ? '#34d399' : '#f87171' }}>
                          {bid.gstStatus}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>OCR Forensics Confidence:</span>
                        <strong style={{ color: '#38bdf8' }}>{bid.ocrConfidence}</strong>
                      </div>
                    </div>

                    {/* Flags / Discrepancies if any */}
                    {bid.flags && bid.flags.length > 0 && (
                      <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', padding: '0.6rem 0.85rem', fontSize: '0.82rem', color: '#fca5a5' }}>
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f87171', marginBottom: '0.2rem' }}>
                          <AlertTriangle size={14} /> AI Discrepancy Alerts:
                        </strong>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                          {bid.flags.map((f, idx) => (
                            <li key={idx}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions: Inspect AI Report & Final Bidder Selection */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #162c47', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Submission Timestamp: {bid.date}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                          <Eye size={14} /> Inspect AI Compliance Report
                        </button>

                        {/* Buyer Final Selection Button */}
                        {!isSelected && isCompliant && (
                          <button
                            onClick={() => handleSelectWinningBid(bid)}
                            disabled={isSelecting}
                            style={{
                              padding: '0.45rem 1rem',
                              backgroundColor: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: '800',
                              cursor: isSelecting ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                            }}
                          >
                            <Award size={14} /> Final Selection (Award Tender)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Create Bid Modal */}
        <CreateBidModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onTenderCreated={(newTender) => {
            if (onTenderCreated) onTenderCreated(newTender);
          }}
        />
      </div>
    </div>
  );
}
