-- Ensure nested-doc breadcrumbs table exists for site-pages list/detail queries.
CREATE TABLE IF NOT EXISTS public.site_pages_breadcrumbs (
  _order      integer           NOT NULL DEFAULT 0,
  _parent_id  integer           NOT NULL,
  id          character varying PRIMARY KEY,
  doc_id      integer,
  url         character varying,
  label       character varying
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'site_pages_breadcrumbs_parent_fk'
      AND conrelid = 'public.site_pages_breadcrumbs'::regclass
  ) THEN
    ALTER TABLE public.site_pages_breadcrumbs
      ADD CONSTRAINT site_pages_breadcrumbs_parent_fk
      FOREIGN KEY (_parent_id)
      REFERENCES public.site_pages(id)
      ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'site_pages_breadcrumbs_doc_fk'
      AND conrelid = 'public.site_pages_breadcrumbs'::regclass
  ) THEN
    ALTER TABLE public.site_pages_breadcrumbs
      ADD CONSTRAINT site_pages_breadcrumbs_doc_fk
      FOREIGN KEY (doc_id)
      REFERENCES public.site_pages(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS site_pages_breadcrumbs_parent_order_idx
  ON public.site_pages_breadcrumbs (_parent_id, _order);
