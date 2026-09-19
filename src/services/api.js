export const API_BASE = window.CYBERGUARD_API_URL || 'http://127.0.0.1:8765';

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
