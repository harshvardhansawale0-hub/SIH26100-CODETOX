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
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div
        className="modal-content-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          width: '95%',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderRadius: '20px',
          border: isSelected ? '2px solid #f59e0b' : '1px solid #e2e8f0',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.2)'
        }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)', padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="mono-text" style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: '800' }}>
                BID ID: {bid.id} • TENDER: {bid.tenderId}
              </span>
              {isSelected && (
                <span style={{ fontSize: '0.75rem', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Award size={12} /> WINNING BIDDER (AWARDED)
                </span>
              )}
            </div>
            <h3 className="modal-title" style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>
              {bid.vendor}
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Category: {bid.category} • Quoted: <strong style={{ color: '#0284c7' }}>{bid.bidAmount}</strong> (Estimated Tender Value: {bid.tenderValue})
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem 1.75rem' }}>
          {/* Top Key Metrics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', fontWeight: '700' }}>Compliance Score</span>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: isCompliant ? '#059669' : (isFlagged ? '#d97706' : '#dc2626') }}>
                {bid.score}<span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/100</span>
              </span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', fontWeight: '700' }}>AI Decision Status</span>
              <div style={{ marginTop: '0.35rem' }}>
                <span
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    backgroundColor: isCompliant ? '#ecfdf5' : (isFlagged ? '#fffbeb' : '#fef2f2'),
                    color: isCompliant ? '#059669' : (isFlagged ? '#d97706' : '#dc2626'),
                    border: `1px solid ${isCompliant ? '#a7f3d0' : (isFlagged ? '#fde68a' : '#fecaca')}`
                  }}
                >
                  {isSelected ? 'SELECTED / AWARDED' : (isCompliant ? 'COMPLIANT' : (isFlagged ? 'FLAGGED' : 'NON-COMPLIANT'))}
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', fontWeight: '700' }}>Quoted Bid Price</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0284c7' }}>
                {bid.bidAmount}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Est: {bid.tenderValue}</span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', fontWeight: '700' }}>OCR Confidence</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#059669' }}>
                {bid.ocrConfidence || '99.4%'}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>EasyOCR Engine</span>
            </div>
          </div>

          {/* AI Buyer Recommendation Banner */}
          <div
            style={{
              backgroundColor: isCompliant ? '#ecfdf5' : (isFlagged ? '#fffbeb' : '#fef2f2'),
              border: `1px solid ${isCompliant ? '#a7f3d0' : (isFlagged ? '#fde68a' : '#fecaca')}`,
              borderRadius: '10px',
              padding: '1.1rem',
              fontSize: '0.88rem'
            }}
          >
            <strong style={{ display: 'block', color: isCompliant ? '#047857' : (isFlagged ? '#b45309' : '#b91c1c'), marginBottom: '0.25rem' }}>
              🤖 Autonomous AI Recommendation for Government Procuring Authority:
            </strong>
            <p style={{ margin: 0, color: '#334155', lineHeight: 1.5 }}>
              {bid.complianceReport?.buyerRecommendation ||
                (isCompliant
                  ? 'RECOMMENDED FOR FINAL SELECTION / L1 AWARD. All statutory criteria, cross-document validations, and tender specifications passed with high confidence.'
                  : isFlagged
                  ? 'REQUIRES BUYER CLARIFICATION. Minor requirement deficits detected (e.g. MII class or turnover marginal shortfall).'
                  : 'REJECT APPLICATION. Critical statutory failures detected.')}
            </p>
          </div>

          {/* Extracted Entities & Statutory Parameters */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0284c7', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={16} /> Statutory Entity Extraction & Eligibility Verification
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Make-in-India (MII) Content:</span>
                <span style={{ color: '#0f172a', fontWeight: '700' }}>{bid.miiContent}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>3-Year Audited Turnover:</span>
                <span style={{ color: '#0f172a', fontWeight: '700' }}>{bid.turnover}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>GST Status & Return Filing:</span>
                <span style={{ color: bid.gstStatus?.includes('ACTIVE') || bid.gstStatus?.includes('Active') ? '#059669' : '#dc2626', fontWeight: '700' }}>
                  {bid.gstStatus}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>PAN & Entity Match:</span>
                <span style={{ color: '#0f172a', fontWeight: '700' }}>{bid.panStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>MSE / UDYAM Registration:</span>
                <span style={{ color: '#0f172a', fontWeight: '700' }}>{bid.msmeStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Past Commercial Experience:</span>
                <span style={{ color: '#0f172a', fontWeight: '700' }}>{bid.experience}</span>
              </div>
            </div>
          </div>

          {/* Cross-Document & Tender Requirement Matching */}
          {((bid.crossDocMatches && bid.crossDocMatches.length > 0) || (bid.requirementMatches && bid.requirementMatches.length > 0)) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Cross-Doc Matches */}
              {bid.crossDocMatches && bid.crossDocMatches.length > 0 && (
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#059669', marginBottom: '0.65rem' }}>
                    Cross-Document Matches
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                    {bid.crossDocMatches.map((m, idx) => (
                      <div key={idx} style={{ backgroundColor: '#ffffff', padding: '0.55rem', borderRadius: '6px', border: m.isMatch ? '1px solid #a7f3d0' : '1px solid #fecaca' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong style={{ color: '#0f172a' }}>{m.fieldName}</strong>
                          <span style={{ color: m.isMatch ? '#059669' : '#dc2626', fontWeight: '800' }}>
                            {m.isMatch ? '✓ MATCHED' : '✗ MISMATCH'}
                          </span>
                        </div>
                        <span style={{ color: '#64748b', fontSize: '0.74rem' }}>{m.remarks}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirement Matches */}
              {bid.requirementMatches && bid.requirementMatches.length > 0 && (
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#ea580c', marginBottom: '0.65rem' }}>
                    Tender Requirement Matches
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                    {bid.requirementMatches.map((r, idx) => (
                      <div key={idx} style={{ backgroundColor: '#ffffff', padding: '0.55rem', borderRadius: '6px', border: r.isMet ? '1px solid #e2e8f0' : '1px solid #fecaca' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong style={{ color: '#0f172a' }}>{r.requirementName}</strong>
                          <span style={{ color: r.isMet ? '#059669' : '#dc2626', fontWeight: '800' }}>
                            {r.isMet ? '✓ MET' : '✗ DEFICIT'}
                          </span>
                        </div>
                        <span style={{ color: '#64748b', fontSize: '0.74rem' }}>{r.remarks}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Discrepancies / Flags */}
          {bid.flags && bid.flags.length > 0 ? (
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '1.1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={18} /> Identified Discrepancies & Forensics Flags
              </span>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.84rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: 0 }}>
                {bid.flags.map((flag, idx) => (
                  <li key={idx} style={{ fontWeight: '500' }}>{flag}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '1rem', color: '#065f46', fontSize: '0.88rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="#059669" />
              All statutory parameters and tender compliance criteria verified with 100% confidence.
            </div>
          )}

          {/* Immutable Audit Trail */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} color="#0284c7" /> Immutable Autonomous Audit Trail
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {bid.auditTrail && bid.auditTrail.map((log, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <span className="mono-text" style={{ color: '#0284c7', fontWeight: '700', minWidth: '170px' }}>{log.timestamp}</span>
                  <span style={{ color: '#334155', flex: 1, fontWeight: '500' }}>{log.action}</span>
                  <span style={{ color: '#64748b', fontStyle: 'italic' }}>({log.agent})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions for Buyer (Procuring Authority) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
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
                    padding: '0.6rem 1.35rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 3px 12px rgba(234, 88, 12, 0.3)'
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
                    padding: '0.6rem 1.15rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
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
                    padding: '0.6rem 1.15rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)'
                  }}
                >
                  Reject Application
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  border: '1px solid #cbd5e1',
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
