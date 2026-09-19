import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

export function Signin() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [alertInfo, setAlertInfo] = useState({ msg: '', type: 'error' });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const showAlert = (msg, type = 'error') => {
    setAlertInfo({ msg, type });
    setTimeout(() => setAlertInfo({ msg: '', type: 'error' }), 4000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !phoneNo || !password || !rePassword) {
      showAlert('All fields are required');
      return;
    }
    if (password !== rePassword) {
      showAlert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { ok, status, data } = await registerUser({
        name,
        email,
        phone_no: phoneNo,
        password,
        re_password: rePassword,
      });
      setLoading(false);

      if (ok || status === 200 || status === 201) {
        showAlert('Registration successful! Redirecting…', 'success');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        showAlert(data.detail || 'Registration failed');
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
        <div className="bg-blob bg-blob--emerald"></div>
      </div>

      <div className="auth-card">
        <div className="card-logo">
          <div className="logo-icon">CG</div>
          <div className="logo-name">CyberGuard</div>
          <div className="logo-sub">Create your secure account</div>
        </div>

        <div className="divider">
          <span>Registration</span>
        </div>

        {alertInfo.msg && (
          <div className={`alert ${alertInfo.type} show`}>{alertInfo.msg}</div>
        )}

        <form onSubmit={handleRegister}>
          <div className="field">
            <label htmlFor="name">Username</label>
            <div className="field-inner">
              <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="text"
                id="name"
                placeholder="Choose a username…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <div className="field-inner">
              <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="phone_no">Mobile Number</label>
            <div className="field-inner">
              <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <input
                type="text"
                id="phone_no"
                placeholder="+91 XXXXX XXXXX"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                autoComplete="tel"
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
                placeholder="Create a strong password…"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="re_password">Confirm Password</label>
            <div className="field-inner">
              <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <input
                type="password"
                id="re_password"
                placeholder="Repeat password…"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button className="btn-signup" type="submit" disabled={loading}>
            {loading ? 'Creating Account…' : 'Create Account →'}
          </button>
        </form>

        <div className="card-footer">
          <Link to="/login">
            Already have an account? <span>Login →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
