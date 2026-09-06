import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function ProcessSection({ onStepClick }) {
  const { t } = useLanguage();

  const steps = [
    {
      num: t('step1Num') || '01',
      icon: t('step1Icon') || '📝',
      title: t('step1Title'),
      desc: t('step1Desc'),
      highlight: 'Tender Upload'
    },
    {
      num: t('step2Num') || '02',
      icon: t('step2Icon') || '📤',
      title: t('step2Title'),
      desc: t('step2Desc'),
      highlight: 'Bid Ingestion'
    },
    {
      num: t('step3Num') || '03',
      icon: t('step3Icon') || '🤖',
      title: t('step3Title'),
      desc: t('step3Desc'),
      highlight: 'AI & OCR Check'
    },
    {
      num: t('step4Num') || '04',
      icon: t('step4Icon') || '⚖️',
      title: t('step4Title'),
      desc: t('step4Desc'),
      highlight: 'L1 & RA Discovery'
    },
    {
      num: t('step5Num') || '05',
      icon: t('step5Icon') || '📄',
      title: t('step5Title'),
      desc: t('step5Desc'),
      highlight: 'Digital Contract'
    },
    {
      num: t('step6Num') || '06',
      icon: t('step6Icon') || '💳',
      title: t('step6Title'),
      desc: t('step6Desc'),
      highlight: 'CRAC & 10-Day Payment'
    }
  ];

  return (
    <section className="process-section">
      <div className="container-custom">
        <div className="process-header-center">
          <span className="section-tag">{t('processTag')}</span>
          <h2 className="section-title serif-heading">{t('processTitle')}</h2>
          <p className="process-subtitle-text">{t('processSubtitle')}</p>
        </div>

        <div className="process-pipeline">
          {/* Continuous connecting flow line across all 6 stages */}
          <div className="process-line-6step"></div>

          <div className="process-steps-grid-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="process-step-col-6"
                onClick={() => onStepClick && onStepClick(step.num)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onStepClick && onStepClick(step.num);
                  }
                }}
              >
                <div className="step-circle-wrapper">
                  <div className="step-circle-6">
                    <span className="step-icon-emoji">{step.icon}</span>
                  </div>
                  <span className="step-number-badge">{step.num}</span>
                </div>

                <div className="step-content-box">
                  <div className="step-badge-tag">{step.highlight}</div>
                  <h3 className="step-name-6">{step.title}</h3>
                  <p className="step-desc-6">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
