import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Capabilities({ onCardClick }) {
  const { t } = useLanguage();

  const capabilities = [
    {
      id: "compliance-engine",
      icon: "🤖",
      tag: t('cap1Tag'),
      title: t('cap1Title'),
      description: t('cap1Desc')
    },
    {
      id: "vendor-intelligence",
      icon: "🔍",
      tag: t('cap2Tag'),
      title: t('cap2Title'),
      description: t('cap2Desc')
    },
    {
      id: "regulatory-adherence",
      icon: "⚖️",
      tag: t('cap3Tag'),
      title: t('cap3Title'),
      description: t('cap3Desc')
    },
    {
      id: "bid-analysis",
      icon: "📊",
      tag: t('cap4Tag'),
      title: t('cap4Title'),
      description: t('cap4Desc')
    },
    {
      id: "anti-fraud",
      icon: "🛡️",
      tag: t('cap5Tag'),
      title: t('cap5Title'),
      description: t('cap5Desc')
    },
    {
      id: "audit-trail",
      icon: "📋",
      tag: t('cap6Tag'),
      title: t('cap6Title'),
      description: t('cap6Desc')
    }
  ];

  return (
    <section className="capabilities-section">
      <div className="container-custom">
        <span className="section-tag">{t('capabilitiesTag')}</span>
        <h2 className="section-title serif-heading">{t('capabilitiesTitle')}</h2>
        <p className="section-subtitle">
          {t('capabilitiesSubtitle')}
        </p>

        <div className="capabilities-grid">
          {capabilities.map((item) => (
            <div 
              key={item.id} 
              className="capability-card"
              onClick={() => onCardClick && onCardClick(item.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-top-row">
                <div className="card-icon-wrapper">{item.icon}</div>
                <span className="card-tag-pill">{item.tag}</span>
              </div>
              <h3 className="card-title">{item.title}</h3>
              <p className="card-description">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
