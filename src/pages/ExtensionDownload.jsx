import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { getExtensionDownloadUrl } from '../services/api';

export function ExtensionDownload() {
  const downloadUrl = getExtensionDownloadUrl();

  return (
    <div className="app">
      <div className="bg-canvas" aria-hidden="true">
        <div className="bg-grid"></div>
        <div className="bg-blob bg-blob--blue"></div>
        <div className="bg-blob bg-blob--cyan"></div>
      </div>

      <Sidebar activePage="extension" />

      <main className="main" style={{ padding: '24px 32px', overflowY: 'auto' }}>
        <div className="main-header">
          <div>
            <div className="main-title">CyberGuard Extension</div>
            <div className="main-subtitle">AI-powered browser protection with real-time threat detection</div>
          </div>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="ext-hero">
            <div className="ext-hero__icon">🛡️</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
              CyberGuard Chrome Extension
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Protect your browsing experience with real-time URL reputation analysis, AI threat classification, and automated malicious site alerts.
            </p>
            <a
              className="btn-login"
              href={downloadUrl}
              download="CyberGuard.zip"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 28px',
                textDecoration: 'none',
                width: 'auto',
                fontSize: '1rem',
              }}
            >
              <i className="fa-solid fa-download"></i> Download Extension v1.0.0
            </a>
            <p style={{ marginTop: '16px', fontSize: '0.78rem', color: '#64748b' }}>
              Chrome · Manifest V3 · Requires Developer Mode
            </p>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '24px 28px',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#fff' }}>
              Installation Instructions
            </h3>
            <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <li style={{ marginBottom: '12px' }}>
                <strong>Download & Extract:</strong> Click the button above to download <code>CyberGuard.zip</code> and extract the contents to a folder on your computer.
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Open Extensions Page:</strong> In Google Chrome, navigate to <code>chrome://extensions</code>.
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Enable Developer Mode:</strong> Toggle the <strong>Developer mode</strong> switch in the top right corner.
              </li>
              <li>
                <strong>Load Unpacked:</strong> Click <strong>Load unpacked</strong> and select the extracted extension directory.
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
