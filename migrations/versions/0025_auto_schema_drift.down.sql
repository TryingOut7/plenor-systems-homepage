-- Rollback for auto-generated schema drift repair.
-- NOTE: Enum label additions are forward-only and intentionally not removed here.

BEGIN;

ALTER TABLE IF EXISTS public.page_drafts
  DROP COLUMN IF EXISTS sections_locked;

COMMIT;