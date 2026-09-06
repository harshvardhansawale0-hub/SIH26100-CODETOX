import React from 'react';
import { Layers, Users, Cpu, ShieldCheck, Award, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AboutSIHView() {
  const { t } = useLanguage();

  const teamMembers = [
    { name: "Harshvardhan Sawale", role: "AI / Backend Architect" },
    { name: "Devika Patil", role: "Frontend Lead & UI/UX" },
    { name: "Aniket Sawarkar", role: "OCR & Document NLP" },
    { name: "Krushnaprakash Bhende", role: "Rule Engine & Compliance" },
    { name: "Sumit Deshmukh", role: "Database & Cloud Architecture" },
    { name: "Namrata Pawar", role: "Security & Testing" }
  ];

  const techStack = [
    { layer: "Frontend", tech: "React.js, HTML5, CSS, JavaScript", desc: "Responsive, high-performance UI matching government design standards." },
    { layer: "Backend", tech: "Python, FastAPI", desc: "Ultra-fast asynchronous REST APIs for bid processing and OCR orchestration." },
    { layer: "Database", tech: "SQL / MySQL", desc: "Structured relational store for tenders, bids, vendor registries, and audit logs." },
    { layer: "AI / ML", tech: "OCR (Tesseract / EasyOCR), NLP/LLM, Pandas, OpenCV", desc: "Multi-language document OCR, entity extraction, forensic fraud detection, rule evaluation." },
    { layer: "Integration", tech: "REST APIs", desc: "Seamless interoperability with GeM 4.0 portal, GSTN, MCA21, and UDYAM portals." },
    { layer: "Deployment", tech: "AWS / Azure (Cloud)", desc: "Cloud-native auto-scaling architecture; standard computer with browser is all client needs." },
    { layer: "Code Quality & Security", tech: "Git / GitHub", desc: "Version control, automated CI/CD pipelines, static security scanning." }
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '80vh', padding: '4rem 1.5rem', color: '#0f172a' }}>
      <div className="container-custom">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 3.5rem auto' }}>
          <span className="section-tag">{t('sihTag')}</span>
          <h1 className="serif-heading" style={{ fontSize: '2.6rem', color: '#0b1a2d', marginBottom: '1rem' }}>
            {t('sihTitle')}
          </h1>
          <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.6 }}>
            {t('sihSubtitle')}
          </p>
        </div>

        {/* SIH Meta Card */}
        <div style={{ backgroundColor: '#0b1a2d', color: '#ffffff', borderRadius: '12px', padding: '2rem', marginBottom: '3.5rem', boxShadow: '0 10px 25px rgba(11, 26, 45, 0.15)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', textAlign: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('psId')}</span>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f5a623', marginTop: '0.25rem' }}>SIH26100</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('theme')}</span>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', marginTop: '0.25rem' }}>Smart Automation</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('psCategory')}</span>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', marginTop: '0.25rem' }}>Software</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('teamName')}</span>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#38bdf8', marginTop: '0.25rem' }}>Codetox</div>
            </div>
          </div>
        </div>

        {/* Technical Approach Table */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Layers size={24} color="#0f2847" />
            <h2 className="serif-heading" style={{ fontSize: '1.8rem', color: '#0b1a2d', margin: 0 }}>
              {t('techApproachTitle')}
            </h2>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0b1a2d', color: '#ffffff' }}>
                  <th style={{ padding: '1rem 1.5rem', width: '22%' }}>{t('layer')}</th>
                  <th style={{ padding: '1rem 1.5rem', width: '38%' }}>{t('technologies')}</th>
                  <th style={{ padding: '1rem 1.5rem', width: '40%' }}>{t('architecturalRole')}</th>
                </tr>
              </thead>
              <tbody>
                {techStack.map((row, idx) => (
                  <tr
                    key={row.layer}
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      borderBottom: '1px solid #e2e8f0'
                    }}
                  >
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '800', color: '#0b1a2d' }}>{row.layer}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '700', color: '#0284c7' }}>{row.tech}</td>
                    <td style={{ padding: '1rem 1.5rem', color: '#475569' }}>{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Members Grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Users size={24} color="#0f2847" />
            <h2 className="serif-heading" style={{ fontSize: '1.8rem', color: '#0b1a2d', margin: 0 }}>
              {t('teamMembersTitle')}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {teamMembers.map((member) => (
              <div
                key={member.name}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#0b1a2d', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem' }}>
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0b1a2d' }}>{member.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
