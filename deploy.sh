#!/usr/bin/env bash
set -euo pipefail

PM2_APP="budget-api"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

fail() {
  log "ERROR: $*"
  exit 1
}

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

log "=== Deploy started ==="

# ── 1. Check for new commits ──────────────────────────────────────────────────
log "Fetching remote..."
git fetch origin

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse '@{u}')

if [[ "$LOCAL" == "$REMOTE" ]]; then
  log "Already up to date. Nothing to deploy."
  exit 0
fi

log "New commits found ($(git log --oneline "$LOCAL".."$REMOTE" | wc -l | tr -d ' ') commit(s))"

# ── 2. Pull ───────────────────────────────────────────────────────────────────
log "Pulling latest..."
git pull || fail "git pull failed"

# ── 3. Backend ────────────────────────────────────────────────────────────────
log "Installing backend dependencies..."
cd "$REPO_DIR/backend"
npm install --omit=dev || fail "backend npm install failed"

log "Building backend..."
npm run build || fail "backend build failed"

log "Running DB migrations..."
npx prisma migrate deploy || fail "prisma migrate failed"

# ── 4. Frontend ───────────────────────────────────────────────────────────────
log "Installing frontend dependencies..."
cd "$REPO_DIR/frontend"
npm install || fail "frontend npm install failed"

log "Building frontend..."
npm run build || fail "frontend build failed"

# ── 5. Reload process ─────────────────────────────────────────────────────────
log "Restarting $PM2_APP via pm2..."
cd "$REPO_DIR"
pm2 restart "$PM2_APP" || fail "pm2 restart failed"

log "=== Deploy complete ==="
