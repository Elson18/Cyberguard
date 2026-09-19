import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

export function Sidebar({ onNewSession, activePage = 'dashboard' }) {
  const { username, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const avatarLetter = username ? username[0].toUpperCase() : 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="logo-wrap">
        <div className="logo-icon">CG</div>
        <div className="logo-text">
          <strong>CyberGuard</strong>
        </div>
      </div>

      <div className="status-bar">
        <span className="status-dot"></span>
        <span className="status-text">Protected ✓</span>
      </div>

      {onNewSession && (
        <button className="btn-new" onClick={onNewSession} type="button">
          {t('sidebar_new_session', '＋ New Chat')}
        </button>
      )}

      <nav className="sidebar-nav" aria-label="Main navigation">
        <NavLink
          to="/"
          className={({ isActive }) => `sidebar-nav__link ${isActive && activePage === 'dashboard' ? 'is-active' : ''}`}
        >
          <i className="fa-solid fa-house"></i>
          <span>{t('nav_dashboard', 'Home')}</span>
        </NavLink>

        <NavLink
          to="/extension"
          className={({ isActive }) => `sidebar-nav__link ${isActive ? 'is-active' : ''}`}
        >
          <i className="fa-solid fa-shield-halved"></i>
          <span>{t('nav_extension_short', 'Browser Protection')}</span>
        </NavLink>

        <NavLink
          to="/email-verification"
          className={({ isActive }) => `sidebar-nav__link ${isActive ? 'is-active' : ''}`}
        >
          <i className="fa-solid fa-envelope-open-text"></i>
          <span>{t('nav_email_verification', 'Check Email')}</span>
        </NavLink>

        <NavLink
          to="/voice-complaint"
          className={({ isActive }) => `sidebar-nav__link ${isActive ? 'is-active' : ''}`}
        >
          <i className="fa-solid fa-microphone"></i>
          <span>Voice Help</span>
        </NavLink>

        <NavLink
          to="/complaint"
          className={({ isActive }) => `sidebar-nav__link ${isActive ? 'is-active' : ''}`}
        >
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>{t('nav_complaint', 'Report Problem')}</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-nav__link ${isActive ? 'is-active' : ''}`}
        >
          <i className="fa-solid fa-gear"></i>
          <span>{t('nav_settings', 'Settings')}</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-row">
          <div className="user-info">
            <div className="user-avatar">{avatarLetter}</div>
            <div>
              <div className="user-name">{username || 'User'}</div>
              <div className="user-label">Online</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout} type="button" title="Sign Out">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
