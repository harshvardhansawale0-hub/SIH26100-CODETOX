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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: '#64748b' }}>
          <ShieldCheck size={48} className="spin-animation" style={{ color: '#0284c7', marginBottom: '16px', animation: 'spin 2s linear infinite' }} />
          <p style={{ fontWeight: '600', color: '#0f172a' }}>Verifying Digital Passport on GeM Blockchain...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: '#dc2626' }}>
          <XCircle size={48} style={{ marginBottom: '16px' }} />
          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#991b1b' }}>Verification Failed</h4>
          <p style={{ color: '#64748b', margin: 0 }}>{error}</p>
        </div>
      );
    }

    if (!result) return null;

    const { status, vendorName, complianceScore, credentials, signatureValid, message, expiryDate } = result;

    let StatusIcon = CheckCircle2;
    let statusColor = '#059669';
    let statusBg = '#ecfdf5';
    let statusBorder = '#a7f3d0';
    let statusText = 'PASSPORT VALID';

    if (status === 'invalid' || status === 'revoked' || !signatureValid) {
      StatusIcon = XCircle;
      statusColor = '#dc2626';
      statusBg = '#fef2f2';
      statusBorder = '#fecaca';
      statusText = !signatureValid ? 'SIGNATURE INVALID' : status === 'revoked' ? 'PASSPORT REVOKED' : 'PASSPORT INVALID';
    } else if (status === 'expired') {
      StatusIcon = Clock;
      statusColor = '#d97706';
      statusBg = '#fffbeb';
      statusBorder = '#fde68a';
      statusText = 'PASSPORT EXPIRED';
    }

    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: statusBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            border: `2px solid ${statusBorder}`
          }}>
            <StatusIcon 
              size={44} 
              style={{ 
                color: statusColor,
                transition: 'transform 0.3s ease',
              }} 
            />
          </div>
          <div 
            style={{ 
              backgroundColor: statusBg, 
              color: statusColor, 
              padding: '6px 18px', 
              borderRadius: '999px',
              fontWeight: '800',
              fontSize: '13px',
              letterSpacing: '0.5px',
              marginBottom: '14px',
              border: `1px solid ${statusBorder}`
            }}
          >
            {statusText}
          </div>
          
          <h4 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 6px 0', color: '#0f172a' }}>{vendorName || 'Verified Vendor Partner'}</h4>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
            <span>Score: <strong style={{ color: '#0284c7', fontWeight: '800' }}>{complianceScore || 0}/100</strong></span>
            <span>•</span>
            <span>Expiry Date: <strong style={{ color: '#334155' }}>{expiryDate || 'N/A'}</strong></span>
          </div>
        </div>

        {message && (
          <div style={{ backgroundColor: '#f8fafc', borderLeft: `4px solid ${statusColor}`, padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: '20px', color: '#334155', fontSize: '13px', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#64748b', margin: '0 0 10px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '800' }}>Verified Credentials</h5>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {credentials && credentials.length > 0 ? (
              credentials.map((cred, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <ShieldCheck size={16} color="#059669" />
                  <span style={{ color: '#1e293b', fontSize: '12.5px', fontWeight: '600' }}>{cred}</span>
                </div>
              ))
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>No credentials listed.</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
            <Fingerprint size={18} color="#0284c7" />
            <span style={{ fontSize: '13.5px', fontWeight: '600' }}>Digital Cryptographic Signature</span>
          </div>
          {signatureValid ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#059669', fontSize: '13px', fontWeight: '800', backgroundColor: '#ecfdf5', padding: '3px 10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
              <CheckCircle2 size={14} /> Validated
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#dc2626', fontSize: '13px', fontWeight: '800', backgroundColor: '#fef2f2', padding: '3px 10px', borderRadius: '6px', border: '1px solid #fecaca' }}>
              <AlertTriangle size={14} /> Invalid
            </span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{ 
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
              color: '#ffffff', 
              border: 'none', 
              padding: '10px 24px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '13px',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
            }}
          >
            Close Check
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div 
        className="modal-content-box" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '560px', 
          width: '100%', 
          backgroundColor: '#ffffff', 
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
          overflow: 'hidden'
        }}
      >
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)' }}>
          <div>
            <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em' }}>PASSPORT VERIFICATION</span>
            <h3 style={{ margin: '6px 0 0 0', color: '#0f172a', fontSize: '18px', fontWeight: '800' }}>Compliance Passport Check</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body" style={{ color: '#0f172a' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
