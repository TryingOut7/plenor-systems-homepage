-- Rollback: remove the columns added in 0016_global_settings_missing_columns.up.sql

BEGIN;

ALTER TABLE IF EXISTS public.site_settings
  DROP COLUMN IF EXISTS content_routing_guide_title,
  DROP COLUMN IF EXISTS content_routing_guide_pdf_url,
  DROP COLUMN IF EXISTS content_routing_guide_page_url,
  DROP COLUMN IF EXISTS content_routing_privacy_policy_url,
  DROP COLUMN IF EXISTS content_routing_workflow_notify_email;

ALTER TABLE IF EXISTS public.ui_settings
  DROP COLUMN IF EXISTS email_palette_primary,
  DROP COLUMN IF EXISTS email_palette_muted,
  DROP COLUMN IF EXISTS email_palette_text,
  DROP COLUMN IF EXISTS email_palette_background,
  DROP COLUMN IF EXISTS email_palette_white,
  DROP COLUMN IF EXISTS email_palette_border,
  DROP COLUMN IF EXISTS email_palette_error;

COMMIT;
