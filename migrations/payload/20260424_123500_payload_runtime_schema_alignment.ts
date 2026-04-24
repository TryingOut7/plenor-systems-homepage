import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
 await db.execute(sql`
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum__org_about_profiles_v_version_category'
 ) THEN
  CREATE TYPE "public"."enum__org_about_profiles_v_version_category" AS ENUM('founder', 'volunteer_team', 'mentor');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum__org_about_profiles_v_version_status'
 ) THEN
  CREATE TYPE "public"."enum__org_about_profiles_v_version_status" AS ENUM('draft', 'published');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum__org_about_profiles_v_version_workflow_status'
 ) THEN
  CREATE TYPE "public"."enum__org_about_profiles_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published', 'archived');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum__org_sponsors_v_version_display_order'
 ) THEN
  CREATE TYPE "public"."enum__org_sponsors_v_version_display_order" AS ENUM('support_summary', 'sponsor_acknowledgment', 'donation_instructions', 'payment_instructions', 'sponsor_logos', 'support_faq', 'featured_supporter_text');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum__org_sponsors_v_version_status'
 ) THEN
  CREATE TYPE "public"."enum__org_sponsors_v_version_status" AS ENUM('draft', 'published');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum__ui_settings_v_version_current_radius_preset'
 ) THEN
  CREATE TYPE "public"."enum__ui_settings_v_version_current_radius_preset" AS ENUM('rd_soft_controlled', 'rd_minimal');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum__ui_settings_v_version_current_spacing_preset'
 ) THEN
  CREATE TYPE "public"."enum__ui_settings_v_version_current_spacing_preset" AS ENUM('sp_relaxed', 'sp_standard');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum__ui_settings_v_version_current_typography_preset'
 ) THEN
  CREATE TYPE "public"."enum__ui_settings_v_version_current_typography_preset" AS ENUM('tp_editorial_professional', 'tp_professional_modern');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_org_about_detail_heading_size'
 ) THEN
  CREATE TYPE "public"."enum_org_about_detail_heading_size" AS ENUM('xs', 'sm', 'md', 'lg', 'xl');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_org_about_detail_heading_tag'
 ) THEN
  CREATE TYPE "public"."enum_org_about_detail_heading_tag" AS ENUM('h1', 'h2', 'h3', 'h4');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_org_about_detail_size'
 ) THEN
  CREATE TYPE "public"."enum_org_about_detail_size" AS ENUM('compact', 'regular', 'spacious');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_org_about_detail_text_align'
 ) THEN
  CREATE TYPE "public"."enum_org_about_detail_text_align" AS ENUM('left', 'center', 'right');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_org_about_detail_theme'
 ) THEN
  CREATE TYPE "public"."enum_org_about_detail_theme" AS ENUM('navy', 'charcoal', 'black', 'white', 'light');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_org_about_profiles_category'
 ) THEN
  CREATE TYPE "public"."enum_org_about_profiles_category" AS ENUM('founder', 'volunteer_team', 'mentor');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_org_about_profiles_status'
 ) THEN
  CREATE TYPE "public"."enum_org_about_profiles_status" AS ENUM('draft', 'published');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_org_about_profiles_workflow_status'
 ) THEN
  CREATE TYPE "public"."enum_org_about_profiles_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published', 'archived');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_org_sponsors_display_order'
 ) THEN
  CREATE TYPE "public"."enum_org_sponsors_display_order" AS ENUM('support_summary', 'sponsor_acknowledgment', 'donation_instructions', 'payment_instructions', 'sponsor_logos', 'support_faq', 'featured_supporter_text');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_org_sponsors_sec_heading_size'
 ) THEN
  CREATE TYPE "public"."enum_org_sponsors_sec_heading_size" AS ENUM('xs', 'sm', 'md', 'lg', 'xl');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_org_sponsors_sec_heading_tag'
 ) THEN
  CREATE TYPE "public"."enum_org_sponsors_sec_heading_tag" AS ENUM('h1', 'h2', 'h3', 'h4');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_org_sponsors_sec_size'
 ) THEN
  CREATE TYPE "public"."enum_org_sponsors_sec_size" AS ENUM('compact', 'regular', 'spacious');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_org_sponsors_sec_text_align'
 ) THEN
  CREATE TYPE "public"."enum_org_sponsors_sec_text_align" AS ENUM('left', 'center', 'right');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_org_sponsors_sec_theme'
 ) THEN
  CREATE TYPE "public"."enum_org_sponsors_sec_theme" AS ENUM('navy', 'charcoal', 'black', 'white', 'light');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_org_sponsors_status'
 ) THEN
  CREATE TYPE "public"."enum_org_sponsors_status" AS ENUM('draft', 'published');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_ui_settings_current_radius_preset'
 ) THEN
  CREATE TYPE "public"."enum_ui_settings_current_radius_preset" AS ENUM('rd_soft_controlled', 'rd_minimal');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_ui_settings_current_spacing_preset'
 ) THEN
  CREATE TYPE "public"."enum_ui_settings_current_spacing_preset" AS ENUM('sp_relaxed', 'sp_standard');
 END IF;
END $$;
  DO $$ BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
   AND t.typname = 'enum_ui_settings_current_typography_preset'
 ) THEN
  CREATE TYPE "public"."enum_ui_settings_current_typography_preset" AS ENUM('tp_editorial_professional', 'tp_professional_modern');
 END IF;
END $$;
  -- _framework_entries_v
  ALTER TABLE "_framework_entries_v" ADD COLUMN IF NOT EXISTS "version_meta_title" varchar;
  ALTER TABLE "_framework_entries_v" ADD COLUMN IF NOT EXISTS "version_meta_description" varchar;
  ALTER TABLE "_framework_entries_v" ADD COLUMN IF NOT EXISTS "version_meta_image_id" integer;
  -- _insight_entries_v
  ALTER TABLE "_insight_entries_v" ADD COLUMN IF NOT EXISTS "version_meta_title" varchar;
  ALTER TABLE "_insight_entries_v" ADD COLUMN IF NOT EXISTS "version_meta_description" varchar;
  ALTER TABLE "_insight_entries_v" ADD COLUMN IF NOT EXISTS "version_meta_image_id" integer;
  -- _org_about_profiles_v
  ALTER TABLE "_org_about_profiles_v" ADD COLUMN IF NOT EXISTS "version_category" "public"."enum__org_about_profiles_v_version_category";
  ALTER TABLE "_org_about_profiles_v" ADD COLUMN IF NOT EXISTS "version_workflow_status" "public"."enum__org_about_profiles_v_version_workflow_status" DEFAULT 'draft';
  ALTER TABLE "_org_about_profiles_v" ADD COLUMN IF NOT EXISTS "version__status" "public"."enum__org_about_profiles_v_version_status" DEFAULT 'draft';
  -- _org_sponsors_v
  ALTER TABLE "_org_sponsors_v" ADD COLUMN IF NOT EXISTS "version__status" "public"."enum__org_sponsors_v_version_status" DEFAULT 'draft';
  -- _org_sponsors_v_version_display_order
  ALTER TABLE "_org_sponsors_v_version_display_order" ADD COLUMN IF NOT EXISTS "value" "public"."enum__org_sponsors_v_version_display_order";
  -- _site_settings_v
  ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_reversed_logo_image_id" integer;
  ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_favicon_image_id" integer;
  -- _solution_entries_v
  ALTER TABLE "_solution_entries_v" ADD COLUMN IF NOT EXISTS "version_meta_title" varchar;
  ALTER TABLE "_solution_entries_v" ADD COLUMN IF NOT EXISTS "version_meta_description" varchar;
  ALTER TABLE "_solution_entries_v" ADD COLUMN IF NOT EXISTS "version_meta_image_id" integer;
  -- _ui_settings_v
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_primary" varchar DEFAULT '#1E4A59';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_primary_hover" varchar DEFAULT '#173A46';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_background" varchar DEFAULT '#FBF8F2';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_surface" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_section_alt" varchar DEFAULT '#F2ECE2';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_text" varchar DEFAULT '#1F2933';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_text_muted" varchar DEFAULT '#5C6670';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_border" varchar DEFAULT '#D8D0C3';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_link" varchar DEFAULT '#1E4A59';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_focus_ring" varchar DEFAULT '#0F766E';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_navy_background" varchar DEFAULT '#1E4A59';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_charcoal_background" varchar DEFAULT '#1F2933';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_black_background" varchar DEFAULT '#111827';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_dark_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_dark_text_muted" varchar DEFAULT 'rgba(255,255,255,0.72)';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_hero_background" varchar DEFAULT '#1E4A59';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_hero_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_hero_muted_text" varchar DEFAULT 'rgba(255,255,255,0.72)';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_footer_background" varchar DEFAULT '#1E4A59';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_footer_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_footer_muted_text" varchar DEFAULT 'rgba(255,255,255,0.6)';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_cookie_background" varchar DEFAULT '#1E4A59';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_cookie_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_cookie_link" varchar DEFAULT '#93C5FD';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_nav_background" varchar DEFAULT 'transparent';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_nav_scrolled_background" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_colors_nav_border" varchar DEFAULT '#D8D0C3';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_typography_body_font_family" varchar DEFAULT 'var(--font-sans), system-ui, sans-serif';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_typography_display_font_family" varchar DEFAULT 'var(--font-sans), system-ui, sans-serif';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_typography_base_font_size" numeric DEFAULT 16;
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_typography_base_line_height" numeric DEFAULT 1.7;
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_typography_heading_letter_spacing" varchar DEFAULT '-0.02em';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_typography_section_label_letter_spacing" varchar DEFAULT '0.06em';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_typography_heading_font_url" varchar;
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_typography_body_font_url" varchar;
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_layout_container_max_width" varchar DEFAULT '1200px';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_layout_section_padding_compact" varchar DEFAULT '56px 24px';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_layout_section_padding_regular" varchar DEFAULT '80px 24px';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_layout_section_padding_spacious" varchar DEFAULT '112px 24px';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_layout_hero_padding_compact" varchar DEFAULT '72px 24px 80px';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_layout_hero_padding_regular" varchar DEFAULT '96px 24px 104px';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_layout_hero_padding_spacious" varchar DEFAULT '128px 24px 136px';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_layout_mobile_section_padding" varchar DEFAULT '40px';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_layout_nav_height" numeric DEFAULT 72;
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_layout_card_radius" numeric DEFAULT 16;
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_buttons_radius" numeric DEFAULT 10;
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_buttons_primary_background" varchar DEFAULT '#1E4A59';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_buttons_primary_background_hover" varchar DEFAULT '#173A46';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_buttons_primary_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_buttons_secondary_background" varchar DEFAULT '#F2ECE2';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_buttons_secondary_background_hover" varchar DEFAULT '#E8DFD2';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_buttons_secondary_text" varchar DEFAULT '#1F2933';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_buttons_secondary_text_hover" varchar DEFAULT '#111827';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_buttons_ghost_background" varchar DEFAULT 'transparent';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_buttons_ghost_background_hover" varchar DEFAULT '#F2ECE2';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_buttons_ghost_text" varchar DEFAULT '#1E4A59';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_buttons_nav_background" varchar DEFAULT '#1E4A59';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_buttons_nav_background_hover" varchar DEFAULT '#173A46';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_buttons_nav_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_email_palette_primary" varchar DEFAULT '#1E4A59';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_email_palette_muted" varchar DEFAULT '#6B7280';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_email_palette_text" varchar DEFAULT '#1F2933';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_email_palette_background" varchar DEFAULT '#FBF8F2';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_email_palette_white" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_email_palette_border" varchar DEFAULT '#D8D0C3';
  ALTER TABLE "_ui_settings_v" ADD COLUMN IF NOT EXISTS "version_email_palette_error" varchar DEFAULT '#C0392B';
  -- framework_entries
  ALTER TABLE "framework_entries" ADD COLUMN IF NOT EXISTS "meta_title" varchar;
  ALTER TABLE "framework_entries" ADD COLUMN IF NOT EXISTS "meta_description" varchar;
  ALTER TABLE "framework_entries" ADD COLUMN IF NOT EXISTS "meta_image_id" integer;
  -- insight_entries
  ALTER TABLE "insight_entries" ADD COLUMN IF NOT EXISTS "meta_title" varchar;
  ALTER TABLE "insight_entries" ADD COLUMN IF NOT EXISTS "meta_description" varchar;
  ALTER TABLE "insight_entries" ADD COLUMN IF NOT EXISTS "meta_image_id" integer;
  -- org_about_detail
  ALTER TABLE "org_about_detail" ADD COLUMN IF NOT EXISTS "theme" "public"."enum_org_about_detail_theme" DEFAULT 'white';
  ALTER TABLE "org_about_detail" ADD COLUMN IF NOT EXISTS "background_color" varchar;
  ALTER TABLE "org_about_detail" ADD COLUMN IF NOT EXISTS "size" "public"."enum_org_about_detail_size" DEFAULT 'regular';
  ALTER TABLE "org_about_detail" ADD COLUMN IF NOT EXISTS "heading_size" "public"."enum_org_about_detail_heading_size";
  ALTER TABLE "org_about_detail" ADD COLUMN IF NOT EXISTS "text_align" "public"."enum_org_about_detail_text_align";
  ALTER TABLE "org_about_detail" ADD COLUMN IF NOT EXISTS "heading_tag" "public"."enum_org_about_detail_heading_tag";
  -- org_about_profiles
  ALTER TABLE "org_about_profiles" ADD COLUMN IF NOT EXISTS "category" "public"."enum_org_about_profiles_category";
  ALTER TABLE "org_about_profiles" ADD COLUMN IF NOT EXISTS "workflow_status" "public"."enum_org_about_profiles_workflow_status" DEFAULT 'draft';
  ALTER TABLE "org_about_profiles" ADD COLUMN IF NOT EXISTS "_status" "public"."enum_org_about_profiles_status" DEFAULT 'draft';
  -- org_sponsors
  ALTER TABLE "org_sponsors" ADD COLUMN IF NOT EXISTS "_status" "public"."enum_org_sponsors_status" DEFAULT 'draft';
  -- org_sponsors_display_order
  ALTER TABLE "org_sponsors_display_order" ADD COLUMN IF NOT EXISTS "value" "public"."enum_org_sponsors_display_order";
  -- org_sponsors_sec
  ALTER TABLE "org_sponsors_sec" ADD COLUMN IF NOT EXISTS "theme" "public"."enum_org_sponsors_sec_theme" DEFAULT 'white';
  ALTER TABLE "org_sponsors_sec" ADD COLUMN IF NOT EXISTS "background_color" varchar;
  ALTER TABLE "org_sponsors_sec" ADD COLUMN IF NOT EXISTS "size" "public"."enum_org_sponsors_sec_size" DEFAULT 'regular';
  ALTER TABLE "org_sponsors_sec" ADD COLUMN IF NOT EXISTS "heading_size" "public"."enum_org_sponsors_sec_heading_size";
  ALTER TABLE "org_sponsors_sec" ADD COLUMN IF NOT EXISTS "text_align" "public"."enum_org_sponsors_sec_text_align";
  ALTER TABLE "org_sponsors_sec" ADD COLUMN IF NOT EXISTS "heading_tag" "public"."enum_org_sponsors_sec_heading_tag";
  -- search_rels
  ALTER TABLE "search_rels" ADD COLUMN IF NOT EXISTS "framework_entries_id" integer;
  ALTER TABLE "search_rels" ADD COLUMN IF NOT EXISTS "solution_entries_id" integer;
  ALTER TABLE "search_rels" ADD COLUMN IF NOT EXISTS "insight_entries_id" integer;
  -- site_settings
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "reversed_logo_image_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "favicon_image_id" integer;
  -- solution_entries
  ALTER TABLE "solution_entries" ADD COLUMN IF NOT EXISTS "meta_title" varchar;
  ALTER TABLE "solution_entries" ADD COLUMN IF NOT EXISTS "meta_description" varchar;
  ALTER TABLE "solution_entries" ADD COLUMN IF NOT EXISTS "meta_image_id" integer;
  -- ui_settings
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_primary" varchar DEFAULT '#1E4A59';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_primary_hover" varchar DEFAULT '#173A46';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_background" varchar DEFAULT '#FBF8F2';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_surface" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_section_alt" varchar DEFAULT '#F2ECE2';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_text" varchar DEFAULT '#1F2933';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_text_muted" varchar DEFAULT '#5C6670';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_border" varchar DEFAULT '#D8D0C3';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_link" varchar DEFAULT '#1E4A59';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_focus_ring" varchar DEFAULT '#0F766E';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_navy_background" varchar DEFAULT '#1E4A59';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_charcoal_background" varchar DEFAULT '#1F2933';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_black_background" varchar DEFAULT '#111827';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_dark_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_dark_text_muted" varchar DEFAULT 'rgba(255,255,255,0.72)';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_hero_background" varchar DEFAULT '#1E4A59';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_hero_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_hero_muted_text" varchar DEFAULT 'rgba(255,255,255,0.72)';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_footer_background" varchar DEFAULT '#1E4A59';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_footer_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_footer_muted_text" varchar DEFAULT 'rgba(255,255,255,0.6)';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_cookie_background" varchar DEFAULT '#1E4A59';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_cookie_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_cookie_link" varchar DEFAULT '#93C5FD';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_nav_background" varchar DEFAULT 'transparent';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_nav_scrolled_background" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "colors_nav_border" varchar DEFAULT '#D8D0C3';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "typography_body_font_family" varchar DEFAULT 'var(--font-sans), system-ui, sans-serif';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "typography_display_font_family" varchar DEFAULT 'var(--font-sans), system-ui, sans-serif';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "typography_base_font_size" numeric DEFAULT 16;
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "typography_base_line_height" numeric DEFAULT 1.7;
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "typography_heading_letter_spacing" varchar DEFAULT '-0.02em';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "typography_section_label_letter_spacing" varchar DEFAULT '0.06em';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "typography_heading_font_url" varchar;
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "typography_body_font_url" varchar;
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "layout_container_max_width" varchar DEFAULT '1200px';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "layout_section_padding_compact" varchar DEFAULT '56px 24px';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "layout_section_padding_regular" varchar DEFAULT '80px 24px';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "layout_section_padding_spacious" varchar DEFAULT '112px 24px';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "layout_hero_padding_compact" varchar DEFAULT '72px 24px 80px';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "layout_hero_padding_regular" varchar DEFAULT '96px 24px 104px';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "layout_hero_padding_spacious" varchar DEFAULT '128px 24px 136px';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "layout_mobile_section_padding" varchar DEFAULT '40px';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "layout_nav_height" numeric DEFAULT 72;
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "layout_card_radius" numeric DEFAULT 16;
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "buttons_radius" numeric DEFAULT 10;
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "buttons_primary_background" varchar DEFAULT '#1E4A59';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "buttons_primary_background_hover" varchar DEFAULT '#173A46';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "buttons_primary_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "buttons_secondary_background" varchar DEFAULT '#F2ECE2';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "buttons_secondary_background_hover" varchar DEFAULT '#E8DFD2';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "buttons_secondary_text" varchar DEFAULT '#1F2933';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "buttons_secondary_text_hover" varchar DEFAULT '#111827';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "buttons_ghost_background" varchar DEFAULT 'transparent';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "buttons_ghost_background_hover" varchar DEFAULT '#F2ECE2';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "buttons_ghost_text" varchar DEFAULT '#1E4A59';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "buttons_nav_background" varchar DEFAULT '#1E4A59';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "buttons_nav_background_hover" varchar DEFAULT '#173A46';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "buttons_nav_text" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "email_palette_primary" varchar DEFAULT '#1E4A59';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "email_palette_muted" varchar DEFAULT '#6B7280';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "email_palette_text" varchar DEFAULT '#1F2933';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "email_palette_background" varchar DEFAULT '#FBF8F2';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "email_palette_white" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "email_palette_border" varchar DEFAULT '#D8D0C3';
  ALTER TABLE "ui_settings" ADD COLUMN IF NOT EXISTS "email_palette_error" varchar DEFAULT '#C0392B';
 `)
}

export async function down({}: MigrateDownArgs): Promise<void> {}
