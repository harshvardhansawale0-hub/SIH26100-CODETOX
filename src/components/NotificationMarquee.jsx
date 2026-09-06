import React from 'react';
import { Bell, Sparkles, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function NotificationMarquee({ onNotificationClick }) {
  const { t } = useLanguage();

  const notifications = [
    t('notif1'),
    t('notif2'),
    t('notif3'),
    t('notif4'),
    t('notif5')
  ];

  return (
    <div className="gem-marquee-strip">
      <div className="container-custom" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {/* Left Badge Header */}
        <div className="marquee-badge-box">
          <Bell size={14} className="marquee-bell-icon" />
          <span>{t('latestNotificationsBadge')}</span>
          <span className="marquee-pulse-dot"></span>
        </div>

        {/* Marquee Scroller Area */}
        <div className="marquee-content-container">
          <div className="marquee-track">
            {/* First sequence */}
            {notifications.map((item, idx) => (
              <span
                key={`a-${idx}`}
                className="marquee-item"
                onClick={() => onNotificationClick && onNotificationClick(idx)}
              >
                {item}
                <span className="marquee-separator">•</span>
              </span>
            ))}
            {/* Duplicate sequence for seamless infinite loop */}
            {notifications.map((item, idx) => (
              <span
                key={`b-${idx}`}
                className="marquee-item"
                onClick={() => onNotificationClick && onNotificationClick(idx)}
              >
                {item}
                <span className="marquee-separator">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
