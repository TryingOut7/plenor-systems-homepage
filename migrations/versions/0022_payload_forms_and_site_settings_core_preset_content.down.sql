-- Rollback for Payload schema alignment migration 0022.

BEGIN;

ALTER TABLE IF EXISTS public.forms
  DROP COLUMN IF EXISTS template_key;

ALTER TABLE IF EXISTS public.site_settings
  DROP COLUMN IF EXISTS core_preset_content_home,
  DROP COLUMN IF EXISTS core_preset_content_services,
  DROP COLUMN IF EXISTS core_preset_content_about,
  DROP COLUMN IF EXISTS core_preset_content_pricing,
  DROP COLUMN IF EXISTS core_preset_content_contact;

ALTER TABLE IF EXISTS public._site_settings_v
  DROP COLUMN IF EXISTS version_core_preset_content_home,
  DROP COLUMN IF EXISTS version_core_preset_content_services,
  DROP COLUMN IF EXISTS version_core_preset_content_about,
  DROP COLUMN IF EXISTS version_core_preset_content_pricing,
  DROP COLUMN IF EXISTS version_core_preset_content_contact;

COMMIT;
