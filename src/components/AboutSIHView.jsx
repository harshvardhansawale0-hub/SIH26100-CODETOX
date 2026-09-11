import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Scale, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  CreditCard, 
  Truck, 
  Search, 
  Users,
  Award,
  Layers,
  Home
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AboutSIHView({ onNavigateHome }) {
  const { t } = useLanguage();

  const pillars = [
    {
      icon: <Users size={28} color="#0284c7" />,
      title: t('pillarInclusiveness'),
      desc: t('pillarInclusivenessDesc')
    },
    {
      icon: <ShieldCheck size={28} color="#059669" />,
      title: t('pillarTransparency'),
      desc: t('pillarTransparencyDesc')
    },
    {
      icon: <Zap size={28} color="#ea580c" />,
      title: t('pillarEfficiency'),
      desc: t('pillarEfficiencyDesc')
    },
    {
      icon: <TrendingUp size={28} color="#7c3aed" />,
      title: t('pillarCostSavings'),
      desc: t('pillarCostSavingsDesc')
    }
  ];

  const lifecycleSteps = [
    {
      num: "01",
      icon: <Building2 size={24} color="#ea580c" />,
      title: t('stepA1Title'),
      desc: t('stepA1Desc')
    },
    {
      num: "02",
      icon: <Layers size={24} color="#0284c7" />,
      title: t('stepA2Title'),
      desc: t('stepA2Desc')
    },
    {
      num: "03",
      icon: <Scale size={24} color="#059669" />,
      title: t('stepA3Title'),
      desc: t('stepA3Desc')
    },
    {
      num: "04",
      icon: <Zap size={24} color="#d97706" />,
      title: t('stepA4Title'),
      desc: t('stepA4Desc')
    },
    {
      num: "05",
      icon: <FileText size={24} color="#0284c7" />,
      title: t('stepA5Title'),
      desc: t('stepA5Desc')
    },
    {
      num: "06",
      icon: <CreditCard size={24} color="#059669" />,
      title: t('stepA6Title'),
      desc: t('stepA6Desc')
    }
  ];

  const procurementModes = [
    {
      title: t('modeDirect'),
      limit: t('modeDirectLimit'),
      desc: t('modeDirectDesc'),
      badgeColor: "#0284c7"
    },
    {
      title: t('modeL1'),
      limit: t('modeL1Limit'),
      desc: t('modeL1Desc'),
      badgeColor: "#059669"
    },
    {
      title: t('modeBidding'),
      limit: t('modeBiddingLimit'),
      desc: t('modeBiddingDesc'),
      badgeColor: "#ea580c"
    },
    {
      title: t('modeRA'),
      limit: t('modeRALimit'),
      desc: t('modeRADesc'),
      badgeColor: "#7c3aed"
    }
  ];

  return (
    <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdf4 30%, #eff6ff 65%, #fff7ed 100%)', minHeight: '85vh', padding: '3.5rem 1.5rem', color: '#0f172a' }}>
      <div className="container-custom">
        {onNavigateHome && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '2rem' }}>
            <button
              onClick={onNavigateHome}
              style={{
                width: '40px',
                height: '40px',
                padding: 0,
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              title="Return to GeM Homepage"
              aria-label="Return to GeM Homepage"
            >
              <Home size={18} color="#0284c7" />
            </button>
          </div>
        )}
        {/* 1. Header Section */}
        <div style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto 3.5rem auto' }}>
          <span className="section-tag" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' }}>{t('aboutGemTag')}</span>
          <h1 className="serif-heading" style={{ fontSize: '2.6rem', color: '#0f172a', fontWeight: '800', marginBottom: '1rem' }}>
            {t('aboutGemTitle')}
          </h1>
          <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.65 }}>
            {t('aboutGemSubtitle')}
          </p>
        </div>

        {/* 2. GeM Operating Pillars (4 Grid Cards) */}
        <div style={{ marginBottom: '4.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 className="serif-heading" style={{ fontSize: '1.85rem', color: '#0f172a', fontWeight: '800' }}>
              {t('gemPillarsTitle')}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.75rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 14px 28px rgba(15, 23, 42, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(15, 23, 42, 0.04)';
                }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {pillar.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  {pillar.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. End-to-End Procurement Lifecycle (6 Steps) - Warm & Cool Mixed Civic Gradient */}
        <div style={{ background: 'linear-gradient(145deg, #f0f9ff 0%, #eff6ff 45%, #fff7ed 100%)', color: '#0f172a', borderRadius: '20px', padding: '3.5rem 2.5rem', marginBottom: '4.5rem', border: '1px solid #e2e8f0', boxShadow: '0 12px 32px rgba(15, 23, 42, 0.05)' }}>
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem auto' }}>
            <span className="section-tag" style={{ backgroundColor: '#fed7aa', color: '#c2410c', border: '1px solid #fdba74' }}>WORKFLOW LIFECYCLE</span>
            <h2 className="serif-heading" style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: '800', margin: '0.4rem 0' }}>
              {t('gemLifecycleTitle')}
            </h2>
            <p style={{ color: '#475569', fontSize: '0.95rem' }}>
              From initial vendor registration to delivery verification and automated 10-day payment disbursal.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {lifecycleSteps.map((step) => (
              <div
                key={step.num}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {step.icon}
                  </div>
                  <span className="mono-text" style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ea580c' }}>
                    {step.num}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Mandatory Procurement Modes under GFR 2017 Rule 149 */}
        <div style={{ marginBottom: '4.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-tag" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' }}>GFR 2017 COMPLIANCE</span>
            <h2 className="serif-heading" style={{ fontSize: '2rem', color: '#0f172a', fontWeight: '800', margin: '0.25rem 0' }}>
              {t('procurementModesTitle')}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {procurementModes.map((mode, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
                }}
              >
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      backgroundColor: `${mode.badgeColor}15`,
                      color: mode.badgeColor,
                      border: `1px solid ${mode.badgeColor}33`,
                      marginBottom: '0.75rem'
                    }}
                  >
                    {mode.limit}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.6rem' }}>
                    {mode.title}
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55 }}>
                    {mode.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Key Government Policies Enforced on GeM */}
        <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2.5rem', display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2.5rem', alignItems: 'center', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)' }}>
          <div>
            <span className="section-tag" style={{ backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>POLICY FRAMEWORK</span>
            <h2 className="serif-heading" style={{ fontSize: '1.85rem', color: '#0f172a', fontWeight: '800', margin: '0.35rem 0 1rem 0' }}>
              Mandatory Policies & Regulatory Framework
            </h2>
            <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
              GeM operates strictly in accordance with statutory guidelines issued by the Ministry of Finance, Ministry of MSME, and DPIIT to ensure fair competition and priority for domestic manufacturers.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.92rem' }}>Public Procurement Order (Make in India - MII)</strong>
                <span style={{ fontSize: '0.82rem', color: '#475569' }}>Preference to Class-I Local Suppliers (≥ 50% local content) and Class-II (20-50%).</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.92rem' }}>Public Procurement Policy for MSEs</strong>
                <span style={{ fontSize: '0.82rem', color: '#475569' }}>Mandatory 25% annual procurement quota from Micro and Small Enterprises, with 4% for SC/ST and 3% for Women entrepreneurs.</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.92rem' }}>General Financial Rules (GFR 2017) Rule 149</strong>
                <span style={{ fontSize: '0.82rem', color: '#475569' }}>Statutory mandate for all Government Buyers to procure goods and services available on GeM.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
