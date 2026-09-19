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
          <div className="top-bar-title">Browser Protection</div>
          <div className="top-bar-meta">
            <span className="status-indicator">
              <span className="dot-green"></span> Protection Ready
            </span>
          </div>
        </header>

        <div className="saas-container">
          {/* 5. HERO SECTION & 6. RIGHT SIDE VISUAL */}
          <section className="saas-hero">
            <div className="saas-hero-content">
              <h1 className="saas-hero-heading">
                Protect Your Browser
              </h1>
              <p className="saas-hero-sub">
                Block bad websites automatically and stay safe while surfing the web.
              </p>

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
                  How to install →
                </button>
              </div>
            </div>

            {/* 6. RIGHT SIDE HERO VISUAL */}
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
                      <span className="p-label">Website Security</span>
                      <span className="p-val val-green">● Safe</span>
                    </div>
                    <div className="preview-row">
                      <span className="p-label">Threat Status</span>
                      <span className="p-val val-blue">No Risk</span>
                    </div>
                    <div className="preview-row">
                      <span className="p-label">Website Check</span>
                      <span className="p-val val-neutral">Verified Safe</span>
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
                <h3>CyberGuard Extension</h3>
                <p className="panel-meta-text">Free browser guard for Google Chrome</p>
              </div>
              <div className="panel-right">
                <a
                  className="btn-saas-primary btn-sm"
                  href={downloadUrl}
                  download="CyberGuard.zip"
                  onClick={handleDownload}
                >
                  <i className="fa-solid fa-download"></i> Download
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
                  <i className="fa-brands fa-chrome"></i> Copy Link
                </button>
              </div>
            </div>
          </section>

          {/* 7. INSTALLATION SECTION */}
          <section id="installation-steps" className="saas-section">
            <div className="section-header">
              <h2>Install in 4 Easy Steps</h2>
              <p>Follow these quick steps to enable browser protection.</p>
            </div>

            <div className="horizontal-flow-grid">
              <div className="flow-step">
                <span className="step-index">01</span>
                <h4>Download</h4>
                <p>Click the download button above.</p>
              </div>
              <div className="flow-connector" aria-hidden="true"></div>

              <div className="flow-step">
                <span className="step-index">02</span>
                <h4>Unzip</h4>
                <p>Open and extract the ZIP file.</p>
              </div>
              <div className="flow-connector" aria-hidden="true"></div>

              <div className="flow-step">
                <span className="step-index">03</span>
                <h4>Open Extensions</h4>
                <p>Go to <code>chrome://extensions</code> in Chrome and turn on Developer mode.</p>
              </div>
              <div className="flow-connector" aria-hidden="true"></div>

              <div className="flow-step">
                <span className="step-index">04</span>
                <h4>Load Extension</h4>
                <p>Click "Load unpacked" and select the unzipped folder.</p>
              </div>
            </div>
          </section>

          {/* 10. SECURITY CAPABILITIES */}
          <section className="saas-section">
            <div className="section-header">
              <h2>Features</h2>
            </div>

            <div className="capabilities-grid">
              <div className="capability-card">
                <div className="cap-icon">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <h4>Real-time Blocking</h4>
                <p>Warns you before you visit dangerous websites.</p>
              </div>

              <div className="capability-card">
                <div className="cap-icon">
                  <i className="fa-solid fa-link"></i>
                </div>
                <h4>Link Checking</h4>
                <p>Checks link safety automatically.</p>
              </div>

              <div className="capability-card">
                <div className="cap-icon">
                  <i className="fa-solid fa-brain"></i>
                </div>
                <h4>Smart Defense</h4>
                <p>Identifies fake and scam websites.</p>
              </div>

              <div className="capability-card">
                <div className="cap-icon">
                  <i className="fa-solid fa-bell"></i>
                </div>
                <h4>Instant Alerts</h4>
                <p>Notifies you instantly if something looks suspicious.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
