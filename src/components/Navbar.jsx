import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Building2, Landmark, PlusCircle, UploadCloud, CheckCircle2, ShieldCheck, ChevronDown, Lock, LogOut, LogIn, Home, Sparkles } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentRole = 'buyer',
  setCurrentRole,
  currentUser = null,
  onLogout,
  onOpenAuth,
  onOpenBidVerifier,
  onOpenCreateBid,
  searchQuery,
  setSearchQuery
}) {
  const { t, lang } = useLanguage();

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null); // 'buyer', 'bidder', 'login', 'signup', 'user'
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

  const isBuyerAuthenticated = currentUser && currentUser.role === 'buyer';
  const isBidderAuthenticated = currentUser && currentUser.role === 'bidder';

  return (
    <header className="gem-navbar" ref={navRef}>
      {/* Brand Group */}
      <div className="gem-brand-group" onClick={() => setActiveTab('Forward')} style={{ cursor: 'pointer' }}>
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setActiveTab('Tenders');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        />
      </div>

      {/* Navigation Tabs with Dropdowns */}
      <nav className="nav-menu-links">
        {/* Dedicated Primary Homepage Tab for ALL Users */}
        <button
          className={`nav-tab-btn ${activeTab === 'Forward' ? 'active' : ''}`}
          onClick={() => {
            setOpenDropdown(null);
            setActiveTab('Forward');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: activeTab === 'Forward' ? '#38bdf8' : 'inherit',
            fontWeight: activeTab === 'Forward' ? '800' : '600'
          }}
          title="Return to GeM Homepage"
        >
          <Home size={15} />
          <span>{lang === 'hi' ? 'मुख्य पृष्ठ' : (lang === 'mr' ? 'मुख्य पृष्ठ' : 'Homepage')}</span>
        </button>
        {/* 1. Forward Auction Dropdown */}
        <div className="nav-dropdown-container">
          <button
            className={`nav-tab-btn ${activeTab === 'Forward' ? 'active' : ''}`}
            onClick={(e) => toggleDropdown('forward', e)}
          >
            <span>{t('tabForward')}</span>
            <span className={`nav-caret ${openDropdown === 'forward' ? 'open' : ''}`}>▼</span>
          </button>

          {openDropdown === 'forward' && (
            <div className="gem-dropdown-menu">
              <button
                className="gem-dropdown-item"
                onClick={() => handleDropdownSelect('Auctions')}
              >
                {t('ongoingAuctions')}
              </button>
              <button
                className="gem-dropdown-item"
                onClick={() => {
                  setOpenDropdown(null);
                  if (onOpenAuth) onOpenAuth('signup', 'buyer');
                }}
              >
                🏛️ Buyer Registration
              </button>
              <button
                className="gem-dropdown-item"
                onClick={() => {
                  setOpenDropdown(null);
                  if (onOpenAuth) onOpenAuth('signup', 'bidder');
                }}
              >
                🏢 Bidder Registration
              </button>
            </div>
          )}
        </div>

        {/* 2. Authenticated Dashboard Portal Navigation (Strict Single-Role) */}
        {currentUser && (
          currentUser.role === 'buyer' ? (
            <div className="nav-dropdown-container">
              <button
                className={`nav-tab-btn ${activeTab === 'Buyer' ? 'active' : ''}`}
                onClick={(e) => toggleDropdown('buyer', e)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: activeTab === 'Buyer' ? '#38bdf8' : 'inherit' }}
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
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: activeTab === 'Bidder' || activeTab === 'Bid' ? '#34d399' : 'inherit' }}
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
          )
        )}

        {/* 3. Tenders Tab */}
        <button
          className={`nav-tab-btn ${activeTab === 'Tenders' ? 'active' : ''}`}
          onClick={() => {
            setOpenDropdown(null);
            setActiveTab('Tenders');
          }}
        >
          {t('tabTenders') || 'Tenders'}
        </button>

        {/* 4. Contracts Tab */}
        <button
          className={`nav-tab-btn ${activeTab === 'Contracts' ? 'active' : ''}`}
          onClick={() => {
            setOpenDropdown(null);
            setActiveTab('Contracts');
          }}
        >
          {t('tabContracts') || 'Contracts'}
        </button>

        {/* 5. Compliance Passport Tab */}
        <button
          className={`nav-tab-btn ${activeTab === 'Passport' ? 'active' : ''}`}
          onClick={() => {
            setOpenDropdown(null);
            setActiveTab('Passport');
          }}
        >
          <ShieldCheck size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          {t('tabPassport') || 'Passport'}
        </button>

        {/* 6. Auction Tab */}
        <button
          className={`nav-tab-btn ${activeTab === 'Auctions' || activeTab === 'Auction' ? 'active' : ''}`}
          onClick={() => {
            setOpenDropdown(null);
            setActiveTab('Auctions');
          }}
        >
          {t('tabAuction')}
        </button>

        {/* 6. About & Contact Tabs */}
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

        {/* Authenticated User Profile OR Login/Signup Buttons */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* User Profile Pill */}
            <div
              onClick={(e) => toggleDropdown('user', e)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: currentUser.role === 'buyer' ? 'rgba(2, 132, 199, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: currentUser.role === 'buyer' ? '1px solid rgba(2, 132, 199, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title={`Logged in as ${currentUser.fullName} (${currentUser.role === 'buyer' ? 'Government Buyer' : 'Vendor Bidder'})`}
            >
              <span style={{ fontSize: '0.9rem' }}>{currentUser.role === 'buyer' ? '🏛️' : '🏢'}</span>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, textAlign: 'left' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: currentUser.role === 'buyer' ? '#38bdf8' : '#34d399', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.fullName || (currentUser.role === 'buyer' ? 'Buyer Officer' : 'Vendor Bidder')}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                  {currentUser.role === 'buyer' ? 'Buyer (Govt)' : 'Bidder (Seller)'}
                </span>
              </div>
              <ChevronDown size={14} style={{ color: '#94a3b8' }} />
            </div>

            {/* User Dropdown */}
            {openDropdown === 'user' && (
              <div className="gem-dropdown-menu right-aligned" style={{ minWidth: '220px', top: '50px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b' }}>
                  <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.84rem', fontWeight: '700', marginBottom: '2px' }}>{currentUser.fullName}</strong>
                  <span>{currentUser.organization || currentUser.email}</span>
                </div>
                <button
                  className="gem-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    setActiveTab(currentUser.role === 'buyer' ? 'Buyer' : 'Bidder');
                  }}
                >
                  🚀 Go to {currentUser.role === 'buyer' ? 'Buyer Portal' : 'Bidder Portal'}
                </button>
                <button
                  className="gem-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onLogout) onLogout();
                  }}
                  style={{ color: '#dc2626', fontWeight: '700', borderTop: '1px solid #e2e8f0' }}
                >
                  🚪 Log Out
                </button>
              </div>
            )}

            {/* Direct Logout Button */}
            <button
              onClick={onLogout}
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease'
              }}
              title="Log out of session"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <button
            className="btn-sign-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 1.15rem',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => onOpenAuth('signin')}
            title="Log in to Buyer or Seller Dashboard"
          >
            <LogIn size={15} />
            <span>Login / Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
