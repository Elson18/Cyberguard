import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

export function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const showAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim() || !password) {
      showAlert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const { ok, status, data } = await loginUser(identifier.trim(), password);
      setLoading(false);

      if (ok && status === 200) {
        login(identifier.trim(), data.user_id);
        navigate('/');
      } else if (status === 404) {
        showAlert('User not found. Please create an account.');
        setTimeout(() => navigate('/signin'), 1500);
      } else {
        showAlert(data.detail || 'Invalid credentials');
      }
    } catch {
      setLoading(false);
      showAlert('Server error. Please try again.');
    }
  };

  return (
    <div className="page-auth">
      <div className="bg-canvas" aria-hidden="true">
        <div className="bg-grid"></div>
        <div className="bg-blob bg-blob--blue"></div>
        <div className="bg-blob bg-blob--cyan"></div>
      </div>

      <div className="auth-card">
        <div className="card-logo">
          <div className="logo-icon">CG</div>
          <div className="logo-name">CyberGuard</div>
          <div className="logo-sub">Stay Safe Online</div>
        </div>

        <div className="divider">
          <span>Sign In</span>
        </div>

        {alertMsg && <div className="alert show">{alertMsg}</div>}

        <form onSubmit={handleLogin}>
          <div className="field">
            <label htmlFor="username">Email or Username</label>
            <div className="field-inner">
              <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="text"
                id="username"
                placeholder="Your name or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="field-inner">
              <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type="password"
                id="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : 'Sign In'}
          </button>
        </form>

        <div className="card-footer">
          <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact admin for password reset.'); }}>
            Forgot Password?
          </a>
          <Link to="/signin">
            New here? <span>Sign Up →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
