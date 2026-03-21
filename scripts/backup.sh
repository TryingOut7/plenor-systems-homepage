#!/usr/bin/env bash
set -euo pipefail

# Snapshot backup for Payload CMS Postgres database.
# Usage: ./scripts/backup.sh
# Requires: pg_dump, gzip
# Reads DATABASE_URI from environment or .env file.

if [ -z "${DATABASE_URI:-}" ] && [ -f .env ]; then
  DATABASE_URI=$(grep '^DATABASE_URI=' .env | cut -d '=' -f2-)
fi

if [ -z "${DATABASE_URI:-}" ]; then
  echo "ERROR: DATABASE_URI is not set." >&2
  exit 1
fi

BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="$BACKUP_DIR/payload_backup_${TIMESTAMP}.sql.gz"

echo "Creating backup: $FILENAME"
pg_dump "$DATABASE_URI" --no-owner --no-acl | gzip > "$FILENAME"

echo "Backup complete: $FILENAME ($(du -h "$FILENAME" | cut -f1))"

# Keep only the last 10 backups
cd "$BACKUP_DIR"
ls -t payload_backup_*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm --
echo "Cleanup done. $(ls payload_backup_*.sql.gz 2>/dev/null | wc -l) backups retained."
