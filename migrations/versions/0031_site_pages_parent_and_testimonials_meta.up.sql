-- Ensure Payload runtime read-path columns exist for site_pages/testimonials.

BEGIN;

ALTER TABLE IF EXISTS public.site_pages
  ADD COLUMN IF NOT EXISTS parent_id integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'site_pages_parent_id_site_pages_id_fk'
      AND conrelid = 'public.site_pages'::regclass
  ) THEN
    ALTER TABLE public.site_pages
      ADD CONSTRAINT site_pages_parent_id_site_pages_id_fk
      FOREIGN KEY (parent_id)
      REFERENCES public.site_pages(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS site_pages_parent_id_idx
  ON public.site_pages(parent_id);

ALTER TABLE IF EXISTS public.testimonials
  ADD COLUMN IF NOT EXISTS meta_title character varying,
  ADD COLUMN IF NOT EXISTS meta_description character varying,
  ADD COLUMN IF NOT EXISTS meta_image_id integer;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'media'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'testimonials_meta_image_id_media_id_fk'
      AND conrelid = 'public.testimonials'::regclass
  ) THEN
    ALTER TABLE public.testimonials
      ADD CONSTRAINT testimonials_meta_image_id_media_id_fk
      FOREIGN KEY (meta_image_id)
      REFERENCES public.media(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

COMMIT;
