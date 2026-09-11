import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Mic, MicOff, Volume2, VolumeX, X, 
  Minimize2, Maximize2, Trash2, ShieldCheck, 
  FileText, TrendingDown, Award, Sparkles, PlusCircle, CheckCircle2,
  Globe, ChevronDown, Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../i18n/translations';
import { GEMMY_SUGGESTED_PROMPTS, getSmartGeMResponse } from '../data/gemmyKnowledge';

export default function AskGemmyModal({ 
  isOpen, 
  onClose, 
  onOpenVerifier, 
  onNavigateTab, 
  onOpenCreateBid, 
  onOpenCategory 
}) {
  const { t, lang: portalLang } = useLanguage();

  // Separate, independent language state for GeMMy Chatbot
  const [chatLanguage, setChatLanguage] = useState(() => {
    return localStorage.getItem('gemmy_chatbot_lang') || portalLang || 'en';
  });
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  const chatLangOptions = [
    { code: 'en', label: 'English', short: 'EN', native: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'Hindi', short: 'HI', native: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr', label: 'Marathi', short: 'MR', native: 'मराठी', flag: '🇮🇳' }
  ];
  const currentChatLang = chatLangOptions.find(o => o.code === chatLanguage) || chatLangOptions[0];

  // Helper to translate strings specific to chatbot's independent language
  const chatT = (key) => {
    return translations[chatLanguage]?.[key] || translations['en']?.[key] || t(key);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update chatbot language and reload its prompts
  const handleSelectChatLang = (code) => {
    setChatLanguage(code);
    localStorage.setItem('gemmy_chatbot_lang', code);
    setIsLangDropdownOpen(false);
    fetchSuggestedPrompts(code);
    if (synthRef.current?.speaking) synthRef.current.cancel();
  };

  // Initialize SpeechRecognition if available (using chatbot language)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = chatLanguage === 'hi' ? 'hi-IN' : chatLanguage === 'mr' ? 'mr-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInputValue(transcript);
      };

      recognitionRef.current = recognition;
    }
  }, [chatLanguage]);

  // Update suggested prompts when chatbot language changes
  useEffect(() => {
    fetchSuggestedPrompts(chatLanguage);
  }, [chatLanguage]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  // Fetch localized starter chips from API or use rich GeM dataset
  const fetchSuggestedPrompts = async (targetLang) => {
    try {
      const res = await fetch(`/api/gemmy/suggested-prompts?language=${targetLang}`);
      if (res.ok) {
        const data = await res.json();
        if (data.prompts && data.prompts.length > 0) {
          setSuggestedPrompts(data.prompts);
          return;
        }
      }
    } catch (e) {
      // Offline / fallback below
    }

    setSuggestedPrompts(GEMMY_SUGGESTED_PROMPTS[targetLang] || GEMMY_SUGGESTED_PROMPTS.en);
  };

  // Text-To-Speech SpeechSynthesis
  const speakText = (text, msgId) => {
    if (!synthRef.current) return;

    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      if (speakingMsgId === msgId) {
        setSpeakingMsgId(null);
        return;
      }
    }

    // Strip markdown formatting for cleaner speech
    const cleanText = text
      .replace(/\[.*?\]/g, '')
      .replace(/[*#_`]/g, '')
      .replace(/\n+/g, ' ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = chatLanguage === 'hi' ? 'hi-IN' : chatLanguage === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = 1.0;

    utterance.onstart = () => setSpeakingMsgId(msgId);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    synthRef.current.speak(utterance);
  };

  // Toggle Voice Input
  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported by your current browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = chatLanguage === 'hi' ? 'hi-IN' : chatLanguage === 'mr' ? 'mr-IN' : 'en-IN';
        recognitionRef.current.start();
      } catch (err) {
        console.error("Recognition start error:", err);
      }
    }
  };

  // Handle Send Message
  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessageId = `user_${Date.now()}`;
    const newMessages = [
      ...messages,
      {
        id: userMessageId,
        role: 'user',
        content: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemmy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: chatLanguage,
          role: 'public',
          history: newMessages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      let replyText = data.reply;
      let replyCitations = data.citations || [];
      let replyActions = data.actions || [];
      let replyModel = data.model || 'Groq (qwen/qwen3.8-27b)';

      // If backend returned empty or generic fallback without answering specifically, enhance with local GeM intelligence
      if (!replyText || replyText.trim().length === 0) {
        const smartFallback = getSmartGeMResponse(query, chatLanguage);
        replyText = smartFallback.reply;
        replyCitations = smartFallback.citations;
        replyActions = smartFallback.actions;
        replyModel = smartFallback.model;
      }

      const assistantMessageId = `gemmy_${Date.now()}`;
      const assistantMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: replyText,
        model: replyModel,
        citations: replyCitations,
        actions: replyActions,
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (ttsEnabled) {
        speakText(replyText, assistantMessageId);
      }
    } catch (err) {
      console.warn("Backend chat unavailable, applying intelligent GeM procurement engine:", err);
      
      // Client-side intelligent response tailored precisely to the user's specific GeM question
      const smartRes = getSmartGeMResponse(query, chatLanguage);
      const assistantMessageId = `gemmy_${Date.now()}`;
      const fallbackMsg = {
        id: assistantMessageId,
        role: 'assistant',
        content: smartRes.reply,
        model: smartRes.model || 'GeMMy-AI-v2.5 (Procurement Engine)',
        citations: smartRes.citations || ['GFR 2017 Rule 149', 'GeM Guidelines 2024'],
        actions: smartRes.actions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);

      if (ttsEnabled) {
        speakText(smartRes.reply, assistantMessageId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Action Button Clicks inside Messages
  const handleActionClick = (action) => {
    if (action.action === 'OPEN_VERIFIER') {
      if (onOpenVerifier) onOpenVerifier(null);
    } else if (action.action === 'NAVIGATE_TENDERS') {
      if (onNavigateTab) onNavigateTab('Bid');
    } else if (action.action === 'NAVIGATE_AUCTIONS') {
      if (onNavigateTab) onNavigateTab('Auction');
    } else if (action.action === 'NAVIGATE_BUYER') {
      if (onNavigateTab) onNavigateTab('Buyer');
    } else if (action.action === 'NAVIGATE_BIDDER') {
      if (onNavigateTab) onNavigateTab('Bidder');
    } else if (action.action === 'NAVIGATE_SCHEMES') {
      if (onNavigateTab) onNavigateTab('Forward');
    }
  };

  const getActionIcon = (iconName) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck size={14} className="text-emerald-400" />;
      case 'FileText': return <FileText size={14} className="text-sky-400" />;
      case 'TrendingDown': return <TrendingDown size={14} className="text-amber-400" />;
      case 'Award': return <Award size={14} className="text-indigo-400" />;
      case 'PlusCircle': return <PlusCircle size={14} className="text-orange-400" />;
      default: return <CheckCircle2 size={14} className="text-blue-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`gemmy-chat-overlay ${isExpanded ? 'is-expanded' : ''} ${isMinimized ? 'is-minimized' : ''}`}>
      <div className="gemmy-chat-window">
        {/* Header */}
        <header className="gemmy-chat-header">
          <div className="gemmy-header-identity">
            <div className="gemmy-header-avatar">
              <span className="gemmy-bot-icon">🤖</span>
              <span className="gemmy-status-dot online"></span>
            </div>
            <div className="gemmy-header-text">
              <div className="gemmy-header-title-row">
                <h3 className="gemmy-title">{chatT('gemmyTitle')}</h3>
                <span className="gemmy-ai-badge">AI 2.0</span>

                {/* Dedicated Chatbot Language Selector */}
                <div className="gemmy-lang-selector-wrap" ref={langDropdownRef}>
                  <button
                    type="button"
                    className="gemmy-lang-select-btn"
                    onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                    title="Change Chatbot Language (English / हिंदी / मराठी)"
                    aria-label="Change Chatbot Language"
                  >
                    <Globe size={12} className="gemmy-globe-icon" />
                    <span>{currentChatLang.native}</span>
                    <span className="gemmy-lang-code-pill">{currentChatLang.short}</span>
                    <ChevronDown size={11} className={`gemmy-lang-caret ${isLangDropdownOpen ? 'open' : ''}`} />
                  </button>

                  {isLangDropdownOpen && (
                    <div className="gemmy-lang-menu">
                      <div className="gemmy-lang-menu-title">Chatbot Language</div>
                      {chatLangOptions.map(opt => (
                        <button
                          key={opt.code}
                          type="button"
                          className={`gemmy-lang-option ${chatLanguage === opt.code ? 'selected' : ''}`}
                          onClick={() => handleSelectChatLang(opt.code)}
                        >
                          <span className="gemmy-lang-opt-flag">{opt.flag}</span>
                          <span className="gemmy-lang-opt-text">
                            <strong>{opt.native}</strong>
                            <small>({opt.label})</small>
                          </span>
                          {chatLanguage === opt.code && <Check size={14} className="gemmy-lang-check" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="gemmy-subtitle">{chatT('gemmyOnlineStatus')}</p>
            </div>
          </div>

          <div className="gemmy-header-controls">
            {/* TTS Audio Toggle */}
            <button
              className={`gemmy-control-btn ${ttsEnabled ? 'active' : ''}`}
              onClick={() => {
                setTtsEnabled(!ttsEnabled);
                if (synthRef.current?.speaking) synthRef.current.cancel();
              }}
              title={ttsEnabled ? chatT('gemmyVoiceOn') : chatT('gemmyVoiceOff')}
              aria-label="Toggle Text-to-Speech"
            >
              {ttsEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>

            {/* Clear Chat */}
            {messages.length > 0 && (
              <button
                className="gemmy-control-btn"
                onClick={() => {
                  setMessages([]);
                  if (synthRef.current?.speaking) synthRef.current.cancel();
                }}
                title={chatT('gemmyClear')}
                aria-label="Clear chat"
              >
                <Trash2 size={16} />
              </button>
            )}

            {/* Minimize */}
            <button
              className="gemmy-control-btn"
              onClick={() => setIsMinimized(!isMinimized)}
              title={chatT('gemmyMinimize')}
              aria-label="Minimize"
            >
              <Minimize2 size={16} />
            </button>

            {/* Maximize */}
            <button
              className="gemmy-control-btn desktop-only"
              onClick={() => setIsExpanded(!isExpanded)}
              title={chatT('gemmyMaximize')}
              aria-label="Maximize"
            >
              <Maximize2 size={16} />
            </button>

            {/* Close */}
            <button
              className="gemmy-control-btn close-btn"
              onClick={() => {
                if (synthRef.current?.speaking) synthRef.current.cancel();
                onClose();
              }}
              title={chatT('gemmyClose')}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Content Body (Hidden if minimized) */}
        {!isMinimized && (
          <>
            <div className="gemmy-chat-body">
              {/* Welcome Screen if no messages */}
              {messages.length === 0 && (
                <div className="gemmy-welcome-container">
                  <div className="gemmy-welcome-banner">
                    <div className="gemmy-welcome-icon-wrap">
                      <Sparkles size={28} className="text-amber-400" />
                    </div>
                    <h4>{chatT('gemmyWelcomeTitle')}</h4>
                    <p>{chatT('gemmyWelcomeDesc')}</p>
                  </div>

                  <div className="gemmy-prompts-section">
                    <span className="gemmy-prompts-label">{chatT('gemmyQuickPrompts')}</span>
                    <div className="gemmy-prompts-grid">
                      {suggestedPrompts.map((item, idx) => (
                        <button
                          key={idx}
                          className="gemmy-prompt-chip"
                          onClick={() => handleSendMessage(item.query)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Messages Stream */}
              {messages.map((msg) => (
                <div key={msg.id} className={`gemmy-message-row ${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <div className="gemmy-msg-avatar">
                      <span>🤖</span>
                    </div>
                  )}

                  <div className="gemmy-msg-bubble">
                    {/* Header info for assistant */}
                    {msg.role === 'assistant' && (
                      <div className="gemmy-msg-meta">
                        <span className="gemmy-msg-author">GeMMy AI</span>
                        <span className="gemmy-model-tag">{msg.model}</span>
                        <button
                          className={`gemmy-msg-speak-btn ${speakingMsgId === msg.id ? 'is-speaking' : ''}`}
                          onClick={() => speakText(msg.content, msg.id)}
                          title="Read message aloud"
                        >
                          <Volume2 size={13} />
                        </button>
                      </div>
                    )}

                    {/* Content */}
                    <div className="gemmy-msg-text">
                      {(msg.content || '').split('\n\n').map((para, i) => (
                        <p key={i}>
                          {para.split('\n').map((line, j) => {
                            // Basic bold formatting
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                              <React.Fragment key={j}>
                                {parts.map((p, k) => {
                                  if (p.startsWith('**') && p.endsWith('**')) {
                                    return <strong key={k}>{p.slice(2, -2)}</strong>;
                                  }
                                  return p;
                                })}
                                {j < para.split('\n').length - 1 && <br />}
                              </React.Fragment>
                            );
                          })}
                        </p>
                      ))}
                    </div>

                    {/* Regulatory Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="gemmy-citations-tray">
                        <span className="gemmy-citation-label">📜 {chatT('gemmyCitRef')}:</span>
                        {msg.citations.map((cit, ci) => (
                          <span key={ci} className="gemmy-citation-pill">
                            {cit}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="gemmy-actions-tray">
                        <span className="gemmy-actions-title">⚡ {chatT('gemmyActions')}:</span>
                        <div className="gemmy-actions-list">
                          {msg.actions.map((act) => (
                            <button
                              key={act.id}
                              className="gemmy-action-btn"
                              onClick={() => handleActionClick(act)}
                            >
                              {getActionIcon(act.icon)}
                              <span>{act.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <span className="gemmy-msg-timestamp">{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {/* Typing Loader */}
              {isLoading && (
                <div className="gemmy-message-row assistant">
                  <div className="gemmy-msg-avatar">
                    <span>🤖</span>
                  </div>
                  <div className="gemmy-msg-bubble loading-bubble">
                    <div className="gemmy-typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="gemmy-thinking-text">GeMMy is thinking with Groq AI...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <footer className="gemmy-chat-footer">
              {/* Quick Prompt Chips tray when in ongoing conversation */}
              {messages.length > 0 && suggestedPrompts.length > 0 && (
                <div className="gemmy-quick-chips-bar">
                  {suggestedPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="gemmy-quick-chip"
                      onClick={() => handleSendMessage(item.query)}
                      disabled={isLoading}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              <form 
                className="gemmy-input-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                {/* Voice Input Mic Button */}
                <button
                  type="button"
                  className={`gemmy-mic-btn ${isListening ? 'listening-pulse' : ''}`}
                  onClick={toggleSpeechRecognition}
                  title={isListening ? "Listening... Click to stop" : "Click to speak via microphone"}
                  aria-label="Voice input"
                >
                  {isListening ? <Mic size={18} className="mic-active-icon" /> : <Mic size={18} />}
                </button>

                <input
                  type="text"
                  className="gemmy-text-input"
                  placeholder={isListening ? chatT('gemmyListening') : chatT('gemmyPlaceholder')}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />

                <button
                  type="submit"
                  className="gemmy-send-btn"
                  disabled={!inputValue.trim() || isLoading}
                  title={chatT('gemmySend')}
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </form>

              <div className="gemmy-footer-footnote">
                <span>Government e-Marketplace (GeM) AI Intelligence • GFR 2017 & DPIIT Rule Engine • SIH26100</span>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

