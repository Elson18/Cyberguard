import React, { useState, useEffect, useRef } from 'react';
import { getSchedulerStatus, triggerSchedulerRun, fetchEmailVerificationHistory } from '../services/api';

export function EmailVerificationSchedulerCard() {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRunningManual, setIsRunningManual] = useState(false);
  const [error, setError] = useState(null);
  const [lastActionMsg, setLastActionMsg] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const timerRef = useRef(null);

  const fetchStatusAndHistory = async () => {
    try {
      const [resStatus, resHistory] = await Promise.all([
        getSchedulerStatus(),
        fetchEmailVerificationHistory(10)
      ]);

      if (resStatus.ok && resStatus.data) {
        setStatus(resStatus.data);
        setError(null);
      } else {
        setError('Could not reach backend scheduler status API');
      }

      if (resHistory.ok && resHistory.data && Array.isArray(resHistory.data.history)) {
        setHistory(resHistory.data.history);
      }
    } catch (err) {
      setError('Network error checking scheduler status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndHistory();
    // 30-second live status polling
    timerRef.current = setInterval(fetchStatusAndHistory, 30000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleRunNow = async () => {
    if (isRunningManual) return;
    setIsRunningManual(true);
    setLastActionMsg(null);

    try {
      const res = await triggerSchedulerRun();
      if (res.ok && res.data) {
        const msg = res.data.message || 'Manual email verification complete.';
        setLastActionMsg(`✅ ${msg}`);
        await fetchStatusAndHistory();
      } else {
        const errDetail = res.data?.detail || 'Manual trigger failed.';
        setLastActionMsg(`❌ ${errDetail}`);
      }
    } catch (err) {
      setLastActionMsg(`❌ Network error executing manual run.`);
    } finally {
      setIsRunningManual(false);
      setTimeout(() => setLastActionMsg(null), 8000);
    }
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Not executed yet';
    try {
      const date = new Date(isoString);
      return date.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return isoString;
    }
  };

  const getClassBadge = (item) => {
    if (item.status === 'FAILED') {
      return { label: 'FAILED', bg: '#fef2f2', color: '#991b1b', border: '#fecaca', icon: 'fa-triangle-exclamation' };
    }
    const classification = item.result?.classification || item.status || 'PENDING';
    switch (classification) {
      case 'AUTHORIZED':
        return { label: 'AUTHORIZED', bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0', icon: 'fa-shield-check' };
      case 'SUSPICIOUS':
        return { label: 'SUSPICIOUS', bg: '#fffbeb', color: '#b45309', border: '#fde68a', icon: 'fa-circle-exclamation' };
      case 'UNAUTHORIZED':
      default:
        return { label: 'UNAUTHORIZED', bg: '#fef2f2', color: '#991b1b', border: '#fecaca', icon: 'fa-ban' };
    }
  };

  return (
    <div className="ev-automation-dashboard-wrapper">
      {/* HEADER SECTION */}
      <div className="ev-automation-header">
        <div className="ev-header-left">
          <h2 className="ev-section-title">
            <i className="fa-solid fa-robot" style={{ color: '#2563eb', marginRight: '10px' }}></i>
            Email Verification Automation
          </h2>
          <p className="ev-section-desc">
            Automatically check and analyze your Gmail inbox for suspicious emails.
          </p>
        </div>

        <div className="ev-header-controls">
          <div className={`ev-connection-pill ${status?.gmail_connected ? 'pill-connected' : 'pill-auth-req'}`}>
            <i className={`fa-solid ${status?.gmail_connected ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
            {status?.gmail_connected ? 'Gmail Connected' : 'Auth Required'}
          </div>

          <button
            onClick={handleRunNow}
            disabled={isRunningManual || (status && !status.gmail_connected)}
            className="ev-run-now-btn"
          >
            {isRunningManual ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Running...
              </>
            ) : (
              <>
                <i className="fa-solid fa-play"></i> Run Now
              </>
            )}
          </button>
        </div>
      </div>

      {lastActionMsg && (
        <div className={`ev-action-alert ${lastActionMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>
          {lastActionMsg}
        </div>
      )}

      {/* 2-COLUMN DASHBOARD GRID */}
      <div className="ev-dashboard-grid">
        {/* LEFT COLUMN: STATUS & STATISTICS */}
        <div className="ev-left-col">
          {/* AUTOMATION STATUS CARD */}
          <div className="ev-dash-card">
            <div className="ev-card-title">
              <i className="fa-solid fa-sliders" style={{ color: '#3b82f6' }}></i>
              Automation Status
            </div>

            <div className="ev-status-rows">
              <div className="ev-status-row">
                <span className="row-label">Gmail Connection</span>
                <span className={`row-val ${status?.gmail_connected ? 'val-green' : 'val-amber'}`}>
                  {status?.gmail_connected ? '✓ Connected' : '⚠️ Auth Required'}
                </span>
              </div>

              <div className="ev-status-row">
                <span className="row-label">Scheduler</span>
                <span className={`row-val ${status?.running ? 'val-green' : 'val-gray'}`}>
                  {status?.running ? '● Running' : '○ Disabled'}
                </span>
              </div>

              <div className="ev-status-row">
                <span className="row-label">Last Checked</span>
                <span className="row-val">
                  {status?.last_run_at ? formatRelativeTime(status.last_run_at) : 'Not executed yet'}
                </span>
              </div>

              <div className="ev-status-row">
                <span className="row-label">Next Scheduled Check</span>
                <span className="row-val">
                  {status?.next_run_at ? formatRelativeTime(status.next_run_at) : (status?.running ? 'In 2 mins' : 'Disabled')}
                </span>
              </div>

              <div className="ev-status-row">
                <span className="row-label">Last Run Result</span>
                <span className={`row-val ${status?.last_run_status === 'failed' ? 'val-red' : (status?.last_run_status === 'success' ? 'val-green' : 'val-gray')}`}>
                  {status?.last_run_status ? status.last_run_status.toUpperCase() : 'No runs yet'}
                </span>
              </div>
            </div>
          </div>

          {/* STATISTICS CARD */}
          <div className="ev-dash-card" style={{ marginTop: '20px' }}>
            <div className="ev-card-title">
              <i className="fa-solid fa-chart-simple" style={{ color: '#3b82f6' }}></i>
              Statistics
            </div>

            <div className="ev-stats-2x2">
              <div className="stat-box">
                <span className="stat-num color-blue">{status?.last_run_found_count || 0}</span>
                <span className="stat-lbl">Emails Found</span>
              </div>

              <div className="stat-box">
                <span className="stat-num color-green">{status?.last_run_processed_count || 0}</span>
                <span className="stat-lbl">Processed</span>
              </div>

              <div className="stat-box">
                <span className="stat-num color-red">{status?.last_run_failed_count || 0}</span>
                <span className="stat-lbl">Failed</span>
              </div>

              <div className="stat-box">
                <span className="stat-num color-dark">{status?.total_runs || 0}</span>
                <span className="stat-lbl">Total Runs</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT EMAILS RESULTS */}
        <div className="ev-right-col">
          <div className="ev-dash-card ev-emails-card">
            <div className="ev-emails-header">
              <div>
                <div className="ev-card-title" style={{ marginBottom: '2px' }}>
                  <i className="fa-solid fa-clock-rotate-left" style={{ color: '#2563eb' }}></i>
                  Recent Emails
                </div>
                <span className="ev-card-subtitle">Emails analyzed by CyberGuard ({history.length})</span>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="ev-empty-state">
                <i className="fa-solid fa-inbox empty-icon"></i>
                <div style={{ fontWeight: '600', color: '#334155', marginBottom: '4px' }}>No emails analyzed yet</div>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Click <strong>Run Now</strong> to check your Gmail inbox or wait for the automatic 2-minute scheduler.
                </p>
              </div>
            ) : (
              <div className="ev-email-list">
                {history.map((item) => {
                  const badge = getClassBadge(item);
                  const isExpanded = expandedId === item.id;
                  const resultData = item.result || {};
                  const senderStr = item.sender_name ? `${item.sender_name} (${item.sender_email})` : (item.sender_email || 'Unknown Sender');

                  return (
                    <div key={item.id} className={`ev-email-item ${isExpanded ? 'is-expanded' : ''}`}>
                      {/* COMPACT CARD HEADER */}
                      <div className="ev-email-item-header" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                        <div className="ev-email-left-info">
                          <span className="ev-class-badge" style={{ backgroundColor: badge.bg, color: badge.color, borderColor: badge.border }}>
                            <i className={`fa-solid ${badge.icon}`}></i> [{badge.label}]
                          </span>
                          <div className="ev-email-subject-block">
                            <div className="ev-email-subject">{item.subject || '(No Subject)'}</div>
                            <div className="ev-email-sender">From: {senderStr}</div>
                          </div>
                        </div>

                        <div className="ev-email-right-info">
                          {resultData.risk_score !== undefined && (
                            <div className="ev-risk-pill">
                              <span className="risk-lbl">Risk Score:</span>
                              <span className={`risk-val ${resultData.risk_score > 60 ? 'score-red' : (resultData.risk_score > 30 ? 'score-amber' : 'score-green')}`}>
                                {resultData.risk_score} / 100
                              </span>
                            </div>
                          )}

                          <div className="ev-email-date">
                            {formatRelativeTime(item.created_at || item.received_at)}
                          </div>

                          <span className="ev-expand-btn">
                            {isExpanded ? (
                              <>▲ Collapse</>
                            ) : (
                              <>▼ Expand</>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* EXPANDED DETAILS DRAWER */}
                      {isExpanded && (
                        <div className="ev-email-drawer">
                          {item.processing_error && (
                            <div className="drawer-alert-error">
                              <strong>Processing Error:</strong> {item.processing_error}
                            </div>
                          )}

                          {resultData.user_message && (
                            <div className="drawer-block">
                              <div className="drawer-block-title">AI Summary &amp; Recommendation</div>
                              <p className="drawer-block-text">{resultData.user_message}</p>
                            </div>
                          )}

                          {resultData.recommendation && (
                            <div className="drawer-block">
                              <div className="drawer-block-title">Recommendation</div>
                              <p className="drawer-block-text">{resultData.recommendation}</p>
                            </div>
                          )}

                          {/* Security Signals & Indicators */}
                          {Array.isArray(resultData.indicators) && resultData.indicators.length > 0 && (
                            <div className="drawer-block">
                              <div className="drawer-block-title">Security Signals &amp; Indicators</div>
                              <ul className="indicators-list">
                                {resultData.indicators.map((ind, idx) => (
                                  <li key={idx} className={`ind-item ${ind.severity === 'HIGH' || ind.severity === 'CRITICAL' ? 'ind-high' : ''}`}>
                                    <strong>[{ind.severity || 'INFO'}]</strong> {ind.explanation || ind.evidence || ind.type}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Email Body Snippet */}
                          {item.email_body && (
                            <div className="drawer-block" style={{ marginBottom: 0 }}>
                              <div className="drawer-block-title">Email Body Snippet</div>
                              <div className="email-body-code-box">
                                {item.email_body}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SCOPED DASHBOARD STYLES */}
      <style>{`
        .ev-automation-dashboard-wrapper {
          max-width: 1400px;
          width: 100%;
          margin: 0 auto 32px auto;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        }

        .ev-automation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
        }

        .ev-header-left .ev-section-title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: var(--heading-color, #0f172a);
          display: flex;
          align-items: center;
        }

        .ev-header-left .ev-section-desc {
          margin: 4px 0 0 0;
          font-size: 14px;
          color: #64748b;
        }

        .ev-header-controls {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ev-connection-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
        }

        .pill-connected {
          background-color: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .pill-auth-req {
          background-color: #fffbeb;
          color: #b45309;
          border: 1px solid #fde68a;
        }

        .ev-run-now-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 8px;
          background-color: #2563eb;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.1s ease;
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
        }

        .ev-run-now-btn:hover:not(:disabled) {
          background-color: #1d4ed8;
          transform: translateY(-1px);
        }

        .ev-run-now-btn:disabled {
          background-color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }

        .ev-action-alert {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 20px;
        }

        .alert-success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
        .alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

        /* 2-COLUMN DASHBOARD GRID */
        .ev-dashboard-grid {
          display: grid;
          grid-template-columns: minmax(280px, 0.35fr) minmax(450px, 0.65fr);
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 992px) {
          .ev-dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        .ev-dash-card {
          background: var(--panel-bg, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }

        .ev-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ev-card-subtitle {
          font-size: 13px;
          color: #64748b;
        }

        /* STATUS ROWS */
        .ev-status-rows {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ev-status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 10px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 13px;
        }

        .ev-status-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .row-label {
          color: #64748b;
          font-weight: 500;
        }

        .row-val {
          font-weight: 600;
          color: #0f172a;
        }

        .val-green { color: #16a34a; }
        .val-amber { color: #d97706; }
        .val-red { color: #dc2626; }
        .val-gray { color: #64748b; }

        /* STATS 2X2 GRID */
        .ev-stats-2x2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .stat-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }

        .stat-num {
          display: block;
          font-size: 20px;
          font-weight: 700;
          line-height: 1.2;
        }

        .color-blue { color: #2563eb; }
        .color-green { color: #16a34a; }
        .color-red { color: #dc2626; }
        .color-dark { color: #0f172a; }

        .stat-lbl {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: #64748b;
          margin-top: 4px;
          display: block;
        }

        /* EMAILS LIST IN RIGHT COLUMN */
        .ev-emails-card {
          padding: 20px;
        }

        .ev-emails-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .ev-empty-state {
          padding: 36px 20px;
          text-align: center;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
        }

        .empty-icon {
          font-size: 28px;
          color: #94a3b8;
          margin-bottom: 10px;
        }

        .ev-email-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ev-email-item {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #ffffff;
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .ev-email-item:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .ev-email-item.is-expanded {
          border-color: #bfdbfe;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
        }

        .ev-email-item-header {
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          cursor: pointer;
          background: #ffffff;
          transition: background 0.15s ease;
        }

        .ev-email-item.is-expanded .ev-email-item-header {
          background: #f8fafc;
        }

        .ev-email-left-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1 1 260px;
        }

        .ev-class-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid transparent;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .ev-email-subject-block {
          overflow: hidden;
        }

        .ev-email-subject {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 380px;
        }

        .ev-email-sender {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 380px;
        }

        .ev-email-right-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .ev-risk-pill {
          text-align: right;
        }

        .risk-lbl {
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 600;
          color: #64748b;
          display: block;
        }

        .risk-val {
          font-size: 13px;
          font-weight: 700;
        }

        .score-green { color: #16a34a; }
        .score-amber { color: #d97706; }
        .score-red { color: #dc2626; }

        .ev-email-date {
          font-size: 12px;
          color: #64748b;
          white-space: nowrap;
        }

        .ev-expand-btn {
          font-size: 12px;
          font-weight: 600;
          color: #2563eb;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        /* DRAWER CONTENT */
        .ev-email-drawer {
          padding: 16px;
          border-top: 1px solid #f1f5f9;
          background: #fafafa;
        }

        .drawer-block {
          margin-bottom: 14px;
        }

        .drawer-block-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: #334155;
          letterSpacing: 0.5px;
          margin-bottom: 6px;
        }

        .drawer-block-text {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: #475569;
          background: #ffffff;
          padding: 10px 12px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .indicators-list {
          margin: 0;
          padding-left: 18px;
        }

        .ind-item {
          font-size: 12px;
          color: #475569;
          margin-bottom: 4px;
        }

        .ind-high {
          color: #dc2626;
          font-weight: 600;
        }

        .email-body-code-box {
          background: #0f172a;
          color: #f8fafc;
          padding: 12px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 12px;
          line-height: 1.5;
          max-height: 180px;
          overflow-y: auto;
          white-space: pre-wrap;
        }

        .drawer-alert-error {
          padding: 10px 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #991b1b;
          font-size: 13px;
          margin-bottom: 14px;
        }
      `}</style>
    </div>
  );
}
