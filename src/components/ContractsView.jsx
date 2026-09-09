import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { gemApi } from '../services/api';
import { initialContracts } from '../data/bidsData';
import { Search, Filter, FileText, CheckCircle, IndianRupee, Clock, Briefcase, FileSignature, X } from 'lucide-react';

const ContractsView = ({ currentUser, initialFilter = 'ALL', initialSearch = '' }) => {
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
    <div style={{ padding: '1.5rem', color: '#ffffff', minHeight: '80vh' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <span className="section-tag">{t('contractTag') || 'CONTRACTS & PAYMENTS (GFR 225)'}</span>
        <h2 className="serif-heading" style={{ margin: '0.4rem 0', fontSize: '1.9rem', color: '#ffffff' }}>
          {t('contractTitle') || 'Contract Management Portal'}
        </h2>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
          {t('contractSubtitle') || 'Track CRAC inspections, process 10-day PFMS payments, and manage contract lifecycles.'}
        </p>
      </div>

      <div className="terminal-stat-cards" style={{ marginBottom: '1.75rem' }}>
        <div className="terminal-card">
          <div className="t-card-label"><Briefcase size={14} style={{marginRight:'0.4rem'}}/> Total Contracts</div>
          <div className="t-card-value-row">
            <span className="t-card-value">{stats.total}</span>
          </div>
        </div>
        <div className="terminal-card">
          <div className="t-card-label"><CheckCircle size={14} style={{marginRight:'0.4rem'}}/> CRAC Approved</div>
          <div className="t-card-value-row">
            <span className="t-card-value">{stats.cracApproved}</span>
            <span className="t-card-badge green">cleared</span>
          </div>
        </div>
        <div className="terminal-card">
          <div className="t-card-label"><IndianRupee size={14} style={{marginRight:'0.4rem'}}/> Payment Settled</div>
          <div className="t-card-value-row">
            <span className="t-card-value">{stats.settled}</span>
            <span className="t-card-badge green">paid</span>
          </div>
        </div>
        <div className="terminal-card">
          <div className="t-card-label"><Clock size={14} style={{marginRight:'0.4rem'}}/> Pending Action</div>
          <div className="t-card-value-row">
            <span className="t-card-value">{stats.pending}</span>
            <span className="t-card-badge orange">attn</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          {['ALL', 'Pending Inspection', 'Approved', 'Payment Processing', 'Settled'].map(status => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              style={{
                backgroundColor: statusFilter === status ? '#1e385b' : 'transparent',
                color: statusFilter === status ? '#38bdf8' : '#94a3b8',
                border: `1px solid ${statusFilter === status ? '#38bdf8' : '#1e385b'}`,
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Contract Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search PO ID, Tender ID, Vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: '#081729',
              border: '1px solid #1e385b',
              color: '#fff',
              padding: '0.45rem 1rem 0.45rem 2.2rem',
              borderRadius: '6px',
              width: '260px',
              fontSize: '0.82rem'
            }}
          />
        </div>
      </div>

      <div style={{ backgroundColor: '#081729', border: '1px solid #1e385b', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 1.2fr 1.5fr 1.5fr 1fr 1.2fr 1.2fr 1.5fr', 
          padding: '0.85rem 1.25rem', 
          backgroundColor: '#061120', 
          borderBottom: '1px solid #162c47', 
          fontSize: '0.78rem', 
          fontWeight: '700', 
          color: '#94a3b8', 
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
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <FileSignature size={32} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.5 }} />
            No contracts found matching your criteria.
          </div>
        ) : (
          filteredContracts.map((contract, i) => (
            <div 
              key={contract.id || i}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1.2fr 1.2fr 1.5fr 1.5fr 1fr 1.2fr 1.2fr 1.5fr', 
                padding: '0.95rem 1.25rem', 
                borderBottom: '1px solid rgba(30, 56, 91, 0.4)', 
                fontSize: '0.85rem',
                alignItems: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f2238'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="mono-text" style={{ color: '#38bdf8' }}>{contract.id}</div>
              <div className="mono-text" style={{ color: '#64748b' }}>{contract.tenderId}</div>
              <div style={{ color: '#cbd5e1' }}>{contract.vendorName}</div>
              <div style={{ color: '#cbd5e1' }}>{contract.buyerOrg}</div>
              <div style={{ color: '#cbd5e1' }}>₹{contract.value?.toLocaleString()}</div>
              <div>
                <span style={{ 
                  color: getCracColor(contract.cracStatus),
                  border: `1px solid ${getCracColor(contract.cracStatus)}40`,
                  backgroundColor: `${getCracColor(contract.cracStatus)}10`,
                  padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem'
                }}>
                  {contract.cracStatus}
                </span>
              </div>
              <div>
                <span style={{ 
                  color: getPaymentColor(contract.paymentStatus),
                  border: `1px solid ${getPaymentColor(contract.paymentStatus)}40`,
                  backgroundColor: `${getPaymentColor(contract.paymentStatus)}10`,
                  padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem'
                }}>
                  {contract.paymentStatus}
                </span>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                {isOfficerOrBuyer && contract.cracStatus === 'Pending Inspection' && (
                  <button onClick={(e) => handleApproveCrac(e, contract.id)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    ✓ {t('cracApprove') || 'CRAC Approve'}
                  </button>
                )}
                {isOfficerOrBuyer && contract.cracStatus === 'Approved' && (!contract.paymentStatus || !contract.paymentStatus.includes('Settled')) && (
                  <button onClick={(e) => handleProcessPayment(e, contract.id)} style={{ backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer' }}>
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
