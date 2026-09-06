import React from 'react';
import { X, ShieldCheck, AlertTriangle, XCircle, FileText, CheckCircle2, Download, Printer } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function BidDetailModal({ bid, onClose, onUpdateStatus }) {
  if (!bid) return null;
  const { t } = useLanguage();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '880px', backgroundColor: '#081729', color: '#ffffff', border: '1px solid #1e385b' }}>
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottomColor: '#162c47' }}>
          <div>
            <span className="mono-text" style={{ fontSize: '0.78rem', color: '#7dd3fc' }}>
              {t('dossierTag')} — {bid.id}
            </span>
            <h3 className="modal-title" style={{ color: '#ffffff', fontSize: '1.4rem', marginTop: '0.25rem' }}>
              {bid.vendor}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ color: '#94a3b8' }}>
            <X size={22} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Key Metrics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div style={{ backgroundColor: '#0f2238', padding: '1rem', borderRadius: '8px', border: '1px solid #1e385b' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>{t('scoreLabel')}</span>
              <span style={{ fontSize: '1.6rem', fontWeight: '900', color: bid.status === 'Compliant' ? '#34d399' : bid.status === 'Flagged' ? '#fbbf24' : '#f87171' }}>
                {bid.score}<span style={{ fontSize: '0.9rem', color: '#64748b' }}>/100</span>
              </span>
            </div>

            <div style={{ backgroundColor: '#0f2238', padding: '1rem', borderRadius: '8px', border: '1px solid #1e385b' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>{t('decisionStatus')}</span>
              <div style={{ marginTop: '0.35rem' }}>
                <span className={`d-status-badge ${bid.status.toLowerCase()}`}>
                  {bid.status === 'Compliant' ? t('compliant') : bid.status === 'Flagged' ? t('flagged') : t('rejected')}
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: '#0f2238', padding: '1rem', borderRadius: '8px', border: '1px solid #1e385b' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>{t('bidEst')}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>
                {bid.bidAmount}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Est: {bid.tenderValue}</span>
            </div>

            <div style={{ backgroundColor: '#0f2238', padding: '1rem', borderRadius: '8px', border: '1px solid #1e385b' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>{t('ocrConfidence')}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#38bdf8' }}>
                {bid.ocrConfidence}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>EasyOCR Model</span>
            </div>
          </div>

          {/* Eligibility & Parameters Checklist */}
          <div style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '8px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem' }}>
              {t('eligibilityTitle')}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #1e385b' }}>
                <span style={{ color: '#94a3b8' }}>Make-in-India Content:</span>
                <span style={{ color: '#ffffff', fontWeight: '600' }}>{bid.miiContent}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #1e385b' }}>
                <span style={{ color: '#94a3b8' }}>3-Year Average Turnover:</span>
                <span style={{ color: '#ffffff', fontWeight: '600' }}>{bid.turnover}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #1e385b' }}>
                <span style={{ color: '#94a3b8' }}>GST Status & Returns:</span>
                <span style={{ color: bid.gstStatus.includes('Active') ? '#34d399' : '#f87171', fontWeight: '600' }}>{bid.gstStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #1e385b' }}>
                <span style={{ color: '#94a3b8' }}>PAN & Entity Verification:</span>
                <span style={{ color: '#ffffff', fontWeight: '600' }}>{bid.panStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #1e385b' }}>
                <span style={{ color: '#94a3b8' }}>MSE / UDYAM Category:</span>
                <span style={{ color: '#ffffff', fontWeight: '600' }}>{bid.msmeStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #1e385b' }}>
                <span style={{ color: '#94a3b8' }}>Past Experience Verification:</span>
                <span style={{ color: '#ffffff', fontWeight: '600' }}>{bid.experience}</span>
              </div>
            </div>
          </div>

          {/* Flags or Compliant Banner */}
          {bid.flags && bid.flags.length > 0 ? (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '8px', padding: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={18} /> {t('discrepanciesTitle')}
              </span>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.84rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {bid.flags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '8px', padding: '0.85rem', color: '#34d399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} />
              {t('allPassedTitle')}
            </div>
          )}

          {/* Immutable Audit Trail */}
          <div style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '8px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.85rem' }}>
              {t('immutableAuditTitle')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {bid.auditTrail && bid.auditTrail.map((log, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <span className="mono-text" style={{ color: '#7dd3fc', minWidth: '160px' }}>{log.timestamp}</span>
                  <span style={{ color: '#cbd5e1', flex: 1 }}>{log.action}</span>
                  <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>({log.agent})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Decision Buttons for Procurement Officer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #162c47', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: '#0f2238',
                  border: '1px solid #1e385b',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Printer size={15} /> {t('printAudit')}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {bid.status !== 'Compliant' && (
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateStatus) onUpdateStatus(bid.id, 'Compliant');
                    onClose();
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {t('overrideApprove')}
                </button>
              )}
              {bid.status !== 'Rejected' && (
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateStatus) onUpdateStatus(bid.id, 'Rejected');
                    onClose();
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {t('rejectBid')}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  backgroundColor: '#1e385b',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
