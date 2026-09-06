import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function CtaBanner({ onGetStarted, onViewDocs }) {
  const { t } = useLanguage();

  return (
    <section className="cta-banner-section">
      <div className="container-custom">
        <h2 className="cta-heading serif-heading">{t('ctaHeading')}</h2>
        <p className="cta-subheading">
          {t('ctaSubheading')}
        </p>

        <div className="cta-buttons-group">
          <button className="btn-cta-primary" onClick={onGetStarted}>
            {t('getStartedFree')}
          </button>
          <button className="btn-cta-secondary" onClick={onViewDocs}>
            {t('viewDocumentation')}
          </button>
        </div>
      </div>
    </section>
  );
}
