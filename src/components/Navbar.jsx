import React from 'react';
import { Search, User } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth, onOpenBidVerifier, searchQuery, setSearchQuery }) {
  const { t } = useLanguage();

  return (
    <header className="gem-navbar">
      {/* Brand Group */}
      <div className="gem-brand-group" onClick={() => setActiveTab('Forward')}>
        <div className="gem-badge-box">GeM</div>
        <div className="gem-brand-text">
          <span className="gem-brand-title">{t('brandTitle')}</span>
          <span className="gem-brand-subtitle">{t('brandSubtitle')}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="nav-search-wrapper">
        <Search className="nav-search-icon" size={15} />
        <input
          type="text"
          className="nav-search-input"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Navigation Tabs */}
      <nav className="nav-menu-links">
        <button
          className={`nav-tab-btn ${activeTab === 'Forward' ? 'active' : ''}`}
          onClick={() => setActiveTab('Forward')}
        >
          {t('tabForward')}
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'Auction' ? 'active' : ''}`}
          onClick={() => setActiveTab('Auction')}
        >
          {t('tabAuction')}
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'Bid' ? 'active' : ''}`}
          onClick={() => setActiveTab('Bid')}
        >
          {t('tabBid')}
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'About' ? 'active' : ''}`}
          onClick={() => setActiveTab('About')}
        >
          {t('tabAbout')}
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'Contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('Contact')}
        >
          {t('tabContact')}
        </button>
      </nav>

      {/* Language Switcher & Auth Actions */}
      <div className="nav-actions-group">
        {/* Multi-language Selector (English / हिंदी / मराठी) */}
        <LanguageSelector />

        <button className="btn-sign-in" onClick={() => onOpenAuth('signin')}>
          {t('signIn')}
        </button>
        <button className="btn-sign-up" onClick={() => onOpenAuth('signup')}>
          {t('signUp')}
        </button>
        <button className="btn-user-avatar" title={t('profileTitle')} onClick={() => onOpenAuth('signin')}>
          <User size={18} />
        </button>
      </div>
    </header>
  );
}
