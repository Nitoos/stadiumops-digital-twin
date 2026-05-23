#!/usr/bin/env bash
# Convenience launcher for the full Phase-0 stack.
# Brings up backend (8000) + ops (3000) + companion (3001).
set -e

cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
  .venv/bin/pip install -r requirements.txt
fi

PIDS=()

cleanup() {
  echo ""
  echo "Stopping..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  pkill -f "uvicorn backend.main" 2>/dev/null || true
  pkill -f "next dev" 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

# Backend
.venv/bin/uvicorn backend.main:app --port 8000 &
PIDS+=("$!")

# Ops dashboard
( cd ops && [ ! -d node_modules ] && npm install --legacy-peer-deps --no-audit --no-fund --silent; npm run dev ) &
PIDS+=("$!")

# Companion PWA
( cd companion && [ ! -d node_modules ] && npm install --legacy-peer-deps --no-audit --no-fund --silent; npm run dev ) &
PIDS+=("$!")

echo ""
echo "  Backend:    http://127.0.0.1:8000"
echo "  Ops:        http://localhost:3000"
echo "  Companion:  http://localhost:3001"
echo ""
echo "  Press Ctrl-C to stop all."
echo ""

wait
