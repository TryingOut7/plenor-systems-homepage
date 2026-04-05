-- Align Payload schema with current form/template and site settings config.
-- Adds immutable form template discriminator and core preset content JSON groups.

BEGIN;

ALTER TABLE IF EXISTS public.forms
  ADD COLUMN IF NOT EXISTS template_key character varying;

ALTER TABLE IF EXISTS public.site_settings
  ADD COLUMN IF NOT EXISTS core_preset_content_home jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS core_preset_content_services jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS core_preset_content_about jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS core_preset_content_pricing jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS core_preset_content_contact jsonb DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public._site_settings_v
  ADD COLUMN IF NOT EXISTS version_core_preset_content_home jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS version_core_preset_content_services jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS version_core_preset_content_about jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS version_core_preset_content_pricing jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS version_core_preset_content_contact jsonb DEFAULT '{}'::jsonb;

COMMIT;
