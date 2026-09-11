import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Mic, Clock, Globe, Trash2, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function GoogleSearchBar({ searchQuery, setSearchQuery, onSearch }) {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState(searchQuery || '');
  const [isFocused, setIsFocused] = useState(false);
  const [clientIp, setClientIp] = useState('Detecting...');
  const [recentSearches, setRecentSearches] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const containerRef = useRef(null);

  // Trending GeM categories
  const trendingSearches = [
    'Medical & Healthcare Supplies',
    'Computers & IT Hardware',
    'Oxygen Gas & Accessories',
    'Office Furniture & Fixtures',
    'Solar Panels & Renewable Energy',
    'Fire Safety & Security'
  ];

  // Detect IP address and load per-IP recent searches
  useEffect(() => {
    let isMounted = true;

    const fetchIpAndLoadHistory = async () => {
      let detectedIp = null;
      try {
        const response = await fetch('https://api.ipify.org?format=json', {
          signal: AbortSignal.timeout(3000)
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.ip) {
            detectedIp = data.ip;
          }
        }
      } catch {
        // Fallback if offline or API blocked
      }

      if (!detectedIp) {
        detectedIp = localStorage.getItem('gem_detected_client_ip') || '192.168.1.104';
      }

      if (isMounted) {
        localStorage.setItem('gem_detected_client_ip', detectedIp);
        setClientIp(detectedIp);
        loadSearchesForIp(detectedIp);
      }
    };

    fetchIpAndLoadHistory();
    return () => { isMounted = false; };
  }, []);

  // Synchronize incoming searchQuery prop
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== inputValue) {
      setInputValue(searchQuery);
    }
  }, [searchQuery]);

  // Load searches for specific IP
  const loadSearchesForIp = (ip) => {
    try {
      const key = `gem_recent_searches_${ip}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      } else {
        // Default initial searches for this IP to demonstrate functionality
        const initialDefaults = [
          'Oxygen Concentrators & Gas Plants',
          'High Performance Desktops & Laptops',
          'Office Ergonomic Chairs',
          'Solar Street Lighting System',
          'Make In India Class-I Verified Tenders'
        ];
        localStorage.setItem(key, JSON.stringify(initialDefaults));
        setRecentSearches(initialDefaults);
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
  };

  // Save new search query for this IP
  const saveSearchForIp = (query) => {
    if (!query || !query.trim() || !clientIp) return;
    const cleanQuery = query.trim();
    const key = `gem_recent_searches_${clientIp}`;

    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== cleanQuery.toLowerCase());
      const updated = [cleanQuery, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (err) {
        console.warn('Error saving recent searches:', err);
      }
      return updated;
    });
  };

  // Remove individual search for this IP
  const handleRemoveSearchItem = (queryToRemove, e) => {
    e.stopPropagation();
    if (!clientIp) return;
    const key = `gem_recent_searches_${clientIp}`;

    setRecentSearches(prev => {
      const updated = prev.filter(q => q !== queryToRemove);
      try {
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (err) {
        console.warn('Error removing search item:', err);
      }
      return updated;
    });
  };

  // Clear all searches for this IP
  const handleClearAllSearches = (e) => {
    e.stopPropagation();
    if (!clientIp) return;
    const key = `gem_recent_searches_${clientIp}`;
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn('Error clearing recent searches:', err);
    }
    setRecentSearches([]);
  };

  // Handle Search Submission
  const triggerSearch = (query) => {
    const finalQuery = (query !== undefined ? query : inputValue).trim();
    if (!finalQuery) return;
    saveSearchForIp(finalQuery);
    setIsFocused(false);
    if (setSearchQuery) setSearchQuery(finalQuery);
    if (onSearch) onSearch(finalQuery);
  };

  // Voice Search Handler
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
        triggerSearch(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      // Fallback simulated voice search
      setIsListening(true);
      setTimeout(() => {
        const simulatedVoiceQueries = [
          'Medical Oxygen Gas Cylinders',
          'Computers and Laptops',
          'Office Furniture for Government Ministry'
        ];
        const randomQuery = simulatedVoiceQueries[Math.floor(Math.random() * simulatedVoiceQueries.length)];
        setInputValue(randomQuery);
        setIsListening(false);
        triggerSearch(randomQuery);
      }, 1500);
    }
  };

  // Close dropdown popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showPopup = isFocused;

  return (
    <div 
      ref={containerRef}
      style={{
        maxWidth: '860px',
        width: '92%',
        margin: '1.25rem auto 1.5rem auto',
        position: 'relative',
        zIndex: 40,
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Google-Type Search Capsule */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: showPopup ? '24px 24px 0 0' : '30px',
          border: '1px solid #cbd5e1',
          borderBottom: showPopup ? '1px solid #e2e8f0' : '1px solid #cbd5e1',
          padding: '0.65rem 1.25rem',
          boxShadow: showPopup
            ? '0 6px 20px rgba(15, 23, 42, 0.12)'
            : '0 3px 12px rgba(15, 23, 42, 0.06)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          zIndex: 41
        }}
      >
        {/* Left Google Search Lens Icon */}
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '0.85rem', flexShrink: 0 }}>
          <Search size={21} color="#0284c7" />
        </div>

        {/* Search Input Field */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              triggerSearch();
            }
          }}
          placeholder={isListening ? 'Listening to voice query...' : (t('searchPlaceholder') || 'Search tenders, bids, ministries, or products on GeM...')}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '1.02rem',
            color: '#0f172a',
            fontWeight: '500',
            backgroundColor: 'transparent',
            minWidth: 0
          }}
        />

        {/* Clear Button (shown when input has text) */}
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              if (setSearchQuery) setSearchQuery('');
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.35rem',
              cursor: 'pointer',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              marginRight: '0.4rem',
              transition: 'color 0.15s ease'
            }}
            title="Clear search"
          >
            <X size={17} />
          </button>
        )}

        {/* Voice Search Microphone Button */}
        <button
          type="button"
          onClick={handleVoiceSearch}
          style={{
            background: isListening ? '#fef2f2' : 'none',
            border: isListening ? '1px solid #fecaca' : 'none',
            padding: '0.45rem',
            cursor: 'pointer',
            color: isListening ? '#ef4444' : '#ea580c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            marginRight: '0.65rem',
            transition: 'all 0.2s ease'
          }}
          title={isListening ? 'Listening...' : 'Search by voice'}
        >
          <Mic size={19} className={isListening ? 'pulse' : ''} />
        </button>

        {/* Google Style Primary Search Button */}
        <button
          type="button"
          onClick={() => triggerSearch()}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '20px',
            padding: '0.48rem 1.25rem',
            fontSize: '0.88rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
        >
          <span>Search</span>
        </button>
      </div>

      {/* Pop-up Dropdown: Recent Searches for this IP Address */}
      {showPopup && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderTop: 'none',
            borderRadius: '0 0 24px 24px',
            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
            padding: '1rem 1.25rem 1.25rem 1.25rem',
            zIndex: 42
          }}
        >
          {/* IP Address Metadata Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '0.75rem',
              marginBottom: '0.75rem',
              borderBottom: '1px solid #f1f5f9',
              fontSize: '0.78rem',
              color: '#64748b'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Globe size={14} color="#0284c7" />
              <span>
                Client IP: <strong className="mono-text" style={{ color: '#0284c7', fontWeight: '700' }}>{clientIp}</strong>
              </span>
              <span style={{ color: '#94a3b8' }}>• Network Isolated History</span>
            </div>

            {recentSearches.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllSearches}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '0.76rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                <Trash2 size={12} /> Clear History
              </button>
            )}
          </div>

          {/* Recent Searches Section */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
              <Clock size={13} color="#0284c7" />
              <span>Recent Searches for IP ({clientIp})</span>
            </div>

            {recentSearches.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {recentSearches.map((query, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setInputValue(query);
                      triggerSearch(query);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      <Clock size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.92rem', color: '#4338ca', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {query}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleRemoveSearchItem(query, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        transition: 'color 0.15s'
                      }}
                      title="Remove from history"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '0.75rem 0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                No recent searches logged for this IP address yet.
              </div>
            )}
          </div>

          {/* Trending GeM Opportunities Section */}
          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', fontWeight: '800', color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
              <TrendingUp size={13} color="#ea580c" />
              <span>Trending Opportunities & Top Categories</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {trendingSearches.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputValue(item);
                    triggerSearch(item);
                  }}
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                    borderRadius: '16px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                    e.currentTarget.style.borderColor = '#bae6fd';
                    e.currentTarget.style.color = '#0284c7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.color = '#334155';
                  }}
                >
                  <span>{item}</span>
                  <ArrowUpRight size={12} style={{ opacity: 0.6 }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
