// DEPRECATION WARNING: This script maintains a hardcoded list of Payload CMS tables and columns
// that will drift whenever new collections or fields are added. It is not a reliable source of
// truth. Use `npm run db:migrate:cms` (payload migrate) and `npm run db:repair:payload` instead.
// This script is retained only as a predeploy guardrail but should be replaced with a
// Payload-native schema repair once the migration workflow is fully adopted.
import { withDatabaseClient } from './migration-lib.mjs';

const BLOCK_TABLES_WITH_SECTION_LABEL = [
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
  'split_sec',
  'reuse_sec_ref',
  'divider',
  'legacy_hero',
  'legacy_narrative',
  'legacy_stage',
  'legacy_audience',
  'legacy_checklist',
  'legacy_quote',
  'legacy_cta',
];

const VERSION_BLOCK_TABLES_WITH_SECTION_LABEL = BLOCK_TABLES_WITH_SECTION_LABEL.map(
  (name) => `${name}_v`,
);

const COLLECTION_TABLES_WITH_CREATED_BY = [
  'service_items',
  'blog_posts',
  'testimonials',
  'site_pages',
];

const COLLECTION_TABLES_WITH_WORKFLOW_REVIEW = [
  'blog_categories',
  'team_members',
  'logos',
];

function createAddVarcharColumnSql(tableNames, columnName) {
  const quotedNames = tableNames.map((name) => `'${name}'`).join(', ');
  return `
DO $$
DECLARE
  target_table TEXT;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[${quotedNames}] LOOP
    EXECUTE format(
      'ALTER TABLE IF EXISTS public.%I ADD COLUMN IF NOT EXISTS %I character varying',
      target_table,
      '${columnName}'
    );
  END LOOP;
END;
$$;
`;
}

function createAddIntegerColumnSql(tableNames, columnName) {
  const quotedNames = tableNames.map((name) => `'${name}'`).join(', ');
  return `
DO $$
DECLARE
  target_table TEXT;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[${quotedNames}] LOOP
    EXECUTE format(
      'ALTER TABLE IF EXISTS public.%I ADD COLUMN IF NOT EXISTS %I integer',
      target_table,
      '${columnName}'
    );
  END LOOP;
END;
$$;
`;
}

function createAddWorkflowReviewColumnsSql(tableNames) {
  const quotedNames = tableNames.map((name) => `'${name}'`).join(', ');
  return `
DO $$
DECLARE
  target_table TEXT;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[${quotedNames}] LOOP
    EXECUTE format(
      'ALTER TABLE IF EXISTS public.%I
         ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
         ADD COLUMN IF NOT EXISTS workflow_status character varying DEFAULT ''draft'',
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
      'CREATE INDEX IF NOT EXISTS %I ON public.%I USING btree (workflow_status)',
      target_table || '_workflow_status_idx',
      target_table
    );

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON public.%I USING btree (deleted_at)',
      target_table || '_deleted_at_idx',
      target_table
    );
  END LOOP;
END;
$$;
`;
}

