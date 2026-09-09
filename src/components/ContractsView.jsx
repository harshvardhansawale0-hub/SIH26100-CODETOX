import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { gemApi } from '../services/api';
import { Search, Filter, FileText, CheckCircle, IndianRupee, Clock, Briefcase, FileSignature } from 'lucide-react';

const ContractsView = ({ currentUser }) => {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const fetchContracts = async (mounted) => {
    try {
      setLoading(true);
      const data = await gemApi.getContracts();
      if (mounted) setContracts(data || []);
    } catch (err) {
      console.error(err);
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
      pending: contracts.filter(c => c.cracStatus === 'Pending Inspection' || c.paymentStatus?.includes('Processing')).length,
    };
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    if (statusFilter === 'ALL') return contracts;
    return contracts.filter(c => {
      if (statusFilter === 'Pending Inspection') return c.cracStatus === 'Pending Inspection';
      if (statusFilter === 'Approved') return c.cracStatus === 'Approved';
      if (statusFilter === 'Payment Processing') return c.paymentStatus?.includes('Processing');
      if (statusFilter === 'Settled') return c.paymentStatus?.includes('Settled');
      return true;
    });
  }, [contracts, statusFilter]);

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
    if (status.includes('Withheld')) return '#ef4444';
    return '#94a3b8';
  };

  const handleApproveCrac = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to approve CRAC for this contract?')) {
      await gemApi.approveCrac(id);
      fetchContracts(true);
    }
  };

  const handleProcessPayment = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Initiate payment processing for this contract?')) {
      await gemApi.processPayment(id);
      fetchContracts(true);
    }
  };

  return (
    <div style={{ padding: '1rem', color: '#ffffff' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <span className="section-tag">{t('contractTag') || 'CONTRACTS & PAYMENTS (GFR 225)'}</span>
        <h2 className="serif-heading" style={{ margin: '0.5rem 0', fontSize: '1.8rem' }}>{t('contractTitle') || 'Contract Management Portal'}</h2>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>{t('contractSubtitle') || 'Track CRAC, process payments, and manage contract lifecycles'}</p>
      </div>

      <div className="terminal-stat-cards" style={{ marginBottom: '2rem' }}>
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

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {['ALL', 'Pending Inspection', 'Approved', 'Payment Processing', 'Settled'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              backgroundColor: statusFilter === status ? '#1e385b' : 'transparent',
              color: statusFilter === status ? '#38bdf8' : '#94a3b8',
              border: `1px solid ${statusFilter === status ? '#38bdf8' : '#1e385b'}`,
              padding: '0.3rem 0.8rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: '#081729', border: '1px solid #1e385b', borderRadius: '12px', overflow: 'hidden' }}>
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
                {currentUser?.role === 'officer' && contract.cracStatus === 'Pending Inspection' && (
                  <button onClick={(e) => handleApproveCrac(e, contract.id)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    ✓ {t('cracApprove') || 'CRAC Approve'}
                  </button>
                )}
                {currentUser?.role === 'officer' && contract.cracStatus === 'Approved' && (!contract.paymentStatus || !contract.paymentStatus.includes('Settled')) && (
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
