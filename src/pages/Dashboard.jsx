import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import { Sidebar } from '../components/Sidebar';
import { LanguageSelector } from '../components/LanguageSelector';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { sendQuery } from '../services/api';

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

  const paneRef = useRef(null);

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
    const text = inputText.trim();
    if (!text) return;

    const userMsg = { id: Date.now(), text, type: 'user', detectedLang: lang };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setSuggestedLang(null);

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
            <div className="main-title">{t('chat_title', 'Cyber Incident Assistant')}</div>
            <div className="main-subtitle">{t('chat_subtitle', 'Secure end-to-end session · All data encrypted')}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LanguageSelector />
            <Link to="/extension" className="btn-extension" title="Download CyberGuard Extension">
              <i className="fa-solid fa-puzzle-piece"></i>
              <span>{t('chat_extension_btn', 'Extension')}</span>
            </Link>
            <div className="tag">{t('chat_ai_tag', 'AI Powered')}</div>
          </div>
        </div>

        <div className="pane" ref={paneRef}>
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛡️</div>
              <p>{t('chat_empty', 'Start a conversation to get expert cyber support')}</p>
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
                        {t('chat_complaint_btn', '🛡️ File Cyber Complaint')}
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

        <form className="composer" onSubmit={handleSend}>
          <div className="composer-input-wrap">
            <svg className="composer-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="messageInput"
              placeholder={t('chat_placeholder', 'Describe your incident or ask a question…')}
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
