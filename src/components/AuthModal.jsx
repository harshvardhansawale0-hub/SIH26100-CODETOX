import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Building2, Landmark, Sparkles, AlertCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { gemApi } from '../services/api';
import { setAuthToken } from '../services/api';

export default function AuthModal({
  isOpen,
  mode = 'signin',
  onClose,
  onAuthSuccess,
  initialRole = 'bidder',
  reasonMessage = null
}) {
  if (!isOpen) return null;

  const { t, lang } = useLanguage();
  const [authMode, setAuthMode] = useState(mode || 'signin');
  const [role, setRole] = useState(initialRole === 'buyer' ? 'buyer' : 'bidder');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync mode and initial role when modal opens
  useEffect(() => {
    setAuthMode(mode || 'signin');
    setRole(initialRole === 'buyer' ? 'buyer' : 'bidder');
    setErrorMsg('');
  }, [isOpen, mode, initialRole]);

  const handleQuickLogin = (demoRole) => {
    const isGovBuyer = demoRole === 'buyer';
    const demoUser = isGovBuyer
      ? {
          id: 101,
          fullName: "Dir. Rajesh Verma",
          email: "procurement.officer@nic.in",
          organization: "Ministry of Electronics & IT (MeitY)",
          gstin: "07AAAGM0289C1ZU",
          role: "buyer",
          designation: "Chief Procurement Officer",
          isDemo: true
        }
      : {
          id: 202,
          fullName: "Harshvardhan Sawale",
          email: "vendor.contact@apextech.com",
          organization: "Apex Technologies & Supplies Ltd.",
          gstin: "27AABCB1234F1Z5",
          role: "bidder",
          category: "IT Hardware",
          udyam: "UDYAM-MH-03-0012345",
          isDemo: true
        };

    const token = `gem_demo_jwt_${Date.now()}`;
    setAuthToken(token);
    localStorage.setItem('gem_user', JSON.stringify(demoUser));
    if (onAuthSuccess) {
      onAuthSuccess(demoUser);
    }
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      if (authMode === 'signin') {
        const res = await gemApi.login(email, password, role);
        const loggedUser = { ...res.user, isDemo: false };
        setAuthToken(res.token);
        localStorage.setItem('gem_user', JSON.stringify(loggedUser));
        if (onAuthSuccess) {
          onAuthSuccess(loggedUser);
        }
      } else {
        const res = await gemApi.register({
          fullName: fullName || email.split('@')[0],
          email,
          password,
          organization: organization || (role === 'buyer' ? 'Government Ministry / Dept' : 'Vendor Enterprise'),
          role: role
        });
        const newUser = { ...res.user, isDemo: false };
        setAuthToken(res.token);
        localStorage.setItem('gem_user', JSON.stringify(newUser));
        if (onAuthSuccess) {
          onAuthSuccess(newUser);
        }
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBuyerLabel = () => {
    if (lang === 'hi') return '🏛️ क्रेता (सरकारी प्राधिकरण)';
    if (lang === 'mr') return '🏛️ खरेदीदार (शासकीय प्राधिकरण)';
    return '🏛️ Buyer (Govt Authority)';
  };

  const getBidderLabel = () => {
    if (lang === 'hi') return '🏢 बोलीदाता (विक्रेता / कंपनी)';
    if (lang === 'mr') return '🏢 निविदाकार (विक्रेता / कंपनी)';
    return '🏢 Bidder / Seller (Vendor)';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="gem-badge-box" style={{ fontSize: '0.85rem', padding: '0.2rem 0.5rem' }}>GeM</span>
            <h3 className="modal-title" style={{ fontSize: '1.2rem' }}>
              {authMode === 'signin' ? 'Sign In to GeM Portal' : 'Create GeM Account'}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {reasonMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(2, 132, 199, 0.1)',
              border: '1px solid rgba(2, 132, 199, 0.3)',
              color: '#0284c7',
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              marginBottom: '1rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{reasonMessage}</span>
            </div>
          )}

          {/* User Role selector: ONLY TWO ROLES */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0f2238', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
              Select Required Portal Access:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setRole('buyer')}
                style={{
                  padding: '0.65rem 0.5rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  border: role === 'buyer' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  backgroundColor: role === 'buyer' ? '#0f2238' : '#f8fafc',
                  color: role === 'buyer' ? '#38bdf8' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: role === 'buyer' ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none'
                }}
              >
                {getBuyerLabel()}
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '400', marginTop: '0.2rem', color: role === 'buyer' ? '#94a3b8' : '#94a3b8' }}>
                  Publish & Award Bids
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole('bidder')}
                style={{
                  padding: '0.65rem 0.5rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  border: role === 'bidder' ? '2px solid #10b981' : '1px solid #cbd5e1',
                  backgroundColor: role === 'bidder' ? '#0f2238' : '#f8fafc',
                  color: role === 'bidder' ? '#34d399' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: role === 'bidder' ? '0 2px 8px rgba(16, 185, 129, 0.25)' : 'none'
                }}
              >
                {getBidderLabel()}
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '400', marginTop: '0.2rem', color: role === 'bidder' ? '#94a3b8' : '#94a3b8' }}>
                  Apply & Upload Docs
                </span>
              </button>
            </div>
          </div>

          {/* Quick 1-Click Demo Shortcut */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin(role)}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                backgroundColor: role === 'buyer' ? 'rgba(2, 132, 199, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                color: role === 'buyer' ? '#0284c7' : '#059669',
                border: role === 'buyer' ? '1px dashed #0284c7' : '1px dashed #10b981',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={15} />
              <span>⚡ Instant Demo Login as {role === 'buyer' ? 'Govt Buyer Officer' : 'Vendor Bidder (Apex)'}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {errorMsg && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 0.8rem', borderRadius: '6px',
                backgroundColor: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', fontSize: '0.82rem', fontWeight: '600'
              }}>
                <AlertTriangle size={16} /> {errorMsg}
              </div>
            )}
            {authMode === 'signup' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Full Official Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      required
                      placeholder={role === 'buyer' ? "e.g. Officer Rajesh Verma" : "e.g. Harshvardhan Sawale"}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    {role === 'buyer' ? 'Ministry / Department' : 'Enterprise / Company Name'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    {role === 'buyer' ? (
                      <Landmark size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    ) : (
                      <Building2 size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    )}
                    <input
                      type="text"
                      required
                      placeholder={role === 'buyer' ? "e.g. Ministry of Electronics & IT" : "e.g. Apex Technologies Ltd."}
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                {t('emailLabel')} / {role === 'buyer' ? 'NIC Official ID' : 'Business Email'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  required
                  placeholder={role === 'buyer' ? "officer@nic.in" : "vendor@apextech.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                {t('passwordLabel')}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: '0.5rem',
                padding: '0.65rem',
                backgroundColor: role === 'buyer' ? '#0284c7' : '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <ShieldCheck size={18} /> {isSubmitting ? 'Authenticating...' : authMode === 'signin' ? `Sign In as ${role === 'buyer' ? 'Buyer' : 'Bidder'}` : `Register as ${role === 'buyer' ? 'Buyer Org' : 'Vendor Bidder'}`}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
            {authMode === 'signin' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  style={{ color: '#0284c7', fontWeight: '700', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Register Entity
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  style={{ color: '#0284c7', fontWeight: '700', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
