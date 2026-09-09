import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Building2, Landmark, PlusCircle, UploadCloud, CheckCircle2, ShieldCheck, ChevronDown } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentRole = 'buyer',
  setCurrentRole,
  onOpenAuth,
  onOpenBidVerifier,
  onOpenCreateBid,
  searchQuery,
  setSearchQuery
}) {
  const { t, lang } = useLanguage();

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null); // 'buyer', 'bidder', 'forward', 'login', 'signup'
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

  const handleSwitchRole = (role) => {
    if (setCurrentRole) {
      setCurrentRole(role);
      setActiveTab(role === 'buyer' ? 'Buyer' : 'Bidder');
    }
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

      {/* Role Switcher Pill in Header: ONLY TWO ROLES */}
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#071526', border: '1px solid #1e385b', borderRadius: '30px', padding: '3px', gap: '3px' }}>
        <button
          type="button"
          onClick={() => handleSwitchRole('buyer')}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: '800',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: currentRole === 'buyer' ? '#0284c7' : 'transparent',
            color: currentRole === 'buyer' ? '#ffffff' : '#94a3b8',
            transition: 'all 0.2s ease',
            boxShadow: currentRole === 'buyer' ? '0 2px 8px rgba(2, 132, 199, 0.4)' : 'none'
          }}
          title="Switch to Government / Procuring Authority Role"
        >
          <span>🏛️</span>
          <span>Buyer (Govt)</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitchRole('bidder')}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: '800',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: currentRole === 'bidder' ? '#10b981' : 'transparent',
            color: currentRole === 'bidder' ? '#ffffff' : '#94a3b8',
            transition: 'all 0.2s ease',
            boxShadow: currentRole === 'bidder' ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none'
          }}
          title="Switch to Vendor / Company Role"
        >
          <span>🏢</span>
          <span>Bidder (Vendor)</span>
        </button>
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

      {/* Navigation Tabs with Role-Specific Portals */}
      <nav className="nav-menu-links">
        {/* 1. Home / Forward Auction */}
        <button
          className={`nav-tab-btn ${activeTab === 'Forward' ? 'active' : ''}`}
          onClick={() => {
            setOpenDropdown(null);
            setActiveTab('Forward');
          }}
        >
          {t('tabForward')}
        </button>

        {/* 2. Role-Adaptive Portal Tab (Buyer Portal vs Bidder Portal) */}
        {currentRole === 'buyer' ? (
          <div className="nav-dropdown-container">
            <button
              className={`nav-tab-btn ${activeTab === 'Buyer' ? 'active' : ''}`}
              onClick={(e) => toggleDropdown('buyer', e)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: activeTab === 'Buyer' ? '#38bdf8' : 'inherit' }}
            >
              <span>🏛️ Buyer Portal</span>
              <span className={`nav-caret ${openDropdown === 'buyer' ? 'open' : ''}`}>▼</span>
            </button>

            {openDropdown === 'buyer' && (
              <div className="gem-dropdown-menu" style={{ minWidth: '220px' }}>
                <button
                  className="gem-dropdown-item"
                  onClick={() => handleDropdownSelect('Buyer')}
                >
                  📋 Published Bids Catalog
                </button>
                <button
                  className="gem-dropdown-item"
                  onClick={() => handleDropdownSelect('Buyer')}
                >
                  🤖 Review AI Compliance Reports
                </button>
                <button
                  className="gem-dropdown-item"
                  onClick={() => handleDropdownSelect('Buyer', onOpenCreateBid)}
                  style={{ color: '#0284c7', fontWeight: '700' }}
                >
                  ➕ Create New Bid & Criteria
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="nav-dropdown-container">
            <button
              className={`nav-tab-btn ${activeTab === 'Bidder' || activeTab === 'Bid' ? 'active' : ''}`}
              onClick={(e) => toggleDropdown('bidder', e)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: activeTab === 'Bidder' || activeTab === 'Bid' ? '#34d399' : 'inherit' }}
            >
              <span>🏢 Bidder Portal</span>
              <span className={`nav-caret ${openDropdown === 'bidder' ? 'open' : ''}`}>▼</span>
            </button>

            {openDropdown === 'bidder' && (
              <div className="gem-dropdown-menu" style={{ minWidth: '220px' }}>
                <button
                  className="gem-dropdown-item"
                  onClick={() => handleDropdownSelect('Bidder')}
                >
                  📄 Browse Available Bids
                </button>
                <button
                  className="gem-dropdown-item"
                  onClick={() => handleDropdownSelect('Bidder', onOpenBidVerifier)}
                  style={{ color: '#10b981', fontWeight: '700' }}
                >
                  ⚡ Apply & Upload Documents (OCR)
                </button>
                <button
                  className="gem-dropdown-item"
                  onClick={() => handleDropdownSelect('Bidder')}
                >
                  ✓ My Submitted Applications
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. Auction Intelligence Analysis */}
        <button
          className={`nav-tab-btn ${activeTab === 'Auction' ? 'active' : ''}`}
          onClick={() => {
            setOpenDropdown(null);
            setActiveTab('Auction');
          }}
        >
          {t('tabAuction')}
        </button>

        {/* 4. About & Contact */}
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

      {/* Language Switcher & Auth Actions */}
      <div className="nav-actions-group">
        {/* Multi-language Selector (English / हिंदी / मराठी) */}
        <LanguageSelector />

        {/* Login Dropdown (Strictly Buyer & Bidder) */}
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
            <div className="gem-dropdown-menu right-aligned" style={{ minWidth: '220px' }}>
              <button
                className="gem-dropdown-item"
                onClick={() => {
                  handleSwitchRole('buyer');
                  handleDropdownSelect('Buyer', () => onOpenAuth('signin', 'buyer'));
                }}
              >
                🏛️ Login as Buyer (Govt)
              </button>
              <button
                className="gem-dropdown-item"
                onClick={() => {
                  handleSwitchRole('bidder');
                  handleDropdownSelect('Bidder', () => onOpenAuth('signin', 'bidder'));
                }}
              >
                🏢 Login as Bidder (Vendor)
              </button>
            </div>
          )}
        </div>

        {/* Sign Up Dropdown (Strictly Buyer & Bidder) */}
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
                onClick={() => {
                  handleSwitchRole('buyer');
                  handleDropdownSelect('Buyer', () => onOpenAuth('signup', 'buyer'));
                }}
              >
                🏛️ Register as Buyer Org
              </button>
              <button
                className="gem-dropdown-item"
                onClick={() => {
                  handleSwitchRole('bidder');
                  handleDropdownSelect('Bidder', () => onOpenAuth('signup', 'bidder'));
                }}
              >
                🏢 Register as Bidder Vendor
              </button>
            </div>
          )}
        </div>

        <button
          className="btn-user-avatar"
          title={`Active Role: ${currentRole === 'buyer' ? 'Government Buyer' : 'Vendor Bidder'}`}
          onClick={() => onOpenAuth('signin', currentRole)}
          style={{
            border: currentRole === 'buyer' ? '2px solid #0284c7' : '2px solid #10b981'
          }}
        >
          <User size={18} />
        </button>
      </div>
    </header>
  );
}
