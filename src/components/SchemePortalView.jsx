import React, { useState, useEffect } from 'react';
import { 
  Award, 
  HeartHandshake, 
  Rocket, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  Download, 
  Building2, 
  Percent, 
  Sparkles, 
  ExternalLink,
  Info,
  BadgeCheck,
  ChevronRight,
  UploadCloud,
  Home
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { initialTenders } from '../data/bidsData';

export default function SchemePortalView({ 
  initialScheme = 'mii', 
  onNavigateToTenders,
  onOpenVerifier,
  currentUser,
  onNavigateHome
}) {
  const { t, lang } = useLanguage();
  const [activeScheme, setActiveScheme] = useState(initialScheme || 'mii');
  const [registeredSchemes, setRegisteredSchemes] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (initialScheme) {
      setActiveScheme(initialScheme);
    }
  }, [initialScheme]);

  // Specific registration form fields state
  const [formData, setFormData] = useState({
    // General
    orgName: currentUser ? (currentUser.organization || currentUser.fullName) : '',
    email: currentUser ? currentUser.email : '',
    gstin: currentUser ? (currentUser.gstin || '') : '',
    // MII
    miiClass: 'Class-I',
    localContentPercent: 65,
    plantState: 'Maharashtra',
    plantDistrict: 'Pune Industrial Area',
    productCategory: 'Electronics & IT Hardware',
    // Womaniya
    womenOwnershipPercent: 100,
    shgRegistrationId: 'NRLM-MH-PUN-0912',
    artisanSpecialty: 'Handloom & Textile Products',
    womenLeaderName: 'Sunita Patil',
    // Startup
    dpiitNumber: 'DIPP89210',
    techDomain: 'Artificial Intelligence & Computer Vision',
    innovationSummary: 'Autonomous document OCR verification and compliance parser for procurement records.',
    hasPatent: 'Yes',
    // MSE
    udyamNumber: 'UDYAM-MH-03-0098741',
    enterpriseType: 'Micro Enterprise',
    socialCategory: 'Women Owned (3% Quota)'
  });

  const schemeConfigs = {
    mii: {
      id: 'mii',
      name: 'Make in India (MII)',
      badge: 'Public Procurement Order (PPO)',
      mandate: 'Preference to Domestically Manufactured Goods under DPIIT Order P-45021/2/2017-PP',
      color: '#f59e0b',
      icon: <Award size={28} color="#f59e0b" />,
      tagline: 'Empowering Indian Manufacturers & Accelerating Atmanirbhar Bharat',
      policyHighlights: [
        'Class-I Local Suppliers (Local Content >= 50%) receive absolute purchase preference in public tenders.',
        'No Global Tender Enquiry (GTE) permitted for procurement up to ₹200 Crores under GFR Rule 161(iv).',
        'Margin of Purchase Preference: L1 + 20% match-up window for domestic manufacturers.',
        'Mandatory local content self-declaration for bids under ₹10 Cr, CA audit certificate for bids > ₹10 Cr.'
      ],
      quotaStat: '50% Minimum Domestic Content',
      eligibility: 'All Indian manufacturers producing goods or services with audited local value addition in India.'
    },
    womaniya: {
      id: 'womaniya',
      name: 'Womaniya on GeM',
      badge: 'Women & SHG Entrepreneurship',
      mandate: 'Special Window for Women Entrepreneurs & Self-Help Groups (MoWCD & NRLM)',
      color: '#ec4899',
      icon: <HeartHandshake size={28} color="#ec4899" />,
      tagline: 'Connecting Women Micro-Entrepreneurs, SHGs & Master Artisans Directly with Government Buyers',
      policyHighlights: [
        '3% Mandatory Public Procurement reservation for Women-Owned Micro & Small Enterprises.',
        'Direct onboarding without turnover or prior experience constraints for registered Self-Help Groups (SHGs).',
        'SARAS Collection integration enabling national exposure for rural artisan craftswomen.',
        'Subsidized catalog creation and dedicated marketing stalls during national procurement expos.'
      ],
      quotaStat: '3% Earmarked Annual Quota',
      eligibility: 'Enterprises with >= 51% ownership/equity held by women, registered SHGs under NRLM/NULM, or artisan cooperatives.'
    },
    startup: {
      id: 'startup',
      name: 'GeM Startup Runway',
      badge: 'DPIIT Innovation Fast-Track',
      mandate: 'Fast-Track Procurement for DPIIT Recognized Startups (DPIIT & Ministry of Commerce)',
      color: '#3b82f6',
      icon: <Rocket size={28} color="#3b82f6" />,
      tagline: 'Direct Fast-Track Onboarding for Cutting-Edge DeepTech, AI & GreenTech Innovations',
      policyHighlights: [
        'Total Exemption from Prior Experience & Prior Turnover criteria under GFR Rule 173(i).',
        '100% Exemption from Earnest Money Deposit (EMD) and Bid Security requirements.',
        'Trial Order Procurement: Government buyers can place pilot and trial orders up to ₹50 Lakhs.',
        'Direct technical showcase to 70,000+ Government departments, ministries, and CPSEs.'
      ],
      quotaStat: '100% EMD & Turnover Waiver',
      eligibility: 'DPIIT-recognized Startups incorporated within the last 10 years with innovative products/services.'
    },
    mse: {
      id: 'mse',
      name: 'MSE Sambandh Portal',
      badge: 'Public Procurement Policy 2012',
      mandate: 'Mandatory 25% Procurement Quota from Micro & Small Enterprises (Ministry of MSME)',
      color: '#10b981',
      icon: <ShieldCheck size={28} color="#10b981" />,
      tagline: 'Statutory 25% Annual Procurement Guarantee for Micro and Small Enterprises',
      policyHighlights: [
        'Mandatory 25% of total annual purchases by all Ministries, Departments and CPSEs reserved for MSEs.',
        'Sub-target of 4% from SC/ST owned MSEs and 3% from Women-Owned MSEs within the 25% quota.',
        'Free tender sets and total waiver of Earnest Money Deposit (EMD).',
        'Price preference: MSEs quoting within L1 + 15% price band are allowed to supply up to 25% by matching L1 price.'
      ],
      quotaStat: '25% Mandatory Reservation',
      eligibility: 'Any enterprise holding a valid Udyam Registration Number (Micro or Small manufacturing/service unit).'
    }
  };

  const currentScheme = schemeConfigs[activeScheme] || schemeConfigs.mii;

  // Filter tenders matching active scheme
  const schemeTenders = initialTenders.filter(t => {
    if (activeScheme === 'mii') return t.isMii;
    if (activeScheme === 'womaniya') return t.isWomaniya;
    if (activeScheme === 'startup') return t.isStartup;
    if (activeScheme === 'mse') return t.isMsme;
    return true;
  });

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const regId = `${activeScheme.toUpperCase()}-IN-${Math.floor(100000 + Math.random() * 900000)}`;
      setRegisteredSchemes(prev => ({
        ...prev,
        [activeScheme]: {
          regId,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'VERIFIED & ENROLLED'
        }
      }));
      setIsSubmitting(false);
      setSuccessMessage({
        scheme: currentScheme.name,
        regId
      });
    }, 800);
  };

  const isCurrentSchemeRegistered = !!registeredSchemes[activeScheme];

  return (
    <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 35%, #fff7ed 70%, #ffffff 100%)', minHeight: '88vh', padding: '2rem 1.5rem', color: '#0f172a', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <div className="container-custom">
        {/* Top Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="section-tag" style={{ margin: 0, background: 'linear-gradient(135deg, #e0f2fe 0%, #fed7aa 100%)', color: '#0369a1', border: '1px solid #bae6fd', fontWeight: '800' }}>
                OFFICIAL GOVERNMENT OF INDIA SCHEMES
              </span>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#eff6ff', color: '#0284c7', padding: '3px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', fontWeight: '700' }}>
                Statutory Procurement Mandates
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0.2rem 0', color: '#0f172a', letterSpacing: '-0.02em' }}>
              Government Initiatives & Enrolment Portal
            </h1>
            <p style={{ color: '#475569', fontSize: '0.95rem', maxWidth: '850px', margin: 0, lineHeight: '1.5' }}>
              Dedicated portal for statutory procurement schemes. Access official policy guidelines, enroll your enterprise with scheme-specific credentials, and participate in reserved public procurement tenders.
            </p>
          </div>
          {onNavigateHome && (
            <button 
              onClick={onNavigateHome}
              style={{
                width: '40px',
                height: '40px',
                padding: 0,
                backgroundColor: '#ffffff',
                color: '#0284c7',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              title="Return to GeM Homepage"
              aria-label="Return to GeM Homepage"
            >
              <Home size={18} color="#0284c7" />
            </button>
          )}
        </div>

        {/* 4 Interactive Scheme Selector Tabs */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          {Object.values(schemeConfigs).map(scheme => {
            const isActive = activeScheme === scheme.id;
            const isReg = registeredSchemes[scheme.id];
            return (
              <div
                key={scheme.id}
                onClick={() => {
                  setActiveScheme(scheme.id);
                  setSuccessMessage(null);
                }}
                role="button"
                tabIndex={0}
                style={{
                  backgroundColor: '#ffffff',
                  border: `2px solid ${isActive ? scheme.color : '#e2e8f0'}`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow: isActive ? `0 8px 24px ${scheme.color}25` : '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ 
                    backgroundColor: `${scheme.color}15`, 
                    padding: '8px', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {scheme.icon}
                  </div>
                  {isReg ? (
                    <span style={{ fontSize: '0.7rem', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 7px', borderRadius: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <BadgeCheck size={12} /> ENROLLED
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', backgroundColor: `${scheme.color}15`, color: scheme.color, border: `1px solid ${scheme.color}30`, padding: '2px 7px', borderRadius: '4px', fontWeight: '800' }}>
                      {scheme.quotaStat}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  {scheme.name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>
                  {scheme.badge}
                </span>
              </div>
            );
          })}
        </div>

        {/* Success Alert Banner if Enrolled */}
        {successMessage && (
          <div style={{ 
            backgroundColor: '#ecfdf5', 
            border: '1px solid #a7f3d0', 
            borderRadius: '12px', 
            padding: '1.25rem', 
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BadgeCheck size={28} color="#059669" />
              <div>
                <h4 style={{ margin: '0 0 2px 0', color: '#059669', fontSize: '1.05rem', fontWeight: '800' }}>
                  Enrollment Successful: {successMessage.scheme}
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155' }}>
                  Certificate Generated with Registration ID: <strong className="mono-text" style={{ color: '#0f172a' }}>{successMessage.regId}</strong>. Your account is now eligible for preferential procurement quotas.
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => onNavigateToTenders && onNavigateToTenders(activeScheme)}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.55rem 1.15rem',
                fontSize: '0.85rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
              }}
            >
              <span>View Reserved Tenders</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* 2-Column Main Section: Left = Scheme Info & Directives, Right = Registration Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          {/* Left Column: Scheme Information & Mandates */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: `${currentScheme.color}15`, padding: '10px', borderRadius: '10px' }}>
                {currentScheme.icon}
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0, fontWeight: '800' }}>
                  {currentScheme.name}
                </h2>
                <span style={{ fontSize: '0.82rem', color: currentScheme.color, fontWeight: '800' }}>
                  {currentScheme.mandate}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {currentScheme.tagline}. GeM provides automated evaluation of this statutory qualification at the tender ingestion stage.
            </p>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#0284c7', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '800' }}>
                <Info size={16} /> Official Policy Directives
              </h4>
              <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {currentScheme.policyHighlights.map((point, idx) => (
                  <li key={idx} style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ backgroundColor: '#fff7ed', borderRadius: '8px', padding: '1rem', border: '1px solid #fed7aa' }}>
              <span style={{ fontSize: '0.75rem', color: '#ea580c', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: '800' }}>
                Eligibility Criteria
              </span>
              <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                {currentScheme.eligibility}
              </p>
            </div>

            {/* Scheme Related Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>Procurement Target</span>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: currentScheme.color, marginTop: '4px' }}>
                  {currentScheme.quotaStat}
                </div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>Active Reserved Bids</span>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>
                  {schemeTenders.length} Live Tenders
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Scheme-Specific Registration Form */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0, fontWeight: '800' }}>
                  Particular Scheme Registration
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Apply for statutory enrollment under {currentScheme.name}
                </span>
              </div>
              {isCurrentSchemeRegistered && (
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                  {registeredSchemes[activeScheme].regId}
                </span>
              )}
            </div>

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Common Enterprise Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                    Enterprise / Supplier Name
                  </label>
                  <input
                    type="text"
                    value={formData.orgName}
                    onChange={e => setFormData({ ...formData, orgName: e.target.value })}
                    required
                    style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem', color: '#0f172a', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="27AABCB1234F1Z5"
                    required
                    style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem', color: '#0f172a', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* SPECIFIC FIELDS PER SCHEME */}
              {activeScheme === 'mii' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Supplier Classification
                      </label>
                      <select
                        value={formData.miiClass}
                        onChange={e => setFormData({ ...formData, miiClass: e.target.value })}
                        style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem', color: '#0f172a', fontSize: '0.85rem' }}
                      >
                        <option value="Class-I">Class-I Local Supplier (50% or more)</option>
                        <option value="Class-II">Class-II Local Supplier (20% - 50%)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Local Content Percentage (%)
                      </label>
                      <input
                        type="number"
                        min="20"
                        max="100"
                        value={formData.localContentPercent}
                        onChange={e => setFormData({ ...formData, localContentPercent: e.target.value })}
                        required
                        style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem', color: '#ea580c', fontWeight: '800', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Manufacturing Plant State
                      </label>
                      <input
                        type="text"
                        value={formData.plantState}
                        onChange={e => setFormData({ ...formData, plantState: e.target.value })}
                        required
                        style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem', color: '#0f172a', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Manufacturing District / Facility
                      </label>
                      <input
                        type="text"
                        value={formData.plantDistrict}
                        onChange={e => setFormData({ ...formData, plantDistrict: e.target.value })}
                        required
                        style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem', color: '#0f172a', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeScheme === 'womaniya' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Women Equity / Shareholding (%)
                      </label>
                      <input
                        type="number"
                        min="51"
                        max="100"
                        value={formData.womenOwnershipPercent}
                        onChange={e => setFormData({ ...formData, womenOwnershipPercent: e.target.value })}
                        required
                        style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem', color: '#db2777', fontWeight: '800', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        SHG / NRLM Reg Number
                      </label>
                      <input
                        type="text"
                        value={formData.shgRegistrationId}
                        onChange={e => setFormData({ ...formData, shgRegistrationId: e.target.value })}
                        placeholder="NRLM-XX-0000"
                        required
                        style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem', color: '#0f172a', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Lead Artisan / Woman Entrepreneur Name
                    </label>
                    <input
                      type="text"
                      value={formData.womenLeaderName}
                      onChange={e => setFormData({ ...formData, womenLeaderName: e.target.value })}
                      required
                      style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem', color: '#0f172a', fontSize: '0.85rem' }}
                    />
                  </div>
                </>
              )}

              {activeScheme === 'startup' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        DPIIT Recognition Number
                      </label>
                      <input
                        type="text"
                        value={formData.dpiitNumber}
                        onChange={e => setFormData({ ...formData, dpiitNumber: e.target.value })}
                        placeholder="DIPP12345"
                        required
                        style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem', color: '#2563eb', fontWeight: '800', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Technology Domain
                      </label>
                      <input
                        type="text"
                        value={formData.techDomain}
                        onChange={e => setFormData({ ...formData, techDomain: e.target.value })}
                        required
                        style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem', color: '#0f172a', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Innovation Summary & Core IP
                    </label>
                    <textarea
                      rows={2}
                      value={formData.innovationSummary}
                      onChange={e => setFormData({ ...formData, innovationSummary: e.target.value })}
                      required
                      style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem', color: '#0f172a', fontSize: '0.85rem', resize: 'vertical' }}
                    />
                  </div>
                </>
              )}

              {activeScheme === 'mse' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Udyam Registration Number
                      </label>
                      <input
                        type="text"
                        value={formData.udyamNumber}
                        onChange={e => setFormData({ ...formData, udyamNumber: e.target.value })}
                        placeholder="UDYAM-MH-03-0000000"
                        required
                        style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem', color: '#059669', fontWeight: '800', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Enterprise Category
                      </label>
                      <select
                        value={formData.enterpriseType}
                        onChange={e => setFormData({ ...formData, enterpriseType: e.target.value })}
                        style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem', color: '#0f172a', fontSize: '0.85rem' }}
                      >
                        <option value="Micro Enterprise">Micro Enterprise (&lt; ₹1 Cr / ₹5 Cr)</option>
                        <option value="Small Enterprise">Small Enterprise (&lt; ₹10 Cr / ₹50 Cr)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Social Category (Sub-Quota Earmarking)
                    </label>
                    <select
                      value={formData.socialCategory}
                      onChange={e => setFormData({ ...formData, socialCategory: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem', color: '#0f172a', fontSize: '0.85rem' }}
                    >
                      <option value="General">General (25% MSE Quota)</option>
                      <option value="SC/ST Owned">SC / ST Owned (4% Dedicated Sub-Quota)</option>
                      <option value="Women Owned">Women Owned (3% Dedicated Sub-Quota)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Statutory Undertaking Checkbox */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="checkbox" id="statutoryCheck" defaultChecked required style={{ marginTop: '3px' }} />
                <label htmlFor="statutoryCheck" style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                  I solemnly certify under penalty of GFR debarment that the statutory claims, certifications, and manufacturing particulars submitted herein comply with official Ministry guidelines.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: `linear-gradient(135deg, ${currentScheme.color} 0%, #ea580c 100%)`,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.92rem',
                  fontWeight: '800',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                  boxShadow: '0 3px 12px rgba(234, 88, 12, 0.25)',
                  transition: 'all 0.2s'
                }}
              >
                {isSubmitting ? (
                  <span>Verifying Credentials & Enrolling...</span>
                ) : (
                  <>
                    <BadgeCheck size={18} />
                    <span>Submit & Enroll in {currentScheme.name}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section: Reserved Tenders Matching This Scheme */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: 0, fontWeight: '800' }}>
                Reserved Public Tenders under {currentScheme.name}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
                Live procurement opportunities reserving preference or quota for enrolled vendors
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTenders && onNavigateToTenders(activeScheme)}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#0284c7',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>Explore All in Tenders View</span>
              <ExternalLink size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {schemeTenders.map(t => (
              <div 
                key={t.id}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                    <span className="mono-text" style={{ color: '#0284c7', fontSize: '0.82rem', fontWeight: '800' }}>{t.id}</span>
                    <span style={{ fontSize: '0.7rem', backgroundColor: `${currentScheme.color}15`, color: currentScheme.color, border: `1px solid ${currentScheme.color}30`, padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>
                      {currentScheme.badge}
                    </span>
                  </div>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#0f172a', fontWeight: '700' }}>{t.title}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.ministry} • {t.department}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Estimated Value</span>
                    <span style={{ color: '#ea580c', fontWeight: '800', fontSize: '0.95rem' }}>{t.estimatedValue}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenVerifier && onOpenVerifier(t)}
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
                    }}
                  >
                    <span>Apply With Scheme Benefits</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
