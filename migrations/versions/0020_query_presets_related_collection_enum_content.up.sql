-- Extend query preset related_collection enum with remaining content collections
-- that have enableQueryPresets enabled in Payload config.

BEGIN;

DO $$
BEGIN
  IF to_regtype('public.enum_payload_query_presets_related_collection') IS NULL THEN
    RAISE NOTICE 'Type public.enum_payload_query_presets_related_collection does not exist; skipping.';
    RETURN;
  END IF;

  ALTER TYPE public.enum_payload_query_presets_related_collection
    ADD VALUE IF NOT EXISTS 'blog-categories';

  ALTER TYPE public.enum_payload_query_presets_related_collection
    ADD VALUE IF NOT EXISTS 'team-members';

  ALTER TYPE public.enum_payload_query_presets_related_collection
    ADD VALUE IF NOT EXISTS 'logos';
END;
$$;

COMMIT;
