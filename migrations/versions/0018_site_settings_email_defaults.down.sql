-- Rollback: remove emailDefaults columns from site_settings and _site_settings_v.

BEGIN;

ALTER TABLE IF EXISTS public.site_settings
  DROP COLUMN IF EXISTS email_defaults_brand_name,
  DROP COLUMN IF EXISTS email_defaults_guide_subject,
  DROP COLUMN IF EXISTS email_defaults_guide_heading,
  DROP COLUMN IF EXISTS email_defaults_guide_body,
  DROP COLUMN IF EXISTS email_defaults_guide_button_label,
  DROP COLUMN IF EXISTS email_defaults_inquiry_notification_subject,
  DROP COLUMN IF EXISTS email_defaults_inquiry_ack_subject,
  DROP COLUMN IF EXISTS email_defaults_inquiry_ack_heading,
  DROP COLUMN IF EXISTS email_defaults_inquiry_ack_body;

ALTER TABLE IF EXISTS public._site_settings_v
  DROP COLUMN IF EXISTS version_email_defaults_brand_name,
  DROP COLUMN IF EXISTS version_email_defaults_guide_subject,
  DROP COLUMN IF EXISTS version_email_defaults_guide_heading,
  DROP COLUMN IF EXISTS version_email_defaults_guide_body,
  DROP COLUMN IF EXISTS version_email_defaults_guide_button_label,
  DROP COLUMN IF EXISTS version_email_defaults_inquiry_notification_subject,
  DROP COLUMN IF EXISTS version_email_defaults_inquiry_ack_subject,
  DROP COLUMN IF EXISTS version_email_defaults_inquiry_ack_heading,
  DROP COLUMN IF EXISTS version_email_defaults_inquiry_ack_body;

COMMIT;
