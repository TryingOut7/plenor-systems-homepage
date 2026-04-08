-- This reconciliation migration is intentionally irreversible.
--
-- It may create missing tables/columns/enums and cast legacy IDs to varchar.
-- Reverting automatically could cause data loss or runtime regressions.
--
-- Keep rollback as a no-op; use restore-from-backup for full rollback scenarios.
SELECT 1;
