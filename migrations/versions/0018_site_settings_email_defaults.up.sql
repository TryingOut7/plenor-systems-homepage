-- Add emailDefaults group columns to site_settings and _site_settings_v.
-- These were defined in the Payload global but never landed in production.
-- Safe to run multiple times (all statements use IF NOT EXISTS).

BEGIN;

ALTER TABLE IF EXISTS public.site_settings
  ADD COLUMN IF NOT EXISTS email_defaults_brand_name varchar,
  ADD COLUMN IF NOT EXISTS email_defaults_guide_subject varchar,
  ADD COLUMN IF NOT EXISTS email_defaults_guide_heading varchar,
  ADD COLUMN IF NOT EXISTS email_defaults_guide_body text,
  ADD COLUMN IF NOT EXISTS email_defaults_guide_button_label varchar,
  ADD COLUMN IF NOT EXISTS email_defaults_inquiry_notification_subject varchar,
  ADD COLUMN IF NOT EXISTS email_defaults_inquiry_ack_subject varchar,
  ADD COLUMN IF NOT EXISTS email_defaults_inquiry_ack_heading varchar,
  ADD COLUMN IF NOT EXISTS email_defaults_inquiry_ack_body text;

ALTER TABLE IF EXISTS public._site_settings_v
  ADD COLUMN IF NOT EXISTS version_email_defaults_brand_name varchar,
  ADD COLUMN IF NOT EXISTS version_email_defaults_guide_subject varchar,
  ADD COLUMN IF NOT EXISTS version_email_defaults_guide_heading varchar,
  ADD COLUMN IF NOT EXISTS version_email_defaults_guide_body text,
  ADD COLUMN IF NOT EXISTS version_email_defaults_guide_button_label varchar,
  ADD COLUMN IF NOT EXISTS version_email_defaults_inquiry_notification_subject varchar,
  ADD COLUMN IF NOT EXISTS version_email_defaults_inquiry_ack_subject varchar,
  ADD COLUMN IF NOT EXISTS version_email_defaults_inquiry_ack_heading varchar,
  ADD COLUMN IF NOT EXISTS version_email_defaults_inquiry_ack_body text;

COMMIT;
