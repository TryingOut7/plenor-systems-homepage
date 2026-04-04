-- Drop site_pages-only FK constraints from all section block tables so they can be
-- used as shared block tables by page_drafts, page_presets, and page_playgrounds.
--
-- Background: All section blocks declare a global dbName (e.g. dbName:'hero'), which
-- means multiple Payload collections share a single physical table. The original
-- migrations created these tables with _parent_id REFERENCES site_pages(id), which
-- worked when site_pages was the only collection with sections. Migration 0012 added
-- workspace collections (page_drafts, page_presets, page_playgrounds) — all using the
-- same block tables — but did not update the FK constraints. As a result, inserting a
-- section block with a workspace-collection parent ID violates the FK and fails.
--
-- Fix: drop the _parent_id FK on every block table. _parent_id becomes a plain indexed
-- integer. Payload's application layer handles block row lifecycle, so DB-level CASCADE
-- is not required for correct operation.
--
-- Safe to run multiple times (each drop is wrapped in an existence check).

DO $$
DECLARE
  rec RECORD;
BEGIN
  -- Dynamically drop any FK constraint on _parent_id that references site_pages.
  -- This covers tables created by both SQL migrations and Payload db:push.
  FOR rec IN
    SELECT tc.constraint_name, tc.table_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.referential_constraints rc
      ON tc.constraint_name = rc.constraint_name
         AND tc.constraint_schema = rc.constraint_schema
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
         AND tc.constraint_schema = kcu.constraint_schema
    JOIN information_schema.constraint_column_usage ccu
      ON rc.unique_constraint_name = ccu.constraint_name
         AND rc.constraint_schema = ccu.constraint_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_schema = 'public'
      AND ccu.table_name = 'site_pages'
      AND kcu.column_name = '_parent_id'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I',
      rec.table_name,
      rec.constraint_name
    );
    RAISE NOTICE 'Dropped FK % on table %', rec.constraint_name, rec.table_name;
  END LOOP;
END $$;
