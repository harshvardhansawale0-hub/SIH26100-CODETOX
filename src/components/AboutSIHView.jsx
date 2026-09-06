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
  Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AboutSIHView() {
  const { t } = useLanguage();

  const pillars = [
    {
      icon: <Users size={28} color="#0284c7" />,
      title: t('pillarInclusiveness'),
      desc: t('pillarInclusivenessDesc')
    },
    {
      icon: <ShieldCheck size={28} color="#10b981" />,
      title: t('pillarTransparency'),
      desc: t('pillarTransparencyDesc')
    },
    {
      icon: <Zap size={28} color="#f59e0b" />,
      title: t('pillarEfficiency'),
      desc: t('pillarEfficiencyDesc')
    },
    {
      icon: <TrendingUp size={28} color="#8b5cf6" />,
      title: t('pillarCostSavings'),
      desc: t('pillarCostSavingsDesc')
    }
  ];

  const lifecycleSteps = [
    {
      num: "01",
      icon: <Building2 size={24} color="#f5a623" />,
      title: t('stepA1Title'),
      desc: t('stepA1Desc')
    },
    {
      num: "02",
      icon: <Layers size={24} color="#f5a623" />,
      title: t('stepA2Title'),
      desc: t('stepA2Desc')
    },
    {
      num: "03",
      icon: <Scale size={24} color="#f5a623" />,
      title: t('stepA3Title'),
      desc: t('stepA3Desc')
    },
    {
      num: "04",
      icon: <Zap size={24} color="#f5a623" />,
      title: t('stepA4Title'),
      desc: t('stepA4Desc')
    },
    {
      num: "05",
      icon: <FileText size={24} color="#f5a623" />,
      title: t('stepA5Title'),
      desc: t('stepA5Desc')
    },
    {
      num: "06",
      icon: <CreditCard size={24} color="#f5a623" />,
      title: t('stepA6Title'),
      desc: t('stepA6Desc')
    }
  ];

  const procurementModes = [
    {
      title: t('modeDirect'),
      limit: t('modeDirectLimit'),
      desc: t('modeDirectDesc'),
      badgeColor: "#3b82f6"
    },
    {
      title: t('modeL1'),
      limit: t('modeL1Limit'),
      desc: t('modeL1Desc'),
      badgeColor: "#10b981"
    },
    {
      title: t('modeBidding'),
      limit: t('modeBiddingLimit'),
      desc: t('modeBiddingDesc'),
      badgeColor: "#f59e0b"
    },
    {
      title: t('modeRA'),
      limit: t('modeRALimit'),
      desc: t('modeRADesc'),
      badgeColor: "#8b5cf6"
    }
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '80vh', padding: '4rem 1.5rem', color: '#0f172a' }}>
      <div className="container-custom">
        {/* 1. Header Section */}
        <div style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto 3.5rem auto' }}>
          <span className="section-tag">{t('aboutGemTag')}</span>
          <h1 className="serif-heading" style={{ fontSize: '2.6rem', color: '#0b1a2d', marginBottom: '1rem' }}>
            {t('aboutGemTitle')}
          </h1>
          <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.65 }}>
            {t('aboutGemSubtitle')}
          </p>
        </div>

        {/* 2. GeM Operating Pillars (4 Grid Cards) */}
        <div style={{ marginBottom: '4.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 className="serif-heading" style={{ fontSize: '1.85rem', color: '#0b1a2d' }}>
              {t('gemPillarsTitle')}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.75rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(11, 26, 45, 0.07)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)' }}>
                  {pillar.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0b1a2d', margin: 0 }}>
                  {pillar.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. End-to-End Procurement Lifecycle (6 Steps) */}
        <div style={{ backgroundColor: '#0b1a2d', color: '#ffffff', borderRadius: '16px', padding: '3rem 2.5rem', marginBottom: '4.5rem', boxShadow: '0 20px 40px rgba(11, 26, 45, 0.2)' }}>
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem auto' }}>
            <span className="section-tag" style={{ color: '#f5a623' }}>WORKFLOW</span>
            <h2 className="serif-heading" style={{ fontSize: '2.1rem', color: '#ffffff', margin: '0.35rem 0' }}>
              {t('gemLifecycleTitle')}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              From initial vendor registration to delivery verification and automated 10-day payment disbursal.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.75rem' }}>
            {lifecycleSteps.map((step) => (
              <div
                key={step.num}
                style={{
                  backgroundColor: '#0f2238',
                  border: '1px solid #1e385b',
                  borderRadius: '12px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#081729', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {step.icon}
                  </div>
                  <span className="mono-text" style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f5a623' }}>
                    {step.num}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.55, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Mandatory Procurement Modes under GFR 2017 Rule 149 */}
        <div style={{ marginBottom: '4.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-tag">GFR 2017 COMPLIANCE</span>
            <h2 className="serif-heading" style={{ fontSize: '2rem', color: '#0b1a2d', margin: '0.25rem 0' }}>
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
                  borderRadius: '12px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      backgroundColor: `${mode.badgeColor}15`,
                      color: mode.badgeColor,
                      marginBottom: '0.75rem'
                    }}
                  >
                    {mode.limit}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0b1a2d', marginBottom: '0.6rem' }}>
                    {mode.title}
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.55 }}>
                    {mode.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Key Government Policies Enforced on GeM */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2.5rem', display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2.5rem', alignItems: 'center' }}>
          <div>
            <span className="section-tag">POLICY FRAMEWORK</span>
            <h2 className="serif-heading" style={{ fontSize: '1.85rem', color: '#0b1a2d', margin: '0.35rem 0 1rem 0' }}>
              Mandatory Policies & Regulatory Framework
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
              GeM operates strictly in accordance with statutory guidelines issued by the Ministry of Finance, Ministry of MSME, and DPIIT to ensure fair competition and priority for domestic manufacturers.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: '#0b1a2d', fontSize: '0.92rem' }}>Public Procurement Order (Make in India - MII)</strong>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Preference to Class-I Local Suppliers (≥ 50% local content) and Class-II (20-50%).</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: '#0b1a2d', fontSize: '0.92rem' }}>Public Procurement Policy for MSEs</strong>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Mandatory 25% annual procurement quota from Micro and Small Enterprises, with 4% for SC/ST and 3% for Women entrepreneurs.</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: '#0b1a2d', fontSize: '0.92rem' }}>General Financial Rules (GFR 2017) Rule 149</strong>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Statutory mandate for all Government Buyers to procure goods and services available on GeM.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
