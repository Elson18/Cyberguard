# CyberGuard Web Frontend

Standalone web frontend for CyberGuard Multilingual Cybercrime Support & Incident Response Platform.

## Running Standalone

To run the frontend independently:

```bash
python run_frontend.py
```
Or using standard Python HTTP server:
```bash
python -m http.server 8000
```

Access in browser at: `http://localhost:8000`

## Configuration

Backend API connection is configured in `config.js`:
```js
window.CYBERGUARD_API_URL = window.CYBERGUARD_API_URL || 'http://127.0.0.1:8765';
```
Change this value when deploying backend API to production servers.