-- Extend Payload query preset related_collection enum with workspace collections.
-- Idempotent: safe to run multiple times across environments.

BEGIN;

DO $$
BEGIN
  IF to_regtype('public.enum_payload_query_presets_related_collection') IS NULL THEN
    RAISE NOTICE 'Type public.enum_payload_query_presets_related_collection does not exist; skipping.';
    RETURN;
  END IF;

  ALTER TYPE public.enum_payload_query_presets_related_collection
    ADD VALUE IF NOT EXISTS 'page-drafts';

  ALTER TYPE public.enum_payload_query_presets_related_collection
    ADD VALUE IF NOT EXISTS 'page-presets';

  ALTER TYPE public.enum_payload_query_presets_related_collection
    ADD VALUE IF NOT EXISTS 'page-playgrounds';
END;
$$;

COMMIT;
