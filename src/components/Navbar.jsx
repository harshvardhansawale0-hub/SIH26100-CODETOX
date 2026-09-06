import React, { useState, useRef, useEffect } from 'react';
import { Search, User } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth, onOpenBidVerifier, searchQuery, setSearchQuery }) {
  const { t } = useLanguage();

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null); // 'forward', 'bids', 'login', 'signup'
  const navRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name, e) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleDropdownSelect = (tab, action) => {
    setOpenDropdown(null);
    if (tab) setActiveTab(tab);
    if (action) action();
  };

  return (
    <header className="gem-navbar" ref={navRef}>
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

      {/* Navigation Tabs with Dropdowns */}
      <nav className="nav-menu-links">
        {/* 1. Forward Auction Dropdown */}
        <div className="nav-dropdown-container">
          <button
            className={`nav-tab-btn ${activeTab === 'Forward' || activeTab === 'Auction' ? 'active' : ''}`}
            onClick={(e) => toggleDropdown('forward', e)}
          >
            <span>{t('tabForward')}</span>
            <span className={`nav-caret ${openDropdown === 'forward' ? 'open' : ''}`}>▼</span>
          </button>

          {openDropdown === 'forward' && (
            <div className="gem-dropdown-menu">
              <button
                className="gem-dropdown-item"
                onClick={() => handleDropdownSelect('Auction')}
              >
                {t('ongoingAuctions')}
              </button>
              <button
                className="gem-dropdown-item"
                onClick={() => handleDropdownSelect(null, () => onOpenAuth('signup'))}
              >
                {t('faBuyerReg')}
              </button>
              <button
                className="gem-dropdown-item"
                onClick={() => handleDropdownSelect(null, () => onOpenAuth('signin'))}
              >
                {t('faBuyerLogin')}
              </button>
            </div>
          )}
        </div>

        {/* 2. Bids Dropdown */}
        <div className="nav-dropdown-container">
          <button
            className={`nav-tab-btn ${activeTab === 'Bid' ? 'active' : ''}`}
            onClick={(e) => toggleDropdown('bids', e)}
          >
            <span>{t('tabBid')}</span>
            <span className={`nav-caret ${openDropdown === 'bids' ? 'open' : ''}`}>▼</span>
          </button>

          {openDropdown === 'bids' && (
            <div className="gem-dropdown-menu">
              <button
                className="gem-dropdown-item"
                onClick={() => handleDropdownSelect('Bid')}
              >
                {t('listOfBids')}
              </button>
              <button
                className="gem-dropdown-item"
                onClick={() => {
                  setSearchQuery('Railways');
                  handleDropdownSelect('Bid');
                }}
              >
                {t('railwaysBids')}
              </button>
              <button
                className="gem-dropdown-item"
                onClick={() => handleDropdownSelect(null, onOpenBidVerifier)}
              >
                {t('pbpNotices')}
              </button>
            </div>
          )}
        </div>

        {/* Regular About & Contact Tabs */}
        <button
          className={`nav-tab-btn ${activeTab === 'About' ? 'active' : ''}`}
          onClick={() => {
            setOpenDropdown(null);
            setActiveTab('About');
          }}
        >
          {t('tabAbout')}
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'Contact' ? 'active' : ''}`}
          onClick={() => {
            setOpenDropdown(null);
            setActiveTab('Contact');
          }}
        >
          {t('tabContact')}
        </button>
      </nav>

      {/* Language Switcher & Auth Actions with Dropdowns */}
      <div className="nav-actions-group">
        {/* Multi-language Selector (English / हिंदी / मराठी) */}
        <LanguageSelector />

        {/* 3. Login Dropdown */}
        <div className="nav-dropdown-container">
          <button
            className="btn-sign-in"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            onClick={(e) => toggleDropdown('login', e)}
          >
            <span>{t('signIn')}</span>
            <span className={`nav-caret ${openDropdown === 'login' ? 'open' : ''}`}>▼</span>
          </button>

          {openDropdown === 'login' && (
            <div className="gem-dropdown-menu right-aligned">
              <button
                className="gem-dropdown-item"
                onClick={() => handleDropdownSelect(null, () => onOpenAuth('signin'))}
              >
                {t('loginGem')}
              </button>
              <button
                className="gem-dropdown-item"
                onClick={() => handleDropdownSelect(null, () => onOpenAuth('signin'))}
              >
                {t('loginGraVa')}
              </button>
            </div>
          )}
        </div>

        {/* 4. Sign Up Dropdown */}
        <div className="nav-dropdown-container">
          <button
            className="btn-sign-up"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            onClick={(e) => toggleDropdown('signup', e)}
          >
            <span>{t('signUp')}</span>
            <span className={`nav-caret ${openDropdown === 'signup' ? 'open' : ''}`} style={{ color: '#ffffff' }}>▼</span>
          </button>

          {openDropdown === 'signup' && (
            <div className="gem-dropdown-menu right-aligned" style={{ minWidth: '220px' }}>
              <button
                className="gem-dropdown-item"
                onClick={() => handleDropdownSelect(null, () => onOpenAuth('signup'))}
              >
                {t('buyerOrg')}
              </button>
              <button
                className="gem-dropdown-item"
                onClick={() => handleDropdownSelect(null, () => onOpenAuth('signup'))}
              >
                {t('sellerServiceProvider')}
              </button>
              <button
                className="gem-dropdown-item"
                onClick={() => handleDropdownSelect(null, () => onOpenAuth('signup'))}
              >
                {t('signupGraVa')}
              </button>
            </div>
          )}
        </div>

        <button className="btn-user-avatar" title={t('profileTitle')} onClick={() => onOpenAuth('signin')}>
          <User size={18} />
        </button>
      </div>
    </header>
  );
}
