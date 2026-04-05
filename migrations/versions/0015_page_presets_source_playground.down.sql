-- Reverse: drop source_playground_id from page_presets.

ALTER TABLE public.page_presets
  DROP CONSTRAINT IF EXISTS page_presets_source_playground_id_page_playgrounds_id_fk;

ALTER TABLE public.page_presets
  DROP COLUMN IF EXISTS source_playground_id;
