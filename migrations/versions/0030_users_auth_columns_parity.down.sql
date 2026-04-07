-- Rollback intentionally left as a no-op.
-- This migration backfills auth/admin columns that may already exist on
-- healthy environments. Dropping them would risk data loss and broken auth.

BEGIN;
SELECT 1;
COMMIT;
