-- Hotfix: backfill missing CMS hardening columns after partial rollout.
-- Safe to run multiple times.

BEGIN;

-- ---------------------------------------------------------------------------
-- Audit logs
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.audit_logs
  ADD COLUMN IF NOT EXISTS actor_id varchar;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'audit_logs'
      AND column_name = 'user_id'
  ) THEN
    UPDATE public.audit_logs
    SET actor_id = COALESCE(actor_id, user_id::text, 'system')
    WHERE actor_id IS NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Localization + review metadata for content collections
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  target_table text;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'blog_posts',
    'service_items',
    'testimonials',
    'reuse_sec'
  ] LOOP
    EXECUTE format(
      'ALTER TABLE IF EXISTS public.%I
         ADD COLUMN IF NOT EXISTS locale varchar DEFAULT ''en'',
         ADD COLUMN IF NOT EXISTS translation_group_id varchar,
         ADD COLUMN IF NOT EXISTS review_checklist_complete boolean DEFAULT false,
         ADD COLUMN IF NOT EXISTS review_summary text,
         ADD COLUMN IF NOT EXISTS reviewed_by_id integer,
         ADD COLUMN IF NOT EXISTS reviewed_at timestamptz',
      target_table
    );
  END LOOP;
END $$;

DO $$
DECLARE
  target_table text;
  fk_name text;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'blog_posts',
    'service_items',
    'testimonials',
    'reuse_sec'
  ] LOOP
    fk_name := target_table || '_reviewed_by_id_users_id_fk';
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = fk_name) THEN
      EXECUTE format(
        'ALTER TABLE public.%I
           ADD CONSTRAINT %I
           FOREIGN KEY (reviewed_by_id)
           REFERENCES public.users(id)
           ON DELETE SET NULL',
        target_table,
        fk_name
      );
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Site pages quality + review metadata
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.site_pages
  ADD COLUMN IF NOT EXISTS publish_quality_score numeric DEFAULT 100,
  ADD COLUMN IF NOT EXISTS publish_quality_level varchar DEFAULT 'excellent',
  ADD COLUMN IF NOT EXISTS preview_diff_summary jsonb,
  ADD COLUMN IF NOT EXISTS review_checklist_complete boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_summary text,
  ADD COLUMN IF NOT EXISTS reviewed_by_id integer,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_pages_reviewed_by_id_users_id_fk'
  ) THEN
    ALTER TABLE public.site_pages
      ADD CONSTRAINT site_pages_reviewed_by_id_users_id_fk
      FOREIGN KEY (reviewed_by_id)
      REFERENCES public.users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Media governance fields
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.media
  ADD COLUMN IF NOT EXISTS usage_scope varchar DEFAULT 'site-only',
  ADD COLUMN IF NOT EXISTS license_source varchar,
  ADD COLUMN IF NOT EXISTS license_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS requires_attribution boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS attribution_text varchar,
  ADD COLUMN IF NOT EXISTS media_qa_status varchar DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS usage_approved_by_id integer,
  ADD COLUMN IF NOT EXISTS usage_approved_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'media_usage_approved_by_id_users_id_fk'
  ) THEN
    ALTER TABLE public.media
      ADD CONSTRAINT media_usage_approved_by_id_users_id_fk
      FOREIGN KEY (usage_approved_by_id)
      REFERENCES public.users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Section structural keys (required by Site Pages block queries)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  block_table text;
BEGIN
  FOREACH block_table IN ARRAY ARRAY[
    'hero',
    'richtext',
    'cta',
    'stats_sec',
    'faq_sec',
    'feat_grid',
    'form_sec',
    'team_sec',
    'logo_band',
    'quote_sec',
    'tabs_sec',
    'guide_form',
    'inquiry_form',
    'privacy_note',
    'img_sec',
    'vid_sec',
    'simple_table',
    'cmp_table',
    'dyn_list',
    'legacy_hero',
    'legacy_narrative',
    'legacy_stage',
    'legacy_audience',
    'legacy_checklist',
    'legacy_quote',
    'legacy_cta',
    'split_sec',
    'reuse_sec_ref',
    'spacer',
    'divider'
  ] LOOP
    EXECUTE format(
      'ALTER TABLE IF EXISTS public.%I
         ADD COLUMN IF NOT EXISTS structural_key varchar',
      block_table
    );
  END LOOP;
END $$;

COMMIT;
