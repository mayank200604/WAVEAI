#!/usr/bin/env bash
set -euo pipefail

# Ensure we're in project root
cd /opt/render/project/src || exit 1

# Internal port for the real app (loopback only)
INTERNAL_PORT=10000

# Start real gunicorn app bound to loopback so it does not expose public port
# Adjust workers/timeout if you want
gunicorn backend.app:app --bind 127.0.0.1:${INTERNAL_PORT} --chdir /opt/render/project/src --workers 2 --timeout 120 --access-logfile - --error-logfile - &

# Small delay to let the process spawn (not strictly required)
sleep 0.5

# Start the proxy that binds the public PORT and forwards to the internal app
python3 proxy.py
