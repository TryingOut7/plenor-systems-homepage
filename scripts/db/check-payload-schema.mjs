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

const COLLECTION_TABLES_WITH_CREATED_BY = [
  'service_items',
  'blog_posts',
  'testimonials',
  'site_pages',
];

const REQUIRED_TABLES = [
  'reuse_sec',
  'audit_logs',
  ...BLOCK_TABLES_WITH_SECTION_LABEL,
  ...COLLECTION_TABLES_WITH_CREATED_BY,
  'ui_settings',
  '_ui_settings_v',
  'site_settings',
  '_site_settings_v',
  'site_settings_navigation_links',
  '_site_settings_v_version_navigation_links',
  'nav_children',
  '_nav_children_v',
];

const REQUIRED_COLUMNS = {
  audit_logs: [
    'actor_id',
    'user_email',
    'actor_role',
    'field_path',
    'old_value_summary',
    'new_value_summary',
    'risk_tier',
    'changed_at',
  ],
  reuse_sec: [
    'library_category',
    'library_version',
    'library_change_summary',
    'is_deprecated',
    'locale',
    'translation_group_id',
    'workflow_status',
    'review_checklist_complete',
    'review_summary',
    'reviewed_by_id',
    'reviewed_at',
    'approved_by_id',
    'approved_at',
    'rejection_reason',
  ],
  ui_settings: [
    'colors_nav_background',
    'colors_nav_scrolled_background',
    'colors_nav_border',
    'typography_heading_font_url',
    'typography_body_font_url',
    'layout_nav_height',
    'layout_card_radius',
  ],
  _ui_settings_v: [
    'version_colors_nav_background',
    'version_colors_nav_scrolled_background',
    'version_colors_nav_border',
    'version_typography_heading_font_url',
    'version_typography_body_font_url',
    'version_layout_nav_height',
    'version_layout_card_radius',
  ],
  site_settings: [
    'logo_image_id',
    'logo_width',
    'announcement_banner_enabled',
    'announcement_banner_text',
    'announcement_banner_link_label',
    'announcement_banner_link_href',
    'announcement_banner_background_color',
    'announcement_banner_text_color',
    'guide_form_privacy_label',
    'guide_form_privacy_href',
    'inquiry_form_privacy_label',
    'inquiry_form_privacy_href',
    'not_found_page_meta_title',
    'not_found_page_meta_description',
  ],
  _site_settings_v: [
    'version_logo_image_id',
    'version_logo_width',
    'version_announcement_banner_enabled',
    'version_announcement_banner_text',
    'version_announcement_banner_link_label',
    'version_announcement_banner_link_href',
    'version_announcement_banner_background_color',
    'version_announcement_banner_text_color',
    'version_guide_form_privacy_label',
    'version_guide_form_privacy_href',
    'version_inquiry_form_privacy_label',
    'version_inquiry_form_privacy_href',
    'version_not_found_page_meta_title',
    'version_not_found_page_meta_description',
  ],
  ...Object.fromEntries(
    COLLECTION_TABLES_WITH_CREATED_BY.map((tableName) => [tableName, ['created_by_id']]),
  ),
  nav_children: ['_order', '_parent_id', 'id', 'label', 'href'],
  _nav_children_v: ['_order', '_parent_id', 'id', 'label', 'href', '_uuid'],
};

const REQUIRED_CONSTRAINTS = [
  ...COLLECTION_TABLES_WITH_CREATED_BY.map((tableName) => ({
    table: tableName,
    name: `${tableName}_created_by_id_fkey`,
  })),
  { table: 'site_settings', name: 'site_settings_logo_image_id_media_id_fk' },
  {
    table: '_site_settings_v',
    name: '_site_settings_v_version_logo_image_id_media_id_fk',
  },
  { table: 'nav_children', name: 'nav_children_parent_id_fk' },
  { table: '_nav_children_v', name: '_nav_children_v_parent_id_fk' },
];

