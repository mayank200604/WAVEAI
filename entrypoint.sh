#!/bin/bash
set -e

echo "Starting entrypoint..."

# Render gives your app a PORT. Use that for internal gunicorn binding.
export INTERNAL_PORT=$PORT

# IMPORTANT: Add backend folder & project root to PYTHONPATH
export PYTHONPATH="/opt/render/project/src:/opt/render/project/src/backend:$PYTHONPATH"

echo "PYTHONPATH set to: $PYTHONPATH"

# Start Gunicorn (backend.app is correct)
echo "Starting backend using Gunicorn..."
gunicorn backend.app:app \
    --bind 127.0.0.1:${INTERNAL_PORT} \
    --workers 1 --timeout 200 &

# Start lightweight proxy so Render detects open port immediately
echo "Starting instant proxy on PORT ${PORT}..."
python3 proxy.py
