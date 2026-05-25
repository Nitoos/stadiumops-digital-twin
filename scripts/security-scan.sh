#!/usr/bin/env bash
# Run dependency + secret + SAST scans across the project.
# Designed to be cheap (no paid tools) and CI-friendly (exit codes propagate).
set -e

cd "$(dirname "$0")/.."

GREEN="\033[0;32m"; RED="\033[0;31m"; YELLOW="\033[1;33m"; RESET="\033[0m"
fail() { echo -e "${RED}✗ $1${RESET}"; exit 1; }
ok()   { echo -e "${GREEN}✓ $1${RESET}"; }
warn() { echo -e "${YELLOW}⚠ $1${RESET}"; }

echo "=== Python deps (pip-audit) ==="
if [ -d ".venv" ]; then
  .venv/bin/pip install --quiet pip-audit >/dev/null 2>&1 || warn "couldn't install pip-audit"
  if ! .venv/bin/pip-audit --strict --requirement requirements.txt 2>&1; then
    fail "pip-audit found vulnerable Python dependencies"
  fi
  ok "pip-audit: no known vulns in requirements.txt"
else
  warn ".venv not found — skipping pip-audit"
fi

echo
echo "=== Node deps (npm audit) ==="
for app in ops companion; do
  if [ -d "$app/node_modules" ]; then
    echo "--- $app ---"
    if ! (cd "$app" && npm audit --omit=dev --audit-level=high 2>&1); then
      warn "$app: npm audit found issues at level=high (review)"
    else
      ok "$app: npm audit clean at level=high"
    fi
  fi
done

echo
echo "=== Secret scan (grep heuristic — replace with gitleaks in CI) ==="
SECRET_PATTERNS='(AKIA|aws_secret|gho_[A-Za-z0-9]{36}|ghp_[A-Za-z0-9]{36}|AIzaSy[A-Za-z0-9_\-]{33}|-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----)'
if git ls-files | xargs grep -nE "$SECRET_PATTERNS" --exclude-dir=node_modules 2>/dev/null; then
  fail "Potential secret committed — review the matches above"
fi
ok "no secret-like strings found in tracked files"

echo
echo "=== .env not tracked ==="
if git ls-files .env >/dev/null 2>&1; then
  fail ".env is tracked in git — remove and rotate any keys it contained"
fi
ok ".env is gitignored"

echo
echo "=== Backend unit + security tests ==="
if [ -d ".venv" ]; then
  .venv/bin/pytest backend/tests/ -q || fail "backend tests failed"
  ok "backend tests passed"
fi

echo
echo "=== Frontend typecheck ==="
for app in ops companion; do
  if [ -f "$app/package.json" ]; then
    (cd "$app" && npm run typecheck --silent) || fail "$app typecheck failed"
    ok "$app typechecks clean"
  fi
done

echo
echo -e "${GREEN}All security checks complete.${RESET}"