async function run() {
  await withDatabaseClient(async (client) => {
    await client.query('BEGIN');

    try {
      await client.query(`
        ALTER TABLE IF EXISTS public.ui_settings
          ADD COLUMN IF NOT EXISTS colors_nav_background character varying DEFAULT 'transparent',
          ADD COLUMN IF NOT EXISTS colors_nav_scrolled_background character varying DEFAULT '#FFFFFF',
          ADD COLUMN IF NOT EXISTS colors_nav_border character varying DEFAULT '#E5E7EB',
          ADD COLUMN IF NOT EXISTS typography_heading_font_url character varying,
          ADD COLUMN IF NOT EXISTS typography_body_font_url character varying,
          ADD COLUMN IF NOT EXISTS layout_nav_height numeric DEFAULT 68,
          ADD COLUMN IF NOT EXISTS layout_card_radius numeric DEFAULT 8;
      `);

      await client.query(`
        ALTER TABLE IF EXISTS public._ui_settings_v
          ADD COLUMN IF NOT EXISTS version_colors_nav_background character varying DEFAULT 'transparent',
          ADD COLUMN IF NOT EXISTS version_colors_nav_scrolled_background character varying DEFAULT '#FFFFFF',
          ADD COLUMN IF NOT EXISTS version_colors_nav_border character varying DEFAULT '#E5E7EB',
          ADD COLUMN IF NOT EXISTS version_typography_heading_font_url character varying,
          ADD COLUMN IF NOT EXISTS version_typography_body_font_url character varying,
          ADD COLUMN IF NOT EXISTS version_layout_nav_height numeric DEFAULT 68,
          ADD COLUMN IF NOT EXISTS version_layout_card_radius numeric DEFAULT 8;
      `);

      await client.query(`
        ALTER TABLE IF EXISTS public.site_settings
          ADD COLUMN IF NOT EXISTS logo_image_id integer,
          ADD COLUMN IF NOT EXISTS logo_width numeric DEFAULT 120,
          ADD COLUMN IF NOT EXISTS announcement_banner_enabled boolean DEFAULT false,
          ADD COLUMN IF NOT EXISTS announcement_banner_text character varying,
          ADD COLUMN IF NOT EXISTS announcement_banner_link_label character varying,
          ADD COLUMN IF NOT EXISTS announcement_banner_link_href character varying,
          ADD COLUMN IF NOT EXISTS announcement_banner_background_color character varying DEFAULT '#1B2D4F',
          ADD COLUMN IF NOT EXISTS announcement_banner_text_color character varying DEFAULT '#FFFFFF',
          ADD COLUMN IF NOT EXISTS guide_form_privacy_label character varying DEFAULT 'Privacy Policy',
          ADD COLUMN IF NOT EXISTS guide_form_privacy_href character varying DEFAULT '/privacy',
          ADD COLUMN IF NOT EXISTS inquiry_form_privacy_label character varying DEFAULT 'Privacy Policy',
          ADD COLUMN IF NOT EXISTS inquiry_form_privacy_href character varying DEFAULT '/privacy',
          ADD COLUMN IF NOT EXISTS not_found_page_meta_title character varying DEFAULT 'Page Not Found',
          ADD COLUMN IF NOT EXISTS not_found_page_meta_description character varying DEFAULT 'The page you requested could not be found.';
      `);

      await client.query(`
        ALTER TABLE IF EXISTS public._site_settings_v
          ADD COLUMN IF NOT EXISTS version_logo_image_id integer,
          ADD COLUMN IF NOT EXISTS version_logo_width numeric DEFAULT 120,
          ADD COLUMN IF NOT EXISTS version_announcement_banner_enabled boolean DEFAULT false,
          ADD COLUMN IF NOT EXISTS version_announcement_banner_text character varying,
          ADD COLUMN IF NOT EXISTS version_announcement_banner_link_label character varying,
          ADD COLUMN IF NOT EXISTS version_announcement_banner_link_href character varying,
          ADD COLUMN IF NOT EXISTS version_announcement_banner_background_color character varying DEFAULT '#1B2D4F',
          ADD COLUMN IF NOT EXISTS version_announcement_banner_text_color character varying DEFAULT '#FFFFFF',
          ADD COLUMN IF NOT EXISTS version_guide_form_privacy_label character varying DEFAULT 'Privacy Policy',
          ADD COLUMN IF NOT EXISTS version_guide_form_privacy_href character varying DEFAULT '/privacy',
          ADD COLUMN IF NOT EXISTS version_inquiry_form_privacy_label character varying DEFAULT 'Privacy Policy',
          ADD COLUMN IF NOT EXISTS version_inquiry_form_privacy_href character varying DEFAULT '/privacy',
          ADD COLUMN IF NOT EXISTS version_not_found_page_meta_title character varying DEFAULT 'Page Not Found',
          ADD COLUMN IF NOT EXISTS version_not_found_page_meta_description character varying DEFAULT 'The page you requested could not be found.';
      `);

      await client.query(
        createAddVarcharColumnSql(
          BLOCK_TABLES_WITH_SECTION_LABEL,
          'section_label',
        ),
      );
      await client.query(
        createAddVarcharColumnSql(
          VERSION_BLOCK_TABLES_WITH_SECTION_LABEL,
          'section_label',
        ),
      );
      await client.query(
        createAddIntegerColumnSql(
          COLLECTION_TABLES_WITH_CREATED_BY,
          'created_by_id',
        ),
      );

      await client.query(`
        ALTER TABLE IF EXISTS public.audit_logs
          ADD COLUMN IF NOT EXISTS ip_address character varying,
          ADD COLUMN IF NOT EXISTS field_path character varying,
          ADD COLUMN IF NOT EXISTS old_value_summary text,
          ADD COLUMN IF NOT EXISTS new_value_summary text,
          ADD COLUMN IF NOT EXISTS risk_tier character varying DEFAULT 'routine',
          ADD COLUMN IF NOT EXISTS changed_at timestamptz;
      `);

      await client.query(`
        ALTER TABLE IF EXISTS public.reuse_sec
          ADD COLUMN IF NOT EXISTS library_category character varying DEFAULT 'general',
          ADD COLUMN IF NOT EXISTS library_version numeric DEFAULT 1,
          ADD COLUMN IF NOT EXISTS library_change_summary text,
          ADD COLUMN IF NOT EXISTS is_deprecated boolean DEFAULT false,
          ADD COLUMN IF NOT EXISTS locale character varying DEFAULT 'en',
          ADD COLUMN IF NOT EXISTS translation_group_id character varying,
          ADD COLUMN IF NOT EXISTS workflow_status character varying DEFAULT 'draft',
          ADD COLUMN IF NOT EXISTS review_checklist_complete boolean DEFAULT false,
          ADD COLUMN IF NOT EXISTS review_summary text,
          ADD COLUMN IF NOT EXISTS reviewed_by_id integer,
          ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
          ADD COLUMN IF NOT EXISTS approved_by_id integer,
          ADD COLUMN IF NOT EXISTS approved_at timestamptz,
          ADD COLUMN IF NOT EXISTS rejection_reason text;
      `);

      await client.query(`
        ALTER TABLE IF EXISTS public.testimonials
          ADD COLUMN IF NOT EXISTS name character varying;
      `);

      await client.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'testimonials'
      AND column_name = 'person_name'
  ) THEN
    UPDATE public.testimonials
    SET name = person_name
    WHERE (name IS NULL OR name = '')
      AND person_name IS NOT NULL
      AND person_name <> '';
  END IF;
END;
$$;
      `);

      await client.query(`
        ALTER TABLE IF EXISTS public.team_members
          ADD COLUMN IF NOT EXISTS linkedin_url character varying,
          ADD COLUMN IF NOT EXISTS twitter_url character varying;
      `);

      await client.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'team_members'
      AND column_name = 'linkedin_href'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'team_members'
      AND column_name = 'twitter_href'
  ) THEN
    UPDATE public.team_members
    SET linkedin_url = COALESCE(NULLIF(linkedin_url, ''), linkedin_href),
        twitter_url = COALESCE(NULLIF(twitter_url, ''), twitter_href)
    WHERE (linkedin_href IS NOT NULL OR twitter_href IS NOT NULL);
  END IF;
END;
$$;
      `);

      await client.query(`
        ALTER TABLE IF EXISTS public.logos
          ADD COLUMN IF NOT EXISTS url character varying;
      `);

      await client.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'logos'
      AND column_name = 'href'
  ) THEN
    UPDATE public.logos
    SET url = COALESCE(NULLIF(url, ''), href)
    WHERE href IS NOT NULL;
  END IF;
END;
$$;
      `);

      await client.query(
        createAddWorkflowReviewColumnsSql(COLLECTION_TABLES_WITH_WORKFLOW_REVIEW),
      );

      await client.query(`
        CREATE TABLE IF NOT EXISTS public.nav_children (
          _order integer NOT NULL,
          _parent_id character varying NOT NULL,
          id character varying NOT NULL,
          label character varying,
          href character varying,
          CONSTRAINT nav_children_pkey PRIMARY KEY (id)
        );
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS nav_children_parent_id_idx
          ON public.nav_children USING btree (_parent_id);
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS nav_children_order_idx
          ON public.nav_children USING btree (_order);
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS public._nav_children_v (
          _order integer NOT NULL,
          _parent_id integer NOT NULL,
          id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
          label character varying,
          href character varying,
          _uuid character varying,
          CONSTRAINT _nav_children_v_pkey PRIMARY KEY (id)
        );
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS _nav_children_v_parent_id_idx
          ON public._nav_children_v USING btree (_parent_id);
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS _nav_children_v_order_idx
          ON public._nav_children_v USING btree (_order);
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS site_settings_logo_image_idx
          ON public.site_settings USING btree (logo_image_id);
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS _site_settings_v_version_logo_image_idx
          ON public._site_settings_v USING btree (version_logo_image_id);
      `);

      await client.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'site_settings_navigation_links'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'nav_children_parent_id_fk'
  ) THEN
    ALTER TABLE public.nav_children
      ADD CONSTRAINT nav_children_parent_id_fk
      FOREIGN KEY (_parent_id)
      REFERENCES public.site_settings_navigation_links(id)
      ON DELETE CASCADE;
  END IF;
END;
$$;
      `);

      for (const tableName of COLLECTION_TABLES_WITH_CREATED_BY) {
        const constraintName = `${tableName}_created_by_id_fkey`;

        await client.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = '${tableName}'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = '${constraintName}'
  ) THEN
    ALTER TABLE public.${tableName}
      ADD CONSTRAINT ${constraintName}
      FOREIGN KEY (created_by_id)
      REFERENCES public.users(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;
        `);
      }

      for (const tableName of COLLECTION_TABLES_WITH_WORKFLOW_REVIEW) {
        const reviewedConstraintName = `${tableName}_reviewed_by_id_users_id_fk`;
        const approvedConstraintName = `${tableName}_approved_by_id_users_id_fk`;

        await client.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = '${tableName}'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = '${reviewedConstraintName}'
  ) THEN
    ALTER TABLE public.${tableName}
      ADD CONSTRAINT ${reviewedConstraintName}
      FOREIGN KEY (reviewed_by_id)
      REFERENCES public.users(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;
        `);

        await client.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = '${tableName}'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = '${approvedConstraintName}'
  ) THEN
    ALTER TABLE public.${tableName}
      ADD CONSTRAINT ${approvedConstraintName}
      FOREIGN KEY (approved_by_id)
      REFERENCES public.users(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;
        `);
      }

      await client.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = '_site_settings_v_version_navigation_links'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = '_nav_children_v_parent_id_fk'
  ) THEN
    ALTER TABLE public._nav_children_v
      ADD CONSTRAINT _nav_children_v_parent_id_fk
      FOREIGN KEY (_parent_id)
      REFERENCES public._site_settings_v_version_navigation_links(id)
      ON DELETE CASCADE;
  END IF;
END;
$$;
      `);

      await client.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'media'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'site_settings_logo_image_id_media_id_fk'
  ) THEN
    ALTER TABLE public.site_settings
      ADD CONSTRAINT site_settings_logo_image_id_media_id_fk
      FOREIGN KEY (logo_image_id)
      REFERENCES public.media(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;
      `);

      await client.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'media'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = '_site_settings_v_version_logo_image_id_media_id_fk'
  ) THEN
    ALTER TABLE public._site_settings_v
      ADD CONSTRAINT _site_settings_v_version_logo_image_id_media_id_fk
      FOREIGN KEY (version_logo_image_id)
      REFERENCES public.media(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;
      `);

      await client.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'site_settings'
  ) THEN
    INSERT INTO public.site_settings (_status)
    SELECT 'draft'::enum_site_settings_status
    WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);
  END IF;
END;
$$;
      `);

      await client.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ui_settings'
  ) THEN
    INSERT INTO public.ui_settings (_status)
    SELECT 'draft'::enum_ui_settings_status
    WHERE NOT EXISTS (SELECT 1 FROM public.ui_settings);
  END IF;
END;
$$;
      `);

      await client.query('COMMIT');
      console.log('Payload schema repair completed successfully.');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

run().catch((error) => {
  console.error(
    `Payload schema repair failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exit(1);
});
