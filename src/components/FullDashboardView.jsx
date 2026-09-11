import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldCheck, AlertTriangle, XCircle, FileSpreadsheet, PlusCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function FullDashboardView({ bids, onSelectBid, onOpenBidVerifier, searchQuery, setSearchQuery }) {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const summaryMetrics = useMemo(() => {
    const total = bids.length;
    const compliant = bids.filter(b => (b.status || '').toUpperCase() === 'COMPLIANT').length;
    const flagged = bids.filter(b => (b.status || '').toUpperCase() === 'FLAGGED').length;
    const rejected = bids.filter(b => (b.status || '').toUpperCase() === 'REJECTED').length;
    const pct = (n) => total > 0 ? `${Math.round((n / total) * 100)}%` : '0%';
    return {
      activeBids: total,
      activeChange: `+${total}`,
      compliant,
      compliantPercent: pct(compliant),
      flagged,
      flaggedPercent: pct(flagged),
      rejected,
      rejectedPercent: pct(rejected),
    };
  }, [bids]);

  const filteredBids = bids.filter((bid) => {
    const matchesSearch =
      (bid.vendor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bid.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bid.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bid.tenderId || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || bid.status.toUpperCase() === statusFilter;

    const matchesCat =
      selectedCategory === 'ALL' || bid.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCat;
  });

  return (
    <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdf4 35%, #eff6ff 70%, #fff7ed 100%)', minHeight: '85vh', padding: '2.5rem 1.5rem', color: '#0f172a' }}>
      <div className="container-custom">
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="section-tag" style={{ marginBottom: '0.25rem', backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' }}>{t('officerTag')}</span>
            <h1 className="serif-heading" style={{ fontSize: '2.2rem', color: '#0f172a', margin: 0, fontWeight: '800' }}>
              {t('officerTitle')}
            </h1>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              {t('officerSubtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onOpenBidVerifier}
              style={{
                padding: '0.65rem 1.25rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.88rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
              }}
            >
              <PlusCircle size={16} /> {t('newBidVerification')}
            </button>
            <button
              onClick={() => window.print()}
              style={{
                padding: '0.65rem 1.15rem',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontWeight: '700',
                fontSize: '0.88rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
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
                  padding: '0.45rem 0.95rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: statusFilter === st.code ? '1px solid transparent' : '1px solid #cbd5e1',
                  backgroundColor:
                    statusFilter === st.code
                      ? st.code === 'COMPLIANT'
                        ? '#059669'
                        : st.code === 'FLAGGED'
                        ? '#d97706'
                        : st.code === 'REJECTED'
                        ? '#dc2626'
                        : '#0284c7'
                      : '#f8fafc',
                  color: statusFilter === st.code ? '#ffffff' : '#475569',
                  boxShadow: statusFilter === st.code ? '0 2px 6px rgba(0,0,0,0.12)' : 'none'
                }}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Bids Table */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 2fr 1.2fr 1fr 1fr 1fr 0.8fr',
              padding: '0.95rem 1.25rem',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderBottom: '1px solid #e2e8f0',
              fontSize: '0.78rem',
              fontWeight: '800',
              color: '#475569',
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
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <span className="mono-text" style={{ color: '#0284c7', fontWeight: '700' }}>{bid.id}</span>
                <div>
                  <span style={{ color: '#0f172a', fontWeight: '700', display: 'block' }}>{bid.vendor}</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{bid.tenderId}</span>
                </div>
                <span style={{ color: '#475569', fontWeight: '500' }}>{bid.category}</span>
                <span style={{ color: '#0f172a', fontWeight: '700' }}>{bid.bidAmount}</span>
                <div>
                  <span className={`d-status-badge ${bid.status.toLowerCase()}`}>
                    {bid.status === 'Compliant' ? t('compliant') : bid.status === 'Flagged' ? t('flagged') : t('rejected')}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{bid.miiContent}</span>
                <span className="mono-text" style={{ color: '#059669', fontWeight: '800', fontSize: '1rem', textAlign: 'right' }}>
                  {bid.score}
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
              No bids found matching current search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
