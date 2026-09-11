import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const langOptions = [
    { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr', label: 'Marathi', native: 'मराठी', flag: '🇮🇳' }
  ];

  const currentOption = langOptions.find((o) => o.code === lang) || langOptions[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="language-selector-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="language-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change Language"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.4rem 0.75rem',
          borderRadius: '9999px',
          border: '1px solid #cbd5e1',
          backgroundColor: '#f8fafc',
          color: '#0f172a',
          fontSize: '0.82rem',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <Globe size={15} color="#0f2847" />
        <span>{currentOption.native}</span>
        <ChevronDown size={13} color="#64748b" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div
          className="language-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
            minWidth: '150px',
            padding: '0.35rem',
            zIndex: 150,
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {langOptions.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => {
                setLang(opt.code);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: lang === opt.code ? '#eff6ff' : 'transparent',
                color: lang === opt.code ? '#0284c7' : '#1e293b',
                fontSize: '0.84rem',
                fontWeight: lang === opt.code ? '700' : '500',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (lang !== opt.code) {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                }
              }}
              onMouseLeave={(e) => {
                if (lang !== opt.code) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{opt.native} <small style={{ opacity: 0.7, fontSize: '0.75rem' }}>({opt.label})</small></span>
              {lang === opt.code && <Check size={14} color="#f59e0b" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
