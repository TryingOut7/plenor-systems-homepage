#!/usr/bin/env bash
#
# Snapshot backup: exports Payload CMS database and media files.
#
# Usage:
#   ./scripts/backup.sh                    # Uses DATABASE_URI from .env.local
#   DATABASE_URI="postgres://..." ./scripts/backup.sh
#
# Output: ./backups/<timestamp>/
#   - db.sql.gz      Compressed pg_dump of the database
#   - media.tar.gz   Compressed archive of uploaded media (if present)
#   - manifest.json  Backup metadata
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load .env.local if DATABASE_URI is not already set
if [ -z "${DATABASE_URI:-}" ]; then
  ENV_FILE="$PROJECT_DIR/.env.local"
  if [ -f "$ENV_FILE" ]; then
    DATABASE_URI=$(grep -E '^DATABASE_URI=' "$ENV_FILE" | head -1 | cut -d'=' -f2-)
    # Also try DATABASE_URL as fallback
    if [ -z "$DATABASE_URI" ]; then
      DATABASE_URI=$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -1 | cut -d'=' -f2-)
    fi
  fi
fi

if [ -z "${DATABASE_URI:-}" ]; then
  echo "Error: DATABASE_URI is not set. Provide it via environment or .env.local."
  exit 1
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$PROJECT_DIR/backups/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

echo "==> Backing up database..."
if command -v pg_dump &>/dev/null; then
  pg_dump "$DATABASE_URI" --no-owner --no-privileges --clean --if-exists \
    | gzip > "$BACKUP_DIR/db.sql.gz"
  echo "    Database backup: $BACKUP_DIR/db.sql.gz"
else
  echo "    Warning: pg_dump not found. Skipping database backup."
  echo "    Install postgresql-client to enable database backups."
fi

MEDIA_DIR="$PROJECT_DIR/media"
if [ -d "$MEDIA_DIR" ] && [ "$(ls -A "$MEDIA_DIR" 2>/dev/null)" ]; then
  echo "==> Backing up media files..."
  tar -czf "$BACKUP_DIR/media.tar.gz" -C "$PROJECT_DIR" media
  echo "    Media backup: $BACKUP_DIR/media.tar.gz"
else
  echo "==> No local media directory found. Skipping media backup."
fi

cat > "$BACKUP_DIR/manifest.json" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "type": "snapshot",
  "contents": {
    "database": $([ -f "$BACKUP_DIR/db.sql.gz" ] && echo 'true' || echo 'false'),
    "media": $([ -f "$BACKUP_DIR/media.tar.gz" ] && echo 'true' || echo 'false')
  }
}
EOF

echo "==> Backup complete: $BACKUP_DIR"
echo "    Manifest: $BACKUP_DIR/manifest.json"
