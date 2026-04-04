-- Rollback for auto-generated schema drift repair.

BEGIN;

ALTER TABLE IF EXISTS public._ui_settings_v
  DROP COLUMN IF EXISTS version_email_palette_primary,
  DROP COLUMN IF EXISTS version_email_palette_muted,
  DROP COLUMN IF EXISTS version_email_palette_text,
  DROP COLUMN IF EXISTS version_email_palette_background,
  DROP COLUMN IF EXISTS version_email_palette_white,
  DROP COLUMN IF EXISTS version_email_palette_border,
  DROP COLUMN IF EXISTS version_email_palette_error;

ALTER TABLE IF EXISTS public._site_settings_v
  DROP COLUMN IF EXISTS version_content_routing_guide_title,
  DROP COLUMN IF EXISTS version_content_routing_guide_pdf_url,
  DROP COLUMN IF EXISTS version_content_routing_guide_page_url,
  DROP COLUMN IF EXISTS version_content_routing_privacy_policy_url,
  DROP COLUMN IF EXISTS version_content_routing_workflow_notify_email;

ALTER TABLE IF EXISTS public.audit_logs
  DROP COLUMN IF EXISTS actor_id;

COMMIT;