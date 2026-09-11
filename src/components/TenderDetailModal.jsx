import React from 'react';
import { X, ExternalLink, Sparkles } from 'lucide-react';

const TenderDetailModal = ({ tender, onClose, onNavigateToBids, onOpenVerifier }) => {
  if (!tender) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#059669';
      case 'Under Evaluation': return '#ea580c';
      case 'Awarded': return '#0284c7';
      default: return '#64748b';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'Active': return '#ecfdf5';
      case 'Under Evaluation': return '#fff7ed';
      case 'Awarded': return '#f0f9ff';
      default: return '#f8fafc';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1000, 
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
    }}>
      <div className="modal-content-box" onClick={e => e.stopPropagation()} style={{
        backgroundColor: '#ffffff', border: '1px solid #fed7aa', borderRadius: '14px', 
        width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"
      }}>
        <div className="modal-header" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #fed7aa', 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #fff7ed 100%)'
        }}>
          <div>
            <div className="mono-text" style={{ color: '#0284c7', fontSize: '0.85rem', marginBottom: '0.2rem', fontWeight: '800' }}>{tender.id}</div>
            <h3 className="modal-title" style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>{tender.title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{
            background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ 
              backgroundColor: getStatusBg(tender.status), 
              color: getStatusColor(tender.status), 
              padding: '0.35rem 0.85rem', 
              borderRadius: '999px', 
              fontSize: '0.82rem', 
              fontWeight: '800',
              border: `1px solid ${getStatusColor(tender.status)}40`
            }}>
              {tender.status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: '700' }}>Organization</div>
              <div style={{ color: '#0f172a', fontWeight: '700' }}>{tender.ministry}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{tender.department}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: '700' }}>Category</div>
              <div style={{ color: '#0f172a', fontWeight: '700' }}>{tender.category}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: '700' }}>Estimated Value</div>
              <div style={{ color: '#ea580c', fontWeight: '800', fontSize: '1.05rem' }}>₹{tender.estimatedValue?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: '700' }}>EMD Amount</div>
              <div style={{ color: '#0f172a', fontWeight: '700' }}>₹{tender.emdAmount?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: '700' }}>Published Date</div>
              <div style={{ color: '#334155' }}>{tender.publishedDate || '-'}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: '700' }}>Closing Date</div>
              <div style={{ color: '#334155' }}>{tender.closingDate}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: '700' }}>MII Minimum Requirement</div>
              <div style={{ color: '#ea580c', fontWeight: '800' }}>{tender.miiMinRequirement || 0}%</div>
            </div>
          </div>

          {tender.boqItems && tender.boqItems.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#0284c7', marginBottom: '0.75rem', fontSize: '1.05rem', fontWeight: '800' }}>Bill of Quantities (BOQ)</h4>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.76rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>
                  <div>ITEM DESCRIPTION</div>
                  <div style={{ textAlign: 'right' }}>QUANTITY</div>
                  <div style={{ textAlign: 'center' }}>UNIT</div>
                </div>
                {tender.boqItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', color: '#334155' }}>
                    <div style={{ fontWeight: '600' }}>{item.description || item.name}</div>
                    <div style={{ textAlign: 'right', fontWeight: '700' }}>{item.quantity}</div>
                    <div style={{ textAlign: 'center', color: '#64748b' }}>{item.unit}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
            <button 
              onClick={() => onNavigateToBids(tender.id)}
              style={{ backgroundColor: '#f1f5f9', color: '#0284c7', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.65rem 1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
            >
              View Related Bids <ExternalLink size={16} />
            </button>
            {onOpenVerifier && (
              <button 
                onClick={() => {
                  onClose();
                  onOpenVerifier(tender);
                }}
                style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.35rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 3px 12px rgba(5, 150, 105, 0.25)' }}
              >
                <Sparkles size={16} /> Apply & Verify Documents (AI OCR)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderDetailModal;
