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
    <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 35%, #fff7ed 70%, #ffffff 100%)', minHeight: '85vh', padding: '3.5rem 1.5rem', color: '#0f172a' }}>
      <div className="container-custom" style={{ maxWidth: '980px' }}>
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
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="section-tag" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' }}>{t('contactTag')}</span>
          <h1 className="serif-heading" style={{ fontSize: '2.4rem', color: '#0f172a', fontWeight: '800', marginBottom: '0.75rem' }}>
            {t('contactTitle')}
          </h1>
          <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            {t('contactSubtitle')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '0', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 12px 36px rgba(15, 23, 42, 0.06)' }}>
          {/* Contact Details with Soft Hot & Cool Civic Gradient */}
          <div style={{ background: 'linear-gradient(145deg, #f0f9ff 0%, #eff6ff 45%, #fff7ed 100%)', color: '#0f172a', padding: '3rem 2.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ display: 'inline-block', backgroundColor: '#ffffff', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800', color: '#0284c7', border: '1px solid #bae6fd', marginBottom: '1rem' }}>
                HELPDESK & NODAL SUPPORT
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>GeM Support & Redressal</h3>
              <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Dedicated technical support for Procurement Officers, Central/State Buyers, and Registered Vendors on the GeM 4.0 ecosystem.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={18} color="#ea580c" />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.82rem' }}>Headquarters</strong>
                    <span style={{ color: '#475569' }}>Ministry of Commerce & Industry, New Delhi, India</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={18} color="#0284c7" />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.82rem' }}>Official Helpdesk</strong>
                    <span style={{ color: '#475569' }}>support@gem.gov.in</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={18} color="#059669" />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.82rem' }}>Toll Free Line</strong>
                    <span style={{ color: '#475569' }}>1800-419-3436 (GeM Toll Free)</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', fontSize: '0.8rem', color: '#64748b' }}>
              Built for Smart India Hackathon 2026 by Team Codetox.
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ padding: '3rem 2.5rem', backgroundColor: '#ffffff' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <CheckCircle size={52} color="#059669" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
                  Grievance Ticket Registered!
                </h3>
                <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Your inquiry ticket <strong>#GEM-TKT-{Math.floor(100000 + Math.random() * 900000)}</strong> has been logged into the compliance queue.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{
                    padding: '0.65rem 1.6rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
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
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', backgroundColor: '#f8fafc' }}
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
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', backgroundColor: '#f8fafc' }}
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
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', backgroundColor: '#f8fafc' }}
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
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', resize: 'vertical', backgroundColor: '#f8fafc' }}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)'
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