const READ_PATH_CHECKS = [
  {
    name: 'ui_settings_version_read',
    sql: `
      SELECT id,
        version_colors_nav_background,
        version_colors_nav_scrolled_background,
        version_colors_nav_border,
        version_typography_heading_font_url,
        version_typography_body_font_url,
        version_layout_nav_height,
        version_layout_card_radius
      FROM public._ui_settings_v
      WHERE version__status = 'draft'
      ORDER BY updated_at DESC, created_at DESC
      LIMIT 1;
    `,
  },
  {
    name: 'site_settings_version_read_with_nav_children',
    sql: `
      SELECT s.id,
        s.version_logo_image_id,
        s.version_logo_width,
        s.version_announcement_banner_enabled,
        s.version_announcement_banner_text,
        s.version_announcement_banner_link_label,
        s.version_announcement_banner_link_href,
        s.version_announcement_banner_background_color,
        s.version_announcement_banner_text_color,
        s.version_guide_form_privacy_label,
        s.version_guide_form_privacy_href,
        s.version_inquiry_form_privacy_label,
        s.version_inquiry_form_privacy_href,
        s.version_not_found_page_meta_title,
        s.version_not_found_page_meta_description,
        n.id AS nav_link_id,
        c.id AS nav_child_id
      FROM public._site_settings_v AS s
      LEFT JOIN public._site_settings_v_version_navigation_links AS n
        ON n._parent_id = s.id
      LEFT JOIN public._nav_children_v AS c
        ON c._parent_id = n.id
      WHERE s.version__status = 'draft'
      ORDER BY s.updated_at DESC, s.created_at DESC
      LIMIT 1;
    `,
  },
  {
    name: 'reusable_sections_list_view_path',
    sql: `
      SELECT r.id, h.section_label
      FROM public.reuse_sec AS r
      LEFT JOIN LATERAL (
        SELECT section_label
        FROM public.hero AS h
        WHERE h._parent_id = r.id
        ORDER BY h._order ASC
        LIMIT 1
      ) AS h ON true
      WHERE r.deleted_at IS NULL
      ORDER BY r.created_at DESC
      LIMIT 1;
    `,
  },
  {
    name: 'service_items_list_view_path',
    sql: `
      SELECT id, created_by_id
      FROM public.service_items
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1;
    `,
  },
  {
    name: 'blog_posts_list_view_path',
    sql: `
      SELECT id, created_by_id
      FROM public.blog_posts
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1;
    `,
  },
  {
    name: 'testimonials_list_view_path',
    sql: `
      SELECT id, created_by_id
      FROM public.testimonials
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1;
    `,
  },
  {
    name: 'site_pages_list_view_path',
    sql: `
      SELECT id, created_by_id
      FROM public.site_pages
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1;
    `,
  },
  {
    name: 'audit_logs_list_view_path',
    sql: `
      SELECT id,
        actor_id,
        user_email,
        actor_role,
        field_path,
        old_value_summary,
        new_value_summary,
        risk_tier,
        changed_at
      FROM public.audit_logs
      ORDER BY created_at DESC
      LIMIT 1;
    `,
  },
];

async function findMissingTables(client) {
  const missing = [];

  for (const tableName of REQUIRED_TABLES) {
    const result = await client.query(
      `
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = $1
        ) AS exists;
      `,
      [tableName],
    );

    if (!result.rows[0]?.exists) {
      missing.push(tableName);
    }
  }

  return missing;
}

async function findMissingColumns(client) {
  const missing = [];

  const tableToColumns = {
    ...REQUIRED_COLUMNS,
    ...Object.fromEntries(
      BLOCK_TABLES_WITH_SECTION_LABEL.map((tableName) => [tableName, ['section_label']]),
    ),
  };

  for (const [tableName, requiredColumns] of Object.entries(tableToColumns)) {
    for (const columnName of requiredColumns) {
      const result = await client.query(
        `
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = $1
              AND column_name = $2
          ) AS exists;
        `,
        [tableName, columnName],
      );

      if (!result.rows[0]?.exists) {
        missing.push({ table: tableName, column: columnName });
      }
    }
  }

  return missing;
}

async function findMissingConstraints(client) {
  const missing = [];

  for (const required of REQUIRED_CONSTRAINTS) {
    const result = await client.query(
      `
        SELECT EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON c.conrelid = t.oid
          JOIN pg_namespace n ON t.relnamespace = n.oid
          WHERE n.nspname = 'public'
            AND t.relname = $1
            AND c.conname = $2
        ) AS exists;
      `,
      [required.table, required.name],
    );

    if (!result.rows[0]?.exists) {
      missing.push(required);
    }
  }

  return missing;
}

async function runReadPathChecks(client) {
  const failures = [];

  for (const check of READ_PATH_CHECKS) {
    try {
      await client.query(check.sql);
    } catch (error) {
      failures.push({
        check: check.name,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return failures;
}

async function run() {
  await withDatabaseClient(async (client) => {
    const [missingTables, missingColumns, missingConstraints, readPathFailures] =
      await Promise.all([
        findMissingTables(client),
        findMissingColumns(client),
        findMissingConstraints(client),
        runReadPathChecks(client),
      ]);

    if (
      missingTables.length > 0 ||
      missingColumns.length > 0 ||
      missingConstraints.length > 0 ||
      readPathFailures.length > 0
    ) {
      console.error(
        JSON.stringify(
          {
            ok: false,
            missingTables,
            missingColumns,
            missingConstraints,
            readPathFailures,
          },
          null,
          2,
        ),
      );
      process.exit(1);
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          checkedTables: REQUIRED_TABLES.length,
          checkedColumnRules:
            Object.keys(REQUIRED_COLUMNS).length + BLOCK_TABLES_WITH_SECTION_LABEL.length,
          checkedConstraints: REQUIRED_CONSTRAINTS.length,
          readPathChecks: READ_PATH_CHECKS.length,
        },
        null,
        2,
      ),
    );
  });
}

run().catch((error) => {
  console.error(
    `Payload schema check failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exit(1);
});
