import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useI18n } from '../context/I18nContext';
import { verifyEmail } from '../services/api';

export function EmailVerification() {
  const { t } = useI18n();

  const [formData, setFormData] = useState({
    sender_name: '',
    sender_email: '',
    company_name: '',
    official_domain: '',
    subject: '',
    email_body: '',
    reply_to: '',
    return_path: '',
    spf: 'UNKNOWN',
    dkim: 'UNKNOWN',
    dmarc: 'UNKNOWN',
    urls_raw: '',
    offer_letter_text: '',
    signature: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [result, setResult] = useState(null);
  const [copiedUrlIndex, setCopiedUrlIndex] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.sender_email.trim()) {
      newErrors.sender_email = 'Please enter the sender email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sender_email.trim())) {
      newErrors.sender_email = 'Please enter a valid email address.';
    }

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Please enter the claimed company name.';
    }

    if (!formData.official_domain.trim()) {
      newErrors.official_domain = 'Please enter the official company domain.';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please enter the email subject line.';
    }

    if (!formData.email_body.trim()) {
      newErrors.email_body = 'Please paste the email content.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsLoading(true);

    const urls = formData.urls_raw
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const payload = {
      sender_name: formData.sender_name.trim(),
      sender_email: formData.sender_email.trim(),
      company_name: formData.company_name.trim(),
      official_domain: formData.official_domain.trim(),
      subject: formData.subject.trim(),
      email_body: formData.email_body.trim(),
      reply_to: formData.reply_to.trim(),
      return_path: formData.return_path.trim(),
      spf: formData.spf,
      dkim: formData.dkim,
      dmarc: formData.dmarc,
      urls,
      offer_letter_text: formData.offer_letter_text.trim(),
      signature: formData.signature.trim(),
    };

    try {
      const response = await verifyEmail(payload);
      setIsLoading(false);

      if (response.ok && response.data && response.data.result) {
        setResult(response.data.result);
        const resultSection = document.getElementById('verification-result');
        if (resultSection) {
          resultSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        const errorMsg =
          (response.data && response.data.detail) ||
          'CyberGuard could not verify this email right now. Please try again.';
        setApiError(errorMsg);
      }
    } catch (err) {
      setIsLoading(false);
      setApiError('CyberGuard could not verify this email right now. Please check your network connection and try again.');
    }
  };

  const handleCopyUrl = (url, index) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlIndex(index);
    setTimeout(() => setCopiedUrlIndex(null), 2500);
  };

  const getRiskLabel = (score) => {
    if (score <= 20) return { label: 'VERY LOW', color: '#047857', bg: '#ecfdf5' };
    if (score <= 40) return { label: 'LOW', color: '#047857', bg: '#ecfdf5' };
    if (score <= 60) return { label: 'MODERATE', color: '#b45309', bg: '#fef3c7' };
    if (score <= 80) return { label: 'HIGH', color: '#c2410c', bg: '#ffedd5' };
    return { label: 'CRITICAL', color: '#b91c1c', bg: '#fef2f2' };
  };

  const getStatusBadge = (classification) => {
    switch (classification) {
      case 'AUTHORIZED':
        return {
          icon: '🟢',
          title: 'AUTHORIZED',
          class: 'status-auth-authorized',
          desc: 'The available evidence indicates that this email appears to come from an authorized company source.',
        };
      case 'SUSPICIOUS':
        return {
          icon: '🟠',
          title: 'SUSPICIOUS',
          class: 'status-auth-suspicious',
          desc: 'CyberGuard found warning signs that require additional verification.',
        };
      case 'UNAUTHORIZED':
      default:
        return {
          icon: '🔴',
          title: 'UNAUTHORIZED',
          class: 'status-auth-unauthorized',
          desc: 'CyberGuard found strong indicators that this sender may not be authorized to represent the claimed company.',
        };
    }
  };

  return (
    <div className="app app-clean">
      <Sidebar activePage="email-verification" />

      <main className="main-viewport">
        {/* TOP BAR */}
        <header className="top-bar">
          <div className="top-bar-title">Email Verification</div>
          <div className="top-bar-meta">
            <span className="status-indicator">
              <span className="dot-green"></span> Verification Engine Active
            </span>
            <span className="ver-tag">v1.0.0</span>
          </div>
        </header>

        <div className="saas-container">
          {/* PAGE HEADER */}
          <section className="ev-header-section">
            <div className="ev-eyebrow">
              <i className="fa-solid fa-shield-halved"></i> EMAIL SECURITY ENGINE
            </div>
            <h1 className="ev-title">EMAIL VERIFICATION</h1>
            <p className="ev-subtitle">
              Check whether a job offer email appears to come from an authorized company representative.
            </p>
            <div className="ev-info-callout">
              <i className="fa-solid fa-circle-info"></i>
              <span>
                CyberGuard analyzes the sender, company domain, email authentication, links, and message content to identify potential recruitment scams.
              </span>
            </div>
          </section>

          {/* INPUT FORM CARD */}
          <section className="saas-panel ev-form-panel">
            <div className="ev-form-header">
              <h2><i className="fa-solid fa-envelope-open-text"></i> Check an Email</h2>
              <p>Enter the email headers and body content to run AI security triage.</p>
            </div>

            {apiError && (
              <div className="ev-alert ev-alert-error" role="alert">
                <i className="fa-solid fa-triangle-exclamation"></i> {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="ev-form-grid">
              <div className="form-group">
                <label htmlFor="sender_name">Sender Name</label>
                <input
                  type="text"
                  id="sender_name"
                  name="sender_name"
                  value={formData.sender_name}
                  onChange={handleChange}
                  placeholder="Example: John Smith"
                  className="ev-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="sender_email">
                  Sender Email <span className="req">*</span>
                </label>
                <input
                  type="email"
                  id="sender_email"
                  name="sender_email"
                  value={formData.sender_email}
                  onChange={handleChange}
                  placeholder="recruiter@company.com"
                  className={`ev-input ${errors.sender_email ? 'has-error' : ''}`}
                />
                {errors.sender_email && <span className="field-err">{errors.sender_email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="company_name">
                  Claimed Company Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Example Technologies"
                  className={`ev-input ${errors.company_name ? 'has-error' : ''}`}
                />
                {errors.company_name && <span className="field-err">{errors.company_name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="official_domain">
                  Official Company Domain <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="official_domain"
                  name="official_domain"
                  value={formData.official_domain}
                  onChange={handleChange}
                  placeholder="company.com"
                  className={`ev-input ${errors.official_domain ? 'has-error' : ''}`}
                />
                <span className="field-hint">If you know the company's official website domain, enter it here.</span>
                {errors.official_domain && <span className="field-err">{errors.official_domain}</span>}
              </div>

              <div className="form-group full-width">
                <label htmlFor="subject">
                  Email Subject <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Congratulations! You have been selected"
                  className={`ev-input ${errors.subject ? 'has-error' : ''}`}
                />
                {errors.subject && <span className="field-err">{errors.subject}</span>}
              </div>

              <div className="form-group full-width">
                <label htmlFor="email_body">
                  Email Content / Body <span className="req">*</span>
                </label>
                <textarea
                  id="email_body"
                  name="email_body"
                  rows={6}
                  value={formData.email_body}
                  onChange={handleChange}
                  placeholder="Paste the complete email content here..."
                  className={`ev-textarea ${errors.email_body ? 'has-error' : ''}`}
                ></textarea>
                {errors.email_body && <span className="field-err">{errors.email_body}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="reply_to">Reply-To (Optional)</label>
                <input
                  type="text"
                  id="reply_to"
                  name="reply_to"
                  value={formData.reply_to}
                  onChange={handleChange}
                  placeholder="reply@company.com"
                  className="ev-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="return_path">Return-Path (Optional)</label>
                <input
                  type="text"
                  id="return_path"
                  name="return_path"
                  value={formData.return_path}
                  onChange={handleChange}
                  placeholder="bounce@company.com"
                  className="ev-input"
                />
              </div>

              <div className="form-group-triple full-width">
                <div className="form-group">
                  <label htmlFor="spf">SPF Header</label>
                  <select id="spf" name="spf" value={formData.spf} onChange={handleChange} className="ev-select">
                    <option value="UNKNOWN">UNKNOWN</option>
                    <option value="PASS">PASS</option>
                    <option value="FAIL">FAIL</option>
                    <option value="SOFTFAIL">SOFTFAIL</option>
                    <option value="NONE">NONE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="dkim">DKIM Header</label>
                  <select id="dkim" name="dkim" value={formData.dkim} onChange={handleChange} className="ev-select">
                    <option value="UNKNOWN">UNKNOWN</option>
                    <option value="PASS">PASS</option>
                    <option value="FAIL">FAIL</option>
                    <option value="NONE">NONE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="dmarc">DMARC Header</label>
                  <select id="dmarc" name="dmarc" value={formData.dmarc} onChange={handleChange} className="ev-select">
                    <option value="UNKNOWN">UNKNOWN</option>
                    <option value="PASS">PASS</option>
                    <option value="FAIL">FAIL</option>
                    <option value="NONE">NONE</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="urls_raw">Extracted URLs (Optional - one URL per line)</label>
                <textarea
                  id="urls_raw"
                  name="urls_raw"
                  rows={3}
                  value={formData.urls_raw}
                  onChange={handleChange}
                  placeholder="https://company-careers-example.com/apply&#10;https://forms-example.com/register"
                  className="ev-textarea mono"
                ></textarea>
              </div>

              <div className="form-group full-width">
                <label htmlFor="offer_letter_text">Offer Letter Content (Optional)</label>
                <textarea
                  id="offer_letter_text"
                  name="offer_letter_text"
                  rows={3}
                  value={formData.offer_letter_text}
                  onChange={handleChange}
                  placeholder="Paste text from attached offer letter if available..."
                  className="ev-textarea"
                ></textarea>
              </div>

              <div className="form-group full-width">
                <label htmlFor="signature">Email Signature (Optional)</label>
                <textarea
                  id="signature"
                  name="signature"
                  rows={2}
                  value={formData.signature}
                  onChange={handleChange}
                  placeholder="John Smith, HR Manager, ABC Technologies..."
                  className="ev-textarea"
                ></textarea>
              </div>

              <div className="form-actions full-width">
                <button type="submit" className="btn-saas-primary btn-lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Analyzing email...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-envelope-circle-check"></i> Verify Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* VERIFICATION RESULT SECTION */}
          {result && (
            <section id="verification-result" className="ev-results-container">
              <h2 className="section-main-title"><i className="fa-solid fa-square-poll-vertical"></i> Verification Result</h2>

              {/* STATUS BANNER */}
              {(() => {
                const status = getStatusBadge(result.classification);
                return (
                  <div className={`ev-status-banner ${status.class}`}>
                    <div className="banner-top">
                      <span className="status-badge-icon">{status.icon}</span>
                      <span className="status-badge-title">{status.title}</span>
                    </div>
                    <p className="banner-desc">{status.desc}</p>
                  </div>
                );
              })()}

              {/* RISK SCORE & CONFIDENCE CARD GRID */}
              <div className="ev-metrics-grid">
                <div className="ev-metric-card">
                  <span className="metric-label">Risk Score</span>
                  {(() => {
                    const score = result.risk_score ?? 0;
                    const meta = getRiskLabel(score);
                    return (
                      <div className="metric-val-wrap">
                        <span className="metric-score-num">{score} <span className="score-denom">/ 100</span></span>
                        <span className="risk-level-badge" style={{ color: meta.color, backgroundColor: meta.bg }}>
                          {meta.label} RISK
                        </span>
                      </div>
                    );
                  })()}
                </div>

                <div className="ev-metric-card">
                  <span className="metric-label">Confidence Rating</span>
                  <div className="metric-val-wrap">
                    <span className="metric-score-num">{result.confidence ?? 0}%</span>
                    <span className="confidence-sub">AI Evidence Alignment</span>
                  </div>
                </div>
              </div>

              {/* WHAT CYBERGUARD FOUND (SIMPLE USER MESSAGE) */}
              {result.user_message && (
                <div className="ev-result-card ev-card-highlight">
                  <h3><i className="fa-solid fa-comment-dots"></i> What CyberGuard Found</h3>
                  <p className="simple-msg-text">{result.user_message}</p>
                </div>
              )}

              {/* SENDER VERIFICATION CARD */}
              <div className="ev-result-card">
                <h3><i className="fa-solid fa-user-check"></i> Sender Verification</h3>

                <div className="ev-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Sender Name:</span>
                    <span className="detail-val">{result.sender?.name || formData.sender_name || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Sender Email:</span>
                    <span className="detail-val mono">{result.sender?.email || formData.sender_email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Sender Domain:</span>
                    <span className="detail-val mono">{result.sender?.domain || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Claimed Company:</span>
                    <span className="detail-val">{result.company?.claimed_name || formData.company_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Official Domain:</span>
                    <span className="detail-val mono">{result.company?.official_domain || formData.official_domain}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Domain Match:</span>
                    <span className={`detail-val ${result.company?.domain_match ? 'match-yes' : 'match-no'}`}>
                      {result.company?.domain_match ? '✓ Match (Official)' : '✕ Mismatch'}
                    </span>
                  </div>
                </div>

                {!result.company?.domain_match && (
                  <div className="ev-warning-box">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <div>
                      <strong>Public Email / Mismatch Warning:</strong>
                      <p>
                        Public email providers such as Gmail or Yahoo do not prove fraud by themselves, but they are a significant verification concern when someone claims to represent an established company.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* EMAIL AUTHENTICATION CARD */}
              <div className="ev-result-card">
                <h3><i className="fa-solid fa-shield-cat"></i> Email Authentication</h3>

                <div className="ev-auth-grid">
                  <div className="auth-item">
                    <span className="auth-header">SPF</span>
                    <span className={`auth-badge auth-${(result.authentication?.spf || 'UNKNOWN').toLowerCase()}`}>
                      {result.authentication?.spf === 'PASS' && '✓ PASS'}
                      {result.authentication?.spf === 'FAIL' && '✕ FAIL'}
                      {result.authentication?.spf === 'SOFTFAIL' && '⚠ SOFTFAIL'}
                      {(result.authentication?.spf === 'NONE' || result.authentication?.spf === 'UNKNOWN' || !result.authentication?.spf) && '⚪ UNKNOWN'}
                    </span>
                  </div>

                  <div className="auth-item">
                    <span className="auth-header">DKIM</span>
                    <span className={`auth-badge auth-${(result.authentication?.dkim || 'UNKNOWN').toLowerCase()}`}>
                      {result.authentication?.dkim === 'PASS' && '✓ PASS'}
                      {result.authentication?.dkim === 'FAIL' && '✕ FAIL'}
                      {(result.authentication?.dkim === 'NONE' || result.authentication?.dkim === 'UNKNOWN' || !result.authentication?.dkim) && '⚪ UNKNOWN'}
                    </span>
                  </div>

                  <div className="auth-item">
                    <span className="auth-header">DMARC</span>
                    <span className={`auth-badge auth-${(result.authentication?.dmarc || 'UNKNOWN').toLowerCase()}`}>
                      {result.authentication?.dmarc === 'PASS' && '✓ PASS'}
                      {result.authentication?.dmarc === 'FAIL' && '✕ FAIL'}
                      {(result.authentication?.dmarc === 'NONE' || result.authentication?.dmarc === 'UNKNOWN' || !result.authentication?.dmarc) && '⚪ UNKNOWN'}
                    </span>
                  </div>
                </div>

                <p className="auth-footnote">
                  Email authentication helps verify the sending infrastructure but does not by itself prove that the person is a legitimate recruiter.
                </p>
              </div>

              {/* PAYMENT REQUEST WARNING */}
              {result.payment_requested ? (
                <div className="ev-result-card card-alert-danger">
                  <div className="alert-header">
                    <i className="fa-solid fa-sack-xmark"></i>
                    <h4>Payment Request Detected</h4>
                  </div>
                  <p>
                    This email appears to request money in connection with the job offer. Do not send money until the offer has been independently verified through the company's official channels.
                  </p>
                </div>
              ) : (
                <div className="ev-result-card card-alert-safe">
                  <i className="fa-solid fa-circle-check"></i> No payment request detected.
                </div>
              )}

              {/* SENSITIVE INFORMATION WARNING */}
              {result.sensitive_information_requested && (
                <div className="ev-result-card card-alert-danger">
                  <div className="alert-header">
                    <i className="fa-solid fa-key"></i>
                    <h4>Sensitive Information Request Detected</h4>
                  </div>
                  <p>
                    Do not share passwords, OTPs, UPI PINs, banking credentials, or identity documents with the sender.
                  </p>
                </div>
              )}

              {/* VERIFICATION CHECKLIST */}
              <div className="ev-result-card">
                <h3><i className="fa-solid fa-list-check"></i> Verification Checklist</h3>

                <ul className="ev-checklist">
                  <li>
                    <span>Official company domain specified</span>
                    <span className="chk-status pass">✓ Verified</span>
                  </li>
                  <li>
                    <span>Sender domain match</span>
                    <span className={`chk-status ${result.company?.domain_match ? 'pass' : 'fail'}`}>
                      {result.company?.domain_match ? '✓ Match' : '✕ Mismatch'}
                    </span>
                  </li>
                  <li>
                    <span>Recruiter verification</span>
                    <span className={`chk-status ${result.verification?.recruiter_verified ? 'pass' : 'warn'}`}>
                      {result.verification?.recruiter_verified ? '✓ Verified' : '⚠ Unverified'}
                    </span>
                  </li>
                  <li>
                    <span>SPF Authentication</span>
                    <span className={`chk-status ${result.authentication?.spf === 'PASS' ? 'pass' : 'warn'}`}>
                      {result.authentication?.spf || 'UNKNOWN'}
                    </span>
                  </li>
                  <li>
                    <span>DKIM Authentication</span>
                    <span className={`chk-status ${result.authentication?.dkim === 'PASS' ? 'pass' : 'warn'}`}>
                      {result.authentication?.dkim || 'UNKNOWN'}
                    </span>
                  </li>
                  <li>
                    <span>DMARC Policy</span>
                    <span className={`chk-status ${result.authentication?.dmarc === 'PASS' ? 'pass' : 'warn'}`}>
                      {result.authentication?.dmarc || 'UNKNOWN'}
                    </span>
                  </li>
                  <li>
                    <span>Payment request check</span>
                    <span className={`chk-status ${result.payment_requested ? 'fail' : 'pass'}`}>
                      {result.payment_requested ? '✕ Payment Requested' : '✓ None Detected'}
                    </span>
                  </li>
                  <li>
                    <span>Sensitive info request check</span>
                    <span className={`chk-status ${result.sensitive_information_requested ? 'fail' : 'pass'}`}>
                      {result.sensitive_information_requested ? '✕ Sensitive Request' : '✓ Clean'}
                    </span>
                  </li>
                </ul>
              </div>

              {/* RISK INDICATORS */}
              <div className="ev-result-card">
                <h3><i className="fa-solid fa-triangle-exclamation"></i> Risk Indicators</h3>

                {result.indicators && result.indicators.length > 0 ? (
                  <div className="ev-indicators-list">
                    {result.indicators.map((ind, idx) => (
                      <div key={idx} className="indicator-item">
                        <div className="ind-header">
                          <span className={`sev-tag sev-${(ind.severity || 'HIGH').toLowerCase()}`}>
                            {ind.severity || 'HIGH'}
                          </span>
                          <strong className="ind-type">{ind.type}</strong>
                        </div>
                        {ind.evidence && <p className="ind-evidence"><strong>Evidence:</strong> "{ind.evidence}"</p>}
                        {ind.explanation && <p className="ind-exp">{ind.explanation}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-subtext">No major risk indicators detected.</p>
                )}
              </div>

              {/* POSITIVE SIGNALS */}
              <div className="ev-result-card">
                <h3><i className="fa-solid fa-circle-check"></i> Positive Signals</h3>

                {result.positive_signals && result.positive_signals.length > 0 ? (
                  <ul className="ev-positive-list">
                    {result.positive_signals.map((sig, idx) => (
                      <li key={idx}><i className="fa-solid fa-check"></i> {sig}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-subtext">No strong positive verification signals were returned.</p>
                )}
              </div>

              {/* SUSPICIOUS LINKS */}
              <div className="ev-result-card">
                <h3><i className="fa-solid fa-link-slash"></i> Suspicious Links</h3>

                {result.suspicious_links && result.suspicious_links.length > 0 ? (
                  <div className="suspicious-links-list">
                    {result.suspicious_links.map((link, idx) => (
                      <div key={idx} className="link-item">
                        <span className="link-url-text">{typeof link === 'string' ? link : link.url || link}</span>
                        <button
                          type="button"
                          className="btn-saas-secondary btn-sm"
                          onClick={() => handleCopyUrl(typeof link === 'string' ? link : link.url, idx)}
                        >
                          {copiedUrlIndex === idx ? '✓ Copied' : 'Copy URL'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-subtext">No suspicious links detected.</p>
                )}
              </div>

              {/* RECOMMENDATION */}
              {result.recommendation && (
                <div className="ev-result-card ev-card-rec">
                  <h3><i className="fa-solid fa-user-shield"></i> CyberGuard Recommendation</h3>
                  <p className="rec-text">{result.recommendation}</p>
                </div>
              )}
            </section>
          )}

          {/* 24. EMAIL SECURITY TIPS */}
          <section className="saas-section">
            <div className="section-header">
              <h2>Stay Safe From Job Scams</h2>
              <p>Essential verification guidelines for online job offers.</p>
            </div>

            <div className="ev-tips-grid">
              <div className="tip-card">
                <div className="tip-num">1</div>
                <h4>Never Pay for a Job</h4>
                <p>Legitimate employers never demand registration fees, equipment deposits, or processing payments.</p>
              </div>

              <div className="tip-card">
                <div className="tip-num">2</div>
                <h4>Verify Official Domains</h4>
                <p>Check if the recruiter email matches the company's official domain name exactly.</p>
              </div>

              <div className="tip-card">
                <div className="tip-num">3</div>
                <h4>Verify via Official Careers Page</h4>
                <p>Cross-check job offers on the official company careers portal before responding.</p>
              </div>

              <div className="tip-card">
                <div className="tip-num">4</div>
                <h4>Protect Sensitive Data</h4>
                <p>Do not share OTPs, passwords, UPI PINs, or banking credentials under any circumstances.</p>
              </div>

              <div className="tip-card">
                <div className="tip-num">5</div>
                <h4>Logos are Not Proof</h4>
                <p>Scammers easily copy official company logos, letterheads, and executive signatures.</p>
              </div>

              <div className="tip-card">
                <div className="tip-num">6</div>
                <h4>Do Not Click Suspicious Links</h4>
                <p>Avoid clicking unexpected login links or downloading unknown attachments.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
