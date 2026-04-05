#!/usr/bin/env bash
set -euo pipefail

# Snapshot backup for Payload CMS Postgres database.
# Usage: ./scripts/backup.sh
# Requires: pg_dump, gzip
# Reads POSTGRES_URL (Supabase+Vercel auto-provisioned) from environment or .env file.
# Falls back to DATABASE_URI / DATABASE_URL for legacy deployments.

# Resolve from environment first, then .env file
_DB_URI="${POSTGRES_URL:-${DATABASE_URI:-${DATABASE_URL:-}}}"

if [ -z "$_DB_URI" ] && [ -f .env ]; then
  _DB_URI=$(grep -E '^(POSTGRES_URL|DATABASE_URI|DATABASE_URL)=' .env | head -1 | cut -d '=' -f2-)
fi

if [ -z "$_DB_URI" ]; then
  echo "ERROR: POSTGRES_URL is not set (also checked DATABASE_URI / DATABASE_URL)." >&2
  exit 1
fi

BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="$BACKUP_DIR/payload_backup_${TIMESTAMP}.sql.gz"

echo "Creating backup: $FILENAME"
pg_dump "$_DB_URI" --no-owner --no-acl | gzip > "$FILENAME"

echo "Backup complete: $FILENAME ($(du -h "$FILENAME" | cut -f1))"

# Keep only the last 10 backups
cd "$BACKUP_DIR"
ls -t payload_backup_*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm --
echo "Cleanup done. $(ls payload_backup_*.sql.gz 2>/dev/null | wc -l) backups retained."
