import http.server
import socketserver
import os
import sys

PORT = int(os.getenv("PORT", 8000))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CyberguardHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

if __name__ == "__main__":
    print("=" * 65)
    print(f"CyberGuard Standalone Frontend Server")
    print(f"URL: http://localhost:{PORT}")
    print(f"Connecting to Backend API at: http://127.0.0.1:8765")
    print("=" * 65)
    with socketserver.TCPServer(("", PORT), CyberguardHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            sys.exit(0)
