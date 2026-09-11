import React from 'react';
import { ShieldCheck, Lock, Landmark, Building2, ArrowRight, KeyRound, AlertCircle, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AuthGate({
  requiredRole = 'buyer', // 'buyer' or 'bidder'
  currentUser = null,
  onOpenAuth,
  onQuickDemoLogin,
  onNavigateHome
}) {
  const { t, lang } = useLanguage();

  const isBuyer = requiredRole === 'buyer';
  const hasWrongRole = currentUser && currentUser.role !== requiredRole;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdf4 35%, #eff6ff 70%, #fff7ed 100%)',
      minHeight: '84vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      color: '#0f172a'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: isBuyer
          ? '0 20px 45px rgba(2, 132, 199, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04)'
          : '0 20px 45px rgba(5, 150, 105, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Top Decorative Banner with Hot & Cool mixed gradient */}
        <div style={{
          height: '6px',
          background: isBuyer
            ? 'linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #f59e0b 100%)'
            : 'linear-gradient(90deg, #059669 0%, #10b981 50%, #ea580c 100%)'
        }} />

        <div style={{ padding: '2.5rem 2.5rem 2rem 2.5rem' }}>
          {/* Official Seal / Badge Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="gem-badge-box" style={{ fontSize: '0.85rem', padding: '0.3rem 0.65rem' }}>GeM</span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: isBuyer ? '#0369a1' : '#047857',
                backgroundColor: isBuyer ? '#eff6ff' : '#ecfdf5',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                border: isBuyer ? '1px solid #bae6fd' : '1px solid #a7f3d0'
              }}>
                {isBuyer ? '🏛️ Govt Procuring Authority' : '🏢 Vendor / Seller Enterprise'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>
              <Lock size={14} style={{ color: isBuyer ? '#0284c7' : '#059669' }} />
              <span>GFR 2017 Secured</span>
            </div>
          </div>

          {/* Main Title & Lock Message */}
          <div style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: isBuyer ? '#eff6ff' : '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              border: isBuyer ? '1px solid #bae6fd' : '1px solid #a7f3d0'
            }}>
              {isBuyer ? (
                <Landmark size={28} style={{ color: '#0284c7' }} />
              ) : (
                <Building2 size={28} style={{ color: '#059669' }} />
              )}
            </div>

            <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.6rem', lineHeight: 1.3 }}>
              {hasWrongRole ? (
                <span>Switch to {isBuyer ? 'Buyer Account' : 'Bidder / Seller Account'}</span>
              ) : (
                <span>Authentication Required: {isBuyer ? 'Buyer Portal' : 'Bidder / Seller Portal'}</span>
              )}
            </h2>

            <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              {hasWrongRole ? (
                <span>
                  You are currently logged in as <strong>{currentUser.fullName}</strong> ({currentUser.role === 'buyer' ? 'Government Buyer' : 'Vendor Bidder'}). Accessing this portal requires logging in with a <strong>{isBuyer ? 'Buyer (Procuring Officer)' : 'Bidder / Seller (Vendor Company)'}</strong> account.
                </span>
              ) : (
                <span>
                  Access to the {isBuyer ? 'Government Buyer Portal' : 'Vendor Bidder Portal'} is protected under Government e-Marketplace procurement regulations. Please sign in with your verified credentials to {isBuyer ? 'publish tenders, manage compliance criteria, and award contracts' : 'browse bids, upload statutory documents, and submit verified proposals'}.
                </span>
              )}
            </p>
          </div>

          {/* Key Portal Features / Permissions Grid */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.1rem 1.25rem',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.65rem' }}>
              🔒 Protected Portal Capabilities:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', fontSize: '0.84rem', color: '#334155' }}>
              {isBuyer ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: '#0284c7', flexShrink: 0 }} />
                    <span style={{ fontWeight: '500' }}>Create Tenders & Rules</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: '#0284c7', flexShrink: 0 }} />
                    <span style={{ fontWeight: '500' }}>AI Compliance Dossiers</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: '#0284c7', flexShrink: 0 }} />
                    <span style={{ fontWeight: '500' }}>Award Winning L1 Vendor</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: '#0284c7', flexShrink: 0 }} />
                    <span style={{ fontWeight: '500' }}>Anti-Cartel Ring Audit</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: '#059669', flexShrink: 0 }} />
                    <span style={{ fontWeight: '500' }}>Browse Active GeM Tenders</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: '#059669', flexShrink: 0 }} />
                    <span style={{ fontWeight: '500' }}>8-Stage AI Document OCR</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: '#059669', flexShrink: 0 }} />
                    <span style={{ fontWeight: '500' }}>GST & PAN Auto-Verification</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: '#059669', flexShrink: 0 }} />
                    <span style={{ fontWeight: '500' }}>Track Submission Status</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => onOpenAuth('signin', requiredRole)}
                style={{
                  padding: '0.85rem 1rem',
                  background: isBuyer ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: isBuyer ? '0 4px 14px rgba(2, 132, 199, 0.3)' : '0 4px 14px rgba(5, 150, 105, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <KeyRound size={17} />
                <span>Sign In as {isBuyer ? 'Buyer' : 'Bidder'}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth('signup', requiredRole)}
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontWeight: '700',
                  fontSize: '0.92rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <span>Register New Entity</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Quick Demo Login Shortcut */}
            <button
              type="button"
              onClick={() => onQuickDemoLogin(requiredRole)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: isBuyer ? '#eff6ff' : '#ecfdf5',
                color: isBuyer ? '#0284c7' : '#059669',
                border: isBuyer ? '1px dashed #0284c7' : '1px dashed #059669',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              title="Click for instant 1-click test session during evaluation"
            >
              <Sparkles size={16} />
              <span>⚡ Quick Demo: Instant 1-Click {isBuyer ? 'Government Buyer' : 'Vendor Bidder'} Login</span>
            </button>
          </div>

          {/* Footer Back Button */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onNavigateHome}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: 0,
                fontWeight: '600'
              }}
            >
              <ArrowLeft size={15} />
              <span>Return to Public Home</span>
            </button>

            <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: '500' }}>
              SIH 2026 • GeM Procurement System
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
