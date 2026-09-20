export const API_BASE = window.CYBERGUARD_API_URL || 'http://localhost:8765';

export async function loginUser(identifier, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

export async function sendQuery(queryText, username, language = 'en') {
  const response = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: queryText, username, language }),
  });
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

export async function sendVoiceQuery(audioFile, username = 'User', language = 'en') {
  const formData = new FormData();
  formData.append('audio', audioFile, audioFile.name);
  if (username) formData.append('username', username);
  if (language) formData.append('language', language);

  console.log(`[Voice API] Uploading audio file ${audioFile.name} (${audioFile.size} bytes) to ${API_BASE}/api/voice-query...`);

  const response = await fetch(`${API_BASE}/api/voice-query`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

export async function verifyEmail(emailVerificationData) {
  const response = await fetch(`${API_BASE}/api/email/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailVerificationData),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

export async function submitIncidentReport(formData) {
  const response = await fetch(`${API_BASE}/report`, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

export async function fetchTranslations(langCode) {
  try {
    const response = await fetch(`${API_BASE}/api/i18n/${langCode}`);
    if (!response.ok) return {};
    const data = await response.json();
    return data.translations || {};
  } catch {
    return {};
  }
}

export async function detectLanguage(text) {
  try {
    const response = await fetch(`${API_BASE}/api/language/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) return 'en';
    const data = await response.json();
    return data.detected_language || 'en';
  } catch {
    return 'en';
  }
}

export function getExtensionDownloadUrl() {
  return `${API_BASE}/api/extension/download`;
}

export async function getSchedulerStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/email-verification/scheduler/status`);
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (err) {
    return { ok: false, status: 500, data: { error: err.message } };
  }
}

export async function triggerSchedulerRun() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/email-verification/scheduler/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (err) {
    return { ok: false, status: 500, data: { error: err.message } };
  }
}

export async function startScheduler() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/email-verification/scheduler/start`, {
      method: 'POST',
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (err) {
    return { ok: false, status: 500, data: { error: err.message } };
  }
}

export async function stopScheduler() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/email-verification/scheduler/stop`, {
      method: 'POST',
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (err) {
    return { ok: false, status: 500, data: { error: err.message } };
  }
}

export async function fetchEmailVerificationHistory(limit = 10) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/email-verification/history?limit=${limit}`);
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (err) {
    return { ok: false, status: 500, data: { error: err.message } };
  }
}


