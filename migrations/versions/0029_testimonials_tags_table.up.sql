-- Ensure testimonials tags array table exists for Payload list/detail reads.
CREATE TABLE IF NOT EXISTS public.testimonials_tags (
  _order      integer           NOT NULL DEFAULT 0,
  _parent_id  integer           NOT NULL,
  id          character varying PRIMARY KEY,
  tag         character varying NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'testimonials_tags_parent_fk'
      AND conrelid = 'public.testimonials_tags'::regclass
  ) THEN
    ALTER TABLE public.testimonials_tags
      ADD CONSTRAINT testimonials_tags_parent_fk
      FOREIGN KEY (_parent_id)
      REFERENCES public.testimonials(id)
      ON DELETE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS testimonials_tags_parent_order_idx
  ON public.testimonials_tags (_parent_id, _order);
