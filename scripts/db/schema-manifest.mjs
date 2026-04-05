/**
 * Schema manifest — single source of truth for all expected Payload CMS columns.
 *
 * IMPORTANT: Update this file whenever you add a field to a Payload collection
 * or global. The pre-push hook uses this to catch schema drift before it reaches
 * production. Each entry maps a table name to a map of { column → SQL definition }.
 *
 * Rules for safe entries:
 *   - Only add columns, never remove or rename existing ones here.
 *   - Always use ADD COLUMN IF NOT EXISTS semantics (the repair tooling does this).
 *   - If a column has a sensible default, include it — this prevents NOT NULL
 *     violations on existing rows when the column is added.
 */

// Shared SQL definitions for reuse across tables.
const varchar = 'character varying';
const text = 'text';
const integer = 'integer';
const boolean_false = 'boolean DEFAULT false';
const timestamptz = 'timestamptz';
const numeric = (n) => (n !== undefined ? `numeric DEFAULT ${n}` : 'numeric');
const varchar_default = (v) => `character varying DEFAULT '${v}'`;

// ---------------------------------------------------------------------------
// Workflow review columns — shared across multiple collection tables
// ---------------------------------------------------------------------------
const WORKFLOW_REVIEW_COLUMNS = {
  deleted_at: timestamptz,
  workflow_status: varchar_default('draft'),
  review_checklist_complete: boolean_false,
  review_summary: text,
  reviewed_by_id: integer,
  reviewed_at: timestamptz,
  approved_by_id: integer,
  approved_at: timestamptz,
  rejection_reason: text,
};

// ---------------------------------------------------------------------------
// Block tables — all need section_label
// ---------------------------------------------------------------------------
const BLOCK_TABLES = [
  'hero', 'richtext', 'cta', 'stats_sec', 'faq_sec', 'feat_grid',
  'form_sec', 'team_sec', 'logo_band', 'quote_sec', 'tabs_sec',
  'guide_form', 'inquiry_form', 'privacy_note', 'img_sec', 'vid_sec',
  'simple_table', 'cmp_table', 'dyn_list', 'split_sec', 'reuse_sec_ref',
  'divider', 'legacy_hero', 'legacy_narrative', 'legacy_stage',
  'legacy_audience', 'legacy_checklist', 'legacy_quote', 'legacy_cta',
];

// ---------------------------------------------------------------------------
// Collection tables — all need created_by_id
// ---------------------------------------------------------------------------
const CREATED_BY_TABLES = [
  'service_items', 'blog_posts', 'testimonials', 'site_pages',
  'page_drafts', 'page_presets', 'page_playgrounds',
];

// ---------------------------------------------------------------------------
// Collection tables — all need full workflow review columns
// ---------------------------------------------------------------------------
const WORKFLOW_REVIEW_TABLES = [
  'blog_categories', 'team_members', 'logos', 'page_drafts',
];

