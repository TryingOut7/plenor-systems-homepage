-- Restore _parent_id FK constraints on block tables that were dropped by the up migration.
--
-- This down migration re-adds FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE
-- on the block tables that were originally created with site_pages-scoped FKs in migrations
-- 0002 and 0005. Each statement is guarded with a NOT EXISTS check so it is safe to re-run.
--
-- Note: Block tables created by Payload db:push (not tracked here) will NOT have their FKs
-- restored by this rollback, as their original constraint names are unknown. Those tables
-- would need manual inspection if a full rollback is required.

-- ── From migration 0002 ─────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stats_sec_parent_id_fk'
      AND table_name = 'stats_sec'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.stats_sec
      ADD CONSTRAINT stats_sec_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'faq_sec_parent_id_fk'
      AND table_name = 'faq_sec'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.faq_sec
      ADD CONSTRAINT faq_sec_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'feat_grid_parent_id_fk'
      AND table_name = 'feat_grid'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.feat_grid
      ADD CONSTRAINT feat_grid_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'form_sec_parent_id_fk'
      AND table_name = 'form_sec'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.form_sec
      ADD CONSTRAINT form_sec_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'team_sec_parent_id_fk'
      AND table_name = 'team_sec'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.team_sec
      ADD CONSTRAINT team_sec_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'logo_band_parent_id_fk'
      AND table_name = 'logo_band'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.logo_band
      ADD CONSTRAINT logo_band_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'quote_sec_parent_id_fk'
      AND table_name = 'quote_sec'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.quote_sec
      ADD CONSTRAINT quote_sec_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tabs_sec_parent_id_fk'
      AND table_name = 'tabs_sec'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.tabs_sec
      ADD CONSTRAINT tabs_sec_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'split_sec_parent_id_fk'
      AND table_name = 'split_sec'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.split_sec
      ADD CONSTRAINT split_sec_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ── From migration 0005 ─────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'legacy_hero_parent_id_fk'
      AND table_name = 'legacy_hero'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.legacy_hero
      ADD CONSTRAINT legacy_hero_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'legacy_narrative_parent_id_fk'
      AND table_name = 'legacy_narrative'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.legacy_narrative
      ADD CONSTRAINT legacy_narrative_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'legacy_stage_parent_id_fk'
      AND table_name = 'legacy_stage'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.legacy_stage
      ADD CONSTRAINT legacy_stage_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'legacy_audience_parent_id_fk'
      AND table_name = 'legacy_audience'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.legacy_audience
      ADD CONSTRAINT legacy_audience_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'legacy_checklist_parent_id_fk'
      AND table_name = 'legacy_checklist'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.legacy_checklist
      ADD CONSTRAINT legacy_checklist_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'legacy_quote_parent_id_fk'
      AND table_name = 'legacy_quote'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.legacy_quote
      ADD CONSTRAINT legacy_quote_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'legacy_cta_parent_id_fk'
      AND table_name = 'legacy_cta'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.legacy_cta
      ADD CONSTRAINT legacy_cta_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;
  END IF;
END $$;
