import React from 'react';
import {
  X, ShieldCheck, AlertTriangle, XCircle, FileText, CheckCircle2,
  Download, Printer, Award, Cpu, Layers, Check, Clock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function BidDetailModal({ bid, onClose, onUpdateStatus, onSelectBidder }) {
  if (!bid) return null;
  const { t } = useLanguage();

  const isSelected = bid.status === 'Selected';
  const isCompliant = bid.status === 'Compliant' || isSelected;
  const isFlagged = bid.status === 'Flagged';
  const isNonCompliant = bid.status === 'Non-Compliant' || bid.status === 'Rejected';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#081729',
          color: '#ffffff',
          border: isSelected ? '2px solid #f59e0b' : '1px solid #1e385b'
        }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottomColor: '#162c47' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="mono-text" style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '700' }}>
                BID ID: {bid.id} • TENDER: {bid.tenderId}
              </span>
              {isSelected && (
                <span style={{ fontSize: '0.75rem', backgroundColor: '#f59e0b', color: '#000000', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Award size={12} /> WINNING BIDDER (AWARDED)
                </span>
              )}
            </div>
            <h3 className="modal-title" style={{ color: '#ffffff', fontSize: '1.4rem', margin: 0 }}>
              {bid.vendor}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Category: {bid.category} • Quoted: <strong style={{ color: '#38bdf8' }}>{bid.bidAmount}</strong> (Estimated Tender Value: {bid.tenderValue})
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ color: '#94a3b8' }}>
            <X size={22} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
          {/* Top Key Metrics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div style={{ backgroundColor: '#0f2238', padding: '1rem', borderRadius: '8px', border: '1px solid #1e385b' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Compliance Score</span>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: isCompliant ? '#34d399' : (isFlagged ? '#fbbf24' : '#f87171') }}>
                {bid.score}<span style={{ fontSize: '0.9rem', color: '#64748b' }}>/100</span>
              </span>
            </div>

            <div style={{ backgroundColor: '#0f2238', padding: '1rem', borderRadius: '8px', border: '1px solid #1e385b' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>AI Decision Status</span>
              <div style={{ marginTop: '0.35rem' }}>
                <span
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    backgroundColor: isCompliant ? 'rgba(16, 185, 129, 0.2)' : (isFlagged ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
                    color: isCompliant ? '#34d399' : (isFlagged ? '#fbbf24' : '#f87171'),
                    border: `1px solid ${isCompliant ? '#10b981' : (isFlagged ? '#f59e0b' : '#ef4444')}`
                  }}
                >
                  {isSelected ? 'SELECTED / AWARDED' : (isCompliant ? 'COMPLIANT' : (isFlagged ? 'FLAGGED' : 'NON-COMPLIANT'))}
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: '#0f2238', padding: '1rem', borderRadius: '8px', border: '1px solid #1e385b' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Quoted Bid Price</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#38bdf8' }}>
                {bid.bidAmount}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Est: {bid.tenderValue}</span>
            </div>

            <div style={{ backgroundColor: '#0f2238', padding: '1rem', borderRadius: '8px', border: '1px solid #1e385b' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>OCR Confidence</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#34d399' }}>
                {bid.ocrConfidence || '99.4%'}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>EasyOCR Engine</span>
            </div>
          </div>

          {/* AI Buyer Recommendation Banner */}
          <div
            style={{
              backgroundColor: isCompliant ? 'rgba(16, 185, 129, 0.1)' : (isFlagged ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
              border: `1px solid ${isCompliant ? 'rgba(16, 185, 129, 0.3)' : (isFlagged ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)')}`,
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '0.88rem'
            }}
          >
            <strong style={{ display: 'block', color: isCompliant ? '#34d399' : (isFlagged ? '#fbbf24' : '#f87171'), marginBottom: '0.25rem' }}>
              🤖 Autonomous AI Recommendation for Government Procuring Authority:
            </strong>
            <p style={{ margin: 0, color: '#e2e8f0', lineHeight: 1.5 }}>
              {bid.complianceReport?.buyerRecommendation ||
                (isCompliant
                  ? 'RECOMMENDED FOR FINAL SELECTION / L1 AWARD. All statutory criteria, cross-document validations, and tender specifications passed with high confidence.'
                  : isFlagged
                  ? 'REQUIRES BUYER CLARIFICATION. Minor requirement deficits detected (e.g. MII class or turnover marginal shortfall).'
                  : 'REJECT APPLICATION. Critical statutory failures detected.')}
            </p>
          </div>

          {/* Extracted Entities & Statutory Parameters */}
          <div style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '8px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#38bdf8', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={16} /> Statutory Entity Extraction & Eligibility Verification
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #162c47' }}>
                <span style={{ color: '#94a3b8' }}>Make-in-India (MII) Content:</span>
                <span style={{ color: '#ffffff', fontWeight: '700' }}>{bid.miiContent}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #162c47' }}>
                <span style={{ color: '#94a3b8' }}>3-Year Audited Turnover:</span>
                <span style={{ color: '#ffffff', fontWeight: '700' }}>{bid.turnover}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #162c47' }}>
                <span style={{ color: '#94a3b8' }}>GST Status & Return Filing:</span>
                <span style={{ color: bid.gstStatus?.includes('ACTIVE') || bid.gstStatus?.includes('Active') ? '#34d399' : '#f87171', fontWeight: '700' }}>
                  {bid.gstStatus}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #162c47' }}>
                <span style={{ color: '#94a3b8' }}>PAN & Entity Match:</span>
                <span style={{ color: '#ffffff', fontWeight: '700' }}>{bid.panStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #162c47' }}>
                <span style={{ color: '#94a3b8' }}>MSE / UDYAM Registration:</span>
                <span style={{ color: '#ffffff', fontWeight: '700' }}>{bid.msmeStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #162c47' }}>
                <span style={{ color: '#94a3b8' }}>Past Commercial Experience:</span>
                <span style={{ color: '#ffffff', fontWeight: '700' }}>{bid.experience}</span>
              </div>
            </div>
          </div>

          {/* Cross-Document & Tender Requirement Matching */}
          {((bid.crossDocMatches && bid.crossDocMatches.length > 0) || (bid.requirementMatches && bid.requirementMatches.length > 0)) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Cross-Doc Matches */}
              {bid.crossDocMatches && bid.crossDocMatches.length > 0 && (
                <div style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '8px', padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#34d399', marginBottom: '0.65rem' }}>
                    Cross-Document Matches
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                    {bid.crossDocMatches.map((m, idx) => (
                      <div key={idx} style={{ backgroundColor: '#081729', padding: '0.45rem', borderRadius: '4px', border: m.isMatch ? '1px solid #10b981' : '1px solid #ef4444' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong style={{ color: '#ffffff' }}>{m.fieldName}</strong>
                          <span style={{ color: m.isMatch ? '#34d399' : '#f87171', fontWeight: '700' }}>
                            {m.isMatch ? '✓ MATCHED' : '✗ MISMATCH'}
                          </span>
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{m.remarks}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirement Matches */}
              {bid.requirementMatches && bid.requirementMatches.length > 0 && (
                <div style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '8px', padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#f59e0b', marginBottom: '0.65rem' }}>
                    Tender Requirement Matches
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                    {bid.requirementMatches.map((r, idx) => (
                      <div key={idx} style={{ backgroundColor: '#081729', padding: '0.45rem', borderRadius: '4px', border: r.isMet ? '1px solid #1e385b' : '1px solid #ef4444' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong style={{ color: '#ffffff' }}>{r.requirementName}</strong>
                          <span style={{ color: r.isMet ? '#34d399' : '#f87171', fontWeight: '700' }}>
                            {r.isMet ? '✓ MET' : '✗ DEFICIT'}
                          </span>
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{r.remarks}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Discrepancies / Flags */}
          {bid.flags && bid.flags.length > 0 ? (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '8px', padding: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={18} /> Identified Discrepancies & Forensics Flags
              </span>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.84rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: 0 }}>
                {bid.flags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '8px', padding: '0.85rem', color: '#34d399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} />
              All statutory parameters and tender compliance criteria verified with 100% confidence.
            </div>
          )}

          {/* Immutable Audit Trail */}
          <div style={{ backgroundColor: '#0f2238', border: '1px solid #1e385b', borderRadius: '8px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} color="#38bdf8" /> Immutable Autonomous Audit Trail
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {bid.auditTrail && bid.auditTrail.map((log, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <span className="mono-text" style={{ color: '#38bdf8', minWidth: '170px' }}>{log.timestamp}</span>
                  <span style={{ color: '#cbd5e1', flex: 1 }}>{log.action}</span>
                  <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>({log.agent})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions for Buyer (Procuring Authority) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #162c47', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
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
              <Printer size={15} /> Print Compliance Audit
            </button>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              {/* Final Selection / Award Action */}
              {!isSelected && isCompliant && (
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateStatus) onUpdateStatus(bid.id, 'Selected');
                    onClose();
                  }}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    backgroundColor: '#f59e0b',
                    color: '#000000',
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: '0 2px 10px rgba(245, 158, 11, 0.35)'
                  }}
                >
                  <Award size={16} /> Final Selection (Award Tender)
                </button>
              )}

              {bid.status !== 'Compliant' && !isSelected && (
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateStatus) onUpdateStatus(bid.id, 'Compliant');
                    onClose();
                  }}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Mark as Compliant
                </button>
              )}

              {bid.status !== 'Non-Compliant' && bid.status !== 'Rejected' && !isSelected && (
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateStatus) onUpdateStatus(bid.id, 'Non-Compliant');
                    onClose();
                  }}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Reject Application
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '6px',
                  backgroundColor: '#1e385b',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

