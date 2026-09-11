import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ContactView({ onNavigateHome }) {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bidId: '',
    category: 'Grievance',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '80vh', padding: '4rem 1.5rem', color: '#0f172a' }}>
      <div className="container-custom" style={{ maxWidth: '960px' }}>
        {onNavigateHome && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '2rem' }}>
            <button
              onClick={onNavigateHome}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0284c7',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s ease'
              }}
              title="Return to GeM Homepage"
            >
              <Home size={16} />
              <span>🏠 Return to Homepage</span>
            </button>
          </div>
        )}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-tag">{t('contactTag')}</span>
          <h1 className="serif-heading" style={{ fontSize: '2.5rem', color: '#0b1a2d', marginBottom: '0.75rem' }}>
            {t('contactTitle')}
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            {t('contactSubtitle')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)' }}>
          {/* Contact Details */}
          <div style={{ backgroundColor: '#0b1a2d', color: '#ffffff', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1rem' }}>GeM Support & Redressal</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Dedicated technical support for Procurement Officers, Buyers, and Registered Vendors on the GeM 4.0 ecosystem.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MapPin size={18} color="#f5a623" />
                  <span>Ministry of Commerce & Industry, New Delhi, India</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Mail size={18} color="#f5a623" />
                  <span>support@gem.gov.in</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Phone size={18} color="#f5a623" />
                  <span>1800-419-3436 (GeM Toll Free)</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', borderTop: '1px solid #162c47', paddingTop: '1.25rem', fontSize: '0.78rem', color: '#64748b' }}>
              Built for Smart India Hackathon 2026 by Team Codetox.
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ padding: '2.5rem' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0b1a2d', marginBottom: '0.5rem' }}>
                  Grievance Ticket Registered!
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Your inquiry ticket <strong>#GEM-TKT-{Math.floor(100000 + Math.random() * 900000)}</strong> has been logged into the compliance queue.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    backgroundColor: '#0b1a2d',
                    color: '#ffffff',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    {t('fullNameLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar (Procurement Officer)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                      {t('emailLabel')}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@gov.in or org email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                      {t('bidTenderIdLabel')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. GEM/2026/B/891244"
                      value={formData.bidId}
                      onChange={(e) => setFormData({ ...formData, bidId: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    {t('messageLabel')}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your issue or query regarding compliance scoring, document OCR, or tender criteria..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', resize: 'vertical' }}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f59e0b',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <Send size={16} /> {t('sendGrievance')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
