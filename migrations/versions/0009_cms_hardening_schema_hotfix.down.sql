-- Rollback: remove CMS hardening columns added in 0009 hotfix.
-- Data loss is expected (dropped columns cannot be recovered after rollback).

BEGIN;

-- ---------------------------------------------------------------------------
-- Drop foreign key constraints first
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.blog_posts      DROP CONSTRAINT IF EXISTS blog_posts_reviewed_by_id_users_id_fk;
ALTER TABLE IF EXISTS public.service_items   DROP CONSTRAINT IF EXISTS service_items_reviewed_by_id_users_id_fk;
ALTER TABLE IF EXISTS public.testimonials    DROP CONSTRAINT IF EXISTS testimonials_reviewed_by_id_users_id_fk;
ALTER TABLE IF EXISTS public.reuse_sec       DROP CONSTRAINT IF EXISTS reuse_sec_reviewed_by_id_users_id_fk;
ALTER TABLE IF EXISTS public.site_pages      DROP CONSTRAINT IF EXISTS site_pages_reviewed_by_id_users_id_fk;
ALTER TABLE IF EXISTS public.media           DROP CONSTRAINT IF EXISTS media_usage_approved_by_id_users_id_fk;

-- ---------------------------------------------------------------------------
-- Audit logs
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.audit_logs
  DROP COLUMN IF EXISTS actor_id;

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
         DROP COLUMN IF EXISTS locale,
         DROP COLUMN IF EXISTS translation_group_id,
         DROP COLUMN IF EXISTS review_checklist_complete,
         DROP COLUMN IF EXISTS review_summary,
         DROP COLUMN IF EXISTS reviewed_by_id,
         DROP COLUMN IF EXISTS reviewed_at',
      target_table
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Site pages quality + review metadata
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.site_pages
  DROP COLUMN IF EXISTS publish_quality_score,
  DROP COLUMN IF EXISTS publish_quality_level,
  DROP COLUMN IF EXISTS preview_diff_summary,
  DROP COLUMN IF EXISTS review_checklist_complete,
  DROP COLUMN IF EXISTS review_summary,
  DROP COLUMN IF EXISTS reviewed_by_id,
  DROP COLUMN IF EXISTS reviewed_at;

-- ---------------------------------------------------------------------------
-- Media governance fields
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.media
  DROP COLUMN IF EXISTS usage_scope,
  DROP COLUMN IF EXISTS license_source,
  DROP COLUMN IF EXISTS license_expires_at,
  DROP COLUMN IF EXISTS requires_attribution,
  DROP COLUMN IF EXISTS attribution_text,
  DROP COLUMN IF EXISTS media_qa_status,
  DROP COLUMN IF EXISTS usage_approved_by_id,
  DROP COLUMN IF EXISTS usage_approved_at;

-- ---------------------------------------------------------------------------
-- Section structural keys
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
      'ALTER TABLE IF EXISTS public.%I DROP COLUMN IF EXISTS structural_key',
      block_table
    );
  END LOOP;
END $$;

COMMIT;
