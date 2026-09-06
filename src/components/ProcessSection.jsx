import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function ProcessSection({ onStepClick }) {
  const { t } = useLanguage();

  const steps = [
    {
      num: t('step1Num'),
      title: t('step1Title'),
      desc: t('step1Desc')
    },
    {
      num: t('step2Num'),
      title: t('step2Title'),
      desc: t('step2Desc')
    },
    {
      num: t('step3Num'),
      title: t('step3Title'),
      desc: t('step3Desc')
    },
    {
      num: t('step4Num'),
      title: t('step4Title'),
      desc: t('step4Desc')
    }
  ];

  return (
    <section className="process-section">
      <div className="container-custom">
        <span className="section-tag">{t('processTag')}</span>
        <h2 className="section-title serif-heading">{t('processTitle')}</h2>

        <div className="process-pipeline">
          {/* Golden connecting line */}
          <div className="process-line"></div>

          <div className="process-steps-grid">
            {steps.map((step) => (
              <div 
                key={step.num} 
                className="process-step-col"
                onClick={() => onStepClick && onStepClick(step.num)}
                style={{ cursor: 'pointer' }}
              >
                <div className="step-circle">{step.num}</div>
                <h3 className="step-name">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
