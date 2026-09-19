import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { getExtensionDownloadUrl } from '../services/api';

export function ExtensionDownload() {
  const downloadUrl = getExtensionDownloadUrl();
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 2000);
  };

  const handleCopyChromeUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setToastMessage('Copied chrome://extensions to clipboard');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const scrollToInstallation = () => {
    const el = document.getElementById('installation-steps');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app app-clean">
      <Sidebar activePage="extension" />

      <main className="main-viewport">
        {toastMessage && (
          <div className="saas-toast" role="status">
            <i className="fa-solid fa-circle-check"></i> {toastMessage}
          </div>
        )}

        {/* 4. TOP BAR */}
        <header className="top-bar">
          <div className="top-bar-title">Extension</div>
          <div className="top-bar-meta">
            <span className="status-indicator">
              <span className="dot-green"></span> Protection Active
            </span>
            <span className="ver-tag">v1.0.0</span>
          </div>
        </header>

        <div className="saas-container">
          {/* 5. HERO SECTION & 6. RIGHT SIDE VISUAL */}
          <section className="saas-hero">
            <div className="saas-hero-content">
              <span className="saas-eyebrow">CYBERGUARD EXTENSION</span>
              <h1 className="saas-hero-heading">
                Protect every click<br />with CyberGuard.
              </h1>
              <p className="saas-hero-sub">
                Real-time protection against malicious websites, phishing attempts, suspicious URLs, and online threats.
              </p>

              <div className="saas-badge-row">
                <span className="saas-neutral-badge">Chrome Extension</span>
                <span className="saas-neutral-badge">Manifest V3</span>
              </div>

              <div className="saas-cta-group">
                <a
                  className={`btn-saas-primary ${isDownloading ? 'is-loading' : ''}`}
                  href={downloadUrl}
                  download="CyberGuard.zip"
                  onClick={handleDownload}
                >
                  {isDownloading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Downloading…
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-download"></i> Download Extension
                    </>
                  )}
                </a>

                <button
                  type="button"
                  className="btn-saas-link"
                  onClick={scrollToInstallation}
                >
                  Installation guide →
                </button>
              </div>
            </div>

            {/* 6. RIGHT SIDE HERO VISUAL - SOPHISTICATED PRODUCT PREVIEW */}
            <div className="saas-hero-visual">
              <div className="saas-preview-frame">
                <div className="preview-chrome-header">
                  <div className="chrome-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <div className="chrome-address">
                    <i className="fa-solid fa-lock text-green"></i>
                    <span>cyberguard.sec/active</span>
                  </div>
                </div>

                <div className="preview-panel-content">
                  <div className="preview-brand-header">
                    <div className="brand-badge-mini">CG</div>
                    <span className="brand-name">CyberGuard</span>
                    <span className="status-pill-subtle">● Active</span>
                  </div>

                  <div className="preview-rows">
                    <div className="preview-row">
                      <span className="p-label">Website Protection</span>
                      <span className="p-val val-green">● Protected</span>
                    </div>
                    <div className="preview-row">
                      <span className="p-label">Threat level</span>
                      <span className="p-val val-blue">LOW</span>
                    </div>
                    <div className="preview-row">
                      <span className="p-label">URL reputation</span>
                      <span className="p-val val-neutral">Verified</span>
                    </div>
                    <div className="preview-row">
                      <span className="p-label">AI analysis</span>
                      <span className="p-val val-dark">No malicious content detected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 8. COMPACT DOWNLOAD CARD & 9. QUICK ACCESS PANEL */}
          <section className="saas-utility-grid">
            <div className="saas-panel download-panel">
              <div className="panel-left">
                <h3>CyberGuard Chrome Extension</h3>
                <p className="panel-meta-text">Version 1.0.0 · Chrome · Manifest V3</p>
                <p className="panel-sub-meta">Size: 12.4 MB · Updated: Recently</p>
              </div>
              <div className="panel-right">
                <a
                  className="btn-saas-primary btn-sm"
                  href={downloadUrl}
                  download="CyberGuard.zip"
                  onClick={handleDownload}
                >
                  <i className="fa-solid fa-download"></i> Download Extension
                </a>
              </div>
            </div>

            <div className="saas-panel shortcut-panel">
              <div className="panel-left">
                <span className="shortcut-mini-label">Quick access</span>
                <h3>Chrome Extensions</h3>
                <p className="panel-meta-text">Open <code>chrome://extensions</code></p>
              </div>
              <div className="panel-right">
                <button
                  type="button"
                  className="btn-saas-secondary btn-sm"
                  onClick={handleCopyChromeUrl}
                >
                  <i className="fa-brands fa-chrome"></i> Open Extensions
                </button>
              </div>
            </div>
          </section>

          {/* 7. INSTALLATION SECTION */}
          <section id="installation-steps" className="saas-section">
            <div className="section-header">
              <h2>Install CyberGuard in minutes</h2>
              <p>Set up browser protection in four simple steps.</p>
            </div>

            <div className="horizontal-flow-grid">
              <div className="flow-step">
                <span className="step-index">01</span>
                <h4>Download</h4>
                <p>Download the CyberGuard package.</p>
              </div>
              <div className="flow-connector" aria-hidden="true"></div>

              <div className="flow-step">
                <span className="step-index">02</span>
                <h4>Extract</h4>
                <p>Extract the ZIP file.</p>
              </div>
              <div className="flow-connector" aria-hidden="true"></div>

              <div className="flow-step">
                <span className="step-index">03</span>
                <h4>Enable Developer Mode</h4>
                <p>Open <code>chrome://extensions</code> and enable Developer Mode.</p>
              </div>
              <div className="flow-connector" aria-hidden="true"></div>

              <div className="flow-step">
                <span className="step-index">04</span>
                <h4>Load Extension</h4>
                <p>Select the extracted CyberGuard folder.</p>
              </div>
            </div>
          </section>

          {/* 10. SECURITY CAPABILITIES */}
          <section className="saas-section">
            <div className="section-header">
              <h2>Built for safer browsing</h2>
            </div>

            <div className="capabilities-grid">
              <div className="capability-card">
                <div className="cap-icon">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <h4>Real-time detection</h4>
                <p>Detect suspicious websites as you browse.</p>
              </div>

              <div className="capability-card">
                <div className="cap-icon">
                  <i className="fa-solid fa-link"></i>
                </div>
                <h4>URL reputation</h4>
                <p>Analyze URLs before you interact with them.</p>
              </div>

              <div className="capability-card">
                <div className="cap-icon">
                  <i className="fa-solid fa-brain"></i>
                </div>
                <h4>AI threat analysis</h4>
                <p>Classify potentially malicious content using AI.</p>
              </div>

              <div className="capability-card">
                <div className="cap-icon">
                  <i className="fa-solid fa-bell"></i>
                </div>
                <h4>Instant alerts</h4>
                <p>Warn users when suspicious activity is detected.</p>
              </div>
            </div>
          </section>

          {/* 11. PROTECTION STATUS */}
          <section className="saas-status-strip">
            <div className="strip-title">Protection systems</div>
            <div className="strip-items">
              <div className="strip-item">
                <span>RAG Engine</span>
                <span className="state-online">● Online</span>
              </div>
              <div className="strip-divider">•</div>
              <div className="strip-item">
                <span>AI Model</span>
                <span className="state-online">● Active</span>
              </div>
              <div className="strip-divider">•</div>
              <div className="strip-item">
                <span>Threat Database</span>
                <span className="state-online">● Synced</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
