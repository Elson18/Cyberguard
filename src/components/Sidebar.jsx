import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

export function Sidebar({ onNewSession, activePage = 'dashboard' }) {
  const { username, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const avatarLetter = username ? username[0].toUpperCase() : 'E';

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
          <span>AI-powered cyber protection</span>
        </div>
      </div>

      <div className="status-bar">
        <span className="status-dot"></span>
        <span className="status-text">Protection active</span>
      </div>

      {onNewSession && (
        <button className="btn-new" onClick={onNewSession} type="button">
          {t('sidebar_new_session', '+ New Session')}
        </button>
      )}

      <nav className="sidebar-nav" aria-label="Main navigation">
        <NavLink
          to="/"
          className={({ isActive }) => `sidebar-nav__link ${isActive && activePage === 'dashboard' ? 'is-active' : ''}`}
        >
          <i className="fa-solid fa-gauge-high"></i>
          <span>{t('nav_dashboard', 'Overview')}</span>
        </NavLink>

        <NavLink
          to="/extension"
          className={({ isActive }) => `sidebar-nav__link ${isActive ? 'is-active' : ''}`}
        >
          <i className="fa-solid fa-puzzle-piece"></i>
          <span>{t('nav_extension_short', 'Extension')}</span>
        </NavLink>

        <NavLink
          to="/email-verification"
          className={({ isActive }) => `sidebar-nav__link ${isActive ? 'is-active' : ''}`}
        >
          <i className="fa-solid fa-envelope-circle-check"></i>
          <span>{t('nav_email_verification', 'Email Verification')}</span>
        </NavLink>

        <NavLink
          to="/voice-complaint"
          className={({ isActive }) => `sidebar-nav__link ${isActive ? 'is-active' : ''}`}
        >
          <i className="fa-solid fa-microphone"></i>
          <span>AI Voice Assistant</span>
        </NavLink>

        <NavLink
          to="/complaint"
          className={({ isActive }) => `sidebar-nav__link ${isActive ? 'is-active' : ''}`}
        >
          <i className="fa-solid fa-file-circle-exclamation"></i>
          <span>{t('nav_complaint', 'File Complaint')}</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-nav__link ${isActive ? 'is-active' : ''}`}
        >
          <i className="fa-solid fa-gear"></i>
          <span>{t('nav_settings', 'Settings')}</span>
        </NavLink>
      </nav>

      <div className="sidebar-panel">
        <div className="sidebar-panel-title">{t('sidebar_system_status', 'System Status')}</div>
        <div className="sidebar-stat">
          <span>RAG Engine</span>
          <span className="online">● Online</span>
        </div>
        <div className="sidebar-stat">
          <span>AI Model</span>
          <span className="online">● Active</span>
        </div>
        <div className="sidebar-stat">
          <span>Threat DB</span>
          <span className="online">● Synced</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-row">
          <div className="user-info">
            <div className="user-avatar">{avatarLetter}</div>
            <div>
              <div className="user-name">{username || 'Elson'}</div>
              <div className="user-label">● Active</div>
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
