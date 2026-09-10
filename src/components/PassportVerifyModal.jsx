import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, CheckCircle2, XCircle, Clock, AlertTriangle, Fingerprint } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { gemApi } from '../services/api';

export default function PassportVerifyModal({ isOpen, onClose, passportId, bidId, tenderId }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const verifyPassport = async () => {
      if (!isOpen || !passportId) return;
      
      setLoading(true);
      setError(null);
      setResult(null);
      
      try {
        const response = await gemApi.verifyPassport(passportId, { bidId, tenderId });
        if (isMounted) {
          setResult(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to verify passport");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifyPassport();

    return () => {
      isMounted = false;
    };
  }, [isOpen, passportId, bidId, tenderId]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: '#94a3b8' }}>
          <ShieldCheck size={48} className="spin-animation" style={{ color: '#38bdf8', marginBottom: '16px', animation: 'spin 2s linear infinite' }} />
          <p style={{ fontFamily: 'monospace' }}>Verifying Digital Passport...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: '#ef4444' }}>
          <XCircle size={48} style={{ marginBottom: '16px' }} />
          <h4 className="serif-heading" style={{ margin: '0 0 8px 0' }}>Verification Failed</h4>
          <p style={{ color: '#94a3b8', margin: 0 }}>{error}</p>
        </div>
      );
    }

    if (!result) return null;

    const { status, vendorName, complianceScore, credentials, signatureValid, message, expiryDate } = result;

    let StatusIcon = CheckCircle2;
    let statusColor = '#10b981';
    let statusText = 'PASSPORT VALID';

    if (status === 'invalid' || status === 'revoked' || !signatureValid) {
      StatusIcon = XCircle;
      statusColor = '#ef4444';
      statusText = !signatureValid ? 'SIGNATURE INVALID' : status === 'revoked' ? 'PASSPORT REVOKED' : 'PASSPORT INVALID';
    } else if (status === 'expired') {
      StatusIcon = Clock;
      statusColor = '#f59e0b';
      statusText = 'PASSPORT EXPIRED';
    }

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
          <StatusIcon 
            size={64} 
            style={{ 
              color: statusColor, 
              marginBottom: '16px',
              transition: 'transform 0.3s ease',
              transform: 'scale(1.1)' 
            }} 
          />
          <div 
            style={{ 
              backgroundColor: `${statusColor}22`, 
              color: statusColor, 
              padding: '6px 16px', 
              borderRadius: '999px',
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '16px',
              border: `1px solid ${statusColor}55`
            }}
          >
            {statusText}
          </div>
          
          <h4 style={{ fontSize: '20px', margin: '0 0 8px 0', color: '#ffffff' }}>{vendorName || 'Unknown Vendor'}</h4>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', color: '#94a3b8', fontSize: '14px' }}>
            <span>Score: <strong style={{ color: '#38bdf8' }}>{complianceScore || 0}/100</strong></span>
            <span>•</span>
            <span>Expires: {expiryDate || 'N/A'}</span>
          </div>
        </div>

        {message && (
          <div style={{ backgroundColor: '#081729', borderLeft: `4px solid ${statusColor}`, padding: '12px', marginBottom: '20px', color: '#e2e8f0', fontSize: '14px' }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#94a3b8', margin: '0 0 12px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified Credentials</h5>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {credentials && credentials.length > 0 ? (
              credentials.map((cred, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#081729', padding: '10px', borderRadius: '6px', border: '1px solid #1e385b' }}>
                  <ShieldCheck size={16} color="#10b981" />
                  <span style={{ color: '#e2e8f0', fontSize: '13px' }}>{cred}</span>
                </div>
              ))
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>No credentials listed.</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#081729', padding: '12px', borderRadius: '6px', border: '1px solid #1e385b', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0' }}>
            <Fingerprint size={18} color="#94a3b8" />
            <span style={{ fontSize: '14px' }}>Digital Signature</span>
          </div>
          {signatureValid ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '13px', fontWeight: 'bold' }}>
              <CheckCircle2 size={14} /> Valid
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '13px', fontWeight: 'bold' }}>
              <AlertTriangle size={14} /> Invalid
            </span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{ 
              backgroundColor: '#1e385b', 
              color: '#ffffff', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div 
        className="modal-content-box" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '560px', 
          width: '100%', 
          backgroundColor: '#0f2238', 
          borderRadius: '8px',
          border: '1px solid #1e385b',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #1e385b', backgroundColor: '#061120' }}>
          <div>
            <span className="section-tag" style={{ backgroundColor: '#0284c7', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.05em' }}>PASSPORT VERIFICATION</span>
            <h3 className="modal-title serif-heading" style={{ margin: '8px 0 0 0', color: '#ffffff', fontSize: '18px' }}>Compliance Passport Check</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body" style={{ color: '#ffffff' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
