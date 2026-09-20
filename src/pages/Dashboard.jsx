import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import { Sidebar } from '../components/Sidebar';
import { LanguageSelector } from '../components/LanguageSelector';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { sendQuery } from '../services/api';
import { useSpeechRecognition, RECOGNITION_STATES } from '../hooks/useSpeechRecognition';

marked.setOptions({ breaks: true, gfm: true });

export function Dashboard() {
  const { username } = useAuth();
  const { t, lang, setLanguage, getLanguageName } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const storageKey = `chat_${username}`;

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedLang, setSuggestedLang] = useState(null);
  const [dismissedSpeechError, setDismissedSpeechError] = useState(false);

  const paneRef = useRef(null);

  const {
    isSupported: isSpeechSupported,
    status: speechStatus,
    error: speechError,
    toggleListening,
    stopListening,
    resetSpeech,
    activeLocale,
  } = useSpeechRecognition({
    lang,
    onTranscript: (finalText, interimText) => {
      const combined = [finalText, interimText].filter(Boolean).join(' ');
      if (combined) {
        setInputText(combined);
      }
    },
  });

  useEffect(() => {
    if (speechError) {
      setDismissedSpeechError(false);
    }
  }, [speechError]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat to localStorage:', e);
    }
  }, [messages, storageKey]);

  useEffect(() => {
    if (paneRef.current) {
      paneRef.current.scrollTop = paneRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (searchParams.get('from') === 'complaint') {
      const successText = t(
        'chat_success',
        '✅ Your cyber complaint has been submitted successfully. Our cyber team will contact you shortly.'
      );
      setMessages((prev) => [...prev, { id: Date.now(), text: successText, type: 'bot' }]);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, t]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(storageKey);
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (speechStatus === RECOGNITION_STATES.LISTENING) {
      stopListening();
    }

    const text = inputText.trim();
    if (!text) return;

    const userMsg = { id: Date.now(), text, type: 'user', detectedLang: lang };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setSuggestedLang(null);
    resetSpeech();

    try {
      const { ok, data } = await sendQuery(text, username, lang);
      setIsTyping(false);

      if (ok && data) {
        if (data.detected_language && data.detected_language !== lang && data.detected_language !== 'en') {
          setSuggestedLang(data.detected_language);
        }

        const botMsg = {
          id: Date.now() + 1,
          text: data.answer || 'No response',
          type: 'bot',
          redirect: Boolean(data.redirect),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, text: 'Unable to reach response server. Please try again.', type: 'bot' },
        ]);
      }
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: 'Server error occurred. Please verify backend server status.', type: 'bot' },
      ]);
    }
  };

  const formatMarkdown = (text) => {
    if (!text) return '';
    try {
      return { __html: marked.parse(text) };
    } catch {
      return { __html: text };
    }
  };

  const userAvatarLetter = username ? username[0].toUpperCase() : 'U';

  return (
    <div className="app">
      <div className="bg-canvas" aria-hidden="true">
        <div className="bg-grid"></div>
        <div className="bg-blob bg-blob--blue"></div>
        <div className="bg-blob bg-blob--cyan"></div>
        <div className="bg-blob bg-blob--emerald"></div>
      </div>

      <Sidebar onNewSession={clearChat} activePage="dashboard" />

      <main className="main">
        <div className="main-header">
          <div>
            <div className="main-title">{t('chat_title', 'How can we help?')}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LanguageSelector />
            <Link to="/email-verification" className="btn-extension" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }} title="Verify Job Offer Email">
              <i className="fa-solid fa-envelope-open-text"></i>
              <span>Check Email</span>
            </Link>
            <Link to="/extension" className="btn-extension" title="Download CyberGuard Extension">
              <i className="fa-solid fa-shield-halved"></i>
              <span>{t('chat_extension_btn', 'Protect Browser')}</span>
            </Link>
          </div>
        </div>

        <div className="pane" ref={paneRef}>
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛡️</div>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{t('chat_empty', 'Tell us what happened 👇')}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.type}`}>
                <div className="avatar">{msg.type === 'user' ? userAvatarLetter : 'AI'}</div>
                <div className="bubble">
                  <div dangerouslySetInnerHTML={formatMarkdown(msg.text)} />

                  {msg.type === 'user' && msg.detectedLang && msg.detectedLang !== 'en' && (
                    <span className="ng-lang-badge" title={`Detected: ${getLanguageName(msg.detectedLang)}`}>
                      🌐 {getLanguageName(msg.detectedLang)}
                    </span>
                  )}

                  {msg.redirect && (
                    <div style={{ marginTop: '12px' }}>
                      <button className="btn-complaint" onClick={() => navigate('/complaint')} type="button">
                        {t('chat_complaint_btn', '📝 Report This')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {suggestedLang && (
            <div className="message bot">
              <div className="avatar">AI</div>
              <div className="bubble" style={{ fontSize: '0.82rem' }}>
                🌐 <strong>{getLanguageName(suggestedLang)}</strong> detected.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setLanguage(suggestedLang);
                    setSuggestedLang(null);
                  }}
                  style={{
                    marginLeft: '8px',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(99,102,241,0.4)',
                    background: 'rgba(99,102,241,0.08)',
                    color: '#818cf8',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Switch to {getLanguageName(suggestedLang)}
                </button>
              </div>
            </div>
          )}

          {isTyping && (
            <div className="message bot">
              <div className="avatar">AI</div>
              <div className="bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {speechStatus === RECOGNITION_STATES.LISTENING && (
          <div className="speech-status-bar">
            <span>
              🔴 <strong>Listening...</strong> ({getLanguageName(lang)} - {activeLocale})
            </span>
            <button
              type="button"
              onClick={stopListening}
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: '4px',
                color: '#ef4444',
                padding: '2px 8px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Stop
            </button>
          </div>
        )}

        {speechError && !dismissedSpeechError && (
          <div className="speech-error-banner">
            <span>⚠️ {speechError}</span>
            <button
              type="button"
              onClick={() => setDismissedSpeechError(true)}
              title="Dismiss warning"
              aria-label="Dismiss warning"
            >
              ✕
            </button>
          </div>
        )}

        <form className="composer" onSubmit={handleSend}>
          <button
            type="button"
            className={`btn-mic ${speechStatus === RECOGNITION_STATES.LISTENING ? 'is-listening' : ''}`}
            onClick={toggleListening}
            disabled={!isSpeechSupported}
            title={
              !isSpeechSupported
                ? t('mic_unsupported', "Voice input isn't supported in this browser. Please use a supported browser or type your message.")
                : speechStatus === RECOGNITION_STATES.LISTENING
                ? t('mic_stop', 'Stop voice input')
                : t('mic_start', 'Start voice input')
            }
            aria-label={
              speechStatus === RECOGNITION_STATES.LISTENING
                ? 'Stop voice input'
                : 'Start voice input'
            }
          >
            {speechStatus === RECOGNITION_STATES.LISTENING ? (
              <span className="mic-listening-indicator">
                <span className="mic-dot"></span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            )}
          </button>

          <div className="composer-input-wrap">
            <svg className="composer-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="messageInput"
              placeholder={
                speechStatus === RECOGNITION_STATES.LISTENING
                  ? t('mic_listening_placeholder', 'Listening... Speak now...')
                  : t('chat_placeholder', 'Type here or ask anything…')
              }
              aria-label="Message"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <button className="btn-send" type="submit" title="Send" aria-label="Send message">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </main>
    </div>
  );
}

