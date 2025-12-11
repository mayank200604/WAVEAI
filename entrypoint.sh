#!/usr/bin/env bash
set -euo pipefail

echo "Starting entrypoint..."

# Public PORT (Render) with safe fallback
export PORT="${PORT:-10000}"
# Internal port for the backend (bind to loopback)
export INTERNAL_PORT="${PORT}"

# Make Python and gunicorn output unbuffered so logs appear immediately
export PYTHONUNBUFFERED=1

# Add project root and backend to PYTHONPATH so imports like `from denodo_adapter import ...` work
export PYTHONPATH="/opt/render/project/src:/opt/render/project/src/backend:${PYTHONPATH:-}"

echo "PORT=${PORT}, INTERNAL_PORT=${INTERNAL_PORT}"
echo "PYTHONPATH set to: $PYTHONPATH"

# Start Gunicorn in background. Keep workers=1 on small instances; increase timeout to allow model downloads.
echo "Starting backend using Gunicorn..."
gunicorn backend.app:app \
  --bind 127.0.0.1:${INTERNAL_PORT} \
  --workers 1 \
  --timeout 300 \
  --log-level debug \
  --access-logfile - \
  --error-logfile - &

sleep 2
ps aux | grep gunicorn

# Small delay to let Gunicorn process spawn (optional)
sleep 0.5

# Start lightweight proxy so Render detects open port immediately
echo "Starting instant proxy on PORT ${PORT}..."
exec python3 -u proxy.py
