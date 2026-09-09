import React from 'react';
import { X, ExternalLink, Sparkles } from 'lucide-react';

const TenderDetailModal = ({ tender, onClose, onNavigateToBids, onOpenVerifier }) => {
  if (!tender) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Under Evaluation': return '#f59e0b';
      case 'Awarded': return '#38bdf8';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, 
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
    }}>
      <div className="modal-content-box" onClick={e => e.stopPropagation()} style={{
        backgroundColor: '#0b1a2d', border: '1px solid #1e385b', borderRadius: '12px', 
        width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div className="modal-header" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #1e385b', backgroundColor: '#0f2238'
        }}>
          <div>
            <div className="mono-text" style={{ color: '#38bdf8', fontSize: '0.85rem', marginBottom: '0.2rem' }}>{tender.id}</div>
            <h3 className="modal-title" style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>{tender.title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{
            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem'
          }}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ 
              backgroundColor: `${getStatusColor(tender.status)}20`, 
              color: getStatusColor(tender.status), 
              padding: '0.3rem 0.8rem', 
              borderRadius: '999px', 
              fontSize: '0.85rem', 
              fontWeight: 'bold',
              border: `1px solid ${getStatusColor(tender.status)}`
            }}>
              {tender.status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Organization</div>
              <div style={{ color: '#fff' }}>{tender.ministry}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{tender.department}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Category</div>
              <div style={{ color: '#fff' }}>{tender.category}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Estimated Value</div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>₹{tender.estimatedValue?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>EMD Amount</div>
              <div style={{ color: '#fff' }}>₹{tender.emdAmount?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Published Date</div>
              <div style={{ color: '#fff' }}>{tender.publishedDate || '-'}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Closing Date</div>
              <div style={{ color: '#fff' }}>{tender.closingDate}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>MII Minimum Requirement</div>
              <div style={{ color: '#fff' }}>{tender.miiMinRequirement || 0}%</div>
            </div>
          </div>

          {tender.boqItems && tender.boqItems.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#38bdf8', marginBottom: '1rem', fontSize: '1.1rem' }}>Bill of Quantities (BOQ)</h4>
              <div style={{ backgroundColor: '#081729', border: '1px solid #1e385b', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', padding: '0.75rem 1rem', backgroundColor: '#061120', borderBottom: '1px solid #162c47', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <div>ITEM DESCRIPTION</div>
                  <div style={{ textAlign: 'right' }}>QUANTITY</div>
                  <div style={{ textAlign: 'center' }}>UNIT</div>
                </div>
                {tender.boqItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(30,56,91,0.4)', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <div>{item.description || item.name}</div>
                    <div style={{ textAlign: 'right' }}>{item.quantity}</div>
                    <div style={{ textAlign: 'center' }}>{item.unit}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #1e385b', flexWrap: 'wrap' }}>
            <button 
              onClick={() => onNavigateToBids(tender.id)}
              style={{ backgroundColor: 'transparent', color: '#38bdf8', border: '1px solid #1e385b', borderRadius: '6px', padding: '0.75rem 1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
            >
              View Related Bids <ExternalLink size={16} />
            </button>
            {onOpenVerifier && (
              <button 
                onClick={() => {
                  onClose();
                  onOpenVerifier(tender);
                }}
                style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.75rem 1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
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
