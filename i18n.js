/**
 * NeuroGuard i18n.js — Shared Frontend Multilingual Engine
 * =========================================================
 * Usage:
 *   <script src="/cyberguard/i18n.js"></script>
 *   Then: await I18n.init();
 *
 * Auto-translates all elements with data-i18n="key" attribute.
 * Fires 'languageChanged' custom event on the document when language switches.
 */

const I18n = (() => {
  // ── Constants ────────────────────────────────────────────────────────────
  const STORAGE_KEY = 'ng_lang';
  const CACHE_KEY   = 'ng_i18n_cache';
  const API_BASE    = window.CYBERGUARD_API_URL || (window.location.port === '8765' ? window.location.origin : 'http://127.0.0.1:8765');
  const DEFAULT_LANG = 'en';

  const LANGUAGE_NAMES = {
    en: 'English', ta: 'தமிழ் (Tamil)', hi: 'हिन्दी (Hindi)',
    te: 'తెలుగు (Telugu)', kn: 'ಕನ್ನಡ (Kannada)', ml: 'മലയാളം (Malayalam)',
    bn: 'বাংলা (Bengali)', mr: 'मराठी (Marathi)', gu: 'ગુજરાતી (Gujarati)',
    pa: 'ਪੰਜਾਬੀ (Punjabi)', or: 'ଓଡ଼ିଆ (Odia)',
    es: 'Español', fr: 'Français', de: 'Deutsch', pt: 'Português',
    ar: 'العربية', ja: '日本語', ko: '한국어', zh: '中文',
  };

  const INDIAN_LANGS  = ['en','ta','hi','te','kn','ml','bn','mr','gu','pa','or'];
  const INTL_LANGS    = ['es','fr','de','pt','ar','ja','ko','zh'];
  const RTL_LANGS     = ['ar'];

  let _currentLang  = DEFAULT_LANG;
  let _translations = {};

  // ── Helpers ──────────────────────────────────────────────────────────────
  function _getLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function _saveLang(code) {
    localStorage.setItem(STORAGE_KEY, code);
  }

  async function _fetchTranslations(langCode) {
    // Check session cache first
    try {
      const cached = sessionStorage.getItem(`${CACHE_KEY}_${langCode}`);
      if (cached) return JSON.parse(cached);
    } catch {}

    try {
      const resp = await fetch(`${API_BASE}/api/i18n/${langCode}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const t = data.translations || {};
      try {
        sessionStorage.setItem(`${CACHE_KEY}_${langCode}`, JSON.stringify(t));
      } catch {}
      return t;
    } catch (err) {
      console.warn('[i18n] Failed to fetch translations, using key fallback:', err);
      return {};
    }
  }

  function _applyTranslations() {
    // Apply to data-i18n="key" elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = _translations[key];
      if (!val) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.placeholder !== undefined) el.placeholder = val;
      } else {
        el.textContent = val;
      }
    });

    // Apply to data-i18n-placeholder="key" elements
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = _translations[key];
      if (val) el.placeholder = val;
    });

    // Apply to data-i18n-title="key" elements
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const val = _translations[key];
      if (val) el.title = val;
    });

    // RTL layout support
    if (RTL_LANGS.includes(_currentLang)) {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', _currentLang);
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', _currentLang);
    }

    // Update page <html lang> attribute
    document.documentElement.setAttribute('lang', _currentLang);
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Initialise i18n — call once per page.
   * Loads translations and applies them.
   */
  async function init() {
    _currentLang  = _getLang();
    _translations = await _fetchTranslations(_currentLang);
    _applyTranslations();
    _injectLanguageSelector();
    return _currentLang;
  }

  /**
   * Get a translated string by key.
   * Falls back to the key name if not found.
   */
  function t(key) {
    return _translations[key] || key;
  }

  /**
   * Set a new language and refresh the page's translated elements.
   */
  async function setLanguage(langCode) {
    if (!LANGUAGE_NAMES[langCode]) {
      console.warn('[i18n] Unsupported language code:', langCode);
      return;
    }
    _currentLang = langCode;
    _saveLang(langCode);
    _translations = await _fetchTranslations(langCode);
    _applyTranslations();
    _updateSelectorDisplay();

    // Notify other scripts
    document.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { lang: langCode, name: LANGUAGE_NAMES[langCode] }
    }));
  }

  /** Get current language code */
  function getLanguage() { return _currentLang; }

  /** Get current language name */
  function getLanguageName(code) {
    return LANGUAGE_NAMES[code || _currentLang] || code;
  }

  /**
   * Detect the language of a text string via the API.
   * Returns lang code string.
   */
  async function detect(text) {
    try {
      const resp = await fetch(`${API_BASE}/api/language/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      return data.detected_language || DEFAULT_LANG;
    } catch {
      return DEFAULT_LANG;
    }
  }

  // ── Language Selector Injection ──────────────────────────────────────────
  function _buildDropdownHTML() {
    const indianOptions = INDIAN_LANGS.map(code =>
      `<button class="ng-lang-option ${code === _currentLang ? 'active' : ''}" data-lang="${code}">${LANGUAGE_NAMES[code]}</button>`
    ).join('');
    const intlOptions = INTL_LANGS.map(code =>
      `<button class="ng-lang-option ${code === _currentLang ? 'active' : ''}" data-lang="${code}">${LANGUAGE_NAMES[code]}</button>`
    ).join('');

    return `
      <div class="ng-lang-selector" id="ngLangSelector" aria-label="Language selector">
        <button class="ng-lang-trigger" id="ngLangTrigger" title="Change Language" aria-haspopup="listbox" aria-expanded="false">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span id="ngLangCurrent">${LANGUAGE_NAMES[_currentLang]}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="ng-lang-chevron" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div class="ng-lang-dropdown" id="ngLangDropdown" role="listbox" aria-label="Select language" hidden>
          <div class="ng-lang-group-label">🇮🇳 Indian Languages</div>
          ${indianOptions}
          <div class="ng-lang-divider"></div>
          <div class="ng-lang-group-label">🌐 International</div>
          ${intlOptions}
        </div>
      </div>`;
  }

  function _injectStyles() {
    if (document.getElementById('ng-i18n-styles')) return;
    const style = document.createElement('style');
    style.id = 'ng-i18n-styles';
    style.textContent = `
      .ng-lang-selector {
        position: relative;
        display: inline-flex;
        align-items: center;
        z-index: 1000;
      }
      .ng-lang-trigger {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px 6px 10px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.05);
        color: #94a3b8;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
        white-space: nowrap;
      }
      .ng-lang-trigger:hover {
        background: rgba(37,99,235,0.12);
        border-color: rgba(37,99,235,0.3);
        color: #3b82f6;
      }
      .ng-lang-chevron { transition: transform 0.2s ease; }
      .ng-lang-trigger[aria-expanded="true"] .ng-lang-chevron { transform: rotate(180deg); }
      .ng-lang-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        min-width: 220px;
        max-height: 340px;
        overflow-y: auto;
        background: #0f172a;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(37,99,235,0.15);
        padding: 8px;
        animation: ngDropIn 0.15s ease;
      }
      .ng-lang-dropdown::-webkit-scrollbar { width: 4px; }
      .ng-lang-dropdown::-webkit-scrollbar-track { background: transparent; }
      .ng-lang-dropdown::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      @keyframes ngDropIn {
        from { opacity: 0; transform: translateY(-6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .ng-lang-group-label {
        font-size: 0.65rem;
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 6px 8px 4px;
      }
      .ng-lang-divider {
        height: 1px;
        background: rgba(255,255,255,0.06);
        margin: 6px 0;
      }
      .ng-lang-option {
        display: block;
        width: 100%;
        text-align: left;
        padding: 8px 10px;
        border: none;
        border-radius: 7px;
        background: transparent;
        color: #94a3b8;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
        font-family: inherit;
      }
      .ng-lang-option:hover {
        background: rgba(37,99,235,0.1);
        color: #e2e8f0;
      }
      .ng-lang-option.active {
        background: rgba(37,99,235,0.15);
        color: #60a5fa;
        font-weight: 700;
      }
      /* Detected language badge in chat */
      .ng-lang-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.65rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 9999px;
        background: rgba(37,99,235,0.12);
        color: #60a5fa;
        border: 1px solid rgba(37,99,235,0.2);
        margin-left: 6px;
        vertical-align: middle;
      }
    `;
    document.head.appendChild(style);
  }

  function _injectLanguageSelector() {
    _injectStyles();
    const mountPoint = document.getElementById('ngLangMount');
    if (!mountPoint) return;
    mountPoint.innerHTML = _buildDropdownHTML();
    _bindSelectorEvents();
  }

  function _updateSelectorDisplay() {
    const current = document.getElementById('ngLangCurrent');
    if (current) current.textContent = LANGUAGE_NAMES[_currentLang];
    document.querySelectorAll('.ng-lang-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === _currentLang);
    });
  }

  function _bindSelectorEvents() {
    const trigger  = document.getElementById('ngLangTrigger');
    const dropdown = document.getElementById('ngLangDropdown');
    if (!trigger || !dropdown) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !dropdown.hidden;
      dropdown.hidden = isOpen;
      trigger.setAttribute('aria-expanded', !isOpen);
    });

    dropdown.addEventListener('click', async (e) => {
      const btn = e.target.closest('.ng-lang-option');
      if (!btn) return;
      dropdown.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      await setLanguage(btn.dataset.lang);
    });

    document.addEventListener('click', () => {
      if (!dropdown.hidden) {
        dropdown.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    // Keyboard nav
    trigger.addEventListener('keydown', e => {
      if (e.key === 'Escape') { dropdown.hidden = true; trigger.setAttribute('aria-expanded','false'); }
    });
  }

  // ── Public surface ───────────────────────────────────────────────────────
  return {
    init,
    t,
    setLanguage,
    getLanguage,
    getLanguageName,
    detect,
    LANGUAGE_NAMES,
    INDIAN_LANGS,
    INTL_LANGS,
  };
})();

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
  I18n.init();
}
