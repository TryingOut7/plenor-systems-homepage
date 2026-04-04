-- Extend query preset related_collection enum to include the forms collection.
-- Idempotent and safe to run multiple times.

BEGIN;

DO $$
BEGIN
  IF to_regtype('public.enum_payload_query_presets_related_collection') IS NULL THEN
    RAISE NOTICE 'Type public.enum_payload_query_presets_related_collection does not exist; skipping.';
    RETURN;
  END IF;

  ALTER TYPE public.enum_payload_query_presets_related_collection
    ADD VALUE IF NOT EXISTS 'forms';
END;
$$;

COMMIT;
