import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2, PlusCircle, FileText, CheckCircle2, AlertTriangle, XCircle,
  Award, Eye, RefreshCw, Filter, Search, ShieldCheck, ChevronRight,
  TrendingUp, Users, FileCheck, Layers, ArrowRight, ExternalLink, Trash2, Home
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { gemApi } from '../services/api';
import CreateBidModal from './CreateBidModal';
import AwardedTenderKeymap from './AwardedTenderKeymap';
import { createDefaultMilestones } from '../data/bidsData';

export default function BuyerDashboard({
  bids = [],
  tenders = [],
  tenderMilestones = {},
  onUpdateMilestone,
  onSelectBid,
  onTenderCreated,
  onBidSelected,
  onDeleteTender,
  currentUser,
  onNavigateHome
}) {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState('tenders'); // 'tenders', 'applications', 'awarded'
  const [selectedTenderId, setSelectedTenderId] = useState('ALL');
  const [selectedKeymapTenderId, setSelectedKeymapTenderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [tenderScopeMode, setTenderScopeMode] = useState('my'); // 'my' or 'all'

  // Dynamic available categories for filter
  const availableCategories = useMemo(() => {
    const cats = new Set(['IT Hardware', 'Software & Cloud Services', 'Medical Equipment & Healthcare Devices', 'Office Furniture & Modular Fixtures']);
    for (const t of tenders || []) if (t.category) cats.add(t.category);
    for (const b of bids || []) if (b.category) cats.add(b.category);
    return Array.from(cats).sort();
  }, [tenders, bids]);

  // Scope tenders to this Buyer:
  // Fresh/registered buyer accounts see their created tenders.
  // Demo accounts (Dir. Rajesh Verma) show demo tenders.
  const myCreatedTenders = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.isDemo) {
      return tenders;
    }
    const userEmail = (currentUser.email || '').trim().toLowerCase();
    const userName = (currentUser.fullName || '').trim().toLowerCase();
    const userOrg = (currentUser.organization || '').trim().toLowerCase();
    const userId = currentUser.id ? String(currentUser.id) : '';

    return tenders.filter(t => {
      const createdBy = (t.createdBy || '').trim().toLowerCase();
      const buyerEmail = (t.buyerEmail || '').trim().toLowerCase();
      const buyerName = (t.buyerName || '').trim().toLowerCase();
      const buyerOrg = (t.buyerOrg || '').trim().toLowerCase();
      const buyerId = t.buyerId ? String(t.buyerId) : '';

      // Direct ID or email match
      if (userId && buyerId && userId === buyerId) return true;
      if (userEmail && (createdBy === userEmail || buyerEmail === userEmail)) return true;

      // Default/seeded authority account match
      const isDefaultGovBuyer = userEmail === 'buyer@gov.in' || userEmail === 'procurement.officer@nic.in' || userEmail === 'buyer@gem.gov.in';
      const isTenderDefaultGov = createdBy === 'buyer@gov.in' || buyerEmail === 'buyer@gov.in' || createdBy === 'buyer@gem.gov.in' || buyerEmail === 'buyer@gem.gov.in' || createdBy === 'procurement.officer@nic.in' || buyerEmail === 'procurement.officer@nic.in';
      if (isDefaultGovBuyer && isTenderDefaultGov) return true;

      // Organization match or Name match
      if (userName && buyerName && (buyerName === userName || buyerName.includes(userName) || userName.includes(buyerName))) return true;
      if (userOrg && buyerOrg && (buyerOrg === userOrg || buyerOrg.includes(userOrg) || userOrg.includes(buyerOrg))) return true;

      return false;
    });
  }, [tenders, currentUser]);

  const buyerTenders = useMemo(() => {
    if (tenderScopeMode === 'all') {
      return tenders;
    }
    return myCreatedTenders;
  }, [tenderScopeMode, myCreatedTenders, tenders]);

  // Scope applications received:
  // - When in 'all' mode: show all bids across the portal
  // - When in 'my' mode: show applications matching tenders created by this officer
  // - If officer has 0 created tenders: show all bids so officer dashboard is immediately actionable
  const buyerBids = useMemo(() => {
    if (tenderScopeMode === 'all') {
      return bids;
    }
    const myTenderIds = new Set(myCreatedTenders.map(t => t.id));
    const matching = bids.filter(b => myTenderIds.has(b.tenderId));
    if (myCreatedTenders.length === 0) {
      return bids;
    }
    return matching;
  }, [bids, myCreatedTenders, tenderScopeMode]);

  const availableTenderOptions = useMemo(() => {
    const list = [...buyerTenders];
    const existingIds = new Set(list.map(t => t.id));
    for (const b of bids) {
      if (b.tenderId && !existingIds.has(b.tenderId)) {
        list.push({
          id: b.tenderId,
          title: `Tender ${b.tenderId} (${b.category || 'General'})`
        });
        existingIds.add(b.tenderId);
      }
    }
    return list;
  }, [buyerTenders, bids]);

  // Awarded Tenders for Keymap Tracking
  const awardedTendersList = useMemo(() => {
    const list = [];
    const seen = new Set();

    for (const t of buyerTenders) {
      const hasWonBid = bids.some(b => (b.status === 'Selected' || b.status === 'Awarded') && b.tenderId === t.id);
      if ((t.status === 'Awarded' || hasWonBid) && !seen.has(t.id)) {
        list.push(t);
        seen.add(t.id);
      }
    }

    // Also include any tender configured in tenderMilestones
    for (const [tId, mData] of Object.entries(tenderMilestones || {})) {
      if (!seen.has(tId)) {
        const matchingTender = tenders.find(t => t.id === tId);
        if (matchingTender) {
          list.push(matchingTender);
          seen.add(tId);
        } else if (currentUser?.isDemo || tenderScopeMode === 'all') {
          list.push({
            id: tId,
            title: `Awarded Contract (${tId})`,
            ministry: mData.buyerOrg || 'Ministry of Defence, DRDO',
            department: 'Procurement Wing',
            category: 'IT Hardware',
            estimatedValue: mData.awardedValue || '₹1.38 Cr',
            status: 'Awarded'
          });
          seen.add(tId);
        }
      }
    }

    return list;
  }, [buyerTenders, bids, tenderMilestones, tenders, currentUser, tenderScopeMode]);

  const displayedAwardedTenders = useMemo(() => {
    if (selectedKeymapTenderId) {
      const match = awardedTendersList.filter(t => t.id === selectedKeymapTenderId);
      if (match.length > 0) return match;
    }
    return awardedTendersList;
  }, [awardedTendersList, selectedKeymapTenderId]);

  // Buyer Summary KPIs
  const kpis = useMemo(() => {
    const totalTenders = buyerTenders.length;
    const totalApps = buyerBids.length;
    const compliantCount = buyerBids.filter(b => b.status === 'Compliant' || b.status === 'Selected').length;
    const awardedCount = awardedTendersList.length;
    return {
      totalTenders,
      totalApps,
      compliantCount,
      awardedCount
    };
  }, [buyerTenders, buyerBids, awardedTendersList]);

  // Filtered Tenders
  const filteredTenders = useMemo(() => {
    return buyerTenders.filter((t) => {
      const matchSearch =
        (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.ministry || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || t.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [buyerTenders, searchQuery, categoryFilter]);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return buyerBids.filter((b) => {
      const matchTender = selectedTenderId === 'ALL' || b.tenderId === selectedTenderId;
      const matchSearch =
        (b.vendor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
      const matchCat = categoryFilter === 'ALL' || b.category === categoryFilter;
      return matchTender && matchSearch && matchStatus && matchCat;
    });
  }, [buyerBids, selectedTenderId, searchQuery, statusFilter, categoryFilter]);

  const handleDeleteTender = (tender) => {
    if (window.confirm(`Are you sure you want to permanently delete Tender "${tender.id} — ${tender.title}"?\n\nThis will remove the tender from your dashboard and public search, and will remove all associated bidder applications.`)) {
      if (onDeleteTender) {
        onDeleteTender(tender.id);
      }
    }
  };

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
    <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 35%, #fff7ed 70%, #ffffff 100%)', minHeight: '88vh', padding: '2rem 1.5rem', color: '#0f172a' }}>
      <div className="container-custom">
        {/* Top Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(224, 242, 254, 0.8) 0%, rgba(254, 243, 199, 0.5) 50%, rgba(255, 237, 213, 0.8) 100%)',
          border: '1px solid #fed7aa',
          borderRadius: '14px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ backgroundColor: '#0284c7', color: '#ffffff', fontSize: '0.75rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  BUYER PORTAL
                </span>
                <span style={{ color: '#0369a1', fontSize: '0.85rem', fontWeight: '700' }}>
                  Government / Procuring Authority
                </span>
                {currentUser && (
                  <span style={{ fontSize: '0.75rem', color: '#475569', backgroundColor: '#ffffff', padding: '0.2rem 0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    Logged in: <strong style={{ color: '#0284c7' }}>{currentUser.fullName}</strong> ({currentUser.organization || 'Govt Authority'})
                  </span>
                )}
              </div>
              <h1 className="heading-page" style={{ fontSize: '2rem', color: '#0f172a', margin: 0, fontWeight: '800' }}>
                Autonomous Procurement & Bidder Selection
              </h1>
              <p style={{ color: '#475569', fontSize: '0.92rem', marginTop: '0.3rem', marginBottom: 0 }}>
                Create tenders, define compliance requirements, review AI verification dossiers, and make final bidder awards.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {onNavigateHome && (
                <button
                  onClick={onNavigateHome}
                  style={{
                    width: '40px',
                    height: '40px',
                    padding: 0,
                    backgroundColor: '#ffffff',
                    color: '#0284c7',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    flexShrink: 0
                  }}
                  title="Return to GeM Homepage"
                  aria-label="Return to GeM Homepage"
                >
                  <Home size={18} color="#0284c7" />
                </button>
              )}
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
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                <PlusCircle size={18} /> Create New Bid / Tender
              </button>
            </div>
          </div>
        </div>

        {/* 4 Stat KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#ffffff', background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>Published Tenders</span>
              <FileText size={18} color="#0284c7" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>
              {kpis.totalTenders}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: '600' }}>Active in Buyer catalog</span>
          </div>

          <div style={{ backgroundColor: '#ffffff', background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>Applications Received</span>
              <Users size={18} color="#9333ea" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>
              {kpis.totalApps}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#7e22ce', fontWeight: '600' }}>Verified via OCR & GFR rules</span>
          </div>

          <div style={{ backgroundColor: '#ffffff', background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>AI Compliant Bids</span>
              <CheckCircle2 size={18} color="#059669" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#059669' }}>
              {kpis.compliantCount}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: '600' }}>Eligible for L1 Award</span>
          </div>

          <div
            onClick={() => setActiveSubTab('awarded')}
            style={{
              backgroundColor: '#ffffff',
              background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
              border: activeSubTab === 'awarded' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeSubTab === 'awarded' ? '0 4px 16px rgba(245, 158, 11, 0.2)' : '0 2px 8px rgba(15, 23, 42, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>Bids Awarded / Won</span>
              <Award size={18} color="#d97706" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#d97706' }}>
              {kpis.awardedCount}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: '600' }}>Click to view execution keymaps</span>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                style={{
                  width: '38px',
                  height: '38px',
                  padding: 0,
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0284c7',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  flexShrink: 0
                }}
                title="Return to GeM Homepage"
                aria-label="Return to GeM Homepage"
              >
                <Home size={17} color="#0284c7" />
              </button>
            )}
            <button
              onClick={() => { setActiveSubTab('tenders'); setSelectedTenderId('ALL'); setSelectedKeymapTenderId(null); }}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '6px',
                border: activeSubTab === 'tenders' ? '1px solid #0284c7' : '1px solid #cbd5e1',
                backgroundColor: activeSubTab === 'tenders' ? '#0284c7' : '#ffffff',
                color: activeSubTab === 'tenders' ? '#ffffff' : '#475569',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: activeSubTab === 'tenders' ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none'
              }}
            >
              <FileText size={16} /> 1. Published Bids / Tenders ({buyerTenders.length})
            </button>
            <button
              onClick={() => { setActiveSubTab('applications'); setSelectedKeymapTenderId(null); }}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '6px',
                border: activeSubTab === 'applications' ? '1px solid #0284c7' : '1px solid #cbd5e1',
                backgroundColor: activeSubTab === 'applications' ? '#0284c7' : '#ffffff',
                color: activeSubTab === 'applications' ? '#ffffff' : '#475569',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: activeSubTab === 'applications' ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none'
              }}
            >
              <Users size={16} /> 2. Received Bidder Applications & AI Reports ({buyerBids.length})
            </button>
            <button
              onClick={() => { setActiveSubTab('awarded'); setSelectedKeymapTenderId(null); }}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '6px',
                border: activeSubTab === 'awarded' ? '1px solid #d97706' : '1px solid #fed7aa',
                backgroundColor: activeSubTab === 'awarded' ? '#f59e0b' : '#fffbeb',
                color: activeSubTab === 'awarded' ? '#000000' : '#b45309',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: activeSubTab === 'awarded' ? '0 2px 10px rgba(245, 158, 11, 0.3)' : 'none'
              }}
            >
              <Award size={16} /> 🏆 3. Awarded Tenders & Keymap Approvals ({awardedTendersList.length})
            </button>
          </div>

          {/* Scope Mode Switcher: My Created vs All Department */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '3px', gap: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b', padding: '0 0.4rem', fontWeight: '600' }}>Scope:</span>
            <button
              type="button"
              onClick={() => setTenderScopeMode('my')}
              style={{
                padding: '0.25rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: tenderScopeMode === 'my' ? '#0284c7' : 'transparent',
                color: tenderScopeMode === 'my' ? '#ffffff' : '#64748b',
                transition: 'all 0.2s ease'
              }}
              title={activeSubTab === 'applications' ? "Show applications for my tenders" : "Show tenders created by this authority account"}
            >
              {activeSubTab === 'applications'
                ? `My Tenders' Bids (${myCreatedTenders.length > 0 ? bids.filter(b => myCreatedTenders.some(t => t.id === b.tenderId)).length : 0})`
                : `My Tenders (${myCreatedTenders.length})`}
            </button>
            <button
              type="button"
              onClick={() => setTenderScopeMode('all')}
              style={{
                padding: '0.25rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: tenderScopeMode === 'all' ? '#0284c7' : 'transparent',
                color: tenderScopeMode === 'all' ? '#ffffff' : '#64748b',
                transition: 'all 0.2s ease'
              }}
              title={activeSubTab === 'applications' ? "Show all received applications across department" : "Show all procurement tenders across the platform/department"}
            >
              {activeSubTab === 'applications'
                ? `All Received Bids (${bids.length})`
                : `All Tenders (${tenders.length})`}
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by tender ID, vendor name, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                padding: '0.45rem 0.75rem',
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
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.83rem'
              }}
            >
              <option value="ALL">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {activeSubTab === 'applications' && (
              <>
                <select
                  value={selectedTenderId}
                  onChange={(e) => setSelectedTenderId(e.target.value)}
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0369a1',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.83rem',
                    fontWeight: '600'
                  }}
                >
                  <option value="ALL">Filter by Tender: All Tenders</option>
                  {availableTenderOptions.map((t) => (
                    <option key={t.id} value={t.id}>{t.id} — {(t.title || '').slice(0, 35)}...</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    padding: '0.45rem 0.75rem',
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
            {buyerTenders.length === 0 ? (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #0284c7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <FileText size={28} color="#0284c7" />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: '800', marginBottom: '0.5rem' }}>
                  Zero Published Tenders
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '540px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
                  You currently have 0 active tenders in your Buyer account. As a Government Procuring Authority, click below to upload your procurement tenders from zero with customized GFR 2017 & Make-in-India compliance criteria.
                </p>
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
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)'
                  }}
                >
                  <PlusCircle size={18} />
                  <span>+ Create / Publish Your First Tender</span>
                </button>
              </div>
            ) : filteredTenders.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ color: '#64748b' }}>No published tenders match your search criteria.</p>
              </div>
            ) : (
              filteredTenders.map((tender) => {
                const tenderBids = buyerBids.filter(b => b.tenderId === tender.id);
                const hasCompliant = tenderBids.some(b => b.status === 'Compliant' || b.status === 'Selected');
                const isAwarded = tender.status === 'Awarded' || tenderBids.some(b => b.status === 'Selected');

                return (
                  <div
                    key={tender.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: isAwarded ? '1px solid #fed7aa' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.78rem', color: '#0369a1', fontFamily: 'monospace', fontWeight: '800' }}>
                            {tender.id}
                          </span>
                          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '600' }}>
                            {tender.category}
                          </span>
                          {isAwarded ? (
                            <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#92400e', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid #fde68a' }}>
                              <Award size={12} /> Awarded
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: '#ecfdf5', color: '#065f46', fontWeight: '800', border: '1px solid #a7f3d0' }}>
                              Active Bidding
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0, fontWeight: '800' }}>
                          {tender.title}
                        </h3>
                        <span style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginTop: '0.2rem' }}>
                          {tender.ministry} • {tender.department}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Estimated Value</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0284c7' }}>{tender.estimatedValue}</span>
                        <span style={{ fontSize: '0.74rem', color: '#d97706', display: 'block', marginTop: '2px' }}>Closing: <strong>{tender.closingDate}</strong></span>
                      </div>
                    </div>

                    {/* Compliance Criteria Defined by Buyer */}
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Min MII Requirement:</span>
                        <strong style={{ color: '#059669' }}>{tender.miiMinRequirement}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Min Annual Turnover:</span>
                        <strong style={{ color: '#0f172a' }}>{tender.minTurnoverRequirement || '₹2.0 Cr'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Commercial Experience:</span>
                        <strong style={{ color: '#0f172a' }}>{tender.minExperienceYears || 3} Years Minimum</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>EMD Specification:</span>
                        <strong style={{ color: '#0f172a' }}>{tender.emdAmount}</strong>
                      </div>
                    </div>

                    {/* Applications & Actions Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.84rem' }}>
                        <span style={{ color: '#475569' }}>
                          Applications Received: <strong style={{ color: '#0f172a' }}>{tenderBids.length}</strong>
                        </span>
                        {tenderBids.length > 0 && (
                          <span style={{ color: hasCompliant ? '#059669' : '#d97706', fontSize: '0.78rem', fontWeight: '700' }}>
                            {hasCompliant ? '✓ Qualified L1 Candidates Available' : '⚠️ Under Evaluation / Review Required'}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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

                        {isAwarded && (
                          <button
                            onClick={() => {
                              setSelectedKeymapTenderId(tender.id);
                              setActiveSubTab('awarded');
                            }}
                            style={{
                              padding: '0.45rem 0.9rem',
                              backgroundColor: '#f59e0b',
                              color: '#000000',
                              fontWeight: '800',
                              fontSize: '0.82rem',
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                            }}
                          >
                            <Award size={14} /> 🏆 View & Approve Keymap
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteTender(tender)}
                          style={{
                            padding: '0.45rem 0.85rem',
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontWeight: '700',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#ffffff'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#b91c1c'; }}
                          title="Permanently delete this tender"
                        >
                          <Trash2 size={14} /> Delete
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
            {myCreatedTenders.length === 0 && (
              <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ShieldCheck size={18} color="#0284c7" />
                  <span style={{ fontSize: '0.84rem', color: '#0369a1' }}>
                    Showing all received vendor submissions across the department ({buyerBids.length}). Create your first tender anytime to track bids exclusively for your authority.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenCreateBid && onOpenCreateBid()}
                  style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.8rem', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  + Create Tender
                </button>
              </div>
            )}

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
              <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ color: '#64748b' }}>No bidder applications found for the selected filter.</p>
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
                      backgroundColor: '#ffffff',
                      border: isSelected ? '2px solid #f59e0b' : (isCompliant ? '1px solid #86efac' : (isFlagged ? '1px solid #fde68a' : '1px solid #fecaca')),
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      boxShadow: isSelected ? '0 4px 20px rgba(245, 158, 11, 0.2)' : '0 4px 16px rgba(15, 23, 42, 0.05)'
                    }}
                  >
                    {/* Header Strip */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#0369a1', fontWeight: '800' }}>
                            {bid.id}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Applied for Tender: <strong>{bid.tenderId}</strong>
                          </span>
                          {isSelected && (
                            <span style={{ fontSize: '0.75rem', backgroundColor: '#fef3c7', color: '#92400e', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid #fde68a' }}>
                              <Award size={12} /> WINNING BIDDER (AWARDED)
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                          {bid.vendor}
                        </h3>
                        <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                          Category: {bid.category} • Quoted: <strong style={{ color: '#0284c7' }}>{bid.bidAmount}</strong> (Tender Est: {bid.tenderValue})
                        </span>
                      </div>

                      {/* Score & Status Pill */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>AI Score</span>
                          <span style={{ fontSize: '1.6rem', fontWeight: '900', color: isCompliant ? '#059669' : (isFlagged ? '#d97706' : '#dc2626') }}>
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
                              backgroundColor: isCompliant ? '#ecfdf5' : (isFlagged ? '#fffbeb' : '#fef2f2'),
                              color: isCompliant ? '#065f46' : (isFlagged ? '#92400e' : '#991b1b'),
                              border: `1px solid ${isCompliant ? '#a7f3d0' : (isFlagged ? '#fde68a' : '#fecaca')}`,
                              display: 'inline-block'
                            }}
                          >
                            {isSelected ? 'SELECTED / AWARDED' : (isCompliant ? 'COMPLIANT' : (isFlagged ? 'FLAGGED' : 'NON-COMPLIANT'))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Key Verification Parameter Badges */}
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Make in India (MII):</span>
                        <strong style={{ color: '#059669' }}>{bid.miiContent}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Audited Turnover:</span>
                        <strong style={{ color: '#0f172a' }}>{bid.turnover}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>GSTIN & PAN Status:</span>
                        <strong style={{ color: bid.gstStatus?.includes('ACTIVE') ? '#059669' : '#dc2626' }}>
                          {bid.gstStatus}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>OCR Forensics Confidence:</span>
                        <strong style={{ color: '#0284c7' }}>{bid.ocrConfidence}</strong>
                      </div>
                    </div>

                    {/* Flags / Discrepancies if any */}
                    {bid.flags && bid.flags.length > 0 && (
                      <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.6rem 0.85rem', fontSize: '0.82rem', color: '#991b1b' }}>
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#dc2626', marginBottom: '0.2rem' }}>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Submission Timestamp: {bid.date}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => onSelectBid(bid)}
                          style={{
                            padding: '0.45rem 0.85rem',
                            backgroundColor: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            color: '#0284c7',
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
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
                            }}
                          >
                            <Award size={14} /> Final Selection (Award Tender)
                          </button>
                        )}

                        {isSelected && (
                          <button
                            onClick={() => {
                              setSelectedKeymapTenderId(bid.tenderId);
                              setActiveSubTab('awarded');
                            }}
                            style={{
                              padding: '0.45rem 1rem',
                              backgroundColor: '#f59e0b',
                              color: '#000000',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                            }}
                          >
                            <Award size={14} /> 🏆 View & Approve Keymap
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

        {/* TAB 3: AWARDED TENDERS & SEQUENTIAL MILESTONE APPROVAL KEYMAP */}
        {activeSubTab === 'awarded' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #fed7aa', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Award size={14} /> PROCUREMENT OFFICER EXECUTION KEYMAP (GFR 2017 & 225)
                </span>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#475569' }}>
                  Review and check off each statutory milestone sequentially: <strong>1. Tender Approved &rarr; 2. Stock Supplied / Consignment Received &rarr; 3. CRAC Inspection &rarr; 4. Invoice Verification &rarr; 5. PFMS Payment Settlement</strong>. Checkboxes enforce statutory sequence.
                </p>
              </div>

              {selectedKeymapTenderId && (
                <button
                  onClick={() => setSelectedKeymapTenderId(null)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.78rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0284c7',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '700'
                  }}
                >
                  Show All Awarded Tenders
                </button>
              )}
            </div>

            {displayedAwardedTenders.length === 0 ? (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #f59e0b', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <Award size={28} color="#d97706" />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: '800', marginBottom: '0.5rem' }}>
                  Zero Awarded Contracts Found
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
                  No tenders have been awarded yet. Review received bidder applications in the "Received Applications" tab and select qualified L1 compliant vendors to initialize their sequential milestone keymaps.
                </p>
                <button
                  onClick={() => setActiveSubTab('applications')}
                  style={{
                    padding: '0.7rem 1.4rem',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)'
                  }}
                >
                  <Users size={17} />
                  <span>Review Received Bidder Applications</span>
                </button>
              </div>
            ) : (
              displayedAwardedTenders.map((tender) => {
                const milestone = tenderMilestones[tender.id] || createDefaultMilestones(tender.id, {
                  vendorName: tender.awardedVendor || tender.vendor || 'Apex Supplies Ltd.',
                  buyerOrg: tender.ministry || currentUser?.organization || 'Ministry of Defence, DRDO',
                  awardedValue: tender.estimatedValue || '₹1.38 Cr'
                });

                return (
                  <AwardedTenderKeymap
                    key={tender.id}
                    milestoneData={milestone}
                    tender={tender}
                    isOfficer={true}
                    currentUser={currentUser}
                    onUpdateMilestone={onUpdateMilestone}
                  />
                );
              })
            )}
          </div>
        )}

        {/* Create Bid Modal */}
        <CreateBidModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          currentUser={currentUser}
          onTenderCreated={(newTender) => {
            if (onTenderCreated) onTenderCreated(newTender);
          }}
        />
      </div>
    </div>
  );
}
