#!/usr/bin/env python3
import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
import requests

PORT = int(os.environ.get("PORT", "10000"))
INTERNAL = "http://127.0.0.1:10000"
TIMEOUT = 2  # seconds for proxying requests / health check

class ProxyHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _forward(self):
        url = INTERNAL + self.path
        try:
            headers = {k: v for k, v in self.headers.items() if k.lower() != 'host'}
            if self.command in ("POST", "PUT", "PATCH"):
                length = int(self.headers.get("content-length", 0))
                data = self.rfile.read(length) if length > 0 else None
                resp = requests.request(self.command, url, headers=headers, data=data, stream=True, timeout=TIMEOUT)
            else:
                resp = requests.request(self.command, url, headers=headers, stream=True, timeout=TIMEOUT)

            # send status and headers
            self.send_response(resp.status_code)
            excluded = ('transfer-encoding', 'content-encoding', 'connection')
            for hk, hv in resp.headers.items():
                if hk.lower() not in excluded:
                    self.send_header(hk, hv)
            body = resp.content
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if body:
                self.wfile.write(body)
        except requests.exceptions.RequestException:
            # Backend not ready — return 503 informative body
            self.send_response(503)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            bbody = b"503 Service Unavailable - application starting, try again shortly\n"
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    def do_GET(self): self._forward()
    def do_POST(self): self._forward()
    def do_PUT(self): self._forward()
    def do_PATCH(self): self._forward()
    def do_DELETE(self): self._forward()

    def log_message(self, format, *args):
        sys.stdout.write("%s - - [%s] %s\n" %
                         (self.client_address[0], self.log_date_time_string(), format%args))

if __name__ == "__main__":
    print(f"Proxy listening on 0.0.0.0:{PORT} -> {INTERNAL}", flush=True)
    server = HTTPServer(("", PORT), ProxyHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
