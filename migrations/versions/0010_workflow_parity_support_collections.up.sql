-- Governance parity: add workflow review metadata to support collections.
-- Safe to run multiple times.

DO $$
DECLARE
  target_table text;
  reviewed_constraint text;
  approved_constraint text;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'blog_categories',
    'team_members',
    'logos'
  ] LOOP
    EXECUTE format(
      'ALTER TABLE IF EXISTS public.%I
         ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
         ADD COLUMN IF NOT EXISTS workflow_status varchar DEFAULT ''draft'',
         ADD COLUMN IF NOT EXISTS review_checklist_complete boolean DEFAULT false,
         ADD COLUMN IF NOT EXISTS review_summary text,
         ADD COLUMN IF NOT EXISTS reviewed_by_id integer,
         ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
         ADD COLUMN IF NOT EXISTS approved_by_id integer,
         ADD COLUMN IF NOT EXISTS approved_at timestamptz,
         ADD COLUMN IF NOT EXISTS rejection_reason text',
      target_table
    );

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON public.%I (workflow_status)',
      target_table || '_workflow_status_idx',
      target_table
    );

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON public.%I (deleted_at)',
      target_table || '_deleted_at_idx',
      target_table
    );

    reviewed_constraint := target_table || '_reviewed_by_id_users_id_fk';
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = reviewed_constraint) THEN
      EXECUTE format(
        'ALTER TABLE public.%I
           ADD CONSTRAINT %I
           FOREIGN KEY (reviewed_by_id)
           REFERENCES public.users(id)
           ON DELETE SET NULL',
        target_table,
        reviewed_constraint
      );
    END IF;

    approved_constraint := target_table || '_approved_by_id_users_id_fk';
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = approved_constraint) THEN
      EXECUTE format(
        'ALTER TABLE public.%I
           ADD CONSTRAINT %I
           FOREIGN KEY (approved_by_id)
           REFERENCES public.users(id)
           ON DELETE SET NULL',
        target_table,
        approved_constraint
      );
    END IF;
  END LOOP;
END $$;
