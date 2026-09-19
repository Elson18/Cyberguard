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
    { id: '1', device: 'Chrome on Windows 11', location: 'Chennai, TN', ip: '192.168.1.45', isCurrent: true },
    { id: '2', device: 'CyberGuard Extension', location: 'Active Tab Scanner', ip: '192.168.1.45', isCurrent: false },
  ]);

  const avatarLetter = username ? username[0].toUpperCase() : 'U';

  const handleSaveLanguage = () => {
    setLanguage(selectedLang);
    setLangSaved(true);
    setTimeout(() => setLangSaved(false), 2500);
  };

  const handle2FADoggle = (e) => {
    const val = e.target.checked;
    setTwoFactor(val);
    localStorage.setItem('2fa', val);
    alert(val ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled');
  };

  const handleBiometricToggle = (e) => {
    const val = e.target.checked;
    setBiometric(val);
    localStorage.setItem('biometric', val);
    alert(val ? 'Biometric Authentication Enabled' : 'Biometric Authentication Disabled');
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
    alert('Session terminated.');
  };

  return (
    <div className="app">
      <div className="bg-canvas" aria-hidden="true">
        <div className="bg-grid"></div>
        <div className="bg-blob bg-blob--blue"></div>
        <div className="bg-blob bg-blob--cyan"></div>
        <div className="bg-blob bg-blob--emerald"></div>
      </div>

      <Sidebar activePage="settings" />

      <main className="main" style={{ overflowY: 'auto' }}>
        <div className="main-header">
          <div>
            <div className="main-title">{t('settings_title', 'Security Settings')}</div>
            <div className="main-subtitle">
              {t('settings_subtitle', 'Manage your profile, notifications, and security preferences.')}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LanguageSelector />
            <div className="tag">Account</div>
          </div>
        </div>

        <div className="settings-scroll" style={{ padding: '24px 32px' }}>
          <div className="settings-grid" style={{ display: 'grid', gap: '24px', maxWidth: '900px' }}>
            {/* Profile Section */}
            <section className="settings-card" style={{ background: 'rgba(15,23,42,0.6)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '4px' }}>User Profile</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Account identity and access level.</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="user-avatar" style={{ width: '56px', height: '56px', fontSize: '1.4rem' }}>
                  {avatarLetter}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{username || 'Anonymous User'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>ID: {userId || 'N/A'} · Primary account</div>
                </div>
              </div>
            </section>

            {/* Language Preferences Section */}
            <section className="settings-card" style={{ background: 'rgba(15,23,42,0.6)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '4px' }}>Language & Localization</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Select your preferred interface language.</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  style={{
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '0.9rem',
                  }}
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

                <button
                  type="button"
                  className="btn-login"
                  onClick={handleSaveLanguage}
                  style={{ width: 'auto', padding: '10px 20px', fontSize: '0.85rem' }}
                >
                  Save Language
                </button>

                {langSaved && (
                  <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                    ✓ Saved! ({getLanguageName(selectedLang)})
                  </span>
                )}
              </div>
            </section>

            {/* Theme Preference Section */}
            <section className="settings-card" style={{ background: 'rgba(15,23,42,0.6)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '4px' }}>Theme Options</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Choose your visual aesthetic.</p>

              <div style={{ display: 'flex', gap: '12px' }}>
                {['dark', 'cyan', 'emerald'].map((tName) => (
                  <button
                    key={tName}
                    type="button"
                    onClick={() => setTheme(tName)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: theme === tName ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                      background: theme === tName ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {tName} Glassmorphism
                  </button>
                ))}
              </div>
            </section>

            {/* Authentication & Security Toggles */}
            <section className="settings-card" style={{ background: 'rgba(15,23,42,0.6)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '16px' }}>Security Settings</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>Two-Factor Authentication (2FA)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Require verification code on new logins</div>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={handle2FADoggle}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>Biometric Login</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Use Windows Hello / Touch ID</div>
                </div>
                <input
                  type="checkbox"
                  checked={biometric}
                  onChange={handleBiometricToggle}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>
            </section>

            {/* Password Update Form */}
            <section className="settings-card" style={{ background: 'rgba(15,23,42,0.6)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '16px' }}>Change Password</h3>
              <form onSubmit={handlePasswordSubmit}>
                <div className="field" style={{ marginBottom: '12px' }}>
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password…"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', width: '100%' }}
                  />
                </div>
                <div className="field" style={{ marginBottom: '12px' }}>
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password…"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', width: '100%' }}
                  />
                </div>
                <div className="field" style={{ marginBottom: '16px' }}>
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password…"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', width: '100%' }}
                  />
                </div>
                <button type="submit" className="btn-login" style={{ width: 'auto', padding: '10px 24px', fontSize: '0.85rem' }}>
                  Update Password
                </button>
              </form>
            </section>

            {/* Active Sessions */}
            <section className="settings-card" style={{ background: 'rgba(15,23,42,0.6)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '16px' }}>Active Sessions</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.03)',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                        {s.device} {s.isCurrent && <span style={{ color: '#10b981', fontSize: '0.75rem', marginLeft: '6px' }}>(Current Session)</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {s.location} · {s.ip}
                      </div>
                    </div>
                    {!s.isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSession(s.id)}
                        style={{
                          background: 'rgba(239,68,68,0.12)',
                          color: '#ef4444',
                          border: '1px solid rgba(239,68,68,0.3)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        Terminate
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
