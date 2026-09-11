import React, { useState, useMemo } from 'react';
import {
  Building2, Search, Filter, ShieldCheck, CheckCircle2, AlertTriangle,
  XCircle, Award, FileText, ArrowRight, UploadCloud, Eye, RefreshCw,
  Layers, Clock, AlertCircle, CheckCircle, ChevronRight, X, Cpu,
  Sparkles, ExternalLink, ShieldAlert, BarChart3, HelpCircle, Home
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import AwardedTenderKeymap from './AwardedTenderKeymap';
import { createDefaultMilestones } from '../data/bidsData';

export default function BidderDashboard({
  tenders = [],
  bids = [],
  tenderMilestones = {},
  onUpdateMilestone,
  onOpenVerifierWithTender,
  onSelectBid,
  onNavigateToPassport,
  currentUser = null,
  onNavigateHome
}) {
  const { t } = useLanguage();

  // Primary Selection & Filtering States
  const sellerCategory = currentUser?.category || 'IT Hardware';
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('ALL'); // 'ALL', 'ACTIVE', 'AT_RISK', 'NON_COMPLIANT', 'PENDING', 'MY_SUBMISSIONS', 'AWARDED'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(currentUser?.category || 'IT Hardware');
  const [inspectingTender, setInspectingTender] = useState(null);

  // Scope submitted bids:
  // Fresh/registered bidder accounts start with ZERO submissions (mySubmissions: 0).
  // Demo accounts (Harshvardhan Sawale / Apex) show demo bids.
  const myBids = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.isDemo) {
      return bids;
    }
    return bids.filter(b => 
      b.submittedBy === currentUser.email || 
      b.vendorEmail === currentUser.email ||
      (currentUser.organization && b.vendor === currentUser.organization)
    );
  }, [bids, currentUser]);

  // Scope won / awarded tenders:
  const myAwardedTenders = useMemo(() => {
    const wonBidTenderIds = new Set(
      myBids.filter(b => b.status === 'Selected' || b.status === 'Awarded').map(b => b.tenderId)
    );

    if (currentUser?.isDemo) {
      wonBidTenderIds.add('GEM/2026/B/891244');
    }

    const list = [];
    const seenIds = new Set();

    for (const t of tenders) {
      const isWon = wonBidTenderIds.has(t.id) || (t.status === 'Awarded' && (
        (currentUser?.isDemo && t.id === 'GEM/2026/B/891244') ||
        (currentUser?.organization && (t.awardedVendor || '').includes(currentUser.organization)) ||
        (currentUser?.fullName && (t.awardedVendor || '').includes(currentUser.fullName))
      ));

      if (isWon && !seenIds.has(t.id)) {
        list.push(t);
        seenIds.add(t.id);
      }
    }

    // Also include any tender defined in tenderMilestones belonging to this vendor
    for (const [tId, mData] of Object.entries(tenderMilestones || {})) {
      if (!seenIds.has(tId)) {
        const isUserVendor = currentUser?.isDemo
          ? (mData.vendorName === 'Apex Supplies Ltd.' || tId === 'GEM/2026/B/891244')
          : (
            (currentUser?.organization && mData.vendorName === currentUser.organization) ||
            (currentUser?.fullName && mData.vendorName === currentUser.fullName)
          );
        if (isUserVendor) {
          const matched = tenders.find(t => t.id === tId);
          list.push(matched || {
            id: tId,
            title: `Procurement Contract (${tId})`,
            ministry: mData.buyerOrg || 'Ministry of Defence, DRDO',
            department: 'Central Procurement Wing',
            category: 'IT Hardware',
            estimatedValue: mData.awardedValue || '₹1.38 Cr',
            status: 'Awarded'
          });
          seenIds.add(tId);
        }
      }
    }

    return list;
  }, [myBids, tenders, tenderMilestones, currentUser]);

  // Helper to determine if a tender has been awarded
  const isTenderAwarded = (t) => {
    return t.status === 'Awarded' || !!t.selectedBidderId || !!t.awardedVendor || (tenderMilestones && !!tenderMilestones[t.id]);
  };

  // Active tenders pool for bidding (strictly excludes all awarded tenders so other sellers don't see them)
  const activeTenders = useMemo(() => {
    return tenders.filter(t => !isTenderAwarded(t));
  }, [tenders, tenderMilestones]);

  // Dynamic available categories for filter dropdown
  const availableCategories = useMemo(() => {
    const cats = new Set(tenders.map(t => t.category).filter(Boolean));
    if (sellerCategory) cats.add(sellerCategory);
    return Array.from(cats).sort();
  }, [tenders, sellerCategory]);

  // Categorized Tenders Counts (Scope strictly to active tenders pool)
  const counts = useMemo(() => {
    const activeList = activeTenders.filter(t => t.riskCategory === 'Active' || (!t.riskCategory && t.status === 'Active'));
    const atRiskList = activeTenders.filter(t => t.riskCategory === 'At Risk' || t.riskLevel?.toLowerCase().includes('risk') || t.status === 'Flagged');
    const nonCompliantList = activeTenders.filter(t => t.riskCategory === 'Non-Compliant' || t.status === 'Non-Compliant' || t.status === 'Rejected');
    const pendingList = activeTenders.filter(t => t.riskCategory === 'Pending Verification' || t.status === 'Pending Verification');
    const mySubmissions = myBids.length;
    const awarded = myAwardedTenders.length;

    return {
      all: activeTenders.length,
      active: activeList.length,
      atRisk: atRiskList.length,
      nonCompliant: nonCompliantList.length,
      pending: pendingList.length,
      mySubmissions,
      awarded
    };
  }, [activeTenders, myBids, myAwardedTenders]);

  // Filtered Tenders based on Tab, Search and Category (Strictly active pool)
  const filteredTenders = useMemo(() => {
    return activeTenders.filter((t) => {
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
  }, [activeTenders, selectedCategoryTab, searchQuery, categoryFilter]);

  // Filtered My Bids
  const filteredMyBids = useMemo(() => {
    return myBids.filter((b) => {
      const matchSearch =
        (b.vendor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.tenderId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || b.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [myBids, searchQuery, categoryFilter]);

  // Filtered Awarded Tenders
  const filteredAwardedTenders = useMemo(() => {
    return myAwardedTenders.filter((t) => {
      const matchSearch =
        (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.ministry || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.department || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || t.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [myAwardedTenders, searchQuery, categoryFilter]);

  const getTenderSubmission = (tenderId) => {
    return myBids.find(b => b.tenderId === tenderId);
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 35%, #fff7ed 70%, #ffffff 100%)', minHeight: '88vh', padding: '2.5rem 1.5rem', color: '#0f172a' }}>
      <div className="container-custom">
        {/* Top Header & Vendor Profile Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(224, 242, 254, 0.8) 0%, rgba(254, 243, 199, 0.5) 50%, rgba(255, 237, 213, 0.8) 100%)',
          padding: '1.75rem 2rem',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff', fontSize: '0.75rem', fontWeight: '800', padding: '0.25rem 0.75rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)' }}>
                BIDDER & SELLER PORTAL
              </span>
              <span style={{ color: '#0369a1', fontSize: '0.85rem', fontWeight: '700' }}>
                Vendor / Supplier Enterprise
              </span>
              {currentUser && (
                <span style={{ fontSize: '0.78rem', color: '#334155', backgroundColor: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: '999px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <Building2 size={13} style={{ color: '#0284c7' }} />
                  <span>Authenticated: <strong style={{ color: '#0f172a' }}>{currentUser.fullName}</strong> ({currentUser.organization || 'Apex Supplies Ltd.'})</span>
                </span>
              )}
            </div>
            <h1 className="heading-page" style={{ margin: 0, fontSize: '2.2rem' }}>
              Tender Selection & AI Document Verification
            </h1>
            <p className="text-lead" style={{ marginTop: '0.4rem', maxWidth: '850px' }}>
              Select published government tenders and join active bidding. Participation strictly requires autonomous 8-stage AI document verification (PAN, GSTIN, UDYAM MSME, CA Turnover Statement & Make-in-India declarations).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                style={{
                  width: '40px',
                  height: '40px',
                  padding: 0,
                  backgroundColor: '#ffffff',
                  color: '#0284c7',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                title="Return to GeM Homepage"
                aria-label="Return to GeM Homepage"
              >
                <Home size={18} color="#0284c7" />
              </button>
            )}
            <button
              onClick={() => onOpenVerifierWithTender(tenders[0] || null)}
              style={{
                padding: '0.7rem 1.35rem',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.88rem',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <Cpu size={17} />
              <span>Launch AI Document Verifier Sandbox</span>
            </button>
          </div>
        </div>

        {/* Digital Compliance Passport Banner */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #bae6fd',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #fff7ed 100%)',
          boxShadow: '0 4px 20px -2px rgba(2, 132, 199, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#e0f2fe',
              border: '1px solid #7dd3fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={26} color="#0284c7" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>
                  Digital Compliance Passport (Reusable Credential)
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  color: '#059669',
                  backgroundColor: '#ecfdf5',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  border: '1px solid #a7f3d0'
                }}>
                  RSA-2048 Signed
                </span>
              </div>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.86rem', color: '#475569' }}>
                Your PAN, GSTIN & UDYAM certificates are verified once and digitally signed. Present your passport QR across all bids without re-uploading documents.
              </p>
            </div>
          </div>
          {onNavigateToPassport && (
            <button
              onClick={onNavigateToPassport}
              style={{
                padding: '0.65rem 1.25rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>View Passport & QR Code</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>

        {/* 5 Core Feature KPI Filter Cards with Soft Hot/Cool Accents */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem', marginBottom: '2rem' }}>
          {/* Card 1: 1. ACTIVE TENDER */}
          <div
            onClick={() => setSelectedCategoryTab('ACTIVE')}
            style={{
              backgroundColor: '#ffffff',
              border: selectedCategoryTab === 'ACTIVE' ? '2px solid #10b981' : '1px solid #e2e8f0',
              background: selectedCategoryTab === 'ACTIVE' ? 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)' : '#ffffff',
              borderRadius: '14px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedCategoryTab === 'ACTIVE' ? '0 8px 24px -4px rgba(16, 185, 129, 0.25)' : '0 2px 10px rgba(15, 23, 42, 0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  1. Active Tenders
                </span>
              </div>
              <CheckCircle2 size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>
              {counts.active}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '0.35rem' }}>
              Open & ready for AI bidding
            </span>
          </div>

          {/* Card 2: 2. AT RISK TENDER */}
          <div
            onClick={() => setSelectedCategoryTab('AT_RISK')}
            style={{
              backgroundColor: '#ffffff',
              border: selectedCategoryTab === 'AT_RISK' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
              background: selectedCategoryTab === 'AT_RISK' ? 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)' : '#ffffff',
              borderRadius: '14px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedCategoryTab === 'AT_RISK' ? '0 8px 24px -4px rgba(245, 158, 11, 0.25)' : '0 2px 10px rgba(15, 23, 42, 0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  2. At Risk Tenders
                </span>
              </div>
              <AlertTriangle size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>
              {counts.atRisk}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#b45309', display: 'block', marginTop: '0.35rem' }}>
              Cartel alert / High scrutiny
            </span>
          </div>

          {/* Card 3: 3. NON-COMPLIANT TENDER */}
          <div
            onClick={() => setSelectedCategoryTab('NON_COMPLIANT')}
            style={{
              backgroundColor: '#ffffff',
              border: selectedCategoryTab === 'NON_COMPLIANT' ? '2px solid #ef4444' : '1px solid #e2e8f0',
              background: selectedCategoryTab === 'NON_COMPLIANT' ? 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)' : '#ffffff',
              borderRadius: '14px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedCategoryTab === 'NON_COMPLIANT' ? '0 8px 24px -4px rgba(239, 68, 68, 0.25)' : '0 2px 10px rgba(15, 23, 42, 0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  3. Non-Compliant
                </span>
              </div>
              <XCircle size={18} color="#ef4444" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>
              {counts.nonCompliant}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#b91c1c', display: 'block', marginTop: '0.35rem' }}>
              Statutory failed criteria
            </span>
          </div>

          {/* Card 4: 4. PENDING VERIFICATION */}
          <div
            onClick={() => setSelectedCategoryTab('PENDING')}
            style={{
              backgroundColor: '#ffffff',
              border: selectedCategoryTab === 'PENDING' ? '2px solid #0284c7' : '1px solid #e2e8f0',
              background: selectedCategoryTab === 'PENDING' ? 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)' : '#ffffff',
              borderRadius: '14px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedCategoryTab === 'PENDING' ? '0 8px 24px -4px rgba(2, 132, 199, 0.25)' : '0 2px 10px rgba(15, 23, 42, 0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  4. Pending Verification
                </span>
              </div>
              <Clock size={18} color="#0284c7" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>
              {counts.pending}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#0369a1', display: 'block', marginTop: '0.35rem' }}>
              8-Stage AI OCR in-progress
            </span>
          </div>

          {/* Card 5: 5. WON / AWARDED TENDERS */}
          <div
            onClick={() => setSelectedCategoryTab('AWARDED')}
            style={{
              backgroundColor: '#ffffff',
              border: selectedCategoryTab === 'AWARDED' ? '2px solid #f97316' : '1px solid #e2e8f0',
              background: selectedCategoryTab === 'AWARDED' ? 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)' : '#ffffff',
              borderRadius: '14px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedCategoryTab === 'AWARDED' ? '0 8px 24px -4px rgba(249, 115, 22, 0.25)' : '0 2px 10px rgba(15, 23, 42, 0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  5. Won / Awarded
                </span>
              </div>
              <Award size={18} color="#f97316" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>
              {counts.awarded}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#c2410c', display: 'block', marginTop: '0.35rem' }}>
              Sequential Keymap in progress
            </span>
          </div>
        </div>

        {/* Tab Selection Filter Bar (Tender Selection Page vs My Submissions) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                style={{
                  width: '38px',
                  height: '38px',
                  padding: 0,
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0284c7',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                title="Return to GeM Homepage"
                aria-label="Return to GeM Homepage"
              >
                <Home size={17} color="#0284c7" />
              </button>
            )}
            <button
              onClick={() => setSelectedCategoryTab('ALL')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: selectedCategoryTab === 'ALL' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : '#ffffff',
                color: selectedCategoryTab === 'ALL' ? '#ffffff' : '#475569',
                boxShadow: selectedCategoryTab === 'ALL' ? '0 2px 8px rgba(2, 132, 199, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <FileText size={15} /> All Tenders ({counts.all})
            </button>

            <button
              onClick={() => setSelectedCategoryTab('ACTIVE')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: selectedCategoryTab === 'ACTIVE' ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : '#ffffff',
                color: selectedCategoryTab === 'ACTIVE' ? '#ffffff' : '#059669',
                boxShadow: selectedCategoryTab === 'ACTIVE' ? '0 2px 8px rgba(16, 185, 129, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              🟢 1. Active ({counts.active})
            </button>

            <button
              onClick={() => setSelectedCategoryTab('AT_RISK')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: selectedCategoryTab === 'AT_RISK' ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' : '#ffffff',
                color: selectedCategoryTab === 'AT_RISK' ? '#ffffff' : '#d97706',
                boxShadow: selectedCategoryTab === 'AT_RISK' ? '0 2px 8px rgba(245, 158, 11, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              ⚠️ 2. At Risk ({counts.atRisk})
            </button>

            <button
              onClick={() => setSelectedCategoryTab('NON_COMPLIANT')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: selectedCategoryTab === 'NON_COMPLIANT' ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : '#ffffff',
                color: selectedCategoryTab === 'NON_COMPLIANT' ? '#ffffff' : '#dc2626',
                boxShadow: selectedCategoryTab === 'NON_COMPLIANT' ? '0 2px 8px rgba(239, 68, 68, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              🔴 3. Non-Compliant ({counts.nonCompliant})
            </button>

            <button
              onClick={() => setSelectedCategoryTab('PENDING')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: selectedCategoryTab === 'PENDING' ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)' : '#ffffff',
                color: selectedCategoryTab === 'PENDING' ? '#ffffff' : '#0284c7',
                boxShadow: selectedCategoryTab === 'PENDING' ? '0 2px 8px rgba(2, 132, 199, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              ⏳ 4. Pending Verification ({counts.pending})
            </button>

            <button
              onClick={() => setSelectedCategoryTab('MY_SUBMISSIONS')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: selectedCategoryTab === 'MY_SUBMISSIONS' ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' : '#ffffff',
                color: selectedCategoryTab === 'MY_SUBMISSIONS' ? '#ffffff' : '#7c3aed',
                boxShadow: selectedCategoryTab === 'MY_SUBMISSIONS' ? '0 2px 8px rgba(139, 92, 246, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <UploadCloud size={15} /> My Submitted Bids ({counts.mySubmissions})
            </button>

            <button
              onClick={() => setSelectedCategoryTab('AWARDED')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: selectedCategoryTab === 'AWARDED' ? 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)' : '#ffffff',
                color: selectedCategoryTab === 'AWARDED' ? '#ffffff' : '#ea580c',
                boxShadow: selectedCategoryTab === 'AWARDED' ? '0 2px 8px rgba(249, 115, 22, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                fontWeight: '800',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Award size={15} /> 🏆 Won / Awarded Tenders ({counts.awarded})
            </button>
          </div>

          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing: <strong style={{ color: '#0f172a' }}>
              {selectedCategoryTab === 'MY_SUBMISSIONS'
                ? filteredMyBids.length
                : (selectedCategoryTab === 'AWARDED' ? filteredAwardedTenders.length : filteredTenders.length)} entries
            </strong>
          </span>
        </div>

        {/* Search & Category Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search tenders by keyword, tender ID, ministry, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCategoryFilter(sellerCategory)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: categoryFilter === sellerCategory ? '1px solid #059669' : '1px solid #cbd5e1',
                backgroundColor: categoryFilter === sellerCategory ? 'rgba(16, 185, 129, 0.12)' : '#ffffff',
                color: categoryFilter === sellerCategory ? '#065f46' : '#475569',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title={`Filter to your registered business category: ${sellerCategory}`}
            >
              <span>🎯 My Category ({sellerCategory})</span>
            </button>

            <button
              onClick={() => setCategoryFilter('ALL')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: categoryFilter === 'ALL' ? '1px solid #0284c7' : '1px solid #cbd5e1',
                backgroundColor: categoryFilter === 'ALL' ? 'rgba(2, 132, 199, 0.12)' : '#ffffff',
                color: categoryFilter === 'ALL' ? '#0369a1' : '#475569',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🌐 All Categories
            </button>

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
              <option value="ALL">All Market Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} {cat === sellerCategory ? '★ (Your Category)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Seller Category Personalization Notification Banner */}
        {categoryFilter === sellerCategory && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '0.6rem 0.95rem',
            marginBottom: '1rem',
            fontSize: '0.84rem',
            color: '#065f46'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🎯</span>
              <span>
                <strong>Category Targeting Active:</strong> Showing active tenders matching your registered business category (<strong>{sellerCategory}</strong>).
              </span>
            </div>
            <button
              onClick={() => setCategoryFilter('ALL')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#047857',
                textDecoration: 'underline',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >
              View all marketplace categories
            </button>
          </div>
        )}

        {/* Quick Search Keyword Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Quick Search:</span>
          {['IT Hardware', 'Software', 'Medical Equipment', 'Defence', 'Make in India'].map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setSearchQuery(chip === searchQuery ? '' : chip);
                if (selectedCategoryTab === 'MY_SUBMISSIONS' || selectedCategoryTab === 'AWARDED') setSelectedCategoryTab('ALL');
              }}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                border: searchQuery === chip ? '1px solid #059669' : '1px solid #cbd5e1',
                backgroundColor: searchQuery === chip ? '#ecfdf5' : '#ffffff',
                color: searchQuery === chip ? '#065f46' : '#475569',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.15s ease'
              }}
            >
              {chip}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >
              ✕ Clear Search
            </button>
          )}
        </div>

        {/* MAIN HOMEPAGE VIEW: TENDER DISCOVERY & SELECTION PAGE */}
        {selectedCategoryTab !== 'MY_SUBMISSIONS' && selectedCategoryTab !== 'AWARDED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredTenders.length === 0 ? (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '0.5rem' }}>No tenders found matching the active filter.</p>
                <button
                  onClick={() => { setSelectedCategoryTab('ALL'); setSearchQuery(''); setCategoryFilter('ALL'); }}
                  style={{ padding: '0.5rem 1.2rem', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
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
                      backgroundColor: '#ffffff',
                      border: isNonCompliant
                        ? '1px solid rgba(239, 68, 68, 0.4)'
                        : (isAtRisk ? '1px solid rgba(245, 158, 11, 0.4)' : (isPending ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid #e2e8f0')),
                      borderRadius: '12px',
                      padding: '1.4rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.1rem',
                      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Top Row: Tender ID, Badges & Estimated Value */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.8rem', color: '#0369a1', fontFamily: 'monospace', fontWeight: '800' }}>
                            {tender.id}
                          </span>
                          <span style={{ fontSize: '0.72rem', padding: '0.18rem 0.55rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '600' }}>
                            {tender.category}
                          </span>
                          {tender.category === sellerCategory && (
                            <span style={{ fontSize: '0.72rem', padding: '0.18rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#065f46', fontWeight: '800', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                              🎯 Matches Your Category
                            </span>
                          )}

                          {/* 4 Category Badges */}
                          {isActive && (
                            <span style={{ fontSize: '0.72rem', padding: '0.18rem 0.6rem', borderRadius: '4px', backgroundColor: '#ecfdf5', color: '#065f46', fontWeight: '800', border: '1px solid #a7f3d0' }}>
                              🟢 1. ACTIVE TENDER
                            </span>
                          )}
                          {isAtRisk && (
                            <span style={{ fontSize: '0.72rem', padding: '0.18rem 0.6rem', borderRadius: '4px', backgroundColor: '#fffbeb', color: '#92400e', fontWeight: '800', border: '1px solid #fde68a' }}>
                              ⚠️ 2. AT RISK TENDER
                            </span>
                          )}
                          {isNonCompliant && (
                            <span style={{ fontSize: '0.72rem', padding: '0.18rem 0.6rem', borderRadius: '4px', backgroundColor: '#fef2f2', color: '#991b1b', fontWeight: '800', border: '1px solid #fecaca' }}>
                              🔴 3. NON-COMPLIANT
                            </span>
                          )}
                          {isPending && (
                            <span style={{ fontSize: '0.72rem', padding: '0.18rem 0.6rem', borderRadius: '4px', backgroundColor: '#f0f9ff', color: '#0369a1', fontWeight: '800', border: '1px solid #bae6fd' }}>
                              ⏳ 4. PENDING VERIFICATION
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0, fontWeight: '800', lineHeight: 1.3 }}>
                          {tender.title}
                        </h3>
                        <span style={{ fontSize: '0.84rem', color: '#475569', display: 'block', marginTop: '0.25rem' }}>
                          🏛️ {tender.ministry} • {tender.department}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right', minWidth: '150px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                          Tender Estimated Value
                        </span>
                        <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0284c7' }}>
                          {tender.estimatedValue}
                        </span>
                        <span style={{ fontSize: '0.76rem', color: '#d97706', display: 'block', marginTop: '2px' }}>
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
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fde68a',
                        borderRadius: '8px',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.82rem',
                        color: '#92400e'
                      }}>
                        <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#d97706' }} />
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
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.82rem',
                        color: '#991b1b'
                      }}>
                        <XCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
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
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '8px',
                        padding: '0.75rem 0.85rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                          <span style={{ color: '#0369a1', fontWeight: '700' }}>
                            ⚙️ AI Verification Progress: {tender.verificationStage || 'Running OCR & Rule Engine'}
                          </span>
                          <span style={{ color: '#0284c7', fontWeight: '800' }}>
                            {tender.ocrProgress || 55}% (Confidence: {tender.ocrConfidence || '97.8%'})
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${tender.ocrProgress || 55}%`,
                              height: '100%',
                              backgroundColor: '#0284c7',
                              transition: 'width 0.4s ease'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Statutory Criteria Grid */}
                    <div style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
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
                        <strong style={{ color: '#059669' }}>{tender.miiMinRequirement || '50% (Class-I)'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                          Min Turnover Requirement:
                        </span>
                        <strong style={{ color: '#0f172a' }}>{tender.minTurnoverRequirement || '₹2.0 Cr'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                          Min Experience:
                        </span>
                        <strong style={{ color: '#0f172a' }}>{tender.minExperienceYears || 3} Years</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                          EMD Amount:
                        </span>
                        <strong style={{ color: '#0f172a' }}>{tender.emdAmount}</strong>
                      </div>
                    </div>

                    {/* Required Documents Checklist */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#475569' }}>
                      <span style={{ color: '#0f172a', fontWeight: '700' }}>Required AI Verification Documents:</span>
                      {(tender.mandatoryDocs || ["PAN Card", "GSTIN Certificate", "UDYAM MSME", "CA Audited Turnover", "Make in India Declaration"]).map((doc, idx) => (
                        <span key={idx} style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#334155', fontWeight: '500' }}>
                          ✓ {doc}
                        </span>
                      ))}
                    </div>

                    {/* Bottom Actions Row: Joining Bidding (Document Verification Gate) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem' }}>
                      <button
                        onClick={() => setInspectingTender(tender)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0284c7',
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
                          <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={16} /> Verified Proposal Submitted (Score: {existingSubmission.score}/100)
                          </span>
                          <button
                            onClick={() => onSelectBid(existingSubmission)}
                            style={{
                              padding: '0.45rem 0.85rem',
                              backgroundColor: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#065f46',
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
                            color: '#ffffff',
                            fontWeight: '800',
                            fontSize: '0.88rem',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            boxShadow: isNonCompliant
                              ? '0 2px 10px rgba(239, 68, 68, 0.25)'
                              : (isAtRisk ? '0 2px 10px rgba(245, 158, 11, 0.25)' : '0 2px 10px rgba(16, 185, 129, 0.25)'),
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
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #10b981', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <UploadCloud size={28} color="#10b981" />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: '800', marginBottom: '0.5rem' }}>
                  Zero Submitted Bids
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
                  You have not submitted any bids yet. Search active government procurement tenders in the portal to verify your compliance documents and submit your bid.
                </p>
                <button
                  onClick={() => { setSelectedCategoryTab('ALL'); setSearchQuery(''); }}
                  style={{
                    padding: '0.7rem 1.4rem',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <Search size={17} />
                  <span>Search Active Tenders to Apply</span>
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
                      backgroundColor: '#ffffff',
                      border: isSelected ? '2px solid #f59e0b' : (isCompliant ? '1px solid #10b981' : (isFlagged ? '1px solid #f59e0b' : '1px solid #ef4444')),
                      borderRadius: '12px',
                      padding: '1.4rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#0369a1', fontWeight: '800' }}>
                            {bid.id}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Tender Ref: <strong>{bid.tenderId}</strong>
                          </span>
                          {isSelected && (
                            <span style={{ fontSize: '0.75rem', backgroundColor: '#fef3c7', color: '#92400e', fontWeight: '900', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid #fde68a' }}>
                              <Award size={13} /> WON & AWARDED
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                          {bid.vendor}
                        </h3>
                        <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                          Quoted Bid: <strong style={{ color: '#0284c7' }}>{bid.bidAmount}</strong> • Category: {bid.category} • Submitted: {bid.date}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>AI Score</span>
                          <span style={{ fontSize: '1.6rem', fontWeight: '900', color: isCompliant ? '#059669' : (isFlagged ? '#d97706' : '#dc2626') }}>
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

                    {/* AI Verification Parameters */}
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Local Content (MII):</span>
                        <strong style={{ color: '#059669' }}>{bid.miiContent}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Turnover Status:</span>
                        <strong style={{ color: '#0f172a' }}>{bid.turnover}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>GSTIN Status:</span>
                        <strong style={{ color: bid.gstStatus.includes('Cancel') ? '#dc2626' : '#059669' }}>{bid.gstStatus}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>OCR Confidence:</span>
                        <strong style={{ color: '#0284c7' }}>{bid.ocrConfidence || '99.1%'}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: '#0284c7' }}>
                        Autonomous AI Compliance Dossier generated & transmitted to Government Procuring Authority
                      </span>
                      <button
                        onClick={() => onSelectBid(bid)}
                        style={{
                          padding: '0.45rem 0.95rem',
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
                        <Eye size={14} /> View AI Compliance Dossier
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* VIEW 3: WON & AWARDED TENDERS & SEQUENTIAL EXECUTION KEYMAP */}
        {selectedCategoryTab === 'AWARDED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredAwardedTenders.length === 0 ? (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #f59e0b', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <Award size={28} color="#d97706" />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: '800', marginBottom: '0.5rem' }}>
                  Zero Awarded Tenders
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '540px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
                  You do not have any awarded contracts yet. Once the Government Procurement Officer reviews your submitted bid and awards the contract to your enterprise, your full 5-stage sequential milestone keymap (Tender Approved &rarr; Stock Supplied &rarr; Inspection &rarr; Invoice &rarr; Payment) will be tracked here in real-time.
                </p>
                <button
                  onClick={() => { setSelectedCategoryTab('ALL'); setSearchQuery(''); }}
                  style={{
                    padding: '0.7rem 1.4rem',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <Search size={17} />
                  <span>Browse Active Government Tenders</span>
                </button>
              </div>
            ) : (
              filteredAwardedTenders.map((tender) => {
                const milestone = tenderMilestones[tender.id] || createDefaultMilestones(tender.id, {
                  vendorName: currentUser?.organization || currentUser?.fullName || "Apex Supplies Ltd.",
                  buyerOrg: tender.ministry || "Ministry of Defence, DRDO",
                  awardedValue: tender.estimatedValue || "₹1.38 Cr"
                });

                return (
                  <AwardedTenderKeymap
                    key={tender.id}
                    milestoneData={milestone}
                    tender={tender}
                    isOfficer={false}
                    currentUser={currentUser}
                    onUpdateMilestone={onUpdateMilestone}
                  />
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
                  <strong style={{ display: 'block', marginBottom: '0.4rem', color: '#0f172a', fontSize: '0.88rem' }}>
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
                  <strong style={{ display: 'block', marginBottom: '0.4rem', color: '#0f172a', fontSize: '0.88rem' }}>
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
