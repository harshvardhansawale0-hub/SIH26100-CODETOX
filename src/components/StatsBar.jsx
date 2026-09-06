import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function StatsBar() {
  const { t } = useLanguage();

  return (
    <section className="top-stats-bar">
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-number">{t('gmvValue')}</div>
          <div className="stat-label">{t('gmvLabel')}</div>
          <div className="stat-sublabel">{t('gmvSubtitle')}</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">{t('accuracyValue')}</div>
          <div className="stat-label">{t('accuracyLabel')}</div>
          <div className="stat-sublabel">{t('accuracySubtitle')}</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">{t('vendorsValue')}</div>
          <div className="stat-label">{t('vendorsLabel')}</div>
          <div className="stat-sublabel">{t('vendorsSubtitle')}</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">{t('turnaroundValue')}</div>
          <div className="stat-label">{t('turnaroundLabel')}</div>
          <div className="stat-sublabel">{t('turnaroundSubtitle')}</div>
        </div>
      </div>
    </section>
  );
}
