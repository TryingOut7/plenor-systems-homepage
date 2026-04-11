import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_framework_entries_category" AS ENUM('diagnostic', 'architecture', 'operations', 'governance');
  CREATE TYPE "public"."enum_framework_entries_locale" AS ENUM('en', 'de', 'fr', 'es', 'it');
  CREATE TYPE "public"."enum_framework_entries_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published', 'archived');
  CREATE TYPE "public"."enum_framework_entries_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__framework_entries_v_version_category" AS ENUM('diagnostic', 'architecture', 'operations', 'governance');
  CREATE TYPE "public"."enum__framework_entries_v_version_locale" AS ENUM('en', 'de', 'fr', 'es', 'it');
  CREATE TYPE "public"."enum__framework_entries_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published', 'archived');
  CREATE TYPE "public"."enum__framework_entries_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_solution_entries_category" AS ENUM('advisory', 'implementation', 'training');
  CREATE TYPE "public"."enum_solution_entries_locale" AS ENUM('en', 'de', 'fr', 'es', 'it');
  CREATE TYPE "public"."enum_solution_entries_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published', 'archived');
  CREATE TYPE "public"."enum_solution_entries_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__solution_entries_v_version_category" AS ENUM('advisory', 'implementation', 'training');
  CREATE TYPE "public"."enum__solution_entries_v_version_locale" AS ENUM('en', 'de', 'fr', 'es', 'it');
  CREATE TYPE "public"."enum__solution_entries_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published', 'archived');
  CREATE TYPE "public"."enum__solution_entries_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_insight_entries_type" AS ENUM('article', 'essay', 'guide');
  CREATE TYPE "public"."enum_insight_entries_locale" AS ENUM('en', 'de', 'fr', 'es', 'it');
  CREATE TYPE "public"."enum_insight_entries_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published', 'archived');
  CREATE TYPE "public"."enum_insight_entries_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__insight_entries_v_version_type" AS ENUM('article', 'essay', 'guide');
  CREATE TYPE "public"."enum__insight_entries_v_version_locale" AS ENUM('en', 'de', 'fr', 'es', 'it');
  CREATE TYPE "public"."enum__insight_entries_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published', 'archived');
  CREATE TYPE "public"."enum__insight_entries_v_version_status" AS ENUM('draft', 'published');
  ALTER TYPE "public"."enum_service_items_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum__service_items_v_version_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum_site_pages_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum_reuse_sec_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum_blog_posts_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum__blog_posts_v_version_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum_blog_categories_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum_testimonials_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum__testimonials_v_version_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum_team_members_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum__team_members_v_version_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum_logos_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum__logos_v_version_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum_org_events_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum__org_events_v_version_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum_org_spotlight_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum__org_spotlight_v_version_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum_org_about_profiles_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum__org_about_profiles_v_version_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum_org_learning_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum__org_learning_v_version_workflow_status" ADD VALUE 'archived';
  ALTER TYPE "public"."enum_payload_query_presets_related_collection" ADD VALUE 'framework-entries' BEFORE 'forms';
  ALTER TYPE "public"."enum_payload_query_presets_related_collection" ADD VALUE 'solution-entries' BEFORE 'forms';
  ALTER TYPE "public"."enum_payload_query_presets_related_collection" ADD VALUE 'insight-entries' BEFORE 'forms';
  CREATE TABLE "framework_entries_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "framework_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"category" "enum_framework_entries_category",
  	"summary" varchar,
  	"cover_image_id" integer,
  	"body" jsonb,
  	"published_at" timestamp(3) with time zone,
  	"is_featured" boolean DEFAULT false,
  	"locale" "enum_framework_entries_locale" DEFAULT 'en',
  	"translation_group_id" varchar,
  	"created_by_id" integer,
  	"workflow_status" "enum_framework_entries_workflow_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"submitted_at" timestamp(3) with time zone,
  	"review_checklist_complete" boolean DEFAULT false,
  	"review_summary" varchar,
  	"approved_by_id" integer,
  	"approved_at" timestamp(3) with time zone,
  	"rejection_reason" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_title" varchar,
  	"seo_og_description" varchar,
  	"seo_og_image_id" integer,
  	"seo_canonical_url" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"seo_nofollow" boolean DEFAULT false,
  	"seo_include_in_sitemap" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_framework_entries_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_framework_entries_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_framework_entries_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_category" "enum__framework_entries_v_version_category",
  	"version_summary" varchar,
  	"version_cover_image_id" integer,
  	"version_body" jsonb,
  	"version_published_at" timestamp(3) with time zone,
  	"version_is_featured" boolean DEFAULT false,
  	"version_locale" "enum__framework_entries_v_version_locale" DEFAULT 'en',
  	"version_translation_group_id" varchar,
  	"version_created_by_id" integer,
  	"version_workflow_status" "enum__framework_entries_v_version_workflow_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_submitted_at" timestamp(3) with time zone,
  	"version_review_checklist_complete" boolean DEFAULT false,
  	"version_review_summary" varchar,
  	"version_approved_by_id" integer,
  	"version_approved_at" timestamp(3) with time zone,
  	"version_rejection_reason" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_og_title" varchar,
  	"version_seo_og_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_canonical_url" varchar,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_seo_nofollow" boolean DEFAULT false,
  	"version_seo_include_in_sitemap" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__framework_entries_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "solution_entries_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "solution_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"category" "enum_solution_entries_category",
  	"summary" varchar,
  	"cover_image_id" integer,
  	"body" jsonb,
  	"published_at" timestamp(3) with time zone,
  	"is_featured" boolean DEFAULT false,
  	"locale" "enum_solution_entries_locale" DEFAULT 'en',
  	"translation_group_id" varchar,
  	"created_by_id" integer,
  	"workflow_status" "enum_solution_entries_workflow_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"submitted_at" timestamp(3) with time zone,
  	"review_checklist_complete" boolean DEFAULT false,
  	"review_summary" varchar,
  	"approved_by_id" integer,
  	"approved_at" timestamp(3) with time zone,
  	"rejection_reason" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_title" varchar,
  	"seo_og_description" varchar,
  	"seo_og_image_id" integer,
  	"seo_canonical_url" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"seo_nofollow" boolean DEFAULT false,
  	"seo_include_in_sitemap" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_solution_entries_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_solution_entries_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solution_entries_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_category" "enum__solution_entries_v_version_category",
  	"version_summary" varchar,
  	"version_cover_image_id" integer,
  	"version_body" jsonb,
  	"version_published_at" timestamp(3) with time zone,
  	"version_is_featured" boolean DEFAULT false,
  	"version_locale" "enum__solution_entries_v_version_locale" DEFAULT 'en',
  	"version_translation_group_id" varchar,
  	"version_created_by_id" integer,
  	"version_workflow_status" "enum__solution_entries_v_version_workflow_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_submitted_at" timestamp(3) with time zone,
  	"version_review_checklist_complete" boolean DEFAULT false,
  	"version_review_summary" varchar,
  	"version_approved_by_id" integer,
  	"version_approved_at" timestamp(3) with time zone,
  	"version_rejection_reason" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_og_title" varchar,
  	"version_seo_og_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_canonical_url" varchar,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_seo_nofollow" boolean DEFAULT false,
  	"version_seo_include_in_sitemap" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__solution_entries_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "insight_entries_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "insight_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"type" "enum_insight_entries_type",
  	"excerpt" varchar,
  	"cover_image_id" integer,
  	"body" jsonb,
  	"published_at" timestamp(3) with time zone,
  	"is_featured" boolean DEFAULT false,
  	"reading_time_minutes" numeric,
  	"locale" "enum_insight_entries_locale" DEFAULT 'en',
  	"translation_group_id" varchar,
  	"created_by_id" integer,
  	"workflow_status" "enum_insight_entries_workflow_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"submitted_at" timestamp(3) with time zone,
  	"review_checklist_complete" boolean DEFAULT false,
  	"review_summary" varchar,
  	"approved_by_id" integer,
  	"approved_at" timestamp(3) with time zone,
  	"rejection_reason" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_title" varchar,
  	"seo_og_description" varchar,
  	"seo_og_image_id" integer,
  	"seo_canonical_url" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"seo_nofollow" boolean DEFAULT false,
  	"seo_include_in_sitemap" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_insight_entries_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_insight_entries_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_insight_entries_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_type" "enum__insight_entries_v_version_type",
  	"version_excerpt" varchar,
  	"version_cover_image_id" integer,
  	"version_body" jsonb,
  	"version_published_at" timestamp(3) with time zone,
  	"version_is_featured" boolean DEFAULT false,
  	"version_reading_time_minutes" numeric,
  	"version_locale" "enum__insight_entries_v_version_locale" DEFAULT 'en',
  	"version_translation_group_id" varchar,
  	"version_created_by_id" integer,
  	"version_workflow_status" "enum__insight_entries_v_version_workflow_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_submitted_at" timestamp(3) with time zone,
  	"version_review_checklist_complete" boolean DEFAULT false,
  	"version_review_summary" varchar,
  	"version_approved_by_id" integer,
  	"version_approved_at" timestamp(3) with time zone,
  	"version_rejection_reason" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_og_title" varchar,
  	"version_seo_og_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_canonical_url" varchar,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_seo_nofollow" boolean DEFAULT false,
  	"version_seo_include_in_sitemap" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__insight_entries_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "org_events" DROP CONSTRAINT "org_events_zelle_qr_code_id_media_id_fk";
  
  ALTER TABLE "org_events" DROP CONSTRAINT "org_events_venmo_qr_code_id_media_id_fk";
  
  ALTER TABLE "_org_events_v" DROP CONSTRAINT "_org_events_v_version_zelle_qr_code_id_media_id_fk";
  
  ALTER TABLE "_org_events_v" DROP CONSTRAINT "_org_events_v_version_venmo_qr_code_id_media_id_fk";
  
  DROP INDEX "org_events_zelle_qr_code_idx";
  DROP INDEX "org_events_venmo_qr_code_idx";
  DROP INDEX "_org_events_v_version_version_zelle_qr_code_idx";
  DROP INDEX "_org_events_v_version_version_venmo_qr_code_idx";
  ALTER TABLE "site_settings" ALTER COLUMN "announcement_banner_background_color" SET DEFAULT '#1E4A59';
  ALTER TABLE "site_settings" ALTER COLUMN "copyright_text" SET DEFAULT '© {year} Plenor Systems LLC. All rights reserved.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_announcement_banner_background_color" SET DEFAULT '#1E4A59';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_copyright_text" SET DEFAULT '© {year} Plenor Systems LLC. All rights reserved.';
  ALTER TABLE "ui_settings" ALTER COLUMN "typography_display_font_family" SET DEFAULT 'var(--font-sans), system-ui, sans-serif';
  ALTER TABLE "_ui_settings_v" ALTER COLUMN "version_typography_display_font_family" SET DEFAULT 'var(--font-sans), system-ui, sans-serif';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "framework_entries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "solution_entries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "insight_entries_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "inquiry_form_name_label" varchar DEFAULT 'Your name';
  ALTER TABLE "site_settings" ADD COLUMN "inquiry_form_email_label" varchar DEFAULT 'Work email';
  ALTER TABLE "site_settings" ADD COLUMN "inquiry_form_organization_label" varchar DEFAULT 'Organization';
  ALTER TABLE "site_settings" ADD COLUMN "inquiry_form_inquiry_type_label" varchar DEFAULT 'What can we help you with?';
  ALTER TABLE "site_settings" ADD COLUMN "inquiry_form_message_label" varchar DEFAULT 'Tell us a bit about your need';
  ALTER TABLE "site_settings" ADD COLUMN "inquiry_form_message_helper" varchar DEFAULT 'A short description is enough for an initial response.';
  ALTER TABLE "site_settings" ADD COLUMN "inquiry_form_success_message" varchar DEFAULT 'Thanks. Your inquiry has been received.';
  ALTER TABLE "site_settings" ADD COLUMN "inquiry_form_response_statement" varchar DEFAULT 'We typically respond within two business days.';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_inquiry_form_name_label" varchar DEFAULT 'Your name';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_inquiry_form_email_label" varchar DEFAULT 'Work email';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_inquiry_form_organization_label" varchar DEFAULT 'Organization';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_inquiry_form_inquiry_type_label" varchar DEFAULT 'What can we help you with?';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_inquiry_form_message_label" varchar DEFAULT 'Tell us a bit about your need';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_inquiry_form_message_helper" varchar DEFAULT 'A short description is enough for an initial response.';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_inquiry_form_success_message" varchar DEFAULT 'Thanks. Your inquiry has been received.';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_inquiry_form_response_statement" varchar DEFAULT 'We typically respond within two business days.';
  ALTER TABLE "framework_entries_tags" ADD CONSTRAINT "framework_entries_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."framework_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "framework_entries" ADD CONSTRAINT "framework_entries_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "framework_entries" ADD CONSTRAINT "framework_entries_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "framework_entries" ADD CONSTRAINT "framework_entries_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "framework_entries" ADD CONSTRAINT "framework_entries_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "framework_entries" ADD CONSTRAINT "framework_entries_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_framework_entries_v_version_tags" ADD CONSTRAINT "_framework_entries_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_framework_entries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_framework_entries_v" ADD CONSTRAINT "_framework_entries_v_parent_id_framework_entries_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."framework_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_framework_entries_v" ADD CONSTRAINT "_framework_entries_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_framework_entries_v" ADD CONSTRAINT "_framework_entries_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_framework_entries_v" ADD CONSTRAINT "_framework_entries_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_framework_entries_v" ADD CONSTRAINT "_framework_entries_v_version_approved_by_id_users_id_fk" FOREIGN KEY ("version_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_framework_entries_v" ADD CONSTRAINT "_framework_entries_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solution_entries_tags" ADD CONSTRAINT "solution_entries_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solution_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solution_entries" ADD CONSTRAINT "solution_entries_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solution_entries" ADD CONSTRAINT "solution_entries_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solution_entries" ADD CONSTRAINT "solution_entries_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solution_entries" ADD CONSTRAINT "solution_entries_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solution_entries" ADD CONSTRAINT "solution_entries_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solution_entries_v_version_tags" ADD CONSTRAINT "_solution_entries_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solution_entries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solution_entries_v" ADD CONSTRAINT "_solution_entries_v_parent_id_solution_entries_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."solution_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solution_entries_v" ADD CONSTRAINT "_solution_entries_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solution_entries_v" ADD CONSTRAINT "_solution_entries_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solution_entries_v" ADD CONSTRAINT "_solution_entries_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solution_entries_v" ADD CONSTRAINT "_solution_entries_v_version_approved_by_id_users_id_fk" FOREIGN KEY ("version_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solution_entries_v" ADD CONSTRAINT "_solution_entries_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insight_entries_tags" ADD CONSTRAINT "insight_entries_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."insight_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insight_entries" ADD CONSTRAINT "insight_entries_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insight_entries" ADD CONSTRAINT "insight_entries_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insight_entries" ADD CONSTRAINT "insight_entries_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insight_entries" ADD CONSTRAINT "insight_entries_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insight_entries" ADD CONSTRAINT "insight_entries_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insight_entries_v_version_tags" ADD CONSTRAINT "_insight_entries_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_insight_entries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insight_entries_v" ADD CONSTRAINT "_insight_entries_v_parent_id_insight_entries_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."insight_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insight_entries_v" ADD CONSTRAINT "_insight_entries_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insight_entries_v" ADD CONSTRAINT "_insight_entries_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insight_entries_v" ADD CONSTRAINT "_insight_entries_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insight_entries_v" ADD CONSTRAINT "_insight_entries_v_version_approved_by_id_users_id_fk" FOREIGN KEY ("version_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insight_entries_v" ADD CONSTRAINT "_insight_entries_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "framework_entries_tags_order_idx" ON "framework_entries_tags" USING btree ("_order");
  CREATE INDEX "framework_entries_tags_parent_id_idx" ON "framework_entries_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "framework_entries_slug_idx" ON "framework_entries" USING btree ("slug");
  CREATE INDEX "framework_entries_cover_image_idx" ON "framework_entries" USING btree ("cover_image_id");
  CREATE INDEX "framework_entries_created_by_idx" ON "framework_entries" USING btree ("created_by_id");
  CREATE INDEX "framework_entries_submitted_by_idx" ON "framework_entries" USING btree ("submitted_by_id");
  CREATE INDEX "framework_entries_approved_by_idx" ON "framework_entries" USING btree ("approved_by_id");
  CREATE INDEX "framework_entries_seo_seo_og_image_idx" ON "framework_entries" USING btree ("seo_og_image_id");
  CREATE INDEX "framework_entries_updated_at_idx" ON "framework_entries" USING btree ("updated_at");
  CREATE INDEX "framework_entries_created_at_idx" ON "framework_entries" USING btree ("created_at");
  CREATE INDEX "framework_entries_deleted_at_idx" ON "framework_entries" USING btree ("deleted_at");
  CREATE INDEX "framework_entries__status_idx" ON "framework_entries" USING btree ("_status");
  CREATE INDEX "_framework_entries_v_version_tags_order_idx" ON "_framework_entries_v_version_tags" USING btree ("_order");
  CREATE INDEX "_framework_entries_v_version_tags_parent_id_idx" ON "_framework_entries_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_framework_entries_v_parent_idx" ON "_framework_entries_v" USING btree ("parent_id");
  CREATE INDEX "_framework_entries_v_version_version_slug_idx" ON "_framework_entries_v" USING btree ("version_slug");
  CREATE INDEX "_framework_entries_v_version_version_cover_image_idx" ON "_framework_entries_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_framework_entries_v_version_version_created_by_idx" ON "_framework_entries_v" USING btree ("version_created_by_id");
  CREATE INDEX "_framework_entries_v_version_version_submitted_by_idx" ON "_framework_entries_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_framework_entries_v_version_version_approved_by_idx" ON "_framework_entries_v" USING btree ("version_approved_by_id");
  CREATE INDEX "_framework_entries_v_version_seo_version_seo_og_image_idx" ON "_framework_entries_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_framework_entries_v_version_version_updated_at_idx" ON "_framework_entries_v" USING btree ("version_updated_at");
  CREATE INDEX "_framework_entries_v_version_version_created_at_idx" ON "_framework_entries_v" USING btree ("version_created_at");
  CREATE INDEX "_framework_entries_v_version_version_deleted_at_idx" ON "_framework_entries_v" USING btree ("version_deleted_at");
  CREATE INDEX "_framework_entries_v_version_version__status_idx" ON "_framework_entries_v" USING btree ("version__status");
  CREATE INDEX "_framework_entries_v_created_at_idx" ON "_framework_entries_v" USING btree ("created_at");
  CREATE INDEX "_framework_entries_v_updated_at_idx" ON "_framework_entries_v" USING btree ("updated_at");
  CREATE INDEX "_framework_entries_v_latest_idx" ON "_framework_entries_v" USING btree ("latest");
  CREATE INDEX "solution_entries_tags_order_idx" ON "solution_entries_tags" USING btree ("_order");
  CREATE INDEX "solution_entries_tags_parent_id_idx" ON "solution_entries_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "solution_entries_slug_idx" ON "solution_entries" USING btree ("slug");
  CREATE INDEX "solution_entries_cover_image_idx" ON "solution_entries" USING btree ("cover_image_id");
  CREATE INDEX "solution_entries_created_by_idx" ON "solution_entries" USING btree ("created_by_id");
  CREATE INDEX "solution_entries_submitted_by_idx" ON "solution_entries" USING btree ("submitted_by_id");
  CREATE INDEX "solution_entries_approved_by_idx" ON "solution_entries" USING btree ("approved_by_id");
  CREATE INDEX "solution_entries_seo_seo_og_image_idx" ON "solution_entries" USING btree ("seo_og_image_id");
  CREATE INDEX "solution_entries_updated_at_idx" ON "solution_entries" USING btree ("updated_at");
  CREATE INDEX "solution_entries_created_at_idx" ON "solution_entries" USING btree ("created_at");
  CREATE INDEX "solution_entries_deleted_at_idx" ON "solution_entries" USING btree ("deleted_at");
  CREATE INDEX "solution_entries__status_idx" ON "solution_entries" USING btree ("_status");
  CREATE INDEX "_solution_entries_v_version_tags_order_idx" ON "_solution_entries_v_version_tags" USING btree ("_order");
  CREATE INDEX "_solution_entries_v_version_tags_parent_id_idx" ON "_solution_entries_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_solution_entries_v_parent_idx" ON "_solution_entries_v" USING btree ("parent_id");
  CREATE INDEX "_solution_entries_v_version_version_slug_idx" ON "_solution_entries_v" USING btree ("version_slug");
  CREATE INDEX "_solution_entries_v_version_version_cover_image_idx" ON "_solution_entries_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_solution_entries_v_version_version_created_by_idx" ON "_solution_entries_v" USING btree ("version_created_by_id");
  CREATE INDEX "_solution_entries_v_version_version_submitted_by_idx" ON "_solution_entries_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_solution_entries_v_version_version_approved_by_idx" ON "_solution_entries_v" USING btree ("version_approved_by_id");
  CREATE INDEX "_solution_entries_v_version_seo_version_seo_og_image_idx" ON "_solution_entries_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_solution_entries_v_version_version_updated_at_idx" ON "_solution_entries_v" USING btree ("version_updated_at");
  CREATE INDEX "_solution_entries_v_version_version_created_at_idx" ON "_solution_entries_v" USING btree ("version_created_at");
  CREATE INDEX "_solution_entries_v_version_version_deleted_at_idx" ON "_solution_entries_v" USING btree ("version_deleted_at");
  CREATE INDEX "_solution_entries_v_version_version__status_idx" ON "_solution_entries_v" USING btree ("version__status");
  CREATE INDEX "_solution_entries_v_created_at_idx" ON "_solution_entries_v" USING btree ("created_at");
  CREATE INDEX "_solution_entries_v_updated_at_idx" ON "_solution_entries_v" USING btree ("updated_at");
  CREATE INDEX "_solution_entries_v_latest_idx" ON "_solution_entries_v" USING btree ("latest");
  CREATE INDEX "insight_entries_tags_order_idx" ON "insight_entries_tags" USING btree ("_order");
  CREATE INDEX "insight_entries_tags_parent_id_idx" ON "insight_entries_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "insight_entries_slug_idx" ON "insight_entries" USING btree ("slug");
  CREATE INDEX "insight_entries_cover_image_idx" ON "insight_entries" USING btree ("cover_image_id");
  CREATE INDEX "insight_entries_created_by_idx" ON "insight_entries" USING btree ("created_by_id");
  CREATE INDEX "insight_entries_submitted_by_idx" ON "insight_entries" USING btree ("submitted_by_id");
  CREATE INDEX "insight_entries_approved_by_idx" ON "insight_entries" USING btree ("approved_by_id");
  CREATE INDEX "insight_entries_seo_seo_og_image_idx" ON "insight_entries" USING btree ("seo_og_image_id");
  CREATE INDEX "insight_entries_updated_at_idx" ON "insight_entries" USING btree ("updated_at");
  CREATE INDEX "insight_entries_created_at_idx" ON "insight_entries" USING btree ("created_at");
  CREATE INDEX "insight_entries_deleted_at_idx" ON "insight_entries" USING btree ("deleted_at");
  CREATE INDEX "insight_entries__status_idx" ON "insight_entries" USING btree ("_status");
  CREATE INDEX "_insight_entries_v_version_tags_order_idx" ON "_insight_entries_v_version_tags" USING btree ("_order");
  CREATE INDEX "_insight_entries_v_version_tags_parent_id_idx" ON "_insight_entries_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_insight_entries_v_parent_idx" ON "_insight_entries_v" USING btree ("parent_id");
  CREATE INDEX "_insight_entries_v_version_version_slug_idx" ON "_insight_entries_v" USING btree ("version_slug");
  CREATE INDEX "_insight_entries_v_version_version_cover_image_idx" ON "_insight_entries_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_insight_entries_v_version_version_created_by_idx" ON "_insight_entries_v" USING btree ("version_created_by_id");
  CREATE INDEX "_insight_entries_v_version_version_submitted_by_idx" ON "_insight_entries_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_insight_entries_v_version_version_approved_by_idx" ON "_insight_entries_v" USING btree ("version_approved_by_id");
  CREATE INDEX "_insight_entries_v_version_seo_version_seo_og_image_idx" ON "_insight_entries_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_insight_entries_v_version_version_updated_at_idx" ON "_insight_entries_v" USING btree ("version_updated_at");
  CREATE INDEX "_insight_entries_v_version_version_created_at_idx" ON "_insight_entries_v" USING btree ("version_created_at");
  CREATE INDEX "_insight_entries_v_version_version_deleted_at_idx" ON "_insight_entries_v" USING btree ("version_deleted_at");
  CREATE INDEX "_insight_entries_v_version_version__status_idx" ON "_insight_entries_v" USING btree ("version__status");
  CREATE INDEX "_insight_entries_v_created_at_idx" ON "_insight_entries_v" USING btree ("created_at");
  CREATE INDEX "_insight_entries_v_updated_at_idx" ON "_insight_entries_v" USING btree ("updated_at");
  CREATE INDEX "_insight_entries_v_latest_idx" ON "_insight_entries_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_framework_entries_fk" FOREIGN KEY ("framework_entries_id") REFERENCES "public"."framework_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_solution_entries_fk" FOREIGN KEY ("solution_entries_id") REFERENCES "public"."solution_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_insight_entries_fk" FOREIGN KEY ("insight_entries_id") REFERENCES "public"."insight_entries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_framework_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("framework_entries_id");
  CREATE INDEX "payload_locked_documents_rels_solution_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("solution_entries_id");
  CREATE INDEX "payload_locked_documents_rels_insight_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("insight_entries_id");
  ALTER TABLE "org_events" DROP COLUMN "payment_required";
  ALTER TABLE "org_events" DROP COLUMN "payment_reference_format";
  ALTER TABLE "org_events" DROP COLUMN "zelle_qr_code_id";
  ALTER TABLE "org_events" DROP COLUMN "venmo_qr_code_id";
  ALTER TABLE "org_events" DROP COLUMN "payment_instructions";
  ALTER TABLE "org_events" DROP COLUMN "max_registrations";
  ALTER TABLE "org_events" DROP COLUMN "registration_opens_at";
  ALTER TABLE "org_events" DROP COLUMN "registration_closes_at";
  ALTER TABLE "_org_events_v" DROP COLUMN "version_payment_required";
  ALTER TABLE "_org_events_v" DROP COLUMN "version_payment_reference_format";
  ALTER TABLE "_org_events_v" DROP COLUMN "version_zelle_qr_code_id";
  ALTER TABLE "_org_events_v" DROP COLUMN "version_venmo_qr_code_id";
  ALTER TABLE "_org_events_v" DROP COLUMN "version_payment_instructions";
  ALTER TABLE "_org_events_v" DROP COLUMN "version_max_registrations";
  ALTER TABLE "_org_events_v" DROP COLUMN "version_registration_opens_at";
  ALTER TABLE "_org_events_v" DROP COLUMN "version_registration_closes_at";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "framework_entries_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "framework_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_framework_entries_v_version_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_framework_entries_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solution_entries_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solution_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solution_entries_v_version_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solution_entries_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "insight_entries_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "insight_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_insight_entries_v_version_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_insight_entries_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "framework_entries_tags" CASCADE;
  DROP TABLE "framework_entries" CASCADE;
  DROP TABLE "_framework_entries_v_version_tags" CASCADE;
  DROP TABLE "_framework_entries_v" CASCADE;
  DROP TABLE "solution_entries_tags" CASCADE;
  DROP TABLE "solution_entries" CASCADE;
  DROP TABLE "_solution_entries_v_version_tags" CASCADE;
  DROP TABLE "_solution_entries_v" CASCADE;
  DROP TABLE "insight_entries_tags" CASCADE;
  DROP TABLE "insight_entries" CASCADE;
  DROP TABLE "_insight_entries_v_version_tags" CASCADE;
  DROP TABLE "_insight_entries_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_framework_entries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_solution_entries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_insight_entries_fk";
  
  ALTER TABLE "service_items" ALTER COLUMN "workflow_status" SET DATA TYPE text;
  ALTER TABLE "service_items" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_service_items_workflow_status";
  CREATE TYPE "public"."enum_service_items_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "service_items" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::"public"."enum_service_items_workflow_status";
  ALTER TABLE "service_items" ALTER COLUMN "workflow_status" SET DATA TYPE "public"."enum_service_items_workflow_status" USING "workflow_status"::"public"."enum_service_items_workflow_status";
  ALTER TABLE "_service_items_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE text;
  ALTER TABLE "_service_items_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum__service_items_v_version_workflow_status";
  CREATE TYPE "public"."enum__service_items_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "_service_items_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::"public"."enum__service_items_v_version_workflow_status";
  ALTER TABLE "_service_items_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE "public"."enum__service_items_v_version_workflow_status" USING "version_workflow_status"::"public"."enum__service_items_v_version_workflow_status";
  ALTER TABLE "site_pages" ALTER COLUMN "workflow_status" SET DATA TYPE text;
  ALTER TABLE "site_pages" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_site_pages_workflow_status";
  CREATE TYPE "public"."enum_site_pages_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "site_pages" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::"public"."enum_site_pages_workflow_status";
  ALTER TABLE "site_pages" ALTER COLUMN "workflow_status" SET DATA TYPE "public"."enum_site_pages_workflow_status" USING "workflow_status"::"public"."enum_site_pages_workflow_status";
  ALTER TABLE "reuse_sec" ALTER COLUMN "workflow_status" SET DATA TYPE text;
  ALTER TABLE "reuse_sec" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_reuse_sec_workflow_status";
  CREATE TYPE "public"."enum_reuse_sec_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "reuse_sec" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::"public"."enum_reuse_sec_workflow_status";
  ALTER TABLE "reuse_sec" ALTER COLUMN "workflow_status" SET DATA TYPE "public"."enum_reuse_sec_workflow_status" USING "workflow_status"::"public"."enum_reuse_sec_workflow_status";
  ALTER TABLE "blog_posts" ALTER COLUMN "workflow_status" SET DATA TYPE text;
  ALTER TABLE "blog_posts" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_blog_posts_workflow_status";
  CREATE TYPE "public"."enum_blog_posts_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "blog_posts" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::"public"."enum_blog_posts_workflow_status";
  ALTER TABLE "blog_posts" ALTER COLUMN "workflow_status" SET DATA TYPE "public"."enum_blog_posts_workflow_status" USING "workflow_status"::"public"."enum_blog_posts_workflow_status";
  ALTER TABLE "_blog_posts_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE text;
  ALTER TABLE "_blog_posts_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum__blog_posts_v_version_workflow_status";
  CREATE TYPE "public"."enum__blog_posts_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "_blog_posts_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::"public"."enum__blog_posts_v_version_workflow_status";
  ALTER TABLE "_blog_posts_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE "public"."enum__blog_posts_v_version_workflow_status" USING "version_workflow_status"::"public"."enum__blog_posts_v_version_workflow_status";
  ALTER TABLE "blog_categories" ALTER COLUMN "workflow_status" SET DATA TYPE text;
  ALTER TABLE "blog_categories" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_blog_categories_workflow_status";
  CREATE TYPE "public"."enum_blog_categories_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "blog_categories" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::"public"."enum_blog_categories_workflow_status";
  ALTER TABLE "blog_categories" ALTER COLUMN "workflow_status" SET DATA TYPE "public"."enum_blog_categories_workflow_status" USING "workflow_status"::"public"."enum_blog_categories_workflow_status";
  ALTER TABLE "testimonials" ALTER COLUMN "workflow_status" SET DATA TYPE text;
  ALTER TABLE "testimonials" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_testimonials_workflow_status";
  CREATE TYPE "public"."enum_testimonials_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "testimonials" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::"public"."enum_testimonials_workflow_status";
  ALTER TABLE "testimonials" ALTER COLUMN "workflow_status" SET DATA TYPE "public"."enum_testimonials_workflow_status" USING "workflow_status"::"public"."enum_testimonials_workflow_status";
  ALTER TABLE "_testimonials_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE text;
  ALTER TABLE "_testimonials_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum__testimonials_v_version_workflow_status";
  CREATE TYPE "public"."enum__testimonials_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "_testimonials_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::"public"."enum__testimonials_v_version_workflow_status";
  ALTER TABLE "_testimonials_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE "public"."enum__testimonials_v_version_workflow_status" USING "version_workflow_status"::"public"."enum__testimonials_v_version_workflow_status";
  ALTER TABLE "team_members" ALTER COLUMN "workflow_status" SET DATA TYPE text;
  ALTER TABLE "team_members" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_team_members_workflow_status";
  CREATE TYPE "public"."enum_team_members_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "team_members" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::"public"."enum_team_members_workflow_status";
  ALTER TABLE "team_members" ALTER COLUMN "workflow_status" SET DATA TYPE "public"."enum_team_members_workflow_status" USING "workflow_status"::"public"."enum_team_members_workflow_status";
  ALTER TABLE "_team_members_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE text;
  ALTER TABLE "_team_members_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum__team_members_v_version_workflow_status";
  CREATE TYPE "public"."enum__team_members_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "_team_members_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::"public"."enum__team_members_v_version_workflow_status";
  ALTER TABLE "_team_members_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE "public"."enum__team_members_v_version_workflow_status" USING "version_workflow_status"::"public"."enum__team_members_v_version_workflow_status";
  ALTER TABLE "logos" ALTER COLUMN "workflow_status" SET DATA TYPE text;
  ALTER TABLE "logos" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_logos_workflow_status";
  CREATE TYPE "public"."enum_logos_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "logos" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::"public"."enum_logos_workflow_status";
  ALTER TABLE "logos" ALTER COLUMN "workflow_status" SET DATA TYPE "public"."enum_logos_workflow_status" USING "workflow_status"::"public"."enum_logos_workflow_status";
  ALTER TABLE "_logos_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE text;
  ALTER TABLE "_logos_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum__logos_v_version_workflow_status";
  CREATE TYPE "public"."enum__logos_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "_logos_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::"public"."enum__logos_v_version_workflow_status";
  ALTER TABLE "_logos_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE "public"."enum__logos_v_version_workflow_status" USING "version_workflow_status"::"public"."enum__logos_v_version_workflow_status";
  ALTER TABLE "org_events" ALTER COLUMN "workflow_status" SET DATA TYPE text;
  ALTER TABLE "org_events" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_org_events_workflow_status";
  CREATE TYPE "public"."enum_org_events_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "org_events" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::"public"."enum_org_events_workflow_status";
  ALTER TABLE "org_events" ALTER COLUMN "workflow_status" SET DATA TYPE "public"."enum_org_events_workflow_status" USING "workflow_status"::"public"."enum_org_events_workflow_status";
  ALTER TABLE "_org_events_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE text;
  ALTER TABLE "_org_events_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum__org_events_v_version_workflow_status";
  CREATE TYPE "public"."enum__org_events_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "_org_events_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::"public"."enum__org_events_v_version_workflow_status";
  ALTER TABLE "_org_events_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE "public"."enum__org_events_v_version_workflow_status" USING "version_workflow_status"::"public"."enum__org_events_v_version_workflow_status";
  ALTER TABLE "org_spotlight" ALTER COLUMN "workflow_status" SET DATA TYPE text;
  ALTER TABLE "org_spotlight" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_org_spotlight_workflow_status";
  CREATE TYPE "public"."enum_org_spotlight_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "org_spotlight" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::"public"."enum_org_spotlight_workflow_status";
  ALTER TABLE "org_spotlight" ALTER COLUMN "workflow_status" SET DATA TYPE "public"."enum_org_spotlight_workflow_status" USING "workflow_status"::"public"."enum_org_spotlight_workflow_status";
  ALTER TABLE "_org_spotlight_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE text;
  ALTER TABLE "_org_spotlight_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum__org_spotlight_v_version_workflow_status";
  CREATE TYPE "public"."enum__org_spotlight_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "_org_spotlight_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::"public"."enum__org_spotlight_v_version_workflow_status";
  ALTER TABLE "_org_spotlight_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE "public"."enum__org_spotlight_v_version_workflow_status" USING "version_workflow_status"::"public"."enum__org_spotlight_v_version_workflow_status";
  ALTER TABLE "org_about_profiles" ALTER COLUMN "workflow_status" SET DATA TYPE text;
  ALTER TABLE "org_about_profiles" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_org_about_profiles_workflow_status";
  CREATE TYPE "public"."enum_org_about_profiles_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "org_about_profiles" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::"public"."enum_org_about_profiles_workflow_status";
  ALTER TABLE "org_about_profiles" ALTER COLUMN "workflow_status" SET DATA TYPE "public"."enum_org_about_profiles_workflow_status" USING "workflow_status"::"public"."enum_org_about_profiles_workflow_status";
  ALTER TABLE "_org_about_profiles_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE text;
  ALTER TABLE "_org_about_profiles_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum__org_about_profiles_v_version_workflow_status";
  CREATE TYPE "public"."enum__org_about_profiles_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "_org_about_profiles_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::"public"."enum__org_about_profiles_v_version_workflow_status";
  ALTER TABLE "_org_about_profiles_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE "public"."enum__org_about_profiles_v_version_workflow_status" USING "version_workflow_status"::"public"."enum__org_about_profiles_v_version_workflow_status";
  ALTER TABLE "org_learning" ALTER COLUMN "workflow_status" SET DATA TYPE text;
  ALTER TABLE "org_learning" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_org_learning_workflow_status";
  CREATE TYPE "public"."enum_org_learning_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "org_learning" ALTER COLUMN "workflow_status" SET DEFAULT 'draft'::"public"."enum_org_learning_workflow_status";
  ALTER TABLE "org_learning" ALTER COLUMN "workflow_status" SET DATA TYPE "public"."enum_org_learning_workflow_status" USING "workflow_status"::"public"."enum_org_learning_workflow_status";
  ALTER TABLE "_org_learning_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE text;
  ALTER TABLE "_org_learning_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum__org_learning_v_version_workflow_status";
  CREATE TYPE "public"."enum__org_learning_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  ALTER TABLE "_org_learning_v" ALTER COLUMN "version_workflow_status" SET DEFAULT 'draft'::"public"."enum__org_learning_v_version_workflow_status";
  ALTER TABLE "_org_learning_v" ALTER COLUMN "version_workflow_status" SET DATA TYPE "public"."enum__org_learning_v_version_workflow_status" USING "version_workflow_status"::"public"."enum__org_learning_v_version_workflow_status";
  ALTER TABLE "payload_query_presets" ALTER COLUMN "related_collection" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_query_presets_related_collection";
  CREATE TYPE "public"."enum_payload_query_presets_related_collection" AS ENUM('users', 'media', 'service-items', 'site-pages', 'page-drafts', 'page-presets', 'page-playgrounds', 'reusable-sections', 'redirect-rules', 'blog-posts', 'blog-categories', 'testimonials', 'team-members', 'logos', 'org-events', 'org-spotlight', 'org-about-profiles', 'org-learning', 'forms');
  ALTER TABLE "payload_query_presets" ALTER COLUMN "related_collection" SET DATA TYPE "public"."enum_payload_query_presets_related_collection" USING "related_collection"::"public"."enum_payload_query_presets_related_collection";
  DROP INDEX "payload_locked_documents_rels_framework_entries_id_idx";
  DROP INDEX "payload_locked_documents_rels_solution_entries_id_idx";
  DROP INDEX "payload_locked_documents_rels_insight_entries_id_idx";
  ALTER TABLE "site_settings" ALTER COLUMN "announcement_banner_background_color" SET DEFAULT '#1B2D4F';
  ALTER TABLE "site_settings" ALTER COLUMN "copyright_text" SET DEFAULT '© {year} {siteName}. All rights reserved.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_announcement_banner_background_color" SET DEFAULT '#1B2D4F';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_copyright_text" SET DEFAULT '© {year} {siteName}. All rights reserved.';
  ALTER TABLE "ui_settings" ALTER COLUMN "typography_display_font_family" SET DEFAULT 'var(--font-display), Georgia, serif';
  ALTER TABLE "_ui_settings_v" ALTER COLUMN "version_typography_display_font_family" SET DEFAULT 'var(--font-display), Georgia, serif';
  ALTER TABLE "org_events" ADD COLUMN "payment_required" boolean DEFAULT false;
  ALTER TABLE "org_events" ADD COLUMN "payment_reference_format" varchar;
  ALTER TABLE "org_events" ADD COLUMN "zelle_qr_code_id" integer;
  ALTER TABLE "org_events" ADD COLUMN "venmo_qr_code_id" integer;
  ALTER TABLE "org_events" ADD COLUMN "payment_instructions" jsonb;
  ALTER TABLE "org_events" ADD COLUMN "max_registrations" numeric;
  ALTER TABLE "org_events" ADD COLUMN "registration_opens_at" timestamp(3) with time zone;
  ALTER TABLE "org_events" ADD COLUMN "registration_closes_at" timestamp(3) with time zone;
  ALTER TABLE "_org_events_v" ADD COLUMN "version_payment_required" boolean DEFAULT false;
  ALTER TABLE "_org_events_v" ADD COLUMN "version_payment_reference_format" varchar;
  ALTER TABLE "_org_events_v" ADD COLUMN "version_zelle_qr_code_id" integer;
  ALTER TABLE "_org_events_v" ADD COLUMN "version_venmo_qr_code_id" integer;
  ALTER TABLE "_org_events_v" ADD COLUMN "version_payment_instructions" jsonb;
  ALTER TABLE "_org_events_v" ADD COLUMN "version_max_registrations" numeric;
  ALTER TABLE "_org_events_v" ADD COLUMN "version_registration_opens_at" timestamp(3) with time zone;
  ALTER TABLE "_org_events_v" ADD COLUMN "version_registration_closes_at" timestamp(3) with time zone;
  ALTER TABLE "org_events" ADD CONSTRAINT "org_events_zelle_qr_code_id_media_id_fk" FOREIGN KEY ("zelle_qr_code_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_events" ADD CONSTRAINT "org_events_venmo_qr_code_id_media_id_fk" FOREIGN KEY ("venmo_qr_code_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_events_v" ADD CONSTRAINT "_org_events_v_version_zelle_qr_code_id_media_id_fk" FOREIGN KEY ("version_zelle_qr_code_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_events_v" ADD CONSTRAINT "_org_events_v_version_venmo_qr_code_id_media_id_fk" FOREIGN KEY ("version_venmo_qr_code_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "org_events_zelle_qr_code_idx" ON "org_events" USING btree ("zelle_qr_code_id");
  CREATE INDEX "org_events_venmo_qr_code_idx" ON "org_events" USING btree ("venmo_qr_code_id");
  CREATE INDEX "_org_events_v_version_version_zelle_qr_code_idx" ON "_org_events_v" USING btree ("version_zelle_qr_code_id");
  CREATE INDEX "_org_events_v_version_version_venmo_qr_code_idx" ON "_org_events_v" USING btree ("version_venmo_qr_code_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "framework_entries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "solution_entries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "insight_entries_id";
  ALTER TABLE "site_settings" DROP COLUMN "inquiry_form_name_label";
  ALTER TABLE "site_settings" DROP COLUMN "inquiry_form_email_label";
  ALTER TABLE "site_settings" DROP COLUMN "inquiry_form_organization_label";
  ALTER TABLE "site_settings" DROP COLUMN "inquiry_form_inquiry_type_label";
  ALTER TABLE "site_settings" DROP COLUMN "inquiry_form_message_label";
  ALTER TABLE "site_settings" DROP COLUMN "inquiry_form_message_helper";
  ALTER TABLE "site_settings" DROP COLUMN "inquiry_form_success_message";
  ALTER TABLE "site_settings" DROP COLUMN "inquiry_form_response_statement";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_inquiry_form_name_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_inquiry_form_email_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_inquiry_form_organization_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_inquiry_form_inquiry_type_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_inquiry_form_message_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_inquiry_form_message_helper";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_inquiry_form_success_message";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_inquiry_form_response_statement";
  DROP TYPE "public"."enum_framework_entries_category";
  DROP TYPE "public"."enum_framework_entries_locale";
  DROP TYPE "public"."enum_framework_entries_workflow_status";
  DROP TYPE "public"."enum_framework_entries_status";
  DROP TYPE "public"."enum__framework_entries_v_version_category";
  DROP TYPE "public"."enum__framework_entries_v_version_locale";
  DROP TYPE "public"."enum__framework_entries_v_version_workflow_status";
  DROP TYPE "public"."enum__framework_entries_v_version_status";
  DROP TYPE "public"."enum_solution_entries_category";
  DROP TYPE "public"."enum_solution_entries_locale";
  DROP TYPE "public"."enum_solution_entries_workflow_status";
  DROP TYPE "public"."enum_solution_entries_status";
  DROP TYPE "public"."enum__solution_entries_v_version_category";
  DROP TYPE "public"."enum__solution_entries_v_version_locale";
  DROP TYPE "public"."enum__solution_entries_v_version_workflow_status";
  DROP TYPE "public"."enum__solution_entries_v_version_status";
  DROP TYPE "public"."enum_insight_entries_type";
  DROP TYPE "public"."enum_insight_entries_locale";
  DROP TYPE "public"."enum_insight_entries_workflow_status";
  DROP TYPE "public"."enum_insight_entries_status";
  DROP TYPE "public"."enum__insight_entries_v_version_type";
  DROP TYPE "public"."enum__insight_entries_v_version_locale";
  DROP TYPE "public"."enum__insight_entries_v_version_workflow_status";
  DROP TYPE "public"."enum__insight_entries_v_version_status";`)
}
