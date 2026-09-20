# CyberGuard React Frontend

Modern React.js (Vite) single-page application for the CyberGuard Multilingual Cybercrime Support & Browser Protection Platform.

## Features & Route Structure

- **React Router v6**: Single-page navigation covering all 8 application views:
  - `/` — `Dashboard.jsx`: AI Cyber Incident Assistant with interactive chat, Markdown rendering (`marked`), threat severity alert cards, emergency steps, and helpline cards.
  - `/voice-complaint` & `/voice` — `VoiceComplaint.jsx`: Interactive Voice Complaint Filing Assistant featuring Web Speech STT/TTS, WebSocket real-time interview engine (`ws://127.0.0.1:8765/ws/voice-complaint`), PII sensitive data filter, summary review, and reference number generation.
  - `/email-verification` — `EmailVerification.jsx`: AI Email & Job Scam Verification Engine for inspecting phishing emails, domain spoofing, fake job offers, and headers.
  - `/complaint` — `Complaint.jsx`: Cybersecurity Incident Report form with multi-file evidence dropzone upload and email forwarding.
  - `/extension` — `ExtensionDownload.jsx`: Chrome Extension hub with live browser preview mockups and installer download.
  - `/settings` — `Settings.jsx`: Profile settings, theme customization, and device session management.
  - `/login` & `/signin` — `Login.jsx` & `Signin.jsx`: Secure authentication pages with bcrypt auto-migration support.
- **Multilingual Engine**: Supports 19 Indian & International languages with dynamic auto-detection and RTL switching (`I18nContext.jsx`).
- **Auth Context**: Persisted authentication & session manager (`AuthContext.jsx`).

## Getting Started

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`.
Connects to FastAPI backend at `http://127.0.0.1:8765`.

## Production Build

```bash
npm run build
```

Generates optimized bundle in `dist/`.
