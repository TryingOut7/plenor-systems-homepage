-- Hotfix: add Site Pages sidebar fields missing in Supabase schema.
-- Safe to run multiple times.

BEGIN;

ALTER TABLE IF EXISTS site_pages
  ADD COLUMN IF NOT EXISTS hide_navbar boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS hide_footer boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS page_background_color varchar,
  ADD COLUMN IF NOT EXISTS custom_head_scripts varchar;

-- Optional: if versions are enabled in the future and a versions table exists,
-- keep it aligned too.
ALTER TABLE IF EXISTS _site_pages_v
  ADD COLUMN IF NOT EXISTS version_hide_navbar boolean,
  ADD COLUMN IF NOT EXISTS version_hide_footer boolean,
  ADD COLUMN IF NOT EXISTS version_page_background_color varchar,
  ADD COLUMN IF NOT EXISTS version_custom_head_scripts varchar;

COMMIT;