// ---------------------------------------------------------------------------
// Build the manifest
// ---------------------------------------------------------------------------
function buildManifest() {
  const columns = {};

  // Block tables: section_label
  for (const table of BLOCK_TABLES) {
    columns[table] = { section_label: varchar, ...columns[table] };
  }

  // Collection tables: created_by_id
  for (const table of CREATED_BY_TABLES) {
    columns[table] = { created_by_id: integer, ...columns[table] };
  }

  // Workflow review tables
  for (const table of WORKFLOW_REVIEW_TABLES) {
    columns[table] = { ...WORKFLOW_REVIEW_COLUMNS, ...columns[table] };
  }

  // ---------------------------------------------------------------------------
  // ui_settings
  // ---------------------------------------------------------------------------
  columns['ui_settings'] = {
    ...columns['ui_settings'],
    colors_nav_background:         varchar_default('transparent'),
    colors_nav_scrolled_background: varchar_default('#FFFFFF'),
    colors_nav_border:             varchar_default('#E5E7EB'),
    typography_heading_font_url:   varchar,
    typography_body_font_url:      varchar,
    layout_nav_height:             numeric(68),
    layout_card_radius:            numeric(8),
    // migration 0016
    email_palette_primary:         varchar,
    email_palette_muted:           varchar,
    email_palette_text:            varchar,
    email_palette_background:      varchar,
    email_palette_white:           varchar,
    email_palette_border:          varchar,
    email_palette_error:           varchar,
  };

  // _ui_settings_v mirrors ui_settings with version_ prefix
  columns['_ui_settings_v'] = {
    ...columns['_ui_settings_v'],
    version_colors_nav_background:         varchar_default('transparent'),
    version_colors_nav_scrolled_background: varchar_default('#FFFFFF'),
    version_colors_nav_border:             varchar_default('#E5E7EB'),
    version_typography_heading_font_url:   varchar,
    version_typography_body_font_url:      varchar,
    version_layout_nav_height:             numeric(68),
    version_layout_card_radius:            numeric(8),
    version_email_palette_primary:         varchar,
    version_email_palette_muted:           varchar,
    version_email_palette_text:            varchar,
    version_email_palette_background:      varchar,
    version_email_palette_white:           varchar,
    version_email_palette_border:          varchar,
    version_email_palette_error:           varchar,
  };

  // ---------------------------------------------------------------------------
  // site_settings
  // ---------------------------------------------------------------------------
  columns['site_settings'] = {
    ...columns['site_settings'],
    logo_image_id:                          integer,
    logo_width:                             numeric(120),
    announcement_banner_enabled:            boolean_false,
    announcement_banner_text:               varchar,
    announcement_banner_link_label:         varchar,
    announcement_banner_link_href:          varchar,
    announcement_banner_background_color:   varchar_default('#1B2D4F'),
    announcement_banner_text_color:         varchar_default('#FFFFFF'),
    guide_form_privacy_label:               varchar_default('Privacy Policy'),
    guide_form_privacy_href:                varchar_default('/privacy'),
    inquiry_form_privacy_label:             varchar_default('Privacy Policy'),
    inquiry_form_privacy_href:              varchar_default('/privacy'),
    not_found_page_meta_title:              varchar_default('Page Not Found'),
    not_found_page_meta_description:        varchar_default('The page you requested could not be found.'),
    // migration 0016
    content_routing_guide_title:            varchar,
    content_routing_guide_pdf_url:          varchar,
    content_routing_guide_page_url:         varchar,
    content_routing_privacy_policy_url:     varchar,
    content_routing_workflow_notify_email:  varchar,
    // migration 0018
    email_defaults_brand_name:                        varchar,
    email_defaults_guide_subject:                     varchar,
    email_defaults_guide_heading:                     varchar,
    email_defaults_guide_body:                        text,
    email_defaults_guide_button_label:                varchar,
    email_defaults_inquiry_notification_subject:      varchar,
    email_defaults_inquiry_ack_subject:               varchar,
    email_defaults_inquiry_ack_heading:               varchar,
    email_defaults_inquiry_ack_body:                  text,
    core_preset_content_home:                         `jsonb DEFAULT '{}'::jsonb`,
    core_preset_content_services:                     `jsonb DEFAULT '{}'::jsonb`,
    core_preset_content_about:                        `jsonb DEFAULT '{}'::jsonb`,
    core_preset_content_pricing:                      `jsonb DEFAULT '{}'::jsonb`,
    core_preset_content_contact:                      `jsonb DEFAULT '{}'::jsonb`,
  };

  // _site_settings_v mirrors site_settings with version_ prefix
  columns['_site_settings_v'] = {
    ...columns['_site_settings_v'],
    version_logo_image_id:                          integer,
    version_logo_width:                             numeric(120),
    version_announcement_banner_enabled:            boolean_false,
    version_announcement_banner_text:               varchar,
    version_announcement_banner_link_label:         varchar,
    version_announcement_banner_link_href:          varchar,
    version_announcement_banner_background_color:   varchar_default('#1B2D4F'),
    version_announcement_banner_text_color:         varchar_default('#FFFFFF'),
    version_guide_form_privacy_label:               varchar_default('Privacy Policy'),
    version_guide_form_privacy_href:                varchar_default('/privacy'),
    version_inquiry_form_privacy_label:             varchar_default('Privacy Policy'),
    version_inquiry_form_privacy_href:              varchar_default('/privacy'),
    version_not_found_page_meta_title:              varchar_default('Page Not Found'),
    version_not_found_page_meta_description:        varchar_default('The page you requested could not be found.'),
    version_content_routing_guide_title:            varchar,
    version_content_routing_guide_pdf_url:          varchar,
    version_content_routing_guide_page_url:         varchar,
    version_content_routing_privacy_policy_url:     varchar,
    version_content_routing_workflow_notify_email:  varchar,
    // migration 0018
    version_email_defaults_brand_name:                        varchar,
    version_email_defaults_guide_subject:                     varchar,
    version_email_defaults_guide_heading:                     varchar,
    version_email_defaults_guide_body:                        text,
    version_email_defaults_guide_button_label:                varchar,
    version_email_defaults_inquiry_notification_subject:      varchar,
    version_email_defaults_inquiry_ack_subject:               varchar,
    version_email_defaults_inquiry_ack_heading:               varchar,
    version_email_defaults_inquiry_ack_body:                  text,
    version_core_preset_content_home:                         `jsonb DEFAULT '{}'::jsonb`,
    version_core_preset_content_services:                     `jsonb DEFAULT '{}'::jsonb`,
    version_core_preset_content_about:                        `jsonb DEFAULT '{}'::jsonb`,
    version_core_preset_content_pricing:                      `jsonb DEFAULT '{}'::jsonb`,
    version_core_preset_content_contact:                      `jsonb DEFAULT '{}'::jsonb`,
  };

  // ---------------------------------------------------------------------------
  // forms / form_submissions
  // ---------------------------------------------------------------------------
  columns['forms'] = {
    ...columns['forms'],
    template_key: varchar,
  };

  columns['form_submissions'] = {
    ...columns['form_submissions'],
    form_type: varchar,
  };

  // ---------------------------------------------------------------------------
  // audit_logs
  // ---------------------------------------------------------------------------
  columns['audit_logs'] = {
    ...columns['audit_logs'],
    actor_id:            varchar,
    ip_address:          varchar,
    field_path:          varchar,
    old_value_summary:   text,
    new_value_summary:   text,
    risk_tier:           varchar_default('routine'),
    changed_at:          timestamptz,
  };

  // ---------------------------------------------------------------------------
  // reuse_sec
  // ---------------------------------------------------------------------------
  columns['reuse_sec'] = {
    ...columns['reuse_sec'],
    library_category:           varchar_default('general'),
    library_version:            numeric(1),
    library_change_summary:     text,
    is_deprecated:              boolean_false,
    locale:                     varchar_default('en'),
    translation_group_id:       varchar,
    workflow_status:            varchar_default('draft'),
    review_checklist_complete:  boolean_false,
    review_summary:             text,
    reviewed_by_id:             integer,
    reviewed_at:                timestamptz,
    approved_by_id:             integer,
    approved_at:                timestamptz,
    rejection_reason:           text,
  };

  // ---------------------------------------------------------------------------
  // testimonials
  // ---------------------------------------------------------------------------
  columns['testimonials'] = {
    ...columns['testimonials'],
    name: varchar,
  };

  // ---------------------------------------------------------------------------
  // team_members
  // ---------------------------------------------------------------------------
  columns['team_members'] = {
    ...columns['team_members'],
    linkedin_url: varchar,
    twitter_url:  varchar,
  };

  // ---------------------------------------------------------------------------
  // logos
  // ---------------------------------------------------------------------------
  columns['logos'] = {
    ...columns['logos'],
    url: varchar,
  };

  // ---------------------------------------------------------------------------
  // page_drafts
  // ---------------------------------------------------------------------------
  columns['page_drafts'] = {
    ...columns['page_drafts'],
    target_slug:          varchar,
    source_type:          varchar,
    source_page_id:       integer,
    source_preset_id:     integer,
    source_playground_id: integer,
    editor_notes:         text,
    seo_meta_title:             varchar,
    seo_meta_description:       varchar,
    seo_og_title:               varchar,
    seo_og_description:         varchar,
    seo_og_image_id:            integer,
    seo_canonical_url:          varchar,
    seo_noindex:                boolean_false,
    seo_nofollow:               boolean_false,
    seo_include_in_sitemap:     boolean_false,
  };

  // ---------------------------------------------------------------------------
  // page_presets
  // ---------------------------------------------------------------------------
  columns['page_presets'] = {
    ...columns['page_presets'],
    name:                      varchar,
    category:                  varchar,
    description:               text,
    thumbnail_id:              integer,
    structure_mode:            varchar,
    source_type:               varchar,
    source_live_page_id:       integer,
    source_draft_id:           integer,
    created_from_snapshot_at:  timestamptz,
  };

  // ---------------------------------------------------------------------------
  // page_playgrounds
  // ---------------------------------------------------------------------------
  columns['page_playgrounds'] = {
    ...columns['page_playgrounds'],
    name:       varchar,
    visibility: varchar,
    expires_at: timestamptz,
    notes:      text,
  };

  // ---------------------------------------------------------------------------
  // nav_children
  // ---------------------------------------------------------------------------
  columns['nav_children'] = {
    ...columns['nav_children'],
    label: varchar,
    href:  varchar,
  };

  // _nav_children_v
  columns['_nav_children_v'] = {
    ...columns['_nav_children_v'],
    label: varchar,
    href:  varchar,
    _uuid: varchar,
  };

  return columns;
}

export const SCHEMA_MANIFEST = buildManifest();

/**
 * Enum manifest — expected labels for critical database enums that can drift
 * when Payload collection slugs evolve faster than applied SQL migrations.
 */
export const SCHEMA_ENUM_MANIFEST = {
  'public.enum_payload_query_presets_related_collection': [
    'users',
    'media',
    'forms',
    'service-items',
    'site-pages',
    'reusable-sections',
    'redirect-rules',
    'blog-posts',
    'testimonials',
    'blog-categories',
    'team-members',
    'logos',
    'page-drafts',
    'page-presets',
    'page-playgrounds',
  ],
};

export const REQUIRED_TABLES = [
  'reuse_sec',
  'audit_logs',
  'page_presets_tags',
  'ui_settings',
  '_ui_settings_v',
  'site_settings',
  '_site_settings_v',
  'site_settings_navigation_links',
  '_site_settings_v_version_navigation_links',
  'nav_children',
  '_nav_children_v',
  'forms',
  'form_submissions',
  ...BLOCK_TABLES,
  ...CREATED_BY_TABLES,
  ...WORKFLOW_REVIEW_TABLES,
];
