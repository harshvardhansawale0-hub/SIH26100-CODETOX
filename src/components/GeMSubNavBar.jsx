import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function GeMSubNavBar({
  onNavigateTab,
  onOpenVerifier,
  onNotificationClick,
  onCategorySelect
}) {
  const { t } = useLanguage();
  const [openDropdown, setOpenDropdown] = useState(null);
  const subNavRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (subNavRef.current && !subNavRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const categoriesList = [
    { title: 'Products', items: ['Oxygen Gas & Accessories', 'Medical & Healthcare', 'Furniture & Fixtures', 'Computers & IT Hardware', 'SARAS Handicrafts', 'Fire Safety & Security', 'Office Stationery'] },
    { title: 'Services', items: ['Cloud & Hosting Services', 'Vehicle Hiring & Transport', 'Security & Manpower', 'Sanitation & Housekeeping', 'Catering & Canteen'] }
  ];

  return (
    <nav className="gem-subnavbar-bar" ref={subNavRef} aria-label="Secondary Navigation">
      <div className="subnavbar-container">
        {/* Left Side: Navigation Links & Dropdowns */}
        <div className="subnavbar-left">
          {/* 1. Categories Menu */}
          <div className="subnav-item-wrapper">
            <button
              type="button"
              className={`subnav-btn subnav-btn-categories ${openDropdown === 'categories' ? 'active' : ''}`}
              onClick={() => toggleDropdown('categories')}
              aria-expanded={openDropdown === 'categories'}
            >
              <span className="subnav-hamburger">☰</span>
              <span>{t('subnavCategories')}</span>
            </button>

            {openDropdown === 'categories' && (
              <div className="subnav-dropdown-menu subnav-mega-menu">
                <div className="mega-menu-grid">
                  {categoriesList.map((col, idx) => (
                    <div key={idx} className="mega-menu-col">
                      <div className="mega-col-title">{col.title}</div>
                      <ul className="mega-col-list">
                        {col.items.map((item, itemIdx) => (
                          <li
                            key={itemIdx}
                            className="mega-menu-item"
                            onClick={() => {
                              setOpenDropdown(null);
                              if (onCategorySelect) onCategorySelect(item);
                              else if (onNavigateTab) onNavigateTab('Bid');
                            }}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Features & Benefits (Highlighted with red text and border box) */}
          <div className="subnav-item-wrapper">
            <button
              type="button"
              className={`subnav-btn subnav-btn-features ${openDropdown === 'features' ? 'active' : ''}`}
              onClick={() => toggleDropdown('features')}
              aria-expanded={openDropdown === 'features'}
            >
              <span>{t('subnavFeaturesBenefits')}</span>
              <span className="subnav-caret">▾</span>
            </button>

            {openDropdown === 'features' && (
              <div className="subnav-dropdown-menu">
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('About');
                  }}
                >
                  {t('featBuyers')}
                </button>
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('About');
                  }}
                >
                  {t('featSellers')}
                </button>
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('About');
                  }}
                >
                  {t('featEaseOfBusiness')}
                </button>
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('Bid');
                  }}
                >
                  {t('featDirectPurchase')}
                </button>
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('Auction');
                  }}
                >
                  {t('featReverseAuction')}
                </button>
                <button
                  type="button"
                  className="subnav-dropdown-item subnav-highlight-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onOpenVerifier) onOpenVerifier();
                  }}
                >
                  ⚡ {t('featAiVerification')}
                </button>
              </div>
            )}
          </div>

          {/* 3. Business Opportunities */}
          <div className="subnav-item-wrapper">
            <button
              type="button"
              className="subnav-btn"
              onClick={() => {
                setOpenDropdown(null);
                if (onNavigateTab) onNavigateTab('Bid');
              }}
            >
              <span>{t('subnavBusinessOpportunities')}</span>
            </button>
          </div>

          {/* 4. Seller On GeM */}
          <div className="subnav-item-wrapper">
            <button
              type="button"
              className={`subnav-btn ${openDropdown === 'seller' ? 'active' : ''}`}
              onClick={() => toggleDropdown('seller')}
              aria-expanded={openDropdown === 'seller'}
            >
              <span>{t('subnavSellerOnGem')}</span>
              <span className="subnav-caret">▾</span>
            </button>

            {openDropdown === 'seller' && (
              <div className="subnav-dropdown-menu">
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('About');
                  }}
                >
                  {t('sellerRegGuide')}
                </button>
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('About');
                  }}
                >
                  {t('sellerMsmeBenefits')}
                </button>
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('About');
                  }}
                >
                  {t('sellerWomaniya')}
                </button>
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('About');
                  }}
                >
                  {t('sellerStartup')}
                </button>
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('About');
                  }}
                >
                  {t('sellerCautionMoney')}
                </button>
              </div>
            )}
          </div>

          {/* 5. View Contracts */}
          <div className="subnav-item-wrapper">
            <button
              type="button"
              className={`subnav-btn ${openDropdown === 'contracts' ? 'active' : ''}`}
              onClick={() => toggleDropdown('contracts')}
              aria-expanded={openDropdown === 'contracts'}
            >
              <span>{t('subnavViewContracts')}</span>
              <span className="subnav-caret">▾</span>
            </button>

            {openDropdown === 'contracts' && (
              <div className="subnav-dropdown-menu">
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('Bid');
                  }}
                >
                  {t('contractsActive')}
                </button>
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('Bid');
                  }}
                >
                  {t('contractsConcluded')}
                </button>
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('Bid');
                  }}
                >
                  {t('contractsCrac')}
                </button>
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('Bid');
                  }}
                >
                  {t('contractsSearch')}
                </button>
              </div>
            )}
          </div>

          {/* 6. CPPP */}
          <div className="subnav-item-wrapper">
            <button
              type="button"
              className={`subnav-btn ${openDropdown === 'cppp' ? 'active' : ''}`}
              onClick={() => toggleDropdown('cppp')}
              aria-expanded={openDropdown === 'cppp'}
            >
              <span>{t('subnavCppp')}</span>
              <span className="subnav-caret">▾</span>
            </button>

            {openDropdown === 'cppp' && (
              <div className="subnav-dropdown-menu">
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('Bid');
                  }}
                >
                  {t('cpppCentralPortal')}
                </button>
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('Bid');
                  }}
                >
                  {t('cpppSync')}
                </button>
                <button
                  type="button"
                  className="subnav-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('Bid');
                  }}
                >
                  {t('cpppXmlFeed')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: New on GeM & Notification Bell with '03' badge */}
        <div className="subnavbar-right">
          {/* New on GeM badge */}
          <button
            type="button"
            className="subnav-new-badge-btn"
            onClick={() => {
              if (onOpenVerifier) onOpenVerifier();
            }}
            title="Recent AI Launches on GeM"
          >
            <span className="new-badge-icon">💥</span>
            <span className="new-badge-label">{t('subnavNewOnGem')}</span>
          </button>

          {/* Notification Bell with '03' Red Badge */}
          <div className="subnav-item-wrapper">
            <button
              type="button"
              className="subnav-bell-btn"
              onClick={() => {
                toggleDropdown('notifications');
                if (onNotificationClick) onNotificationClick();
              }}
              title="Notifications"
              aria-label="View notifications"
            >
              <span className="bell-icon">🔔</span>
              <span className="bell-counter-badge">03</span>
            </button>

            {openDropdown === 'notifications' && (
              <div className="subnav-dropdown-menu subnav-notif-dropdown">
                <div className="notif-dropdown-header">
                  <strong>{t('latestNotificationsBadge')}</strong>
                  <span className="notif-count-pill">3 New</span>
                </div>
                <div
                  className="notif-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onOpenVerifier) onOpenVerifier();
                  }}
                >
                  <p className="notif-item-title">🔔 GFR Rule 144(xi) Mandatory Declaration</p>
                  <span className="notif-item-time">Active for all registered bidders</span>
                </div>
                <div
                  className="notif-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onOpenVerifier) onOpenVerifier();
                  }}
                >
                  <p className="notif-item-title">📢 AI Autonomous OCR Bid Compliance Live</p>
                  <span className="notif-item-time">Real-time evaluation active</span>
                </div>
                <div
                  className="notif-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    if (onNavigateTab) onNavigateTab('Auction');
                  }}
                >
                  <p className="notif-item-title">🛡️ Anti-Cartel Vigilance Alert</p>
                  <span className="notif-item-time">Price clustering anomaly detector</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
