import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { gemApi } from '../services/api';
import { initialContracts } from '../data/bidsData';
import { Search, Filter, FileText, CheckCircle, IndianRupee, Clock, Briefcase, FileSignature, X, Home } from 'lucide-react';

const ContractsView = ({ currentUser, initialFilter = 'ALL', initialSearch = '', onNavigateHome }) => {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState(initialContracts || []);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(initialFilter || 'ALL');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  
  useEffect(() => {
    if (initialFilter) setStatusFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialSearch]);

  const fetchContracts = async (mounted) => {
    try {
      setLoading(true);
      const data = await gemApi.getContracts();
      if (mounted) {
        setContracts(data && data.length > 0 ? data : initialContracts);
      }
    } catch (err) {
      console.error(err);
      if (mounted) setContracts(initialContracts);
    } finally {
      if (mounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchContracts(isMounted);
    return () => { isMounted = false; };
  }, []);

  const stats = useMemo(() => {
    return {
      total: contracts.length,
      cracApproved: contracts.filter(c => c.cracStatus === 'Approved').length,
      settled: contracts.filter(c => c.paymentStatus?.includes('Settled')).length,
      pending: contracts.filter(c => c.cracStatus === 'Pending Inspection' || c.paymentStatus?.includes('Processing') || c.paymentStatus?.includes('Awaiting')).length,
    };
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    let list = contracts;

    if (statusFilter !== 'ALL') {
      list = list.filter(c => {
        if (statusFilter === 'Pending Inspection') return c.cracStatus === 'Pending Inspection';
        if (statusFilter === 'Approved') return c.cracStatus === 'Approved';
        if (statusFilter === 'Payment Processing') return c.paymentStatus?.includes('Processing') || c.paymentStatus?.includes('Awaiting');
        if (statusFilter === 'Settled') return c.paymentStatus?.includes('Settled');
        return true;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => 
        (c.id?.toLowerCase().includes(q)) ||
        (c.tenderId?.toLowerCase().includes(q)) ||
        (c.vendorName?.toLowerCase().includes(q)) ||
        (c.buyerOrg?.toLowerCase().includes(q)) ||
        (c.disbursementRef?.toLowerCase().includes(q))
      );
    }

    return list;
  }, [contracts, statusFilter, searchQuery]);

  const getCracColor = (status) => {
    if (status === 'Approved') return '#10b981';
    if (status === 'Pending Inspection') return '#f59e0b';
    if (status === 'Rejected') return '#ef4444';
    return '#94a3b8';
  };

  const getPaymentColor = (status) => {
    if (!status) return '#94a3b8';
    if (status.includes('Settled')) return '#10b981';
    if (status.includes('Processing')) return '#f59e0b';
    if (status.includes('Withheld') || status.includes('Rejected')) return '#ef4444';
    return '#94a3b8';
  };

  const handleApproveCrac = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Approve CRAC (Consignee Receipt and Acceptance Certificate) for this delivery?')) {
      // Optimistic state update
      setContracts(prev => prev.map(c => c.id === id ? { ...c, cracStatus: 'Approved', cracDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), paymentStatus: 'Payment Processing (Day 1/10)' } : c));
      try {
        await gemApi.approveCrac(id);
      } catch (err) {
        console.warn('Offline approve CRAC');
      }
    }
  };

  const handleProcessPayment = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Initiate electronic payment settlement via PFMS for this contract?')) {
      // Optimistic state update
      setContracts(prev => prev.map(c => c.id === id ? { ...c, paymentStatus: 'Settled (100%)', disbursementRef: `PFMS-TXN-${Date.now().toString().slice(-8)}` } : c));
      try {
        await gemApi.processPayment(id);
      } catch (err) {
        console.warn('Offline process payment');
      }
    }
  };

  const isOfficerOrBuyer = currentUser?.role === 'officer' || currentUser?.role === 'buyer';

  return (
    <div style={{ padding: '1.75rem', minHeight: '88vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 35%, #fff7ed 70%, #ffffff 100%)', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="section-tag" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #fed7aa 100%)', color: '#0369a1', border: '1px solid #bae6fd', fontWeight: '800' }}>
            {t('contractTag') || 'CONTRACTS & PAYMENTS (GFR 225)'}
          </span>
          <h2 style={{ margin: '0.4rem 0', fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
            {t('contractTitle') || 'Contract Management Portal'}
          </h2>
          <p style={{ color: '#475569', margin: 0, fontSize: '0.92rem', lineHeight: '1.5' }}>
            {t('contractSubtitle') || 'Track CRAC inspections, process 10-day PFMS payments, and manage contract lifecycles.'}
          </p>
        </div>
        {onNavigateHome && (
          <button 
            onClick={onNavigateHome}
            style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.65rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              transition: 'all 0.2s ease'
            }}
            title="Return to GeM Homepage"
          >
            <Home size={16} color="#0284c7" />
            <span>🏠 Homepage</span>
          </button>
        )}
      </div>

      <div className="terminal-stat-cards" style={{ marginBottom: '1.75rem' }}>
        <div className="terminal-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="t-card-label" style={{ color: '#475569' }}><Briefcase size={14} style={{marginRight:'0.4rem', color: '#0284c7'}}/> Total Contracts</div>
          <div className="t-card-value-row">
            <span className="t-card-value" style={{ color: '#0f172a' }}>{stats.total}</span>
          </div>
        </div>
        <div className="terminal-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="t-card-label" style={{ color: '#475569' }}><CheckCircle size={14} style={{marginRight:'0.4rem', color: '#10b981'}}/> CRAC Approved</div>
          <div className="t-card-value-row">
            <span className="t-card-value" style={{ color: '#0f172a' }}>{stats.cracApproved}</span>
            <span className="t-card-badge green">cleared</span>
          </div>
        </div>
        <div className="terminal-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="t-card-label" style={{ color: '#475569' }}><IndianRupee size={14} style={{marginRight:'0.4rem', color: '#059669'}}/> Payment Settled</div>
          <div className="t-card-value-row">
            <span className="t-card-value" style={{ color: '#0f172a' }}>{stats.settled}</span>
            <span className="t-card-badge green">paid</span>
          </div>
        </div>
        <div className="terminal-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="t-card-label" style={{ color: '#475569' }}><Clock size={14} style={{marginRight:'0.4rem', color: '#f59e0b'}}/> Pending Action</div>
          <div className="t-card-value-row">
            <span className="t-card-value" style={{ color: '#0f172a' }}>{stats.pending}</span>
            <span className="t-card-badge orange">attn</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          {['ALL', 'Pending Inspection', 'Approved', 'Payment Processing', 'Settled'].map(status => {
            const isSel = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={{
                  background: isSel ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#ffffff',
                  color: isSel ? '#ffffff' : '#475569',
                  border: `1px solid ${isSel ? '#0284c7' : '#cbd5e1'}`,
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: isSel ? '700' : '600',
                  cursor: 'pointer',
                  boxShadow: isSel ? '0 2px 6px rgba(2, 132, 199, 0.2)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {status}
              </button>
            );
          })}
        </div>

        {/* Contract Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search PO ID, Tender ID, Vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              padding: '0.45rem 1rem 0.45rem 2.2rem',
              borderRadius: '6px',
              width: '260px',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 1.2fr 1.5fr 1.5fr 1fr 1.2fr 1.2fr 1.5fr', 
          padding: '0.85rem 1.25rem', 
          backgroundColor: '#f8fafc', 
          borderBottom: '1px solid #e2e8f0', 
          fontSize: '0.76rem', 
          fontWeight: '700', 
          color: '#475569', 
          letterSpacing: '0.04em', 
          textTransform: 'uppercase' 
        }}>
          <div>{t('poIdCol') || 'PO ID'}</div>
          <div>{t('tenderIdCol') || 'TENDER ID'}</div>
          <div>{t('vendorCol') || 'VENDOR'}</div>
          <div>{t('buyerOrgCol') || 'BUYER ORG'}</div>
          <div>{t('contractValueCol') || 'VALUE'}</div>
          <div>{t('cracStatusCol') || 'CRAC STATUS'}</div>
          <div>{t('paymentStatusCol') || 'PAYMENT'}</div>
          <div style={{ textAlign: 'right' }}>ACTIONS</div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading contracts...</div>
        ) : filteredContracts.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
            <FileSignature size={36} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.5, color: '#0284c7' }} />
            <h4 style={{ color: '#0f172a', marginBottom: '0.35rem', fontSize: '1.05rem', fontWeight: '700' }}>No contracts found</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Try clearing filters or search query.</p>
          </div>
        ) : (
          filteredContracts.map((contract, i) => (
            <div 
              key={contract.id || i}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1.2fr 1.2fr 1.5fr 1.5fr 1fr 1.2fr 1.2fr 1.5fr', 
                padding: '0.95rem 1.25rem', 
                borderBottom: '1px solid #f1f5f9', 
                fontSize: '0.85rem',
                alignItems: 'center',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <div className="mono-text" style={{ color: '#0284c7', fontWeight: '700' }}>{contract.id}</div>
              <div className="mono-text" style={{ color: '#64748b', fontSize: '0.8rem' }}>{contract.tenderId}</div>
              <div style={{ color: '#0f172a', fontWeight: '700' }}>{contract.vendorName}</div>
              <div style={{ color: '#475569' }}>{contract.buyerOrg}</div>
              <div style={{ color: '#ea580c', fontWeight: '800' }}>₹{contract.value?.toLocaleString()}</div>
              <div>
                <span style={{ 
                  color: getCracColor(contract.cracStatus),
                  border: `1px solid ${getCracColor(contract.cracStatus)}40`,
                  backgroundColor: `${getCracColor(contract.cracStatus)}15`,
                  padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700'
                }}>
                  {contract.cracStatus}
                </span>
              </div>
              <div>
                <span style={{ 
                  color: getPaymentColor(contract.paymentStatus),
                  border: `1px solid ${getPaymentColor(contract.paymentStatus)}40`,
                  backgroundColor: `${getPaymentColor(contract.paymentStatus)}15`,
                  padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700'
                }}>
                  {contract.paymentStatus}
                </span>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                {isOfficerOrBuyer && contract.cracStatus === 'Pending Inspection' && (
                  <button onClick={(e) => handleApproveCrac(e, contract.id)} style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)' }}>
                    ✓ {t('cracApprove') || 'CRAC Approve'}
                  </button>
                )}
                {isOfficerOrBuyer && contract.cracStatus === 'Approved' && (!contract.paymentStatus || !contract.paymentStatus.includes('Settled')) && (
                  <button onClick={(e) => handleProcessPayment(e, contract.id)} style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)' }}>
                    ₹ {t('processPayment') || 'Process Payment'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContractsView;
