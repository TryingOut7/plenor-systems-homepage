DO $$
DECLARE
  target_table text;
  constraint_name text;
BEGIN
  FOR target_table IN
    SELECT unnest(ARRAY['exports', 'imports', 'payload_jobs', 'payload_query_presets'])
  LOOP
    IF to_regclass(format('public.%I', target_table)) IS NULL THEN
      CONTINUE;
    END IF;

    constraint_name := target_table || '_pkey';

    IF EXISTS (
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public'
        AND t.relname = target_table
        AND c.conname = constraint_name
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.%I DROP CONSTRAINT %I',
        target_table,
        constraint_name
      );
    END IF;
  END LOOP;
END
$$;
