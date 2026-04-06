-- Rollback for auto-generated schema drift repair.
-- NOTE: Enum label additions are forward-only and intentionally not removed here.

BEGIN;

ALTER TABLE IF EXISTS public.legacy_hero
  DROP COLUMN IF EXISTS section_label;

ALTER TABLE IF EXISTS public.legacy_stage
  DROP COLUMN IF EXISTS section_label;

ALTER TABLE IF EXISTS public.legacy_cta
  DROP COLUMN IF EXISTS section_label;

COMMIT;