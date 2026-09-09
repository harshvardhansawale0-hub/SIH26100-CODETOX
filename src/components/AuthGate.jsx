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
      backgroundColor: '#071526',
      minHeight: '84vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      color: '#ffffff'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        backgroundColor: '#0b1d33',
        borderRadius: '16px',
        border: isBuyer ? '1px solid rgba(2, 132, 199, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
        boxShadow: isBuyer
          ? '0 20px 50px rgba(2, 132, 199, 0.15), 0 0 0 1px rgba(2, 132, 199, 0.2)'
          : '0 20px 50px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(16, 185, 129, 0.2)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Top Decorative Banner */}
        <div style={{
          height: '6px',
          background: isBuyer
            ? 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)'
            : 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
        }} />

        <div style={{ padding: '2.5rem 2.5rem 2rem 2.5rem' }}>
          {/* Official Seal / Badge Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="gem-badge-box" style={{ fontSize: '0.85rem', padding: '0.3rem 0.65rem' }}>GeM</span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: isBuyer ? '#38bdf8' : '#34d399',
                backgroundColor: isBuyer ? 'rgba(2, 132, 199, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                padding: '0.3rem 0.75rem',
                borderRadius: '20px',
                border: isBuyer ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(52, 211, 153, 0.3)'
              }}>
                {isBuyer ? '🏛️ Govt Procuring Authority' : '🏢 Vendor / Seller Enterprise'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.8rem' }}>
              <Lock size={14} style={{ color: isBuyer ? '#38bdf8' : '#34d399' }} />
              <span>GFR 2017 Secured</span>
            </div>
          </div>

          {/* Main Title & Lock Message */}
          <div style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: isBuyer ? 'rgba(2, 132, 199, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              border: isBuyer ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              {isBuyer ? (
                <Landmark size={28} style={{ color: '#38bdf8' }} />
              ) : (
                <Building2 size={28} style={{ color: '#34d399' }} />
              )}
            </div>

            <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.6rem', lineHeight: 1.3 }}>
              {hasWrongRole ? (
                <span>Switch to {isBuyer ? 'Buyer Account' : 'Bidder / Seller Account'}</span>
              ) : (
                <span>Authentication Required: {isBuyer ? 'Buyer Portal' : 'Bidder / Seller Portal'}</span>
              )}
            </h2>

            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
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
            backgroundColor: '#071526',
            borderRadius: '10px',
            border: '1px solid #1e385b',
            padding: '1rem 1.25rem',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.65rem' }}>
              🔒 Protected Portal Capabilities:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', fontSize: '0.84rem', color: '#94a3b8' }}>
              {isBuyer ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: '#38bdf8', flexShrink: 0 }} />
                    <span>Create Tenders & Rules</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: '#38bdf8', flexShrink: 0 }} />
                    <span>AI Compliance Dossiers</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: '#38bdf8', flexShrink: 0 }} />
                    <span>Award Winning L1 Vendor</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: '#38bdf8', flexShrink: 0 }} />
                    <span>Anti-Cartel Ring Audit</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: '#34d399', flexShrink: 0 }} />
                    <span>Browse Active GeM Tenders</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: '#34d399', flexShrink: 0 }} />
                    <span>8-Stage AI Document OCR</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: '#34d399', flexShrink: 0 }} />
                    <span>GST & PAN Auto-Verification</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: '#34d399', flexShrink: 0 }} />
                    <span>Track Submission Status</span>
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
                  backgroundColor: isBuyer ? '#0284c7' : '#10b981',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: isBuyer ? '0 4px 14px rgba(2, 132, 199, 0.4)' : '0 4px 14px rgba(16, 185, 129, 0.4)',
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
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.92rem',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
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
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: isBuyer ? '#38bdf8' : '#34d399',
                border: isBuyer ? '1px dashed rgba(56, 189, 248, 0.4)' : '1px dashed rgba(52, 211, 153, 0.4)',
                borderRadius: '8px',
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
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #1e385b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onNavigateHome}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: 0
              }}
            >
              <ArrowLeft size={15} />
              <span>Return to Public Home</span>
            </button>

            <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
              SIH 2026 • GeM Procurement System
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
