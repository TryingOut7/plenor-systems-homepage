#!/usr/bin/env bash
# vercel-env-setup.sh
#
# Sets all required and recommended environment variables for plenor-systems-homepage
# on Vercel (production environment).
#
# Prerequisites:
#   npm i -g vercel
#   vercel login
#   vercel link  (link this repo to the Vercel project)
#
# Usage:
#   chmod +x scripts/vercel-env-setup.sh
#   ./scripts/vercel-env-setup.sh
#
# The script will prompt for secrets it cannot infer. Values marked [REQUIRED]
# will cause the app to refuse to start if missing in production.
#
# Vercel project: plenor-systems-homepage
# Team:           tryingout7s-projects

set -euo pipefail

VERCEL_SCOPE="--scope=tryingout7s-projects"
ENV_TARGET="production"

info()  { echo "  [info]  $*"; }
warn()  { echo "  [warn]  $*"; }
prompt_secret() {
  local var_name="$1"
  local description="$2"
  local value
  printf "  Enter %s (%s): " "$var_name" "$description"
  read -rs value
  echo
  echo "$value"
}

set_env() {
  local name="$1"
  local value="$2"
  local target="${3:-$ENV_TARGET}"
  echo "$value" | vercel env add "$name" "$target" $VERCEL_SCOPE --force 2>/dev/null || \
    echo "$value" | vercel env add "$name" "$target" $VERCEL_SCOPE
  info "Set $name"
}

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  Vercel environment setup: plenor-systems-homepage"
echo "══════════════════════════════════════════════════════════════"
echo ""

# ── DATABASE ──────────────────────────────────────────────────────────────────
echo "── Database ─────────────────────────────────────────────────"
echo ""
info "POSTGRES_URL is auto-provisioned by the Supabase+Vercel integration."
info "If you connected Supabase via the Vercel Marketplace, skip this step —"
info "POSTGRES_URL is already set automatically."
echo ""
warn "If setting manually: POSTGRES_URL MUST use the Transaction Pooler URL (port 6543),"
warn "NOT the direct connection (port 5432). Using port 5432 causes connection"
warn "exhaustion in serverless environments and 500 errors under load."
warn ""
warn "Get the pooler URL from:"
warn "  Supabase Dashboard → Project Settings → Database"
warn "  → Connection string → URI → switch to 'Transaction pooler'"
warn "  The URL format is:"
warn "  postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
echo ""
POSTGRES_URL=$(prompt_secret "POSTGRES_URL" "Supabase Transaction Pooler URL port 6543 [REQUIRED if not auto-provisioned]")
if [[ -n "$POSTGRES_URL" ]]; then
  set_env "POSTGRES_URL" "$POSTGRES_URL"
fi
set_env "DATABASE_SSL_REJECT_UNAUTHORIZED" "false"

echo ""

# ── PAYLOAD CMS ───────────────────────────────────────────────────────────────
echo "── Payload CMS ──────────────────────────────────────────────"
echo ""
PAYLOAD_SECRET=$(prompt_secret "PAYLOAD_SECRET" "random string ≥32 chars [REQUIRED]")
set_env "PAYLOAD_SECRET" "$PAYLOAD_SECRET"

echo ""
warn "NEXT_PUBLIC_SERVER_URL must be your production URL, e.g. https://plenor.systems"
NEXT_PUBLIC_SERVER_URL=$(prompt_secret "NEXT_PUBLIC_SERVER_URL" "https://your-domain.com [REQUIRED]")
set_env "NEXT_PUBLIC_SERVER_URL" "$NEXT_PUBLIC_SERVER_URL"

echo ""

# ── SUPABASE ──────────────────────────────────────────────────────────────────
echo "── Supabase ─────────────────────────────────────────────────"
echo ""
info "Supabase URL (pre-filled from project zhcpdpvxrywblmipekyd):"
set_env "SUPABASE_URL" "https://zhcpdpvxrywblmipekyd.supabase.co"

