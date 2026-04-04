-- Add source_playground_id column and FK to page_presets.
-- Safe to run multiple times.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'page_presets'
      AND column_name = 'source_playground_id'
  ) THEN
    ALTER TABLE public.page_presets ADD COLUMN source_playground_id integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'page_presets_source_playground_id_page_playgrounds_id_fk') THEN
    ALTER TABLE public.page_presets
      ADD CONSTRAINT page_presets_source_playground_id_page_playgrounds_id_fk
      FOREIGN KEY (source_playground_id) REFERENCES public.page_playgrounds(id) ON DELETE SET NULL;
  END IF;
END $$;
