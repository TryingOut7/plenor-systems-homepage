-- Hotfix: add missing columns to site_settings and ui_settings globals.
-- These columns were added to the Payload schema but never landed in production
-- because no migration was generated before deployment.
-- Safe to run multiple times (all statements use IF NOT EXISTS).

BEGIN;

-- ---------------------------------------------------------------------------
-- site_settings: contentRouting group
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.site_settings
  ADD COLUMN IF NOT EXISTS content_routing_guide_title varchar,
  ADD COLUMN IF NOT EXISTS content_routing_guide_pdf_url varchar,
  ADD COLUMN IF NOT EXISTS content_routing_guide_page_url varchar,
  ADD COLUMN IF NOT EXISTS content_routing_privacy_policy_url varchar,
  ADD COLUMN IF NOT EXISTS content_routing_workflow_notify_email varchar;

-- ---------------------------------------------------------------------------
-- ui_settings: emailPalette group
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.ui_settings
  ADD COLUMN IF NOT EXISTS email_palette_primary varchar,
  ADD COLUMN IF NOT EXISTS email_palette_muted varchar,
  ADD COLUMN IF NOT EXISTS email_palette_text varchar,
  ADD COLUMN IF NOT EXISTS email_palette_background varchar,
  ADD COLUMN IF NOT EXISTS email_palette_white varchar,
  ADD COLUMN IF NOT EXISTS email_palette_border varchar,
  ADD COLUMN IF NOT EXISTS email_palette_error varchar;

COMMIT;
