-- Ensure payload relation sync can reference these tables via FK on `id`.
-- This migration is idempotent and validates that `id` is key-safe before
-- attaching a primary key.

DO $$
DECLARE
  target_table text;
  null_count bigint;
  duplicate_count bigint;
BEGIN
  FOR target_table IN
    SELECT unnest(ARRAY['exports', 'imports', 'payload_jobs', 'payload_query_presets'])
  LOOP
    IF to_regclass(format('public.%I', target_table)) IS NULL THEN
      CONTINUE;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = target_table
        AND column_name = 'id'
    ) THEN
      CONTINUE;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public'
        AND t.relname = target_table
        AND c.contype = 'p'
    ) THEN
      CONTINUE;
    END IF;

    EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE id IS NULL', target_table)
      INTO null_count;

    IF null_count > 0 THEN
      RAISE EXCEPTION
        'Cannot add primary key on %.id because % NULL values exist.',
        target_table,
        null_count;
    END IF;

    EXECUTE format(
      'SELECT COUNT(*) FROM (SELECT id FROM public.%I GROUP BY id HAVING COUNT(*) > 1) duplicates',
      target_table
    )
      INTO duplicate_count;

    IF duplicate_count > 0 THEN
      RAISE EXCEPTION
        'Cannot add primary key on %.id because duplicate values exist (% groups).',
        target_table,
        duplicate_count;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id SET NOT NULL', target_table);
    EXECUTE format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I PRIMARY KEY (id)',
      target_table,
      target_table || '_pkey'
    );
  END LOOP;
END
$$;
