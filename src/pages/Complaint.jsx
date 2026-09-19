import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { submitIncidentReport } from '../services/api';

export function Complaint() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [alertInfo, setAlertInfo] = useState({ msg: '', type: 'error' });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const showAlert = (msg, type = 'error') => {
    setAlertInfo({ msg, type });
    if (type === 'error') {
      setTimeout(() => setAlertInfo({ msg: '', type: 'error' }), 4000);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullname || !email || !phone || !incidentType || !description) {
      showAlert('Please complete all required fields.');
      return;
    }

    if (files.length === 0) {
      showAlert('Please upload at least one evidence screenshot.');
      return;
    }

    const formData = new FormData();
    formData.append('fullname', fullname);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('incident_type', incidentType);
    formData.append('description', description);

    files.forEach((file) => {
      formData.append('screenshot', file);
    });

    setLoading(true);
    try {
      const { ok } = await submitIncidentReport(formData);
      setLoading(false);

      if (ok) {
        showAlert('Incident reported successfully. Cyber team has been notified.', 'success');
        setTimeout(() => {
          navigate('/?from=complaint');
        }, 1800);
      } else {
        showAlert('Failed to submit incident. Please try again.');
      }
    } catch {
      setLoading(false);
      showAlert('Server error. Please try again later.');
    }
  };

  return (
    <div className="page-auth">
      <div className="bg-canvas" aria-hidden="true">
        <div className="bg-grid"></div>
        <div className="bg-blob bg-blob--blue"></div>
        <div className="bg-blob bg-blob--cyan"></div>
      </div>

      <div className="auth-card auth-card--wide">
        <div className="card-header">
          <div className="header-icon">🚨</div>
          <div>
            <div className="header-title">Report a Problem</div>
            <div className="header-sub">We will keep your info safe</div>
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(6,182,212,0.08) 100%)',
            border: '1px solid rgba(37,99,235,0.2)',
            borderRadius: '16px',
            padding: '1.1rem 1.4rem',
            margin: '1.25rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                color: '#fff',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              🎙️
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                Prefer speaking?
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                Talk directly with our Voice Assistant step-by-step.
              </div>
            </div>
          </div>
          <Link
            to="/voice-complaint"
            style={{
              background: '#2563eb',
              color: '#ffffff',
              padding: '0.55rem 1.1rem',
              borderRadius: '10px',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '0.88rem',
              whiteSpace: 'nowrap'
            }}
          >
            Try Voice →
          </Link>
        </div>

        {alertInfo.msg && (
          <div className={`alert ${alertInfo.type} show`}>{alertInfo.msg}</div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="input-box">
            <label className="input-label" htmlFor="fullname">Full Name</label>
            <div className="input-inner">
              <i className="fas fa-user input-icon" aria-hidden="true"></i>
              <input
                type="text"
                id="fullname"
                placeholder="John Doe"
                required
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>
          </div>

          <div className="input-box">
            <label className="input-label" htmlFor="email">Email Address</label>
            <div className="input-inner">
              <i className="fas fa-envelope input-icon" aria-hidden="true"></i>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-box">
            <label className="input-label" htmlFor="phone">Phone Number</label>
            <div className="input-inner">
              <i className="fas fa-phone input-icon" aria-hidden="true"></i>
              <input
                type="tel"
                id="phone"
                placeholder="+91 XXXXX XXXXX"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="input-box">
            <label className="input-label" htmlFor="incident_type">What kind of problem?</label>
            <div className="input-inner" style={{ position: 'relative' }}>
              <i className="fas fa-shield-alt input-icon" aria-hidden="true"></i>
              <select
                id="incident_type"
                required
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
              >
                <option value="" disabled>Select problem type…</option>
                <option value="Online Fraud">💸 Online Fraud / Money Lost</option>
                <option value="Phishing">🎣 Phishing Email / Fake Message</option>
                <option value="Hacking Attempt">💻 Hacking / Account Stolen</option>
                <option value="Identity Theft">🆔 Identity Theft</option>
                <option value="Malware / Virus">🦠 Virus / Phone Hacked</option>
                <option value="Cyber Bullying">😰 Online Bullying / Harassment</option>
                <option value="Other">❓ Other Problem</option>
              </select>
              <i className="fas fa-chevron-down select-arrow" aria-hidden="true"></i>
            </div>
          </div>

          <div className="input-box">
            <label className="input-label" htmlFor="description">What happened?</label>
            <div className="input-inner">
              <i className="fas fa-file-alt input-icon" style={{ top: '18px', transform: 'none' }} aria-hidden="true"></i>
              <textarea
                id="description"
                placeholder="Tell us what happened…"
                required
                style={{ paddingLeft: '42px' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="input-box">
            <label className="input-label">Add Photos / Screenshots</label>
            <div className="file-upload-area" id="dropZone">
              <input
                type="file"
                accept="image/*"
                multiple
                required
                id="fileInput"
                onChange={handleFileChange}
              />
              <div className="file-upload-icon">📷</div>
              <div className="file-upload-text">
                {files.length > 0
                  ? `${files.length} photo${files.length > 1 ? 's' : ''} selected`
                  : 'Tap to add photos'}
              </div>
              <div className="file-upload-sub">Photos up to 10MB</div>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Sending Report…' : 'Send Report'}
          </button>
        </form>

        <Link to="/" className="back-link">
          ← Go Back
        </Link>
      </div>
    </div>
  );
}
