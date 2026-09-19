import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { LanguageSelector } from '../components/LanguageSelector';
import { useAuth } from '../context/AuthContext';
import { useI18n, LANGUAGE_NAMES, INDIAN_LANGS, INTL_LANGS } from '../context/I18nContext';

export function Settings() {
  const { username, userId } = useAuth();
  const { t, lang, setLanguage, getLanguageName } = useI18n();

  const [selectedLang, setSelectedLang] = useState(lang);
  const [langSaved, setLangSaved] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [twoFactor, setTwoFactor] = useState(() => localStorage.getItem('2fa') === 'true');
  const [biometric, setBiometric] = useState(() => localStorage.getItem('biometric') === 'true');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [sessions, setSessions] = useState([
    { id: '1', device: 'Chrome on Windows 11', location: 'Coimbatore, TN', ip: '192.168.1.45', isCurrent: true, icon: 'desktop' },
    { id: '2', device: 'CyberGuard Extension', location: 'Active Tab Scanner', ip: '192.168.1.45', isCurrent: false, icon: 'puzzle' },
  ]);

  const avatarLetter = username ? username[0].toUpperCase() : 'U';

  const handleSaveLanguage = () => {
    setLanguage(selectedLang);
    setLangSaved(true);
    setTimeout(() => setLangSaved(false), 2500);
  };

  const handle2FAToggle = (e) => {
    const val = e.target.checked;
    setTwoFactor(val);
    localStorage.setItem('2fa', val);
  };

  const handleBiometricToggle = (e) => {
    const val = e.target.checked;
    setBiometric(val);
    localStorage.setItem('biometric', val);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    alert('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleRemoveSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="app page-settings">
      <div className="bg-canvas" aria-hidden="true">
        <div className="bg-grid"></div>
        <div className="bg-blob bg-blob--blue"></div>
        <div className="bg-blob bg-blob--cyan"></div>
        <div className="bg-blob bg-blob--emerald"></div>
      </div>

      <Sidebar activePage="settings" />

      <main className="main">
        <div className="main-header">
          <div>
            <div className="main-title">{t('settings_title', 'Security Settings')}</div>
            <div className="main-subtitle">
              {t('settings_subtitle', 'Manage your profile identity, regional localization, authentication standards, and active sessions.')}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LanguageSelector />
            <div className="tag" style={{ background: 'rgba(37, 99, 235, 0.08)', color: 'var(--primary)', border: '1px solid rgba(37, 99, 235, 0.18)', fontWeight: 600 }}>
              Account Active
            </div>
          </div>
        </div>

        <div className="settings-scroll" style={{ padding: '24px 32px' }}>
          <div className="settings-grid" style={{ maxWidth: '960px' }}>

            {/* User Profile Card */}
            <section className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-header__icon">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="settings-card__title">User Profile</h3>
                  <p className="settings-card__sub">Account identity and access authorization.</p>
                </div>
              </div>

              <div className="settings-profile">
                <div className="settings-profile__avatar">
                  {avatarLetter}
                </div>
                <div>
                  <div className="settings-profile__name">{username || 'elsonaron24@gmail.com'}</div>
                  <div className="settings-profile__meta">ID: {userId || 'USER-F6FD2100'} · Primary Account</div>
                  <div className="settings-role">
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                    Full Protection Active
                  </div>
                </div>
              </div>
            </section>

            {/* Language Preferences Card */}
            <section className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-header__icon">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <div>
                  <h3 className="settings-card__title">Language & Localization</h3>
                  <p className="settings-card__sub">Select your preferred system display language.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="settings-select"
                >
                  <optgroup label="🇮🇳 Indian Languages">
                    {INDIAN_LANGS.map((code) => (
                      <option key={code} value={code}>{LANGUAGE_NAMES[code]}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🌐 International Languages">
                    {INTL_LANGS.map((code) => (
                      <option key={code} value={code}>{LANGUAGE_NAMES[code]}</option>
                    ))}
                  </optgroup>
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn-settings btn-settings--primary"
                    onClick={handleSaveLanguage}
                  >
                    Save Language
                  </button>

                  {langSaved && (
                    <span style={{ color: '#059669', fontSize: '0.8125rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Saved ({getLanguageName(selectedLang)})
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* Theme Aesthetic Card */}
            <section className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-header__icon">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-23" />
                  </svg>
                </div>
                <div>
                  <h3 className="settings-card__title">Theme Aesthetic</h3>
                  <p className="settings-card__sub">Choose visual glassmorphism style for interface.</p>
                </div>
              </div>

              <div className="settings-theme-chips">
                {[
                  { id: 'dark', label: 'Dark Glass' },
                  { id: 'cyan', label: 'Cyan Glass' },
                  { id: 'emerald', label: 'Emerald Glass' }
                ].map((tItem) => (
                  <button
                    key={tItem.id}
                    type="button"
                    className={`settings-theme-chip ${theme === tItem.id ? 'is-active' : ''}`}
                    onClick={() => setTheme(tItem.id)}
                  >
                    {tItem.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Security Settings & Toggles Card */}
            <section className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-header__icon">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="settings-card__title">Security Authentication</h3>
                  <p className="settings-card__sub">Configure multi-factor and biometric security locks.</p>
                </div>
              </div>

              <div className="settings-toggle-list">
                <div className="settings-toggle">
                  <div className="settings-toggle__label">
                    <strong>Two-Factor Authentication (2FA)</strong>
                    <span>Require TOTP verification code on login attempts</span>
                  </div>
                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      checked={twoFactor}
                      onChange={handle2FAToggle}
                    />
                    <span className="settings-switch__slider"></span>
                  </label>
                </div>

                <div className="settings-toggle" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <div className="settings-toggle__label">
                    <strong>Biometric Login</strong>
                    <span>Use Windows Hello, Touch ID, or FIDO2 key</span>
                  </div>
                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      checked={biometric}
                      onChange={handleBiometricToggle}
                    />
                    <span className="settings-switch__slider"></span>
                  </label>
                </div>
              </div>
            </section>

            {/* Change Password Card */}
            <section className="settings-card" style={{ gridColumn: 'span 2' }}>
              <div className="settings-card-header">
                <div className="settings-card-header__icon">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="settings-card__title">Change Password</h3>
                  <p className="settings-card__sub">Update account access credentials.</p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit}>
                <div className="settings-fields">
                  <div className="settings-field">
                    <label>Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="settings-field">
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="settings-field">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="settings-actions">
                  <button type="submit" className="btn-settings btn-settings--primary">
                    Update Password
                  </button>
                </div>
              </form>
            </section>

            {/* Active Sessions Card */}
            <section className="settings-card" style={{ gridColumn: 'span 2' }}>
              <div className="settings-card-header">
                <div className="settings-card-header__icon">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="settings-card__title">Active Connected Sessions</h3>
                  <p className="settings-card__sub">Devices currently authenticated to your CyberGuard identity.</p>
                </div>
              </div>

              <div className="settings-session-list">
                {sessions.map((s) => (
                  <div key={s.id} className="settings-session-item">
                    <div className="settings-session-info">
                      <div className="settings-session-icon">
                        {s.icon === 'desktop' ? (
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>
                          {s.device}
                          {s.isCurrent && (
                            <span className="settings-session-badge">
                              ● Current Session
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {s.location} · {s.ip}
                        </div>
                      </div>
                    </div>

                    {!s.isCurrent && (
                      <button
                        type="button"
                        className="btn-settings btn-settings--ghost"
                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.04)', fontSize: '0.75rem', padding: '6px 12px' }}
                        onClick={() => handleRemoveSession(s.id)}
                      >
                        Terminate Session
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
