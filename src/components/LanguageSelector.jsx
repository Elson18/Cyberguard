import React, { useState, useEffect, useRef } from 'react';
import { useI18n, LANGUAGE_NAMES, INDIAN_LANGS, INTL_LANGS } from '../context/I18nContext';

export function LanguageSelector() {
  const { lang, setLanguage, getLanguageName } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    <div className="ng-lang-selector" ref={dropdownRef}>
      <button
        className="ng-lang-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Change Language"
        aria-expanded={isOpen}
        type="button"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{getLanguageName(lang)}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="ng-lang-chevron"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="ng-lang-dropdown" role="listbox">
          <div className="ng-lang-group-label">🇮🇳 Indian Languages</div>
          {INDIAN_LANGS.map((code) => (
            <button
              key={code}
              type="button"
              className={`ng-lang-option ${code === lang ? 'active' : ''}`}
              onClick={() => {
                setLanguage(code);
                setIsOpen(false);
              }}
            >
              {LANGUAGE_NAMES[code]}
            </button>
          ))}
          <div className="ng-lang-divider"></div>
          <div className="ng-lang-group-label">🌐 International</div>
          {INTL_LANGS.map((code) => (
            <button
              key={code}
              type="button"
              className={`ng-lang-option ${code === lang ? 'active' : ''}`}
              onClick={() => {
                setLanguage(code);
                setIsOpen(false);
              }}
            >
              {LANGUAGE_NAMES[code]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
