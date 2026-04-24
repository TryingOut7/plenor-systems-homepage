import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."bg_token" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum__ui_settings_v_version_current_scheme" AS ENUM('professional_cool', 'modern_technical', 'warm_professional');
  CREATE TYPE "public"."enum_cmp_table_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_cta_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_divider_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_dyn_list_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_faq_sec_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_feat_grid_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_form_sec_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_hero_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_img_sec_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_logo_band_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_org_about_detail_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_org_evt_detail_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_org_evt_reg_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_org_feed_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_org_learn_detail_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_org_sponsors_sec_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_org_spot_detail_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_privacy_note_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_quote_sec_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_reuse_sec_ref_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_richtext_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_simple_table_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_site_pages_page_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_split_sec_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_stats_sec_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_tabs_sec_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_team_sec_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."enum_ui_settings_current_scheme" AS ENUM('professional_cool', 'modern_technical', 'warm_professional');
  CREATE TYPE "public"."enum_vid_sec_background_color" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  CREATE TYPE "public"."text_token" AS ENUM('primary', 'primary-hover', 'background', 'surface', 'section-alt', 'text', 'text-muted', 'border', 'link', 'focus-ring', 'success', 'warning', 'error', 'dark-bg', 'dark-text');
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_site_name" SET DEFAULT 'Plenor.ai';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_brand_tagline" SET DEFAULT 'Professional services and advisory for CMS-driven websites and structured delivery.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_site_url" SET DEFAULT 'https://plenor.ai';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_contact_email" SET DEFAULT 'hello@plenor.ai';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_email_defaults_guide_subject" SET DEFAULT 'Your Plenor.ai briefing from {brandName}';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_email_defaults_guide_heading" SET DEFAULT 'Here''s the briefing, {name}.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_email_defaults_guide_body" SET DEFAULT 'This guide introduces the CMS-driven website model, governed content operations, and the delivery approach Plenor.ai uses in client work.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_email_defaults_guide_button_label" SET DEFAULT 'View the briefing';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_email_defaults_inquiry_ack_body" SET DEFAULT 'We review every inquiry and respond within two business days with next-step guidance or a proposal path.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_content_routing_guide_title" SET DEFAULT 'The CMS-Driven Website Operating Model';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_content_routing_guide_page_url" SET DEFAULT '/contact';
  UPDATE "cmp_table" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "cta" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "divider" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "dyn_list" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "faq_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "feat_grid" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "form_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "hero" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "img_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "logo_band" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "org_about_detail" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "org_evt_detail" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "org_evt_reg" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "org_feed" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "org_learn_detail" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "org_sponsors_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "org_spot_detail" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "privacy_note" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "quote_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "reuse_sec_ref" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "richtext" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "simple_table" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "split_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "stats_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "tabs_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "team_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "vid_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN lower(trim("background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "background_color" IS NOT NULL;
  UPDATE "site_pages" SET "page_background_color" = CASE
    WHEN "page_background_color" IS NULL THEN NULL
    WHEN lower(trim("page_background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("page_background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("page_background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("page_background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("page_background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("page_background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("page_background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("page_background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("page_background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("page_background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("page_background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("page_background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("page_background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("page_background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("page_background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("page_background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "page_background_color" IS NOT NULL;
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_announcement_banner_background_color" DROP DEFAULT;
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_announcement_banner_text_color" DROP DEFAULT;
  UPDATE "_site_settings_v" SET "version_announcement_banner_background_color" = CASE
    WHEN "version_announcement_banner_background_color" IS NULL THEN NULL
    WHEN lower(trim("version_announcement_banner_background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("version_announcement_banner_background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("version_announcement_banner_background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("version_announcement_banner_background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("version_announcement_banner_background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("version_announcement_banner_background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("version_announcement_banner_background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("version_announcement_banner_background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("version_announcement_banner_background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("version_announcement_banner_background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("version_announcement_banner_background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("version_announcement_banner_background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("version_announcement_banner_background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("version_announcement_banner_background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("version_announcement_banner_background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("version_announcement_banner_background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "version_announcement_banner_background_color" IS NOT NULL;
  UPDATE "_site_settings_v" SET "version_announcement_banner_text_color" = CASE
    WHEN "version_announcement_banner_text_color" IS NULL THEN NULL
    WHEN lower(trim("version_announcement_banner_text_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("version_announcement_banner_text_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("version_announcement_banner_text_color")) IN ('background', '#fbf8f2') THEN 'background'
    WHEN lower(trim("version_announcement_banner_text_color")) IN ('surface', '#ffffff') THEN 'surface'
    WHEN lower(trim("version_announcement_banner_text_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("version_announcement_banner_text_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("version_announcement_banner_text_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("version_announcement_banner_text_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("version_announcement_banner_text_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("version_announcement_banner_text_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("version_announcement_banner_text_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("version_announcement_banner_text_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("version_announcement_banner_text_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("version_announcement_banner_text_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1e4a59', '#1b2d4f', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("version_announcement_banner_text_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "version_announcement_banner_text_color" IS NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "announcement_banner_background_color" DROP DEFAULT;
  ALTER TABLE "site_settings" ALTER COLUMN "announcement_banner_text_color" DROP DEFAULT;
  UPDATE "site_settings" SET "announcement_banner_background_color" = CASE
    WHEN "announcement_banner_background_color" IS NULL THEN NULL
    WHEN lower(trim("announcement_banner_background_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("announcement_banner_background_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("announcement_banner_background_color")) IN ('background', 'light', 'transparent') THEN 'background'
    WHEN lower(trim("announcement_banner_background_color")) = '#fbf8f2' THEN 'background'
    WHEN lower(trim("announcement_banner_background_color")) IN ('surface', 'white', '#ffffff') THEN 'surface'
    WHEN lower(trim("announcement_banner_background_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("announcement_banner_background_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("announcement_banner_background_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("announcement_banner_background_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("announcement_banner_background_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("announcement_banner_background_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("announcement_banner_background_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("announcement_banner_background_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("announcement_banner_background_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("announcement_banner_background_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("announcement_banner_background_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "announcement_banner_background_color" IS NOT NULL;
  UPDATE "site_settings" SET "announcement_banner_text_color" = CASE
    WHEN "announcement_banner_text_color" IS NULL THEN NULL
    WHEN lower(trim("announcement_banner_text_color")) IN ('primary', '#1e4a59', '#1b2d4f') THEN 'primary'
    WHEN lower(trim("announcement_banner_text_color")) IN ('primary-hover', '#173a46', '#2a4270') THEN 'primary-hover'
    WHEN lower(trim("announcement_banner_text_color")) IN ('background', '#fbf8f2') THEN 'background'
    WHEN lower(trim("announcement_banner_text_color")) IN ('surface', '#ffffff') THEN 'surface'
    WHEN lower(trim("announcement_banner_text_color")) IN ('section-alt', '#f2ece2', '#f8f9fa') THEN 'section-alt'
    WHEN lower(trim("announcement_banner_text_color")) IN ('text', '#1f2933', '#1a1a1a') THEN 'text'
    WHEN lower(trim("announcement_banner_text_color")) IN ('text-muted', '#5c6670', '#6b7280') THEN 'text-muted'
    WHEN lower(trim("announcement_banner_text_color")) IN ('border', '#d8d0c3', '#e5e7eb') THEN 'border'
    WHEN lower(trim("announcement_banner_text_color")) IN ('link', '#93c5fd') THEN 'link'
    WHEN lower(trim("announcement_banner_text_color")) = '#0f766e' THEN 'focus-ring'
    WHEN lower(trim("announcement_banner_text_color")) IN ('success', '#2f7a3e') THEN 'success'
    WHEN lower(trim("announcement_banner_text_color")) IN ('warning', '#b7791f') THEN 'warning'
    WHEN lower(trim("announcement_banner_text_color")) IN ('error', '#c0392b', '#dc2626') THEN 'error'
    WHEN lower(trim("announcement_banner_text_color")) IN ('dark-bg', 'navy', 'charcoal', 'black', '#1e4a59', '#1b2d4f', '#1f2937', '#111827') THEN 'dark-bg'
    WHEN lower(trim("announcement_banner_text_color")) IN ('dark-text', '#ffffff', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.6)') THEN 'dark-text'
    ELSE NULL
  END WHERE "announcement_banner_text_color" IS NOT NULL;
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_announcement_banner_background_color" SET DATA TYPE "public"."bg_token" USING "version_announcement_banner_background_color"::"public"."bg_token";
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_announcement_banner_background_color" SET DEFAULT 'primary'::"public"."bg_token";
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_announcement_banner_text_color" SET DATA TYPE text_token USING "version_announcement_banner_text_color"::text_token;
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_announcement_banner_text_color" SET DEFAULT 'dark-text'::text_token;
  ALTER TABLE "site_settings" ALTER COLUMN "announcement_banner_background_color" SET DATA TYPE "public"."bg_token" USING "announcement_banner_background_color"::"public"."bg_token";
  ALTER TABLE "site_settings" ALTER COLUMN "announcement_banner_background_color" SET DEFAULT 'primary'::"public"."bg_token";
  ALTER TABLE "site_settings" ALTER COLUMN "announcement_banner_text_color" SET DATA TYPE text_token USING "announcement_banner_text_color"::text_token;
  ALTER TABLE "site_settings" ALTER COLUMN "announcement_banner_text_color" SET DEFAULT 'dark-text'::text_token;
  ALTER TABLE "cmp_table" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_cmp_table_background_color" USING "background_color"::"public"."enum_cmp_table_background_color";
  ALTER TABLE "cta" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_cta_background_color" USING "background_color"::"public"."enum_cta_background_color";
  ALTER TABLE "divider" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_divider_background_color" USING "background_color"::"public"."enum_divider_background_color";
  ALTER TABLE "dyn_list" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_dyn_list_background_color" USING "background_color"::"public"."enum_dyn_list_background_color";
  ALTER TABLE "faq_sec" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_faq_sec_background_color" USING "background_color"::"public"."enum_faq_sec_background_color";
  ALTER TABLE "feat_grid" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_feat_grid_background_color" USING "background_color"::"public"."enum_feat_grid_background_color";
  ALTER TABLE "form_sec" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_form_sec_background_color" USING "background_color"::"public"."enum_form_sec_background_color";
  ALTER TABLE "hero" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_hero_background_color" USING "background_color"::"public"."enum_hero_background_color";
  ALTER TABLE "img_sec" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_img_sec_background_color" USING "background_color"::"public"."enum_img_sec_background_color";
  ALTER TABLE "logo_band" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_logo_band_background_color" USING "background_color"::"public"."enum_logo_band_background_color";
  ALTER TABLE "org_about_detail" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_org_about_detail_background_color" USING "background_color"::"public"."enum_org_about_detail_background_color";
  ALTER TABLE "org_evt_detail" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_org_evt_detail_background_color" USING "background_color"::"public"."enum_org_evt_detail_background_color";
  ALTER TABLE "org_evt_reg" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_org_evt_reg_background_color" USING "background_color"::"public"."enum_org_evt_reg_background_color";
  ALTER TABLE "org_feed" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_org_feed_background_color" USING "background_color"::"public"."enum_org_feed_background_color";
  ALTER TABLE "org_learn_detail" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_org_learn_detail_background_color" USING "background_color"::"public"."enum_org_learn_detail_background_color";
  ALTER TABLE "org_sponsors_sec" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_org_sponsors_sec_background_color" USING "background_color"::"public"."enum_org_sponsors_sec_background_color";
  ALTER TABLE "org_spot_detail" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_org_spot_detail_background_color" USING "background_color"::"public"."enum_org_spot_detail_background_color";
  ALTER TABLE "privacy_note" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_privacy_note_background_color" USING "background_color"::"public"."enum_privacy_note_background_color";
  ALTER TABLE "quote_sec" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_quote_sec_background_color" USING "background_color"::"public"."enum_quote_sec_background_color";
  ALTER TABLE "reuse_sec_ref" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_reuse_sec_ref_background_color" USING "background_color"::"public"."enum_reuse_sec_ref_background_color";
  ALTER TABLE "richtext" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_richtext_background_color" USING "background_color"::"public"."enum_richtext_background_color";
  ALTER TABLE "simple_table" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_simple_table_background_color" USING "background_color"::"public"."enum_simple_table_background_color";
  ALTER TABLE "site_pages" ALTER COLUMN "page_background_color" SET DATA TYPE "public"."enum_site_pages_page_background_color" USING "page_background_color"::"public"."enum_site_pages_page_background_color";
  ALTER TABLE "site_settings" ALTER COLUMN "site_name" SET DEFAULT 'Plenor.ai';
  ALTER TABLE "site_settings" ALTER COLUMN "brand_tagline" SET DEFAULT 'Professional services and advisory for CMS-driven websites and structured delivery.';
  ALTER TABLE "site_settings" ALTER COLUMN "site_url" SET DEFAULT 'https://plenor.ai';
  ALTER TABLE "site_settings" ALTER COLUMN "contact_email" SET DEFAULT 'hello@plenor.ai';
  ALTER TABLE "site_settings" ALTER COLUMN "email_defaults_guide_subject" SET DEFAULT 'Your Plenor.ai briefing from {brandName}';
  ALTER TABLE "site_settings" ALTER COLUMN "email_defaults_guide_heading" SET DEFAULT 'Here''s the briefing, {name}.';
  ALTER TABLE "site_settings" ALTER COLUMN "email_defaults_guide_body" SET DEFAULT 'This guide introduces the CMS-driven website model, governed content operations, and the delivery approach Plenor.ai uses in client work.';
  ALTER TABLE "site_settings" ALTER COLUMN "email_defaults_guide_button_label" SET DEFAULT 'View the briefing';
  ALTER TABLE "site_settings" ALTER COLUMN "email_defaults_inquiry_ack_body" SET DEFAULT 'We review every inquiry and respond within two business days with next-step guidance or a proposal path.';
  ALTER TABLE "site_settings" ALTER COLUMN "content_routing_guide_title" SET DEFAULT 'The CMS-Driven Website Operating Model';
  ALTER TABLE "site_settings" ALTER COLUMN "content_routing_guide_page_url" SET DEFAULT '/contact';
  ALTER TABLE "split_sec" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_split_sec_background_color" USING "background_color"::"public"."enum_split_sec_background_color";
  ALTER TABLE "stats_sec" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_stats_sec_background_color" USING "background_color"::"public"."enum_stats_sec_background_color";
  ALTER TABLE "tabs_sec" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_tabs_sec_background_color" USING "background_color"::"public"."enum_tabs_sec_background_color";
  ALTER TABLE "team_sec" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_team_sec_background_color" USING "background_color"::"public"."enum_team_sec_background_color";
  ALTER TABLE "vid_sec" ALTER COLUMN "background_color" SET DATA TYPE "public"."enum_vid_sec_background_color" USING "background_color"::"public"."enum_vid_sec_background_color";
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_inquiry_validation_name_error" varchar DEFAULT 'Name is required (max 200 characters).';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_inquiry_validation_email_error" varchar DEFAULT 'A valid email address is required.';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_inquiry_validation_organization_error" varchar DEFAULT 'Organization must be 300 characters or fewer.';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_inquiry_validation_inquiry_type_error" varchar DEFAULT 'Inquiry type is required (max 200 characters).';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_inquiry_validation_message_error" varchar DEFAULT 'Message is required (max 5000 characters).';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_inquiry_validation_submission_failure" varchar DEFAULT 'Unable to save your submission. Please try again.';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_inquiry_validation_server_error" varchar DEFAULT 'Server error. Please try again.';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_current_family" varchar DEFAULT 'startup_professional';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_current_scheme" "enum__ui_settings_v_version_current_scheme" DEFAULT 'warm_professional';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_current_typography_preset" varchar DEFAULT 'tp_editorial_professional';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_current_spacing_preset" varchar DEFAULT 'sp_relaxed';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_current_radius_preset" varchar DEFAULT 'rd_soft_controlled';
  ALTER TABLE "site_settings" ADD COLUMN "inquiry_validation_name_error" varchar DEFAULT 'Name is required (max 200 characters).';
  ALTER TABLE "site_settings" ADD COLUMN "inquiry_validation_email_error" varchar DEFAULT 'A valid email address is required.';
  ALTER TABLE "site_settings" ADD COLUMN "inquiry_validation_organization_error" varchar DEFAULT 'Organization must be 300 characters or fewer.';
  ALTER TABLE "site_settings" ADD COLUMN "inquiry_validation_inquiry_type_error" varchar DEFAULT 'Inquiry type is required (max 200 characters).';
  ALTER TABLE "site_settings" ADD COLUMN "inquiry_validation_message_error" varchar DEFAULT 'Message is required (max 5000 characters).';
  ALTER TABLE "site_settings" ADD COLUMN "inquiry_validation_submission_failure" varchar DEFAULT 'Unable to save your submission. Please try again.';
  ALTER TABLE "site_settings" ADD COLUMN "inquiry_validation_server_error" varchar DEFAULT 'Server error. Please try again.';
  ALTER TABLE "ui_settings" ADD COLUMN "current_family" varchar DEFAULT 'startup_professional';
  ALTER TABLE "ui_settings" ADD COLUMN "current_scheme" "enum_ui_settings_current_scheme" DEFAULT 'warm_professional';
  ALTER TABLE "ui_settings" ADD COLUMN "current_typography_preset" varchar DEFAULT 'tp_editorial_professional';
  ALTER TABLE "ui_settings" ADD COLUMN "current_spacing_preset" varchar DEFAULT 'sp_relaxed';
  ALTER TABLE "ui_settings" ADD COLUMN "current_radius_preset" varchar DEFAULT 'rd_soft_controlled';
  UPDATE "_ui_settings_v" SET "version_current_family" = 'startup_professional', "version_current_scheme" = 'warm_professional', "version_current_typography_preset" = 'tp_editorial_professional', "version_current_spacing_preset" = 'sp_relaxed', "version_current_radius_preset" = 'rd_soft_controlled';
  UPDATE "ui_settings" SET "current_family" = 'startup_professional', "current_scheme" = 'warm_professional', "current_typography_preset" = 'tp_editorial_professional', "current_spacing_preset" = 'sp_relaxed', "current_radius_preset" = 'rd_soft_controlled';
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_primary";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_primary_hover";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_background";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_surface";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_section_alt";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_text";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_text_muted";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_border";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_link";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_focus_ring";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_navy_background";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_charcoal_background";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_black_background";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_dark_text";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_dark_text_muted";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_hero_background";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_hero_text";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_hero_muted_text";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_footer_background";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_footer_text";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_footer_muted_text";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_cookie_background";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_cookie_text";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_cookie_link";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_nav_background";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_nav_scrolled_background";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_colors_nav_border";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_typography_body_font_family";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_typography_display_font_family";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_typography_base_font_size";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_typography_base_line_height";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_typography_heading_letter_spacing";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_typography_section_label_letter_spacing";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_typography_heading_font_url";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_typography_body_font_url";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_layout_container_max_width";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_layout_section_padding_compact";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_layout_section_padding_regular";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_layout_section_padding_spacious";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_layout_hero_padding_compact";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_layout_hero_padding_regular";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_layout_hero_padding_spacious";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_layout_mobile_section_padding";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_layout_nav_height";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_layout_card_radius";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_buttons_radius";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_buttons_primary_background";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_buttons_primary_background_hover";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_buttons_primary_text";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_buttons_secondary_background";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_buttons_secondary_background_hover";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_buttons_secondary_text";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_buttons_secondary_text_hover";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_buttons_ghost_background";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_buttons_ghost_background_hover";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_buttons_ghost_text";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_buttons_nav_background";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_buttons_nav_background_hover";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_buttons_nav_text";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_email_palette_primary";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_email_palette_muted";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_email_palette_text";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_email_palette_background";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_email_palette_white";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_email_palette_border";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_email_palette_error";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_primary";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_primary_hover";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_background";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_surface";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_section_alt";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_text";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_text_muted";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_border";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_link";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_focus_ring";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_navy_background";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_charcoal_background";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_black_background";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_dark_text";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_dark_text_muted";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_hero_background";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_hero_text";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_hero_muted_text";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_footer_background";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_footer_text";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_footer_muted_text";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_cookie_background";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_cookie_text";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_cookie_link";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_nav_background";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_nav_scrolled_background";
  ALTER TABLE "ui_settings" DROP COLUMN "colors_nav_border";
  ALTER TABLE "ui_settings" DROP COLUMN "typography_body_font_family";
  ALTER TABLE "ui_settings" DROP COLUMN "typography_display_font_family";
  ALTER TABLE "ui_settings" DROP COLUMN "typography_base_font_size";
  ALTER TABLE "ui_settings" DROP COLUMN "typography_base_line_height";
  ALTER TABLE "ui_settings" DROP COLUMN "typography_heading_letter_spacing";
  ALTER TABLE "ui_settings" DROP COLUMN "typography_section_label_letter_spacing";
  ALTER TABLE "ui_settings" DROP COLUMN "typography_heading_font_url";
  ALTER TABLE "ui_settings" DROP COLUMN "typography_body_font_url";
  ALTER TABLE "ui_settings" DROP COLUMN "layout_container_max_width";
  ALTER TABLE "ui_settings" DROP COLUMN "layout_section_padding_compact";
  ALTER TABLE "ui_settings" DROP COLUMN "layout_section_padding_regular";
  ALTER TABLE "ui_settings" DROP COLUMN "layout_section_padding_spacious";
  ALTER TABLE "ui_settings" DROP COLUMN "layout_hero_padding_compact";
  ALTER TABLE "ui_settings" DROP COLUMN "layout_hero_padding_regular";
  ALTER TABLE "ui_settings" DROP COLUMN "layout_hero_padding_spacious";
  ALTER TABLE "ui_settings" DROP COLUMN "layout_mobile_section_padding";
  ALTER TABLE "ui_settings" DROP COLUMN "layout_nav_height";
  ALTER TABLE "ui_settings" DROP COLUMN "layout_card_radius";
  ALTER TABLE "ui_settings" DROP COLUMN "buttons_radius";
  ALTER TABLE "ui_settings" DROP COLUMN "buttons_primary_background";
  ALTER TABLE "ui_settings" DROP COLUMN "buttons_primary_background_hover";
  ALTER TABLE "ui_settings" DROP COLUMN "buttons_primary_text";
  ALTER TABLE "ui_settings" DROP COLUMN "buttons_secondary_background";
  ALTER TABLE "ui_settings" DROP COLUMN "buttons_secondary_background_hover";
  ALTER TABLE "ui_settings" DROP COLUMN "buttons_secondary_text";
  ALTER TABLE "ui_settings" DROP COLUMN "buttons_secondary_text_hover";
  ALTER TABLE "ui_settings" DROP COLUMN "buttons_ghost_background";
  ALTER TABLE "ui_settings" DROP COLUMN "buttons_ghost_background_hover";
  ALTER TABLE "ui_settings" DROP COLUMN "buttons_ghost_text";
  ALTER TABLE "ui_settings" DROP COLUMN "buttons_nav_background";
  ALTER TABLE "ui_settings" DROP COLUMN "buttons_nav_background_hover";
  ALTER TABLE "ui_settings" DROP COLUMN "buttons_nav_text";
  ALTER TABLE "ui_settings" DROP COLUMN "email_palette_primary";
  ALTER TABLE "ui_settings" DROP COLUMN "email_palette_muted";
  ALTER TABLE "ui_settings" DROP COLUMN "email_palette_text";
  ALTER TABLE "ui_settings" DROP COLUMN "email_palette_background";
  ALTER TABLE "ui_settings" DROP COLUMN "email_palette_white";
  ALTER TABLE "ui_settings" DROP COLUMN "email_palette_border";
  ALTER TABLE "ui_settings" DROP COLUMN "email_palette_error";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_site_settings_v" ALTER COLUMN "version_site_name" SET DEFAULT 'Website';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_brand_tagline" DROP DEFAULT;
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_site_url" SET DEFAULT 'https://example.com';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_contact_email" SET DEFAULT 'contact@example.com';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_announcement_banner_background_color" SET DATA TYPE varchar;
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_announcement_banner_background_color" SET DEFAULT '#1E4A59';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_announcement_banner_text_color" SET DATA TYPE varchar;
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_announcement_banner_text_color" SET DEFAULT '#FFFFFF';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_email_defaults_guide_subject" SET DEFAULT 'Your free guide from {brandName}';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_email_defaults_guide_heading" SET DEFAULT 'Here''s your guide, {name}.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_email_defaults_guide_body" SET DEFAULT 'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_email_defaults_guide_button_label" SET DEFAULT 'Download the guide';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_email_defaults_inquiry_ack_body" SET DEFAULT 'We review every inquiry and respond within 2 business days with initial thoughts or a proposal request.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_content_routing_guide_title" SET DEFAULT 'The 7 Most Common Product Development Mistakes — and How to Avoid Them';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_content_routing_guide_page_url" SET DEFAULT '/contact#guide';
  ALTER TABLE "cmp_table" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "cta" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "divider" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "dyn_list" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "faq_sec" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "feat_grid" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "form_sec" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "hero" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "img_sec" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "logo_band" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "org_about_detail" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "org_evt_detail" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "org_evt_reg" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "org_feed" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "org_learn_detail" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "org_sponsors_sec" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "org_spot_detail" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "privacy_note" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "quote_sec" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "reuse_sec_ref" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "richtext" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "simple_table" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "site_pages" ALTER COLUMN "page_background_color" SET DATA TYPE varchar;
  ALTER TABLE "site_settings" ALTER COLUMN "site_name" SET DEFAULT 'Website';
  ALTER TABLE "site_settings" ALTER COLUMN "brand_tagline" DROP DEFAULT;
  ALTER TABLE "site_settings" ALTER COLUMN "site_url" SET DEFAULT 'https://example.com';
  ALTER TABLE "site_settings" ALTER COLUMN "contact_email" SET DEFAULT 'contact@example.com';
  ALTER TABLE "site_settings" ALTER COLUMN "announcement_banner_background_color" SET DATA TYPE varchar;
  ALTER TABLE "site_settings" ALTER COLUMN "announcement_banner_background_color" SET DEFAULT '#1E4A59';
  ALTER TABLE "site_settings" ALTER COLUMN "announcement_banner_text_color" SET DATA TYPE varchar;
  ALTER TABLE "site_settings" ALTER COLUMN "announcement_banner_text_color" SET DEFAULT '#FFFFFF';
  ALTER TABLE "site_settings" ALTER COLUMN "email_defaults_guide_subject" SET DEFAULT 'Your free guide from {brandName}';
  ALTER TABLE "site_settings" ALTER COLUMN "email_defaults_guide_heading" SET DEFAULT 'Here''s your guide, {name}.';
  ALTER TABLE "site_settings" ALTER COLUMN "email_defaults_guide_body" SET DEFAULT 'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead.';
  ALTER TABLE "site_settings" ALTER COLUMN "email_defaults_guide_button_label" SET DEFAULT 'Download the guide';
  ALTER TABLE "site_settings" ALTER COLUMN "email_defaults_inquiry_ack_body" SET DEFAULT 'We review every inquiry and respond within 2 business days with initial thoughts or a proposal request.';
  ALTER TABLE "site_settings" ALTER COLUMN "content_routing_guide_title" SET DEFAULT 'The 7 Most Common Product Development Mistakes — and How to Avoid Them';
  ALTER TABLE "site_settings" ALTER COLUMN "content_routing_guide_page_url" SET DEFAULT '/contact#guide';
  ALTER TABLE "split_sec" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "stats_sec" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "tabs_sec" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "team_sec" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "vid_sec" ALTER COLUMN "background_color" SET DATA TYPE varchar;
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_primary" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_primary_hover" varchar DEFAULT '#2A4270';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_background" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_surface" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_section_alt" varchar DEFAULT '#F8F9FA';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_text" varchar DEFAULT '#1A1A1A';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_text_muted" varchar DEFAULT '#6B7280';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_border" varchar DEFAULT '#E5E7EB';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_link" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_focus_ring" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_navy_background" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_charcoal_background" varchar DEFAULT '#1F2937';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_black_background" varchar DEFAULT '#111827';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_dark_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_dark_text_muted" varchar DEFAULT 'rgba(255,255,255,0.72)';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_hero_background" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_hero_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_hero_muted_text" varchar DEFAULT 'rgba(255,255,255,0.72)';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_footer_background" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_footer_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_footer_muted_text" varchar DEFAULT 'rgba(255,255,255,0.6)';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_cookie_background" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_cookie_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_cookie_link" varchar DEFAULT '#93C5FD';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_nav_background" varchar DEFAULT 'transparent';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_nav_scrolled_background" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_colors_nav_border" varchar DEFAULT '#E5E7EB';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_typography_body_font_family" varchar DEFAULT 'var(--font-sans), system-ui, sans-serif';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_typography_display_font_family" varchar DEFAULT 'var(--font-sans), system-ui, sans-serif';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_typography_base_font_size" numeric DEFAULT 16;
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_typography_base_line_height" numeric DEFAULT 1.6;
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_typography_heading_letter_spacing" varchar DEFAULT '-0.02em';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_typography_section_label_letter_spacing" varchar DEFAULT '0.12em';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_typography_heading_font_url" varchar;
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_typography_body_font_url" varchar;
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_layout_container_max_width" varchar DEFAULT '1200px';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_layout_section_padding_compact" varchar DEFAULT '72px 24px';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_layout_section_padding_regular" varchar DEFAULT '96px 24px';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_layout_section_padding_spacious" varchar DEFAULT '124px 24px';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_layout_hero_padding_compact" varchar DEFAULT '88px 24px 96px';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_layout_hero_padding_regular" varchar DEFAULT '112px 24px 120px';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_layout_hero_padding_spacious" varchar DEFAULT '140px 24px 148px';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_layout_mobile_section_padding" varchar DEFAULT '64px';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_layout_nav_height" numeric DEFAULT 68;
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_layout_card_radius" numeric DEFAULT 8;
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_buttons_radius" numeric DEFAULT 4;
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_buttons_primary_background" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_buttons_primary_background_hover" varchar DEFAULT '#2A4270';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_buttons_primary_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_buttons_secondary_background" varchar DEFAULT 'transparent';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_buttons_secondary_background_hover" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_buttons_secondary_text" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_buttons_secondary_text_hover" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_buttons_ghost_background" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_buttons_ghost_background_hover" varchar DEFAULT '#F0F4FA';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_buttons_ghost_text" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_buttons_nav_background" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_buttons_nav_background_hover" varchar DEFAULT '#2A4270';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_buttons_nav_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_email_palette_primary" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_email_palette_muted" varchar DEFAULT '#6B7280';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_email_palette_text" varchar DEFAULT '#1A1A1A';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_email_palette_background" varchar DEFAULT '#F8F9FA';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_email_palette_white" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_email_palette_border" varchar DEFAULT '#E5E7EB';
  ALTER TABLE "_ui_settings_v" ADD COLUMN "version_email_palette_error" varchar DEFAULT '#DC2626';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_primary" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_primary_hover" varchar DEFAULT '#2A4270';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_background" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_surface" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_section_alt" varchar DEFAULT '#F8F9FA';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_text" varchar DEFAULT '#1A1A1A';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_text_muted" varchar DEFAULT '#6B7280';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_border" varchar DEFAULT '#E5E7EB';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_link" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_focus_ring" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_navy_background" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_charcoal_background" varchar DEFAULT '#1F2937';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_black_background" varchar DEFAULT '#111827';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_dark_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_dark_text_muted" varchar DEFAULT 'rgba(255,255,255,0.72)';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_hero_background" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_hero_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_hero_muted_text" varchar DEFAULT 'rgba(255,255,255,0.72)';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_footer_background" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_footer_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_footer_muted_text" varchar DEFAULT 'rgba(255,255,255,0.6)';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_cookie_background" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_cookie_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_cookie_link" varchar DEFAULT '#93C5FD';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_nav_background" varchar DEFAULT 'transparent';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_nav_scrolled_background" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN "colors_nav_border" varchar DEFAULT '#E5E7EB';
  ALTER TABLE "ui_settings" ADD COLUMN "typography_body_font_family" varchar DEFAULT 'var(--font-sans), system-ui, sans-serif';
  ALTER TABLE "ui_settings" ADD COLUMN "typography_display_font_family" varchar DEFAULT 'var(--font-sans), system-ui, sans-serif';
  ALTER TABLE "ui_settings" ADD COLUMN "typography_base_font_size" numeric DEFAULT 16;
  ALTER TABLE "ui_settings" ADD COLUMN "typography_base_line_height" numeric DEFAULT 1.6;
  ALTER TABLE "ui_settings" ADD COLUMN "typography_heading_letter_spacing" varchar DEFAULT '-0.02em';
  ALTER TABLE "ui_settings" ADD COLUMN "typography_section_label_letter_spacing" varchar DEFAULT '0.12em';
  ALTER TABLE "ui_settings" ADD COLUMN "typography_heading_font_url" varchar;
  ALTER TABLE "ui_settings" ADD COLUMN "typography_body_font_url" varchar;
  ALTER TABLE "ui_settings" ADD COLUMN "layout_container_max_width" varchar DEFAULT '1200px';
  ALTER TABLE "ui_settings" ADD COLUMN "layout_section_padding_compact" varchar DEFAULT '72px 24px';
  ALTER TABLE "ui_settings" ADD COLUMN "layout_section_padding_regular" varchar DEFAULT '96px 24px';
  ALTER TABLE "ui_settings" ADD COLUMN "layout_section_padding_spacious" varchar DEFAULT '124px 24px';
  ALTER TABLE "ui_settings" ADD COLUMN "layout_hero_padding_compact" varchar DEFAULT '88px 24px 96px';
  ALTER TABLE "ui_settings" ADD COLUMN "layout_hero_padding_regular" varchar DEFAULT '112px 24px 120px';
  ALTER TABLE "ui_settings" ADD COLUMN "layout_hero_padding_spacious" varchar DEFAULT '140px 24px 148px';
  ALTER TABLE "ui_settings" ADD COLUMN "layout_mobile_section_padding" varchar DEFAULT '64px';
  ALTER TABLE "ui_settings" ADD COLUMN "layout_nav_height" numeric DEFAULT 68;
  ALTER TABLE "ui_settings" ADD COLUMN "layout_card_radius" numeric DEFAULT 8;
  ALTER TABLE "ui_settings" ADD COLUMN "buttons_radius" numeric DEFAULT 4;
  ALTER TABLE "ui_settings" ADD COLUMN "buttons_primary_background" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "ui_settings" ADD COLUMN "buttons_primary_background_hover" varchar DEFAULT '#2A4270';
  ALTER TABLE "ui_settings" ADD COLUMN "buttons_primary_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN "buttons_secondary_background" varchar DEFAULT 'transparent';
  ALTER TABLE "ui_settings" ADD COLUMN "buttons_secondary_background_hover" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "ui_settings" ADD COLUMN "buttons_secondary_text" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "ui_settings" ADD COLUMN "buttons_secondary_text_hover" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN "buttons_ghost_background" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN "buttons_ghost_background_hover" varchar DEFAULT '#F0F4FA';
  ALTER TABLE "ui_settings" ADD COLUMN "buttons_ghost_text" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "ui_settings" ADD COLUMN "buttons_nav_background" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "ui_settings" ADD COLUMN "buttons_nav_background_hover" varchar DEFAULT '#2A4270';
  ALTER TABLE "ui_settings" ADD COLUMN "buttons_nav_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN "email_palette_primary" varchar DEFAULT '#1B2D4F';
  ALTER TABLE "ui_settings" ADD COLUMN "email_palette_muted" varchar DEFAULT '#6B7280';
  ALTER TABLE "ui_settings" ADD COLUMN "email_palette_text" varchar DEFAULT '#1A1A1A';
  ALTER TABLE "ui_settings" ADD COLUMN "email_palette_background" varchar DEFAULT '#F8F9FA';
  ALTER TABLE "ui_settings" ADD COLUMN "email_palette_white" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN "email_palette_border" varchar DEFAULT '#E5E7EB';
  ALTER TABLE "ui_settings" ADD COLUMN "email_palette_error" varchar DEFAULT '#DC2626';
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_inquiry_validation_name_error";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_inquiry_validation_email_error";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_inquiry_validation_organization_error";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_inquiry_validation_inquiry_type_error";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_inquiry_validation_message_error";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_inquiry_validation_submission_failure";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_inquiry_validation_server_error";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_current_family";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_current_scheme";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_current_typography_preset";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_current_spacing_preset";
  ALTER TABLE "_ui_settings_v" DROP COLUMN "version_current_radius_preset";
  ALTER TABLE "site_settings" DROP COLUMN "inquiry_validation_name_error";
  ALTER TABLE "site_settings" DROP COLUMN "inquiry_validation_email_error";
  ALTER TABLE "site_settings" DROP COLUMN "inquiry_validation_organization_error";
  ALTER TABLE "site_settings" DROP COLUMN "inquiry_validation_inquiry_type_error";
  ALTER TABLE "site_settings" DROP COLUMN "inquiry_validation_message_error";
  ALTER TABLE "site_settings" DROP COLUMN "inquiry_validation_submission_failure";
  ALTER TABLE "site_settings" DROP COLUMN "inquiry_validation_server_error";
  ALTER TABLE "ui_settings" DROP COLUMN "current_family";
  ALTER TABLE "ui_settings" DROP COLUMN "current_scheme";
  ALTER TABLE "ui_settings" DROP COLUMN "current_typography_preset";
  ALTER TABLE "ui_settings" DROP COLUMN "current_spacing_preset";
  ALTER TABLE "ui_settings" DROP COLUMN "current_radius_preset";
  UPDATE "cmp_table" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "cta" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "divider" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "dyn_list" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "faq_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "feat_grid" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "form_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "hero" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "img_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "logo_band" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "org_about_detail" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "org_evt_detail" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "org_evt_reg" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "org_feed" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "org_learn_detail" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "org_sponsors_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "org_spot_detail" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "privacy_note" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "quote_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "reuse_sec_ref" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "richtext" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "simple_table" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "split_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "stats_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "tabs_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "team_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "vid_sec" SET "background_color" = CASE
    WHEN "background_color" IS NULL THEN NULL
    WHEN "background_color" = 'primary' THEN '#1E4A59'
    WHEN "background_color" = 'primary-hover' THEN '#173A46'
    WHEN "background_color" = 'background' THEN '#FBF8F2'
    WHEN "background_color" = 'surface' THEN '#FFFFFF'
    WHEN "background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "background_color" = 'text' THEN '#1F2933'
    WHEN "background_color" = 'text-muted' THEN '#5C6670'
    WHEN "background_color" = 'border' THEN '#D8D0C3'
    WHEN "background_color" = 'link' THEN '#1E4A59'
    WHEN "background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "background_color" = 'success' THEN '#2F7A3E'
    WHEN "background_color" = 'warning' THEN '#B7791F'
    WHEN "background_color" = 'error' THEN '#C0392B'
    WHEN "background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "background_color"
  END WHERE "background_color" IS NOT NULL;
  UPDATE "site_pages" SET "page_background_color" = CASE
    WHEN "page_background_color" IS NULL THEN NULL
    WHEN "page_background_color" = 'primary' THEN '#1E4A59'
    WHEN "page_background_color" = 'primary-hover' THEN '#173A46'
    WHEN "page_background_color" = 'background' THEN '#FBF8F2'
    WHEN "page_background_color" = 'surface' THEN '#FFFFFF'
    WHEN "page_background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "page_background_color" = 'text' THEN '#1F2933'
    WHEN "page_background_color" = 'text-muted' THEN '#5C6670'
    WHEN "page_background_color" = 'border' THEN '#D8D0C3'
    WHEN "page_background_color" = 'link' THEN '#1E4A59'
    WHEN "page_background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "page_background_color" = 'success' THEN '#2F7A3E'
    WHEN "page_background_color" = 'warning' THEN '#B7791F'
    WHEN "page_background_color" = 'error' THEN '#C0392B'
    WHEN "page_background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "page_background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "page_background_color"
  END WHERE "page_background_color" IS NOT NULL;
  UPDATE "_site_settings_v" SET "version_announcement_banner_background_color" = CASE
    WHEN "version_announcement_banner_background_color" IS NULL THEN NULL
    WHEN "version_announcement_banner_background_color" = 'primary' THEN '#1E4A59'
    WHEN "version_announcement_banner_background_color" = 'primary-hover' THEN '#173A46'
    WHEN "version_announcement_banner_background_color" = 'background' THEN '#FBF8F2'
    WHEN "version_announcement_banner_background_color" = 'surface' THEN '#FFFFFF'
    WHEN "version_announcement_banner_background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "version_announcement_banner_background_color" = 'text' THEN '#1F2933'
    WHEN "version_announcement_banner_background_color" = 'text-muted' THEN '#5C6670'
    WHEN "version_announcement_banner_background_color" = 'border' THEN '#D8D0C3'
    WHEN "version_announcement_banner_background_color" = 'link' THEN '#1E4A59'
    WHEN "version_announcement_banner_background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "version_announcement_banner_background_color" = 'success' THEN '#2F7A3E'
    WHEN "version_announcement_banner_background_color" = 'warning' THEN '#B7791F'
    WHEN "version_announcement_banner_background_color" = 'error' THEN '#C0392B'
    WHEN "version_announcement_banner_background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "version_announcement_banner_background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "version_announcement_banner_background_color"
  END WHERE "version_announcement_banner_background_color" IS NOT NULL;
  UPDATE "_site_settings_v" SET "version_announcement_banner_text_color" = CASE
    WHEN "version_announcement_banner_text_color" IS NULL THEN NULL
    WHEN "version_announcement_banner_text_color" = 'dark-text' THEN '#FFFFFF'
    WHEN "version_announcement_banner_text_color" = 'text' THEN '#1F2933'
    WHEN "version_announcement_banner_text_color" = 'text-muted' THEN '#5C6670'
    WHEN "version_announcement_banner_text_color" = 'primary' THEN '#1E4A59'
    WHEN "version_announcement_banner_text_color" = 'primary-hover' THEN '#173A46'
    WHEN "version_announcement_banner_text_color" = 'background' THEN '#FBF8F2'
    WHEN "version_announcement_banner_text_color" = 'surface' THEN '#FFFFFF'
    WHEN "version_announcement_banner_text_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "version_announcement_banner_text_color" = 'border' THEN '#D8D0C3'
    WHEN "version_announcement_banner_text_color" = 'link' THEN '#1E4A59'
    WHEN "version_announcement_banner_text_color" = 'focus-ring' THEN '#0F766E'
    WHEN "version_announcement_banner_text_color" = 'success' THEN '#2F7A3E'
    WHEN "version_announcement_banner_text_color" = 'warning' THEN '#B7791F'
    WHEN "version_announcement_banner_text_color" = 'error' THEN '#C0392B'
    WHEN "version_announcement_banner_text_color" = 'dark-bg' THEN '#1E4A59'
    ELSE "version_announcement_banner_text_color"
  END WHERE "version_announcement_banner_text_color" IS NOT NULL;
  UPDATE "site_settings" SET "announcement_banner_background_color" = CASE
    WHEN "announcement_banner_background_color" IS NULL THEN NULL
    WHEN "announcement_banner_background_color" = 'primary' THEN '#1E4A59'
    WHEN "announcement_banner_background_color" = 'primary-hover' THEN '#173A46'
    WHEN "announcement_banner_background_color" = 'background' THEN '#FBF8F2'
    WHEN "announcement_banner_background_color" = 'surface' THEN '#FFFFFF'
    WHEN "announcement_banner_background_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "announcement_banner_background_color" = 'text' THEN '#1F2933'
    WHEN "announcement_banner_background_color" = 'text-muted' THEN '#5C6670'
    WHEN "announcement_banner_background_color" = 'border' THEN '#D8D0C3'
    WHEN "announcement_banner_background_color" = 'link' THEN '#1E4A59'
    WHEN "announcement_banner_background_color" = 'focus-ring' THEN '#0F766E'
    WHEN "announcement_banner_background_color" = 'success' THEN '#2F7A3E'
    WHEN "announcement_banner_background_color" = 'warning' THEN '#B7791F'
    WHEN "announcement_banner_background_color" = 'error' THEN '#C0392B'
    WHEN "announcement_banner_background_color" = 'dark-bg' THEN '#1E4A59'
    WHEN "announcement_banner_background_color" = 'dark-text' THEN '#FFFFFF'
    ELSE "announcement_banner_background_color"
  END WHERE "announcement_banner_background_color" IS NOT NULL;
  UPDATE "site_settings" SET "announcement_banner_text_color" = CASE
    WHEN "announcement_banner_text_color" IS NULL THEN NULL
    WHEN "announcement_banner_text_color" = 'dark-text' THEN '#FFFFFF'
    WHEN "announcement_banner_text_color" = 'text' THEN '#1F2933'
    WHEN "announcement_banner_text_color" = 'text-muted' THEN '#5C6670'
    WHEN "announcement_banner_text_color" = 'primary' THEN '#1E4A59'
    WHEN "announcement_banner_text_color" = 'primary-hover' THEN '#173A46'
    WHEN "announcement_banner_text_color" = 'background' THEN '#FBF8F2'
    WHEN "announcement_banner_text_color" = 'surface' THEN '#FFFFFF'
    WHEN "announcement_banner_text_color" = 'section-alt' THEN '#F2ECE2'
    WHEN "announcement_banner_text_color" = 'border' THEN '#D8D0C3'
    WHEN "announcement_banner_text_color" = 'link' THEN '#1E4A59'
    WHEN "announcement_banner_text_color" = 'focus-ring' THEN '#0F766E'
    WHEN "announcement_banner_text_color" = 'success' THEN '#2F7A3E'
    WHEN "announcement_banner_text_color" = 'warning' THEN '#B7791F'
    WHEN "announcement_banner_text_color" = 'error' THEN '#C0392B'
    WHEN "announcement_banner_text_color" = 'dark-bg' THEN '#1E4A59'
    ELSE "announcement_banner_text_color"
  END WHERE "announcement_banner_text_color" IS NOT NULL;
  DROP TYPE "public"."bg_token";
  DROP TYPE "public"."enum__ui_settings_v_version_current_scheme";
  DROP TYPE "public"."enum_cmp_table_background_color";
  DROP TYPE "public"."enum_cta_background_color";
  DROP TYPE "public"."enum_divider_background_color";
  DROP TYPE "public"."enum_dyn_list_background_color";
  DROP TYPE "public"."enum_faq_sec_background_color";
  DROP TYPE "public"."enum_feat_grid_background_color";
  DROP TYPE "public"."enum_form_sec_background_color";
  DROP TYPE "public"."enum_hero_background_color";
  DROP TYPE "public"."enum_img_sec_background_color";
  DROP TYPE "public"."enum_logo_band_background_color";
  DROP TYPE "public"."enum_org_about_detail_background_color";
  DROP TYPE "public"."enum_org_evt_detail_background_color";
  DROP TYPE "public"."enum_org_evt_reg_background_color";
  DROP TYPE "public"."enum_org_feed_background_color";
  DROP TYPE "public"."enum_org_learn_detail_background_color";
  DROP TYPE "public"."enum_org_sponsors_sec_background_color";
  DROP TYPE "public"."enum_org_spot_detail_background_color";
  DROP TYPE "public"."enum_privacy_note_background_color";
  DROP TYPE "public"."enum_quote_sec_background_color";
  DROP TYPE "public"."enum_reuse_sec_ref_background_color";
  DROP TYPE "public"."enum_richtext_background_color";
  DROP TYPE "public"."enum_simple_table_background_color";
  DROP TYPE "public"."enum_site_pages_page_background_color";
  DROP TYPE "public"."enum_split_sec_background_color";
  DROP TYPE "public"."enum_stats_sec_background_color";
  DROP TYPE "public"."enum_tabs_sec_background_color";
  DROP TYPE "public"."enum_team_sec_background_color";
  DROP TYPE "public"."enum_ui_settings_current_scheme";
  DROP TYPE "public"."enum_vid_sec_background_color";
  DROP TYPE "public"."text_token";
  `)
}
