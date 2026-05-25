#!/usr/bin/env bash
# Deploy StadiumOps to Google Cloud Run (3 services).
# Prerequisites: gcloud CLI authenticated, Docker running, project set.
#
# Usage:
#   export GCP_PROJECT=your-project-id
#   export GOOGLE_API_KEY=your-gemini-key
#   ./deploy-cloudrun.sh

set -euo pipefail

PROJECT="${GCP_PROJECT:?Set GCP_PROJECT}"
REGION="${GCP_REGION:-us-central1}"
REPO="${REGION}-docker.pkg.dev/${PROJECT}/stadiumops"
API_KEY="${GOOGLE_API_KEY:?Set GOOGLE_API_KEY}"

echo "==> Enabling required APIs..."
gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  --project="${PROJECT}"

echo "==> Creating Artifact Registry repository (if missing)..."
gcloud artifacts repositories create stadiumops \
  --repository-format=docker \
  --location="${REGION}" \
  --project="${PROJECT}" 2>/dev/null || true

echo "==> Configuring Docker auth..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# ── Step 1: backend ────────────────────────────────────────────────────────────
echo ""
echo "==> [1/3] Building & deploying backend..."

docker build \
  --platform linux/amd64 \
  -t "${REPO}/backend:latest" \
  -f backend/Dockerfile \
  .

docker push "${REPO}/backend:latest"

gcloud run deploy stadiumops-backend \
  --image="${REPO}/backend:latest" \
  --region="${REGION}" \
  --project="${PROJECT}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --set-env-vars="AGENT_MODE=real,GOOGLE_API_KEY=${API_KEY}" \
  --quiet

BACKEND_URL=$(gcloud run services describe stadiumops-backend \
  --region="${REGION}" --project="${PROJECT}" \
  --format="value(status.url)")

echo "Backend URL: ${BACKEND_URL}"

# Derive WebSocket URL (https → wss)
BACKEND_WS="${BACKEND_URL/https:\/\//wss://}/ws"

# ── Step 2: ops dashboard ──────────────────────────────────────────────────────
echo ""
echo "==> [2/3] Building & deploying ops dashboard..."

docker build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API="${BACKEND_URL}" \
  --build-arg NEXT_PUBLIC_WS="${BACKEND_WS}" \
  -t "${REPO}/ops:latest" \
  -f ops/Dockerfile \
  ops/

docker push "${REPO}/ops:latest"

gcloud run deploy stadiumops-ops \
  --image="${REPO}/ops:latest" \
  --region="${REGION}" \
  --project="${PROJECT}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --quiet

OPS_URL=$(gcloud run services describe stadiumops-ops \
  --region="${REGION}" --project="${PROJECT}" \
  --format="value(status.url)")

echo "Ops dashboard URL: ${OPS_URL}"

# ── Step 3: companion PWA ──────────────────────────────────────────────────────
echo ""
echo "==> [3/3] Building & deploying companion PWA..."

docker build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API="${BACKEND_URL}" \
  -t "${REPO}/companion:latest" \
  -f companion/Dockerfile \
  companion/

docker push "${REPO}/companion:latest"

gcloud run deploy stadiumops-companion \
  --image="${REPO}/companion:latest" \
  --region="${REGION}" \
  --project="${PROJECT}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --quiet

COMPANION_URL=$(gcloud run services describe stadiumops-companion \
  --region="${REGION}" --project="${PROJECT}" \
  --format="value(status.url)")

echo "Companion PWA URL: ${COMPANION_URL}"

# ── Step 4: update backend CORS ────────────────────────────────────────────────
echo ""
echo "==> Updating backend CORS to allow frontend origins..."

gcloud run services update stadiumops-backend \
  --region="${REGION}" \
  --project="${PROJECT}" \
  --update-env-vars="CORS_ORIGINS=${OPS_URL},${COMPANION_URL},http://localhost:3000,http://localhost:3001" \
  --quiet

echo ""
echo "======================================================"
echo "Deployment complete!"
echo "  Backend:   ${BACKEND_URL}"
echo "  Ops:       ${OPS_URL}"
echo "  Companion: ${COMPANION_URL}"
echo "======================================================"
