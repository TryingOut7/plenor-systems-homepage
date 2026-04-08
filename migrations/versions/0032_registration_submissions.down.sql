DROP INDEX IF EXISTS public.idx_registration_submissions_event_id;
DROP INDEX IF EXISTS public.idx_registration_submissions_public_id;
DROP INDEX IF EXISTS public.idx_registration_submissions_status_submitted_at;

DROP TABLE IF EXISTS public.registration_submissions;

ALTER TABLE IF EXISTS public.audit_logs
  DROP COLUMN IF EXISTS reason,
  DROP COLUMN IF EXISTS new_status,
  DROP COLUMN IF EXISTS old_status,
  DROP COLUMN IF EXISTS target_id,
  DROP COLUMN IF EXISTS actor_key_id;

-- NOTE: enum label removal is intentionally omitted because PostgreSQL does not
-- support dropping a single enum value safely in a simple reversible migration.
