import React from 'react';
import { summaryMetrics, initialBids } from '../data/bidsData';
import { useLanguage } from '../context/LanguageContext';

export default function DashboardPreview({ onSelectBid, onViewFullDashboard }) {
  const { t } = useLanguage();
  const displayBids = initialBids.slice(0, 4);

  const violationList = [
    { key: 'priceCartel', percent: 34, color: '#ef4444' },
    { key: 'mseFraud', percent: 27, color: '#f59e0b' },
    { key: 'miiNonCompliance', percent: 19, color: '#3b82f6' },
    { key: 'docForgery', percent: 12, color: '#eab308' },
    { key: 'other', percent: 8, color: '#64748b' }
  ];

  return (
    <section className="dashboard-preview-section">
      <div className="container-custom">
        <span className="section-tag">{t('dashboardTag')}</span>
        <h2 className="section-title serif-heading">{t('dashboardTitle')}</h2>
        <p className="section-subtitle">
          {t('dashboardSubtitle')}
        </p>

        {/* Dark Dashboard Terminal Box */}
        <div className="dashboard-terminal">
          {/* Terminal Window Bar */}
          <div className="terminal-header">
            <div className="window-dots">
              <span className="window-dot red"></span>
              <span className="window-dot yellow"></span>
              <span className="window-dot green"></span>
            </div>
            <span className="terminal-title mono-text">{t('dashboardHeader')}</span>
          </div>

          <div className="terminal-body">
            {/* 4 Stat Cards */}
            <div className="terminal-stat-cards">
              <div className="terminal-card">
                <span className="t-card-label">{t('activeBids')}</span>
                <div className="t-card-value-row">
                  <span className="t-card-value">{summaryMetrics.activeBids}</span>
                  <span className="t-card-badge green">{summaryMetrics.activeChange}</span>
                </div>
              </div>

              <div className="terminal-card">
                <span className="t-card-label">{t('compliant')}</span>
                <div className="t-card-value-row">
                  <span className="t-card-value">{summaryMetrics.compliant}</span>
                  <span className="t-card-badge green">{summaryMetrics.compliantPercent}</span>
                </div>
              </div>

              <div className="terminal-card">
                <span className="t-card-label">{t('flagged')}</span>
                <div className="t-card-value-row">
                  <span className="t-card-value">{summaryMetrics.flagged}</span>
                  <span className="t-card-badge orange">{summaryMetrics.flaggedPercent}</span>
                </div>
              </div>

              <div className="terminal-card">
                <span className="t-card-label">{t('rejected')}</span>
                <div className="t-card-value-row">
                  <span className="t-card-value">{summaryMetrics.rejected}</span>
                  <span className="t-card-badge red">{summaryMetrics.rejectedPercent}</span>
                </div>
              </div>
            </div>

            {/* Lower Grid: Violation Categories & Recent Bid Decisions */}
            <div className="terminal-lower-grid">
              {/* Left Column: Violation Categories */}
              <div className="terminal-panel">
                <h4 className="panel-heading">{t('violationCategories')}</h4>
                <div className="violation-list">
                  {violationList.map((item) => (
                    <div key={item.key} className="violation-item">
                      <div className="v-header-row">
                        <span className="v-name">{t(item.key)}</span>
                        <span className="v-percent">{item.percent}%</span>
                      </div>
                      <div className="v-bar-bg">
                        <div
                          className="v-bar-fill"
                          style={{
                            width: `${item.percent}%`,
                            backgroundColor: item.color
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Recent Bid Decisions */}
              <div className="terminal-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h4 className="panel-heading" style={{ margin: 0 }}>{t('recentBidDecisions')}</h4>
                  {onViewFullDashboard && (
                    <button
                      onClick={onViewFullDashboard}
                      style={{
                        background: 'transparent',
                        border: '1px solid #1e385b',
                        color: '#7dd3fc',
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {t('viewAllBids')}
                    </button>
                  )}
                </div>

                <div className="recent-decisions-table">
                  {displayBids.map((bid) => (
                    <div
                      key={bid.id}
                      className="decision-row"
                      onClick={() => onSelectBid && onSelectBid(bid)}
                      title="Click to view AI reasoning & audit trail"
                    >
                      <span className="d-bid-id">{bid.id}</span>
                      <span className="d-vendor">{bid.vendor}</span>
                      <span className="d-category">{bid.category}</span>
                      <div>
                        <span className={`d-status-badge ${bid.status.toLowerCase()}`}>
                          {bid.status === 'Compliant' ? t('compliant') : bid.status === 'Flagged' ? t('flagged') : t('rejected')}
                        </span>
                      </div>
                      <span className="d-score">{bid.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
