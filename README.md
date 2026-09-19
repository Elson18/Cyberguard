# CyberGuard React Frontend

Modern React.js (Vite) single-page application for the CyberGuard Multilingual Cybercrime Support Platform.

## Features

- **React Router v6**: Single-page navigation (`/`, `/login`, `/signin`, `/complaint`, `/extension`, `/settings`).
- **Multilingual Support**: Supports 19 Indian & International languages with dynamic auto-detection and RTL switching.
- **AI Chat Dashboard**: Markdown parsing (`marked`), thread history persistence, threat severity warning badges, and helpline assistance.
- **Incident Reporting**: Multi-file evidence dropzone upload.
- **Auth Context**: Persisted authentication & session manager.

## Getting Started

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`.
Connects to FastAPI backend at `http://127.0.0.1:8765`.