SUPABASE_SERVICE_ROLE_KEY=$(prompt_secret "SUPABASE_SERVICE_ROLE_KEY" "from Supabase Dashboard → Project Settings → API [REQUIRED]")
set_env "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"

echo ""

# ── CRON SECRET ───────────────────────────────────────────────────────────────
echo "── Cron secret ──────────────────────────────────────────────"
echo ""
warn "CRON_SECRET secures the /api/internal/cron/* endpoints. Without it every"
warn "Vercel Cron call returns 401 and the outbox never drains."
echo ""
CRON_SECRET=$(prompt_secret "CRON_SECRET" "random string ≥32 chars [REQUIRED]")
set_env "CRON_SECRET" "$CRON_SECRET"

echo ""

# ── SENTRY ────────────────────────────────────────────────────────────────────
echo "── Sentry ───────────────────────────────────────────────────"
echo ""
info "Using DSN from plenor/javascript-nextjs project:"
SENTRY_DSN="https://e4ee4be056992167a870bfb36e4de204@o4511149912096768.ingest.de.sentry.io/4511149918847056"
set_env "SENTRY_DSN" "$SENTRY_DSN"
set_env "NEXT_PUBLIC_SENTRY_DSN" "$SENTRY_DSN"

echo ""

# ── VERCEL BLOB ───────────────────────────────────────────────────────────────
echo "── Vercel Blob ──────────────────────────────────────────────"
echo ""
warn "BLOB_READ_WRITE_TOKEN is required for persistent media uploads on Vercel."
warn "Without it, uploaded files are lost on the next deployment."
warn "Create a token at: Vercel Dashboard → Storage → Blob → Create Store"
echo ""
BLOB_READ_WRITE_TOKEN=$(prompt_secret "BLOB_READ_WRITE_TOKEN" "from Vercel Blob storage [REQUIRED for media]")
set_env "BLOB_READ_WRITE_TOKEN" "$BLOB_READ_WRITE_TOKEN"

echo ""

# ── EMAIL (RESEND) ────────────────────────────────────────────────────────────
echo "── Email (Resend) ───────────────────────────────────────────"
echo ""
RESEND_API_KEY=$(prompt_secret "RESEND_API_KEY" "from resend.com/api-keys")
set_env "RESEND_API_KEY" "$RESEND_API_KEY"

RESEND_FROM_EMAIL=$(prompt_secret "RESEND_FROM_EMAIL" "verified sender address e.g. noreply@plenor.systems")
set_env "RESEND_FROM_EMAIL" "$RESEND_FROM_EMAIL"

RESEND_FROM_NAME=$(prompt_secret "RESEND_FROM_NAME" "e.g. Plenor Systems")
set_env "RESEND_FROM_NAME" "$RESEND_FROM_NAME"

echo ""

# ── OPTIONAL: BACKEND API KEYS ────────────────────────────────────────────────
echo "── Backend API keys (optional, skip with Enter) ─────────────"
echo ""
BACKEND_INTERNAL_API_KEY=$(prompt_secret "BACKEND_INTERNAL_API_KEY" "internal role key (leave blank to skip)")
if [[ -n "$BACKEND_INTERNAL_API_KEY" ]]; then
  set_env "BACKEND_INTERNAL_API_KEY" "$BACKEND_INTERNAL_API_KEY"
fi

BACKEND_ADMIN_API_KEY=$(prompt_secret "BACKEND_ADMIN_API_KEY" "admin role key (leave blank to skip)")
if [[ -n "$BACKEND_ADMIN_API_KEY" ]]; then
  set_env "BACKEND_ADMIN_API_KEY" "$BACKEND_ADMIN_API_KEY"
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  Done. Trigger a new deployment to apply all env changes:"
echo "  vercel --prod $VERCEL_SCOPE"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "  Post-deploy verification:"
echo "  1. Check /admin — should load the Payload CMS admin panel"
echo "  2. Check runtime logs for any [env] warnings about missing vars"
echo "  3. Test form submission on the contact page"
echo "  4. Verify Sentry receives an error event (trigger a test error)"
echo ""
