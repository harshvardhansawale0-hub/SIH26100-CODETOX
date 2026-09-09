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
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, []);

  const handleSelectLanguage = (code, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLang(code);
    setIsOpen(false);
  };

  return (
    <div
      className="language-selector-wrapper"
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <button
        type="button"
        className="language-selector-btn"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-label="Change Portal Language"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.42rem 0.85rem',
          borderRadius: '20px',
          border: '1px solid #1e385b',
          backgroundColor: '#0c1f36',
          color: '#ffffff',
          fontSize: '0.82rem',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}
      >
        <span style={{ fontSize: '1rem', lineHeight: 1 }}>{currentOption.flag}</span>
        <span style={{ color: '#38bdf8' }}>{currentOption.native}</span>
        <ChevronDown
          size={13}
          style={{
            color: '#94a3b8',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>

      {isOpen && (
        <div
          className="language-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            backgroundColor: '#0c1f36',
            border: '1px solid #1e385b',
            borderRadius: '10px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
            minWidth: '170px',
            padding: '0.4rem',
            zIndex: 99999,
            animation: 'fadeIn 0.15s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ padding: '0.35rem 0.65rem', borderBottom: '1px solid #1e385b', fontSize: '0.72rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Select Language:
          </div>
          {langOptions.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={(e) => handleSelectLanguage(opt.code, e)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: lang === opt.code ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
                color: lang === opt.code ? '#38bdf8' : '#e2e8f0',
                fontSize: '0.85rem',
                fontWeight: lang === opt.code ? '800' : '600',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                marginTop: '2px'
              }}
              onMouseEnter={(e) => {
                if (lang !== opt.code) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (lang !== opt.code) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.05rem' }}>{opt.flag}</span>
                <span>{opt.native} <span style={{ opacity: 0.65, fontSize: '0.75rem' }}>({opt.label})</span></span>
              </div>
              {lang === opt.code && <Check size={15} color="#38bdf8" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
