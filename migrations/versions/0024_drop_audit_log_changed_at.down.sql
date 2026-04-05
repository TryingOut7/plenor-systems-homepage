-- Restore changed_at column if rolling back.
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS changed_at timestamptz;
