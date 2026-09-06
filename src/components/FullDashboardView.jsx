import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, AlertTriangle, XCircle, FileSpreadsheet, PlusCircle, RefreshCw } from 'lucide-react';
import { summaryMetrics } from '../data/bidsData';
import { useLanguage } from '../context/LanguageContext';

export default function FullDashboardView({ bids, onSelectBid, onOpenBidVerifier, searchQuery, setSearchQuery }) {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredBids = bids.filter((bid) => {
    const matchesSearch =
      bid.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bid.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bid.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bid.tenderId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || bid.status.toUpperCase() === statusFilter;

    const matchesCat =
      selectedCategory === 'ALL' || bid.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCat;
  });

  return (
    <div style={{ backgroundColor: '#0b1a2d', minHeight: '80vh', padding: '2.5rem 1.5rem', color: '#ffffff' }}>
      <div className="container-custom">
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="section-tag" style={{ marginBottom: '0.25rem' }}>{t('officerTag')}</span>
            <h1 className="serif-heading" style={{ fontSize: '2.2rem', color: '#ffffff', margin: 0 }}>
              {t('officerTitle')}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              {t('officerSubtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onOpenBidVerifier}
              style={{
                padding: '0.65rem 1.25rem',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.88rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}
            >
              <PlusCircle size={16} /> {t('newBidVerification')}
            </button>
            <button
              onClick={() => window.print()}
              style={{
                padding: '0.65rem 1.15rem',
                backgroundColor: '#0f2238',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '0.88rem',
                borderRadius: '8px',
                border: '1px solid #1e385b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <FileSpreadsheet size={16} /> {t('exportAuditLog')}
            </button>
          </div>
        </div>

        {/* 4 Stat KPI Cards */}
        <div className="terminal-stat-cards" style={{ marginBottom: '2rem' }}>
          <div className="terminal-card">
            <span className="t-card-label">{t('activeBids')}</span>
            <div className="t-card-value-row">
              <span className="t-card-value">{summaryMetrics.activeBids}</span>
              <span className="t-card-badge green">{summaryMetrics.activeChange}</span>
            </div>
          </div>

          <div className="terminal-card">
            <span className="t-card-label">{t('compliant')}</span>
            <div className="t-card-value-row">
              <span className="t-card-value">{summaryMetrics.compliant}</span>
              <span className="t-card-badge green">{summaryMetrics.compliantPercent}</span>
            </div>
          </div>

          <div className="terminal-card">
            <span className="t-card-label">{t('flagged')}</span>
            <div className="t-card-value-row">
              <span className="t-card-value">{summaryMetrics.flagged}</span>
              <span className="t-card-badge orange">{summaryMetrics.flaggedPercent}</span>
            </div>
          </div>

          <div className="terminal-card">
            <span className="t-card-label">{t('rejected')}</span>
            <div className="t-card-value-row">
              <span className="t-card-value">{summaryMetrics.rejected}</span>
              <span className="t-card-badge red">{summaryMetrics.rejectedPercent}</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div
          style={{
            backgroundColor: '#0f2238',
            border: '1px solid #1e385b',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}
        >
          {/* Status Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { code: 'ALL', label: 'ALL' },
              { code: 'COMPLIANT', label: t('compliant') },
              { code: 'FLAGGED', label: t('flagged') },
              { code: 'REJECTED', label: t('rejected') }
            ].map((st) => (
              <button
                key={st.code}
                onClick={() => setStatusFilter(st.code)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: statusFilter === st.code ? '1px solid transparent' : '1px solid #1e385b',
                  backgroundColor:
                    statusFilter === st.code
                      ? st.code === 'COMPLIANT'
                        ? '#10b981'
                        : st.code === 'FLAGGED'
                        ? '#f59e0b'
                        : st.code === 'REJECTED'
                        ? '#ef4444'
                        : '#38bdf8'
                      : 'transparent',
                  color: statusFilter === st.code ? '#ffffff' : '#94a3b8'
                }}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                borderRadius: '6px',
                border: '1px solid #1e385b',
                backgroundColor: '#081729',
                color: '#ffffff',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Bids Table */}
        <div style={{ backgroundColor: '#081729', border: '1px solid #1e385b', borderRadius: '12px', overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 2fr 1.2fr 1fr 1fr 1fr 0.8fr',
              padding: '0.85rem 1.25rem',
              backgroundColor: '#061120',
              borderBottom: '1px solid #162c47',
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#94a3b8',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            <span>{t('bidId')}</span>
            <span>{t('vendorEntity')}</span>
            <span>{t('category')}</span>
            <span>{t('amount')}</span>
            <span>{t('status')}</span>
            <span>{t('localContent')}</span>
            <span style={{ textAlign: 'right' }}>{t('score')}</span>
          </div>

          {filteredBids.length > 0 ? (
            filteredBids.map((bid) => (
              <div
                key={bid.id}
                onClick={() => onSelectBid(bid)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 2fr 1.2fr 1fr 1fr 1fr 0.8fr',
                  alignItems: 'center',
                  padding: '0.95rem 1.25rem',
                  borderBottom: '1px solid rgba(30, 56, 91, 0.4)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(30, 56, 91, 0.4)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span className="mono-text" style={{ color: '#7dd3fc', fontWeight: '600' }}>{bid.id}</span>
                <div>
                  <span style={{ color: '#ffffff', fontWeight: '700', display: 'block' }}>{bid.vendor}</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{bid.tenderId}</span>
                </div>
                <span style={{ color: '#cbd5e1' }}>{bid.category}</span>
                <span style={{ color: '#ffffff', fontWeight: '600' }}>{bid.bidAmount}</span>
                <div>
                  <span className={`d-status-badge ${bid.status.toLowerCase()}`}>
                    {bid.status === 'Compliant' ? t('compliant') : bid.status === 'Flagged' ? t('flagged') : t('rejected')}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{bid.miiContent}</span>
                <span className="mono-text" style={{ color: '#ffffff', fontWeight: '800', fontSize: '1rem', textAlign: 'right' }}>
                  {bid.score}
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              No bids found matching current search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
