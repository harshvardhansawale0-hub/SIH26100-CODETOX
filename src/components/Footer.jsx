import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer({ 
  onNavigate, 
  onOpenHelp,
  onNavigateInitiative,
  onOpenInitiativeModal,
  onOpenVerifier
}) {
  const { t } = useLanguage();

  return (
    <>
      <footer className="gem-footer">
        <div className="footer-top-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <span className="footer-gem-badge">GeM</span>
              <span className="footer-brand-title">{t('brandTitle')}</span>
            </div>
            <p className="footer-desc">
              {t('footerDesc')}
            </p>
          </div>

          {/* Platform Col */}
          <div>
            <h4 className="footer-col-heading">{t('platform')}</h4>
            <ul className="footer-links-list">
              <li><span className="footer-link" onClick={() => onOpenVerifier ? onOpenVerifier() : onNavigate('Bid')}>{t('bidVerification')}</span></li>
              <li><span className="footer-link" onClick={() => onNavigate('Auction')}>{t('vendorScreen')}</span></li>
              <li><span className="footer-link" onClick={() => onNavigate('Auction')}>{t('auditLogs')}</span></li>
              <li><span className="footer-link" onClick={() => onNavigate('Forward')}>{t('analytics')}</span></li>
            </ul>
          </div>

          {/* Policy Col */}
          <div>
            <h4 className="footer-col-heading">{t('policy')}</h4>
            <ul className="footer-links-list">
              <li><span className="footer-link" onClick={() => onOpenInitiativeModal ? onOpenInitiativeModal('gfr') : onNavigate('About')}>{t('gfr2017')}</span></li>
              <li><span className="footer-link" onClick={() => onNavigateInitiative ? onNavigateInitiative('mii') : onNavigate('About')}>{t('makeInIndia')}</span></li>
              <li><span className="footer-link" onClick={() => onNavigateInitiative ? onNavigateInitiative('mse') : onNavigate('About')}>{t('msePolicy')}</span></li>
              <li><span className="footer-link" onClick={() => onNavigateInitiative ? onNavigateInitiative('startup') : onNavigate('About')}>{t('dpiitGuidelines')}</span></li>
            </ul>
          </div>

          {/* Support Col */}
          <div>
            <h4 className="footer-col-heading">{t('support')}</h4>
            <ul className="footer-links-list">
              <li><span className="footer-link" onClick={() => onNavigate('About')}>{t('documentation')}</span></li>
              <li><span className="footer-link" onClick={() => onNavigate('About')}>{t('apiReference')}</span></li>
              <li><span className="footer-link" onClick={() => onNavigate('Contact')}>{t('contactUs')}</span></li>
              <li><span className="footer-link" onClick={() => onNavigate('Contact')}>{t('grievance')}</span></li>
            </ul>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom-row">
          <div>
            {t('copyright')}
          </div>
          <div className="footer-legal-links">
            <span className="footer-legal-link" onClick={() => onNavigate('About')}>{t('privacy')}</span>
            <span className="footer-legal-link" onClick={() => onNavigate('About')}>{t('terms')}</span>
            <span className="footer-legal-link" onClick={() => onNavigate('About')}>{t('rti')}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
