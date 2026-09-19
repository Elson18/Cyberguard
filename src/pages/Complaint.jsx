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
            <div className="header-title">Cybersecurity Incident Report</div>
            <div className="header-sub">Your report is encrypted and secure</div>
          </div>
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
            <label className="input-label" htmlFor="incident_type">Type of Cyber Incident</label>
            <div className="input-inner" style={{ position: 'relative' }}>
              <i className="fas fa-shield-alt input-icon" aria-hidden="true"></i>
              <select
                id="incident_type"
                required
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
              >
                <option value="" disabled>Select incident type…</option>
                <option value="Online Fraud">Online Fraud</option>
                <option value="Phishing">Phishing</option>
                <option value="Hacking Attempt">Hacking Attempt</option>
                <option value="Identity Theft">Identity Theft</option>
                <option value="Malware / Virus">Malware / Virus</option>
                <option value="Cyber Bullying">Cyber Bullying</option>
                <option value="Other">Other</option>
              </select>
              <i className="fas fa-chevron-down select-arrow" aria-hidden="true"></i>
            </div>
          </div>

          <div className="input-box">
            <label className="input-label" htmlFor="description">Incident Description</label>
            <div className="input-inner">
              <i className="fas fa-file-alt input-icon" style={{ top: '18px', transform: 'none' }} aria-hidden="true"></i>
              <textarea
                id="description"
                placeholder="Describe the incident in detail…"
                required
                style={{ paddingLeft: '42px' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="input-box">
            <label className="input-label">Upload Evidence (Screenshots)</label>
            <div className="file-upload-area" id="dropZone">
              <input
                type="file"
                accept="image/*"
                multiple
                required
                id="fileInput"
                onChange={handleFileChange}
              />
              <div className="file-upload-icon">📎</div>
              <div className="file-upload-text">
                {files.length > 0
                  ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
                  : 'Click to upload or drag & drop'}
              </div>
              <div className="file-upload-sub">PNG, JPG, GIF up to 10MB</div>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Submitting Report…' : 'Report Incident'}
          </button>
        </form>

        <Link to="/" className="back-link">
          ← Back to Chat
        </Link>
      </div>
    </div>
  );
}
