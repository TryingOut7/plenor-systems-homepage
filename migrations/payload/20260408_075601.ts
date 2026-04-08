import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_org_events_event_type" AS ENUM('concert', 'competition', 'festival', 'workshop');
  CREATE TYPE "public"."enum_org_events_event_status" AS ENUM('upcoming_planned', 'current_ongoing', 'past_completed');
  CREATE TYPE "public"."enum_org_events_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  CREATE TYPE "public"."enum_org_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__org_events_v_version_event_type" AS ENUM('concert', 'competition', 'festival', 'workshop');
  CREATE TYPE "public"."enum__org_events_v_version_event_status" AS ENUM('upcoming_planned', 'current_ongoing', 'past_completed');
  CREATE TYPE "public"."enum__org_events_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  CREATE TYPE "public"."enum__org_events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_org_spotlight_category" AS ENUM('student', 'teacher', 'volunteer', 'local_organization', 'local_prominent_artist');
  CREATE TYPE "public"."enum_org_spotlight_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  CREATE TYPE "public"."enum_org_spotlight_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__org_spotlight_v_version_category" AS ENUM('student', 'teacher', 'volunteer', 'local_organization', 'local_prominent_artist');
  CREATE TYPE "public"."enum__org_spotlight_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  CREATE TYPE "public"."enum__org_spotlight_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_org_about_profiles_category" AS ENUM('founder', 'volunteer_team', 'mentor');
  CREATE TYPE "public"."enum_org_about_profiles_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  CREATE TYPE "public"."enum_org_about_profiles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__org_about_profiles_v_version_category" AS ENUM('founder', 'volunteer_team', 'mentor');
  CREATE TYPE "public"."enum__org_about_profiles_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  CREATE TYPE "public"."enum__org_about_profiles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_org_learning_category" AS ENUM('knowledge_sharing', 'college_prep', 'mentorship');
  CREATE TYPE "public"."enum_org_learning_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  CREATE TYPE "public"."enum_org_learning_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__org_learning_v_version_category" AS ENUM('knowledge_sharing', 'college_prep', 'mentorship');
  CREATE TYPE "public"."enum__org_learning_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');
  CREATE TYPE "public"."enum__org_learning_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_org_sponsors_display_order" AS ENUM('support_summary', 'sponsor_acknowledgment', 'donation_instructions', 'payment_instructions', 'sponsor_logos', 'support_faq', 'featured_supporter_text');
  CREATE TYPE "public"."enum_org_sponsors_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__org_sponsors_v_version_display_order" AS ENUM('support_summary', 'sponsor_acknowledgment', 'donation_instructions', 'payment_instructions', 'sponsor_logos', 'support_faq', 'featured_supporter_text');
  CREATE TYPE "public"."enum__org_sponsors_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_org_home_features_home_section_order" AS ENUM('events', 'spotlight', 'learning', 'sponsors');
  CREATE TYPE "public"."enum_org_home_features_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__org_home_features_v_version_home_section_order" AS ENUM('events', 'spotlight', 'learning', 'sponsors');
  CREATE TYPE "public"."enum__org_home_features_v_version_status" AS ENUM('draft', 'published');
  ALTER TYPE "public"."enum_payload_query_presets_related_collection" ADD VALUE 'org-events' BEFORE 'forms';
  ALTER TYPE "public"."enum_payload_query_presets_related_collection" ADD VALUE 'org-spotlight' BEFORE 'forms';
  ALTER TYPE "public"."enum_payload_query_presets_related_collection" ADD VALUE 'org-about-profiles' BEFORE 'forms';
  ALTER TYPE "public"."enum_payload_query_presets_related_collection" ADD VALUE 'org-learning' BEFORE 'forms';
  CREATE TABLE "org_events_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "org_events_external_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "org_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"event_type" "enum_org_events_event_type",
  	"event_status" "enum_org_events_event_status" DEFAULT 'upcoming_planned',
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"start_time" varchar,
  	"end_time" varchar,
  	"event_timezone" varchar DEFAULT 'UTC',
  	"short_summary" varchar,
  	"description" jsonb,
  	"hero_image_id" integer,
  	"venue" varchar,
  	"location" varchar,
  	"is_featured" boolean DEFAULT false,
  	"display_priority" numeric DEFAULT 0,
  	"registration_required" boolean DEFAULT false,
  	"payment_required" boolean DEFAULT false,
  	"registration_instructions" jsonb,
  	"payment_reference_format" varchar,
  	"zelle_qr_code_id" integer,
  	"venmo_qr_code_id" integer,
  	"payment_instructions" jsonb,
  	"max_registrations" numeric,
  	"registration_opens_at" timestamp(3) with time zone,
  	"registration_closes_at" timestamp(3) with time zone,
  	"display_window_start" timestamp(3) with time zone,
  	"display_window_end" timestamp(3) with time zone,
  	"created_by_id" integer,
  	"workflow_status" "enum_org_events_workflow_status" DEFAULT 'draft',
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
  	"_status" "enum_org_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "org_events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"org_spotlight_id" integer,
  	"org_learning_id" integer,
  	"org_events_id" integer
  );
  
  CREATE TABLE "_org_events_v_version_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_org_events_v_version_external_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_org_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_event_type" "enum__org_events_v_version_event_type",
  	"version_event_status" "enum__org_events_v_version_event_status" DEFAULT 'upcoming_planned',
  	"version_start_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_start_time" varchar,
  	"version_end_time" varchar,
  	"version_event_timezone" varchar DEFAULT 'UTC',
  	"version_short_summary" varchar,
  	"version_description" jsonb,
  	"version_hero_image_id" integer,
  	"version_venue" varchar,
  	"version_location" varchar,
  	"version_is_featured" boolean DEFAULT false,
  	"version_display_priority" numeric DEFAULT 0,
  	"version_registration_required" boolean DEFAULT false,
  	"version_payment_required" boolean DEFAULT false,
  	"version_registration_instructions" jsonb,
  	"version_payment_reference_format" varchar,
  	"version_zelle_qr_code_id" integer,
  	"version_venmo_qr_code_id" integer,
  	"version_payment_instructions" jsonb,
  	"version_max_registrations" numeric,
  	"version_registration_opens_at" timestamp(3) with time zone,
  	"version_registration_closes_at" timestamp(3) with time zone,
  	"version_display_window_start" timestamp(3) with time zone,
  	"version_display_window_end" timestamp(3) with time zone,
  	"version_created_by_id" integer,
  	"version_workflow_status" "enum__org_events_v_version_workflow_status" DEFAULT 'draft',
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
  	"version__status" "enum__org_events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_org_events_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"org_spotlight_id" integer,
  	"org_learning_id" integer,
  	"org_events_id" integer
  );
  
  CREATE TABLE "org_spotlight_additional_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "org_spotlight" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"category" "enum_org_spotlight_category",
  	"short_summary" varchar,
  	"detail_content" jsonb,
  	"thumbnail_image_id" integer,
  	"role_title" varchar,
  	"affiliation" varchar,
  	"is_featured" boolean DEFAULT false,
  	"display_order" numeric DEFAULT 0,
  	"external_link" varchar,
  	"created_by_id" integer,
  	"workflow_status" "enum_org_spotlight_workflow_status" DEFAULT 'draft',
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
  	"_status" "enum_org_spotlight_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "org_spotlight_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"org_events_id" integer
  );
  
  CREATE TABLE "_org_spotlight_v_version_additional_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_org_spotlight_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_category" "enum__org_spotlight_v_version_category",
  	"version_short_summary" varchar,
  	"version_detail_content" jsonb,
  	"version_thumbnail_image_id" integer,
  	"version_role_title" varchar,
  	"version_affiliation" varchar,
  	"version_is_featured" boolean DEFAULT false,
  	"version_display_order" numeric DEFAULT 0,
  	"version_external_link" varchar,
  	"version_created_by_id" integer,
  	"version_workflow_status" "enum__org_spotlight_v_version_workflow_status" DEFAULT 'draft',
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
  	"version__status" "enum__org_spotlight_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_org_spotlight_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"org_events_id" integer
  );
  
  CREATE TABLE "org_about_profiles_additional_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "org_about_profiles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"category" "enum_org_about_profiles_category",
  	"short_bio" varchar,
  	"detail_content" jsonb,
  	"profile_image_id" integer,
  	"role_title" varchar,
  	"affiliation" varchar,
  	"display_order" numeric DEFAULT 0,
  	"external_link" varchar,
  	"created_by_id" integer,
  	"workflow_status" "enum_org_about_profiles_workflow_status" DEFAULT 'draft',
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
  	"_status" "enum_org_about_profiles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_org_about_profiles_v_version_additional_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_org_about_profiles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_category" "enum__org_about_profiles_v_version_category",
  	"version_short_bio" varchar,
  	"version_detail_content" jsonb,
  	"version_profile_image_id" integer,
  	"version_role_title" varchar,
  	"version_affiliation" varchar,
  	"version_display_order" numeric DEFAULT 0,
  	"version_external_link" varchar,
  	"version_created_by_id" integer,
  	"version_workflow_status" "enum__org_about_profiles_v_version_workflow_status" DEFAULT 'draft',
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
  	"version__status" "enum__org_about_profiles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "org_learning" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"category" "enum_org_learning_category",
  	"short_summary" varchar,
  	"detail_content" jsonb,
  	"thumbnail_id" integer,
  	"author" varchar,
  	"is_featured" boolean DEFAULT false,
  	"display_order" numeric DEFAULT 0,
  	"external_reference_link" varchar,
  	"related_event_id" integer,
  	"related_spotlight_id" integer,
  	"created_by_id" integer,
  	"workflow_status" "enum_org_learning_workflow_status" DEFAULT 'draft',
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
  	"_status" "enum_org_learning_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_org_learning_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_category" "enum__org_learning_v_version_category",
  	"version_short_summary" varchar,
  	"version_detail_content" jsonb,
  	"version_thumbnail_id" integer,
  	"version_author" varchar,
  	"version_is_featured" boolean DEFAULT false,
  	"version_display_order" numeric DEFAULT 0,
  	"version_external_reference_link" varchar,
  	"version_related_event_id" integer,
  	"version_related_spotlight_id" integer,
  	"version_created_by_id" integer,
  	"version_workflow_status" "enum__org_learning_v_version_workflow_status" DEFAULT 'draft',
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
  	"version__status" "enum__org_learning_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "org_sponsors_sponsor_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"label" varchar
  );
  
  CREATE TABLE "org_sponsors_support_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "org_sponsors_display_order" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_org_sponsors_display_order",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "org_sponsors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"page_title" varchar,
  	"support_summary" jsonb,
  	"sponsor_acknowledgment_content" jsonb,
  	"donation_instructions" jsonb,
  	"zelle_qr_code_id" integer,
  	"venmo_qr_code_id" integer,
  	"payment_instructions_content" jsonb,
  	"support_contact_path" varchar,
  	"featured_supporter_text" jsonb,
  	"_status" "enum_org_sponsors_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_org_sponsors_v_version_sponsor_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_org_sponsors_v_version_support_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_org_sponsors_v_version_display_order" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__org_sponsors_v_version_display_order",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_org_sponsors_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_page_title" varchar,
  	"version_support_summary" jsonb,
  	"version_sponsor_acknowledgment_content" jsonb,
  	"version_donation_instructions" jsonb,
  	"version_zelle_qr_code_id" integer,
  	"version_venmo_qr_code_id" integer,
  	"version_payment_instructions_content" jsonb,
  	"version_support_contact_path" varchar,
  	"version_featured_supporter_text" jsonb,
  	"version__status" "enum__org_sponsors_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "org_home_features_home_section_order" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_org_home_features_home_section_order",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "org_home_features" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"events_placeholder" varchar,
  	"spotlight_placeholder" varchar,
  	"learning_placeholder" varchar,
  	"_status" "enum_org_home_features_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "org_home_features_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"org_events_id" integer,
  	"org_spotlight_id" integer,
  	"org_learning_id" integer
  );
  
  CREATE TABLE "_org_home_features_v_version_home_section_order" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__org_home_features_v_version_home_section_order",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_org_home_features_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_events_placeholder" varchar,
  	"version_spotlight_placeholder" varchar,
  	"version_learning_placeholder" varchar,
  	"version__status" "enum__org_home_features_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_org_home_features_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"org_events_id" integer,
  	"org_spotlight_id" integer,
  	"org_learning_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "org_events_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "org_spotlight_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "org_about_profiles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "org_learning_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "org_sponsors_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "org_home_features_id" integer;
  ALTER TABLE "org_events_media_gallery" ADD CONSTRAINT "org_events_media_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_events_media_gallery" ADD CONSTRAINT "org_events_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."org_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_events_external_links" ADD CONSTRAINT "org_events_external_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."org_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_events" ADD CONSTRAINT "org_events_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_events" ADD CONSTRAINT "org_events_zelle_qr_code_id_media_id_fk" FOREIGN KEY ("zelle_qr_code_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_events" ADD CONSTRAINT "org_events_venmo_qr_code_id_media_id_fk" FOREIGN KEY ("venmo_qr_code_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_events" ADD CONSTRAINT "org_events_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_events" ADD CONSTRAINT "org_events_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_events" ADD CONSTRAINT "org_events_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_events" ADD CONSTRAINT "org_events_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_events_rels" ADD CONSTRAINT "org_events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."org_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_events_rels" ADD CONSTRAINT "org_events_rels_org_spotlight_fk" FOREIGN KEY ("org_spotlight_id") REFERENCES "public"."org_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_events_rels" ADD CONSTRAINT "org_events_rels_org_learning_fk" FOREIGN KEY ("org_learning_id") REFERENCES "public"."org_learning"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_events_rels" ADD CONSTRAINT "org_events_rels_org_events_fk" FOREIGN KEY ("org_events_id") REFERENCES "public"."org_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_events_v_version_media_gallery" ADD CONSTRAINT "_org_events_v_version_media_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_events_v_version_media_gallery" ADD CONSTRAINT "_org_events_v_version_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_org_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_events_v_version_external_links" ADD CONSTRAINT "_org_events_v_version_external_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_org_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_events_v" ADD CONSTRAINT "_org_events_v_parent_id_org_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."org_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_events_v" ADD CONSTRAINT "_org_events_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_events_v" ADD CONSTRAINT "_org_events_v_version_zelle_qr_code_id_media_id_fk" FOREIGN KEY ("version_zelle_qr_code_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_events_v" ADD CONSTRAINT "_org_events_v_version_venmo_qr_code_id_media_id_fk" FOREIGN KEY ("version_venmo_qr_code_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_events_v" ADD CONSTRAINT "_org_events_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_events_v" ADD CONSTRAINT "_org_events_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_events_v" ADD CONSTRAINT "_org_events_v_version_approved_by_id_users_id_fk" FOREIGN KEY ("version_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_events_v" ADD CONSTRAINT "_org_events_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_events_v_rels" ADD CONSTRAINT "_org_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_org_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_events_v_rels" ADD CONSTRAINT "_org_events_v_rels_org_spotlight_fk" FOREIGN KEY ("org_spotlight_id") REFERENCES "public"."org_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_events_v_rels" ADD CONSTRAINT "_org_events_v_rels_org_learning_fk" FOREIGN KEY ("org_learning_id") REFERENCES "public"."org_learning"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_events_v_rels" ADD CONSTRAINT "_org_events_v_rels_org_events_fk" FOREIGN KEY ("org_events_id") REFERENCES "public"."org_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_spotlight_additional_images" ADD CONSTRAINT "org_spotlight_additional_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_spotlight_additional_images" ADD CONSTRAINT "org_spotlight_additional_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."org_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_spotlight" ADD CONSTRAINT "org_spotlight_thumbnail_image_id_media_id_fk" FOREIGN KEY ("thumbnail_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_spotlight" ADD CONSTRAINT "org_spotlight_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_spotlight" ADD CONSTRAINT "org_spotlight_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_spotlight" ADD CONSTRAINT "org_spotlight_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_spotlight" ADD CONSTRAINT "org_spotlight_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_spotlight_rels" ADD CONSTRAINT "org_spotlight_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."org_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_spotlight_rels" ADD CONSTRAINT "org_spotlight_rels_org_events_fk" FOREIGN KEY ("org_events_id") REFERENCES "public"."org_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_spotlight_v_version_additional_images" ADD CONSTRAINT "_org_spotlight_v_version_additional_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_spotlight_v_version_additional_images" ADD CONSTRAINT "_org_spotlight_v_version_additional_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_org_spotlight_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_spotlight_v" ADD CONSTRAINT "_org_spotlight_v_parent_id_org_spotlight_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."org_spotlight"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_spotlight_v" ADD CONSTRAINT "_org_spotlight_v_version_thumbnail_image_id_media_id_fk" FOREIGN KEY ("version_thumbnail_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_spotlight_v" ADD CONSTRAINT "_org_spotlight_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_spotlight_v" ADD CONSTRAINT "_org_spotlight_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_spotlight_v" ADD CONSTRAINT "_org_spotlight_v_version_approved_by_id_users_id_fk" FOREIGN KEY ("version_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_spotlight_v" ADD CONSTRAINT "_org_spotlight_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_spotlight_v_rels" ADD CONSTRAINT "_org_spotlight_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_org_spotlight_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_spotlight_v_rels" ADD CONSTRAINT "_org_spotlight_v_rels_org_events_fk" FOREIGN KEY ("org_events_id") REFERENCES "public"."org_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_about_profiles_additional_images" ADD CONSTRAINT "org_about_profiles_additional_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_about_profiles_additional_images" ADD CONSTRAINT "org_about_profiles_additional_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."org_about_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_about_profiles" ADD CONSTRAINT "org_about_profiles_profile_image_id_media_id_fk" FOREIGN KEY ("profile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_about_profiles" ADD CONSTRAINT "org_about_profiles_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_about_profiles" ADD CONSTRAINT "org_about_profiles_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_about_profiles" ADD CONSTRAINT "org_about_profiles_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_about_profiles" ADD CONSTRAINT "org_about_profiles_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_about_profiles_v_version_additional_images" ADD CONSTRAINT "_org_about_profiles_v_version_additional_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_about_profiles_v_version_additional_images" ADD CONSTRAINT "_org_about_profiles_v_version_additional_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_org_about_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_about_profiles_v" ADD CONSTRAINT "_org_about_profiles_v_parent_id_org_about_profiles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."org_about_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_about_profiles_v" ADD CONSTRAINT "_org_about_profiles_v_version_profile_image_id_media_id_fk" FOREIGN KEY ("version_profile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_about_profiles_v" ADD CONSTRAINT "_org_about_profiles_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_about_profiles_v" ADD CONSTRAINT "_org_about_profiles_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_about_profiles_v" ADD CONSTRAINT "_org_about_profiles_v_version_approved_by_id_users_id_fk" FOREIGN KEY ("version_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_about_profiles_v" ADD CONSTRAINT "_org_about_profiles_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_learning" ADD CONSTRAINT "org_learning_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_learning" ADD CONSTRAINT "org_learning_related_event_id_org_events_id_fk" FOREIGN KEY ("related_event_id") REFERENCES "public"."org_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_learning" ADD CONSTRAINT "org_learning_related_spotlight_id_org_spotlight_id_fk" FOREIGN KEY ("related_spotlight_id") REFERENCES "public"."org_spotlight"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_learning" ADD CONSTRAINT "org_learning_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_learning" ADD CONSTRAINT "org_learning_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_learning" ADD CONSTRAINT "org_learning_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_learning" ADD CONSTRAINT "org_learning_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_learning_v" ADD CONSTRAINT "_org_learning_v_parent_id_org_learning_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."org_learning"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_learning_v" ADD CONSTRAINT "_org_learning_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_learning_v" ADD CONSTRAINT "_org_learning_v_version_related_event_id_org_events_id_fk" FOREIGN KEY ("version_related_event_id") REFERENCES "public"."org_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_learning_v" ADD CONSTRAINT "_org_learning_v_version_related_spotlight_id_org_spotlight_id_fk" FOREIGN KEY ("version_related_spotlight_id") REFERENCES "public"."org_spotlight"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_learning_v" ADD CONSTRAINT "_org_learning_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_learning_v" ADD CONSTRAINT "_org_learning_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_learning_v" ADD CONSTRAINT "_org_learning_v_version_approved_by_id_users_id_fk" FOREIGN KEY ("version_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_learning_v" ADD CONSTRAINT "_org_learning_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_sponsors_sponsor_logos" ADD CONSTRAINT "org_sponsors_sponsor_logos_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_sponsors_sponsor_logos" ADD CONSTRAINT "org_sponsors_sponsor_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."org_sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_sponsors_support_faq" ADD CONSTRAINT "org_sponsors_support_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."org_sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_sponsors_display_order" ADD CONSTRAINT "org_sponsors_display_order_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."org_sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_sponsors" ADD CONSTRAINT "org_sponsors_zelle_qr_code_id_media_id_fk" FOREIGN KEY ("zelle_qr_code_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_sponsors" ADD CONSTRAINT "org_sponsors_venmo_qr_code_id_media_id_fk" FOREIGN KEY ("venmo_qr_code_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_sponsors_v_version_sponsor_logos" ADD CONSTRAINT "_org_sponsors_v_version_sponsor_logos_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_sponsors_v_version_sponsor_logos" ADD CONSTRAINT "_org_sponsors_v_version_sponsor_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_org_sponsors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_sponsors_v_version_support_faq" ADD CONSTRAINT "_org_sponsors_v_version_support_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_org_sponsors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_sponsors_v_version_display_order" ADD CONSTRAINT "_org_sponsors_v_version_display_order_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_org_sponsors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_sponsors_v" ADD CONSTRAINT "_org_sponsors_v_version_zelle_qr_code_id_media_id_fk" FOREIGN KEY ("version_zelle_qr_code_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_org_sponsors_v" ADD CONSTRAINT "_org_sponsors_v_version_venmo_qr_code_id_media_id_fk" FOREIGN KEY ("version_venmo_qr_code_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_home_features_home_section_order" ADD CONSTRAINT "org_home_features_home_section_order_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."org_home_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_home_features_rels" ADD CONSTRAINT "org_home_features_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."org_home_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_home_features_rels" ADD CONSTRAINT "org_home_features_rels_org_events_fk" FOREIGN KEY ("org_events_id") REFERENCES "public"."org_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_home_features_rels" ADD CONSTRAINT "org_home_features_rels_org_spotlight_fk" FOREIGN KEY ("org_spotlight_id") REFERENCES "public"."org_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_home_features_rels" ADD CONSTRAINT "org_home_features_rels_org_learning_fk" FOREIGN KEY ("org_learning_id") REFERENCES "public"."org_learning"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_home_features_v_version_home_section_order" ADD CONSTRAINT "_org_home_features_v_version_home_section_order_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_org_home_features_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_home_features_v_rels" ADD CONSTRAINT "_org_home_features_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_org_home_features_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_home_features_v_rels" ADD CONSTRAINT "_org_home_features_v_rels_org_events_fk" FOREIGN KEY ("org_events_id") REFERENCES "public"."org_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_home_features_v_rels" ADD CONSTRAINT "_org_home_features_v_rels_org_spotlight_fk" FOREIGN KEY ("org_spotlight_id") REFERENCES "public"."org_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_org_home_features_v_rels" ADD CONSTRAINT "_org_home_features_v_rels_org_learning_fk" FOREIGN KEY ("org_learning_id") REFERENCES "public"."org_learning"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "org_events_media_gallery_order_idx" ON "org_events_media_gallery" USING btree ("_order");
  CREATE INDEX "org_events_media_gallery_parent_id_idx" ON "org_events_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "org_events_media_gallery_image_idx" ON "org_events_media_gallery" USING btree ("image_id");
  CREATE INDEX "org_events_external_links_order_idx" ON "org_events_external_links" USING btree ("_order");
  CREATE INDEX "org_events_external_links_parent_id_idx" ON "org_events_external_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "org_events_slug_idx" ON "org_events" USING btree ("slug");
  CREATE INDEX "org_events_hero_image_idx" ON "org_events" USING btree ("hero_image_id");
  CREATE INDEX "org_events_zelle_qr_code_idx" ON "org_events" USING btree ("zelle_qr_code_id");
  CREATE INDEX "org_events_venmo_qr_code_idx" ON "org_events" USING btree ("venmo_qr_code_id");
  CREATE INDEX "org_events_created_by_idx" ON "org_events" USING btree ("created_by_id");
  CREATE INDEX "org_events_submitted_by_idx" ON "org_events" USING btree ("submitted_by_id");
  CREATE INDEX "org_events_approved_by_idx" ON "org_events" USING btree ("approved_by_id");
  CREATE INDEX "org_events_seo_seo_og_image_idx" ON "org_events" USING btree ("seo_og_image_id");
  CREATE INDEX "org_events_updated_at_idx" ON "org_events" USING btree ("updated_at");
  CREATE INDEX "org_events_created_at_idx" ON "org_events" USING btree ("created_at");
  CREATE INDEX "org_events__status_idx" ON "org_events" USING btree ("_status");
  CREATE INDEX "org_events_rels_order_idx" ON "org_events_rels" USING btree ("order");
  CREATE INDEX "org_events_rels_parent_idx" ON "org_events_rels" USING btree ("parent_id");
  CREATE INDEX "org_events_rels_path_idx" ON "org_events_rels" USING btree ("path");
  CREATE INDEX "org_events_rels_org_spotlight_id_idx" ON "org_events_rels" USING btree ("org_spotlight_id");
  CREATE INDEX "org_events_rels_org_learning_id_idx" ON "org_events_rels" USING btree ("org_learning_id");
  CREATE INDEX "org_events_rels_org_events_id_idx" ON "org_events_rels" USING btree ("org_events_id");
  CREATE INDEX "_org_events_v_version_media_gallery_order_idx" ON "_org_events_v_version_media_gallery" USING btree ("_order");
  CREATE INDEX "_org_events_v_version_media_gallery_parent_id_idx" ON "_org_events_v_version_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "_org_events_v_version_media_gallery_image_idx" ON "_org_events_v_version_media_gallery" USING btree ("image_id");
  CREATE INDEX "_org_events_v_version_external_links_order_idx" ON "_org_events_v_version_external_links" USING btree ("_order");
  CREATE INDEX "_org_events_v_version_external_links_parent_id_idx" ON "_org_events_v_version_external_links" USING btree ("_parent_id");
  CREATE INDEX "_org_events_v_parent_idx" ON "_org_events_v" USING btree ("parent_id");
  CREATE INDEX "_org_events_v_version_version_slug_idx" ON "_org_events_v" USING btree ("version_slug");
  CREATE INDEX "_org_events_v_version_version_hero_image_idx" ON "_org_events_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_org_events_v_version_version_zelle_qr_code_idx" ON "_org_events_v" USING btree ("version_zelle_qr_code_id");
  CREATE INDEX "_org_events_v_version_version_venmo_qr_code_idx" ON "_org_events_v" USING btree ("version_venmo_qr_code_id");
  CREATE INDEX "_org_events_v_version_version_created_by_idx" ON "_org_events_v" USING btree ("version_created_by_id");
  CREATE INDEX "_org_events_v_version_version_submitted_by_idx" ON "_org_events_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_org_events_v_version_version_approved_by_idx" ON "_org_events_v" USING btree ("version_approved_by_id");
  CREATE INDEX "_org_events_v_version_seo_version_seo_og_image_idx" ON "_org_events_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_org_events_v_version_version_updated_at_idx" ON "_org_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_org_events_v_version_version_created_at_idx" ON "_org_events_v" USING btree ("version_created_at");
  CREATE INDEX "_org_events_v_version_version__status_idx" ON "_org_events_v" USING btree ("version__status");
  CREATE INDEX "_org_events_v_created_at_idx" ON "_org_events_v" USING btree ("created_at");
  CREATE INDEX "_org_events_v_updated_at_idx" ON "_org_events_v" USING btree ("updated_at");
  CREATE INDEX "_org_events_v_latest_idx" ON "_org_events_v" USING btree ("latest");
  CREATE INDEX "_org_events_v_rels_order_idx" ON "_org_events_v_rels" USING btree ("order");
  CREATE INDEX "_org_events_v_rels_parent_idx" ON "_org_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_org_events_v_rels_path_idx" ON "_org_events_v_rels" USING btree ("path");
  CREATE INDEX "_org_events_v_rels_org_spotlight_id_idx" ON "_org_events_v_rels" USING btree ("org_spotlight_id");
  CREATE INDEX "_org_events_v_rels_org_learning_id_idx" ON "_org_events_v_rels" USING btree ("org_learning_id");
  CREATE INDEX "_org_events_v_rels_org_events_id_idx" ON "_org_events_v_rels" USING btree ("org_events_id");
  CREATE INDEX "org_spotlight_additional_images_order_idx" ON "org_spotlight_additional_images" USING btree ("_order");
  CREATE INDEX "org_spotlight_additional_images_parent_id_idx" ON "org_spotlight_additional_images" USING btree ("_parent_id");
  CREATE INDEX "org_spotlight_additional_images_image_idx" ON "org_spotlight_additional_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "org_spotlight_slug_idx" ON "org_spotlight" USING btree ("slug");
  CREATE INDEX "org_spotlight_thumbnail_image_idx" ON "org_spotlight" USING btree ("thumbnail_image_id");
  CREATE INDEX "org_spotlight_created_by_idx" ON "org_spotlight" USING btree ("created_by_id");
  CREATE INDEX "org_spotlight_submitted_by_idx" ON "org_spotlight" USING btree ("submitted_by_id");
  CREATE INDEX "org_spotlight_approved_by_idx" ON "org_spotlight" USING btree ("approved_by_id");
  CREATE INDEX "org_spotlight_seo_seo_og_image_idx" ON "org_spotlight" USING btree ("seo_og_image_id");
  CREATE INDEX "org_spotlight_updated_at_idx" ON "org_spotlight" USING btree ("updated_at");
  CREATE INDEX "org_spotlight_created_at_idx" ON "org_spotlight" USING btree ("created_at");
  CREATE INDEX "org_spotlight__status_idx" ON "org_spotlight" USING btree ("_status");
  CREATE INDEX "org_spotlight_rels_order_idx" ON "org_spotlight_rels" USING btree ("order");
  CREATE INDEX "org_spotlight_rels_parent_idx" ON "org_spotlight_rels" USING btree ("parent_id");
  CREATE INDEX "org_spotlight_rels_path_idx" ON "org_spotlight_rels" USING btree ("path");
  CREATE INDEX "org_spotlight_rels_org_events_id_idx" ON "org_spotlight_rels" USING btree ("org_events_id");
  CREATE INDEX "_org_spotlight_v_version_additional_images_order_idx" ON "_org_spotlight_v_version_additional_images" USING btree ("_order");
  CREATE INDEX "_org_spotlight_v_version_additional_images_parent_id_idx" ON "_org_spotlight_v_version_additional_images" USING btree ("_parent_id");
  CREATE INDEX "_org_spotlight_v_version_additional_images_image_idx" ON "_org_spotlight_v_version_additional_images" USING btree ("image_id");
  CREATE INDEX "_org_spotlight_v_parent_idx" ON "_org_spotlight_v" USING btree ("parent_id");
  CREATE INDEX "_org_spotlight_v_version_version_slug_idx" ON "_org_spotlight_v" USING btree ("version_slug");
  CREATE INDEX "_org_spotlight_v_version_version_thumbnail_image_idx" ON "_org_spotlight_v" USING btree ("version_thumbnail_image_id");
  CREATE INDEX "_org_spotlight_v_version_version_created_by_idx" ON "_org_spotlight_v" USING btree ("version_created_by_id");
  CREATE INDEX "_org_spotlight_v_version_version_submitted_by_idx" ON "_org_spotlight_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_org_spotlight_v_version_version_approved_by_idx" ON "_org_spotlight_v" USING btree ("version_approved_by_id");
  CREATE INDEX "_org_spotlight_v_version_seo_version_seo_og_image_idx" ON "_org_spotlight_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_org_spotlight_v_version_version_updated_at_idx" ON "_org_spotlight_v" USING btree ("version_updated_at");
  CREATE INDEX "_org_spotlight_v_version_version_created_at_idx" ON "_org_spotlight_v" USING btree ("version_created_at");
  CREATE INDEX "_org_spotlight_v_version_version__status_idx" ON "_org_spotlight_v" USING btree ("version__status");
  CREATE INDEX "_org_spotlight_v_created_at_idx" ON "_org_spotlight_v" USING btree ("created_at");
  CREATE INDEX "_org_spotlight_v_updated_at_idx" ON "_org_spotlight_v" USING btree ("updated_at");
  CREATE INDEX "_org_spotlight_v_latest_idx" ON "_org_spotlight_v" USING btree ("latest");
  CREATE INDEX "_org_spotlight_v_rels_order_idx" ON "_org_spotlight_v_rels" USING btree ("order");
  CREATE INDEX "_org_spotlight_v_rels_parent_idx" ON "_org_spotlight_v_rels" USING btree ("parent_id");
  CREATE INDEX "_org_spotlight_v_rels_path_idx" ON "_org_spotlight_v_rels" USING btree ("path");
  CREATE INDEX "_org_spotlight_v_rels_org_events_id_idx" ON "_org_spotlight_v_rels" USING btree ("org_events_id");
  CREATE INDEX "org_about_profiles_additional_images_order_idx" ON "org_about_profiles_additional_images" USING btree ("_order");
  CREATE INDEX "org_about_profiles_additional_images_parent_id_idx" ON "org_about_profiles_additional_images" USING btree ("_parent_id");
  CREATE INDEX "org_about_profiles_additional_images_image_idx" ON "org_about_profiles_additional_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "org_about_profiles_slug_idx" ON "org_about_profiles" USING btree ("slug");
  CREATE INDEX "org_about_profiles_profile_image_idx" ON "org_about_profiles" USING btree ("profile_image_id");
  CREATE INDEX "org_about_profiles_created_by_idx" ON "org_about_profiles" USING btree ("created_by_id");
  CREATE INDEX "org_about_profiles_submitted_by_idx" ON "org_about_profiles" USING btree ("submitted_by_id");
  CREATE INDEX "org_about_profiles_approved_by_idx" ON "org_about_profiles" USING btree ("approved_by_id");
  CREATE INDEX "org_about_profiles_seo_seo_og_image_idx" ON "org_about_profiles" USING btree ("seo_og_image_id");
  CREATE INDEX "org_about_profiles_updated_at_idx" ON "org_about_profiles" USING btree ("updated_at");
  CREATE INDEX "org_about_profiles_created_at_idx" ON "org_about_profiles" USING btree ("created_at");
  CREATE INDEX "org_about_profiles__status_idx" ON "org_about_profiles" USING btree ("_status");
  CREATE INDEX "_org_about_profiles_v_version_additional_images_order_idx" ON "_org_about_profiles_v_version_additional_images" USING btree ("_order");
  CREATE INDEX "_org_about_profiles_v_version_additional_images_parent_id_idx" ON "_org_about_profiles_v_version_additional_images" USING btree ("_parent_id");
  CREATE INDEX "_org_about_profiles_v_version_additional_images_image_idx" ON "_org_about_profiles_v_version_additional_images" USING btree ("image_id");
  CREATE INDEX "_org_about_profiles_v_parent_idx" ON "_org_about_profiles_v" USING btree ("parent_id");
  CREATE INDEX "_org_about_profiles_v_version_version_slug_idx" ON "_org_about_profiles_v" USING btree ("version_slug");
  CREATE INDEX "_org_about_profiles_v_version_version_profile_image_idx" ON "_org_about_profiles_v" USING btree ("version_profile_image_id");
  CREATE INDEX "_org_about_profiles_v_version_version_created_by_idx" ON "_org_about_profiles_v" USING btree ("version_created_by_id");
  CREATE INDEX "_org_about_profiles_v_version_version_submitted_by_idx" ON "_org_about_profiles_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_org_about_profiles_v_version_version_approved_by_idx" ON "_org_about_profiles_v" USING btree ("version_approved_by_id");
  CREATE INDEX "_org_about_profiles_v_version_seo_version_seo_og_image_idx" ON "_org_about_profiles_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_org_about_profiles_v_version_version_updated_at_idx" ON "_org_about_profiles_v" USING btree ("version_updated_at");
  CREATE INDEX "_org_about_profiles_v_version_version_created_at_idx" ON "_org_about_profiles_v" USING btree ("version_created_at");
  CREATE INDEX "_org_about_profiles_v_version_version__status_idx" ON "_org_about_profiles_v" USING btree ("version__status");
  CREATE INDEX "_org_about_profiles_v_created_at_idx" ON "_org_about_profiles_v" USING btree ("created_at");
  CREATE INDEX "_org_about_profiles_v_updated_at_idx" ON "_org_about_profiles_v" USING btree ("updated_at");
  CREATE INDEX "_org_about_profiles_v_latest_idx" ON "_org_about_profiles_v" USING btree ("latest");
  CREATE UNIQUE INDEX "org_learning_slug_idx" ON "org_learning" USING btree ("slug");
  CREATE INDEX "org_learning_thumbnail_idx" ON "org_learning" USING btree ("thumbnail_id");
  CREATE INDEX "org_learning_related_event_idx" ON "org_learning" USING btree ("related_event_id");
  CREATE INDEX "org_learning_related_spotlight_idx" ON "org_learning" USING btree ("related_spotlight_id");
  CREATE INDEX "org_learning_created_by_idx" ON "org_learning" USING btree ("created_by_id");
  CREATE INDEX "org_learning_submitted_by_idx" ON "org_learning" USING btree ("submitted_by_id");
  CREATE INDEX "org_learning_approved_by_idx" ON "org_learning" USING btree ("approved_by_id");
  CREATE INDEX "org_learning_seo_seo_og_image_idx" ON "org_learning" USING btree ("seo_og_image_id");
  CREATE INDEX "org_learning_updated_at_idx" ON "org_learning" USING btree ("updated_at");
  CREATE INDEX "org_learning_created_at_idx" ON "org_learning" USING btree ("created_at");
  CREATE INDEX "org_learning__status_idx" ON "org_learning" USING btree ("_status");
  CREATE INDEX "_org_learning_v_parent_idx" ON "_org_learning_v" USING btree ("parent_id");
  CREATE INDEX "_org_learning_v_version_version_slug_idx" ON "_org_learning_v" USING btree ("version_slug");
  CREATE INDEX "_org_learning_v_version_version_thumbnail_idx" ON "_org_learning_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_org_learning_v_version_version_related_event_idx" ON "_org_learning_v" USING btree ("version_related_event_id");
  CREATE INDEX "_org_learning_v_version_version_related_spotlight_idx" ON "_org_learning_v" USING btree ("version_related_spotlight_id");
  CREATE INDEX "_org_learning_v_version_version_created_by_idx" ON "_org_learning_v" USING btree ("version_created_by_id");
  CREATE INDEX "_org_learning_v_version_version_submitted_by_idx" ON "_org_learning_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_org_learning_v_version_version_approved_by_idx" ON "_org_learning_v" USING btree ("version_approved_by_id");
  CREATE INDEX "_org_learning_v_version_seo_version_seo_og_image_idx" ON "_org_learning_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_org_learning_v_version_version_updated_at_idx" ON "_org_learning_v" USING btree ("version_updated_at");
  CREATE INDEX "_org_learning_v_version_version_created_at_idx" ON "_org_learning_v" USING btree ("version_created_at");
  CREATE INDEX "_org_learning_v_version_version__status_idx" ON "_org_learning_v" USING btree ("version__status");
  CREATE INDEX "_org_learning_v_created_at_idx" ON "_org_learning_v" USING btree ("created_at");
  CREATE INDEX "_org_learning_v_updated_at_idx" ON "_org_learning_v" USING btree ("updated_at");
  CREATE INDEX "_org_learning_v_latest_idx" ON "_org_learning_v" USING btree ("latest");
  CREATE INDEX "org_sponsors_sponsor_logos_order_idx" ON "org_sponsors_sponsor_logos" USING btree ("_order");
  CREATE INDEX "org_sponsors_sponsor_logos_parent_id_idx" ON "org_sponsors_sponsor_logos" USING btree ("_parent_id");
  CREATE INDEX "org_sponsors_sponsor_logos_logo_idx" ON "org_sponsors_sponsor_logos" USING btree ("logo_id");
  CREATE INDEX "org_sponsors_support_faq_order_idx" ON "org_sponsors_support_faq" USING btree ("_order");
  CREATE INDEX "org_sponsors_support_faq_parent_id_idx" ON "org_sponsors_support_faq" USING btree ("_parent_id");
  CREATE INDEX "org_sponsors_display_order_order_idx" ON "org_sponsors_display_order" USING btree ("order");
  CREATE INDEX "org_sponsors_display_order_parent_idx" ON "org_sponsors_display_order" USING btree ("parent_id");
  CREATE INDEX "org_sponsors_zelle_qr_code_idx" ON "org_sponsors" USING btree ("zelle_qr_code_id");
  CREATE INDEX "org_sponsors_venmo_qr_code_idx" ON "org_sponsors" USING btree ("venmo_qr_code_id");
  CREATE INDEX "org_sponsors__status_idx" ON "org_sponsors" USING btree ("_status");
  CREATE INDEX "_org_sponsors_v_version_sponsor_logos_order_idx" ON "_org_sponsors_v_version_sponsor_logos" USING btree ("_order");
  CREATE INDEX "_org_sponsors_v_version_sponsor_logos_parent_id_idx" ON "_org_sponsors_v_version_sponsor_logos" USING btree ("_parent_id");
  CREATE INDEX "_org_sponsors_v_version_sponsor_logos_logo_idx" ON "_org_sponsors_v_version_sponsor_logos" USING btree ("logo_id");
  CREATE INDEX "_org_sponsors_v_version_support_faq_order_idx" ON "_org_sponsors_v_version_support_faq" USING btree ("_order");
  CREATE INDEX "_org_sponsors_v_version_support_faq_parent_id_idx" ON "_org_sponsors_v_version_support_faq" USING btree ("_parent_id");
  CREATE INDEX "_org_sponsors_v_version_display_order_order_idx" ON "_org_sponsors_v_version_display_order" USING btree ("order");
  CREATE INDEX "_org_sponsors_v_version_display_order_parent_idx" ON "_org_sponsors_v_version_display_order" USING btree ("parent_id");
  CREATE INDEX "_org_sponsors_v_version_version_zelle_qr_code_idx" ON "_org_sponsors_v" USING btree ("version_zelle_qr_code_id");
  CREATE INDEX "_org_sponsors_v_version_version_venmo_qr_code_idx" ON "_org_sponsors_v" USING btree ("version_venmo_qr_code_id");
  CREATE INDEX "_org_sponsors_v_version_version__status_idx" ON "_org_sponsors_v" USING btree ("version__status");
  CREATE INDEX "_org_sponsors_v_created_at_idx" ON "_org_sponsors_v" USING btree ("created_at");
  CREATE INDEX "_org_sponsors_v_updated_at_idx" ON "_org_sponsors_v" USING btree ("updated_at");
  CREATE INDEX "_org_sponsors_v_latest_idx" ON "_org_sponsors_v" USING btree ("latest");
  CREATE INDEX "org_home_features_home_section_order_order_idx" ON "org_home_features_home_section_order" USING btree ("order");
  CREATE INDEX "org_home_features_home_section_order_parent_idx" ON "org_home_features_home_section_order" USING btree ("parent_id");
  CREATE INDEX "org_home_features__status_idx" ON "org_home_features" USING btree ("_status");
  CREATE INDEX "org_home_features_rels_order_idx" ON "org_home_features_rels" USING btree ("order");
  CREATE INDEX "org_home_features_rels_parent_idx" ON "org_home_features_rels" USING btree ("parent_id");
  CREATE INDEX "org_home_features_rels_path_idx" ON "org_home_features_rels" USING btree ("path");
  CREATE INDEX "org_home_features_rels_org_events_id_idx" ON "org_home_features_rels" USING btree ("org_events_id");
  CREATE INDEX "org_home_features_rels_org_spotlight_id_idx" ON "org_home_features_rels" USING btree ("org_spotlight_id");
  CREATE INDEX "org_home_features_rels_org_learning_id_idx" ON "org_home_features_rels" USING btree ("org_learning_id");
  CREATE INDEX "_org_home_features_v_version_home_section_order_order_idx" ON "_org_home_features_v_version_home_section_order" USING btree ("order");
  CREATE INDEX "_org_home_features_v_version_home_section_order_parent_idx" ON "_org_home_features_v_version_home_section_order" USING btree ("parent_id");
  CREATE INDEX "_org_home_features_v_version_version__status_idx" ON "_org_home_features_v" USING btree ("version__status");
  CREATE INDEX "_org_home_features_v_created_at_idx" ON "_org_home_features_v" USING btree ("created_at");
  CREATE INDEX "_org_home_features_v_updated_at_idx" ON "_org_home_features_v" USING btree ("updated_at");
  CREATE INDEX "_org_home_features_v_latest_idx" ON "_org_home_features_v" USING btree ("latest");
  CREATE INDEX "_org_home_features_v_rels_order_idx" ON "_org_home_features_v_rels" USING btree ("order");
  CREATE INDEX "_org_home_features_v_rels_parent_idx" ON "_org_home_features_v_rels" USING btree ("parent_id");
  CREATE INDEX "_org_home_features_v_rels_path_idx" ON "_org_home_features_v_rels" USING btree ("path");
  CREATE INDEX "_org_home_features_v_rels_org_events_id_idx" ON "_org_home_features_v_rels" USING btree ("org_events_id");
  CREATE INDEX "_org_home_features_v_rels_org_spotlight_id_idx" ON "_org_home_features_v_rels" USING btree ("org_spotlight_id");
  CREATE INDEX "_org_home_features_v_rels_org_learning_id_idx" ON "_org_home_features_v_rels" USING btree ("org_learning_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_org_events_fk" FOREIGN KEY ("org_events_id") REFERENCES "public"."org_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_org_spotlight_fk" FOREIGN KEY ("org_spotlight_id") REFERENCES "public"."org_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_org_about_profiles_fk" FOREIGN KEY ("org_about_profiles_id") REFERENCES "public"."org_about_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_org_learning_fk" FOREIGN KEY ("org_learning_id") REFERENCES "public"."org_learning"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_org_sponsors_fk" FOREIGN KEY ("org_sponsors_id") REFERENCES "public"."org_sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_org_home_features_fk" FOREIGN KEY ("org_home_features_id") REFERENCES "public"."org_home_features"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_org_events_id_idx" ON "payload_locked_documents_rels" USING btree ("org_events_id");
  CREATE INDEX "payload_locked_documents_rels_org_spotlight_id_idx" ON "payload_locked_documents_rels" USING btree ("org_spotlight_id");
  CREATE INDEX "payload_locked_documents_rels_org_about_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("org_about_profiles_id");
  CREATE INDEX "payload_locked_documents_rels_org_learning_id_idx" ON "payload_locked_documents_rels" USING btree ("org_learning_id");
  CREATE INDEX "payload_locked_documents_rels_org_sponsors_id_idx" ON "payload_locked_documents_rels" USING btree ("org_sponsors_id");
  CREATE INDEX "payload_locked_documents_rels_org_home_features_id_idx" ON "payload_locked_documents_rels" USING btree ("org_home_features_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "org_events_media_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "org_events_external_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "org_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "org_events_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_events_v_version_media_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_events_v_version_external_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_events_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_events_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "org_spotlight_additional_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "org_spotlight" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "org_spotlight_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_spotlight_v_version_additional_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_spotlight_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_spotlight_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "org_about_profiles_additional_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "org_about_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_about_profiles_v_version_additional_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_about_profiles_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "org_learning" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_learning_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "org_sponsors_sponsor_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "org_sponsors_support_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "org_sponsors_display_order" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "org_sponsors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_sponsors_v_version_sponsor_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_sponsors_v_version_support_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_sponsors_v_version_display_order" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_sponsors_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "org_home_features_home_section_order" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "org_home_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "org_home_features_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_home_features_v_version_home_section_order" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_home_features_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_org_home_features_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "org_events_media_gallery" CASCADE;
  DROP TABLE "org_events_external_links" CASCADE;
  DROP TABLE "org_events" CASCADE;
  DROP TABLE "org_events_rels" CASCADE;
  DROP TABLE "_org_events_v_version_media_gallery" CASCADE;
  DROP TABLE "_org_events_v_version_external_links" CASCADE;
  DROP TABLE "_org_events_v" CASCADE;
  DROP TABLE "_org_events_v_rels" CASCADE;
  DROP TABLE "org_spotlight_additional_images" CASCADE;
  DROP TABLE "org_spotlight" CASCADE;
  DROP TABLE "org_spotlight_rels" CASCADE;
  DROP TABLE "_org_spotlight_v_version_additional_images" CASCADE;
  DROP TABLE "_org_spotlight_v" CASCADE;
  DROP TABLE "_org_spotlight_v_rels" CASCADE;
  DROP TABLE "org_about_profiles_additional_images" CASCADE;
  DROP TABLE "org_about_profiles" CASCADE;
  DROP TABLE "_org_about_profiles_v_version_additional_images" CASCADE;
  DROP TABLE "_org_about_profiles_v" CASCADE;
  DROP TABLE "org_learning" CASCADE;
  DROP TABLE "_org_learning_v" CASCADE;
  DROP TABLE "org_sponsors_sponsor_logos" CASCADE;
  DROP TABLE "org_sponsors_support_faq" CASCADE;
  DROP TABLE "org_sponsors_display_order" CASCADE;
  DROP TABLE "org_sponsors" CASCADE;
  DROP TABLE "_org_sponsors_v_version_sponsor_logos" CASCADE;
  DROP TABLE "_org_sponsors_v_version_support_faq" CASCADE;
  DROP TABLE "_org_sponsors_v_version_display_order" CASCADE;
  DROP TABLE "_org_sponsors_v" CASCADE;
  DROP TABLE "org_home_features_home_section_order" CASCADE;
  DROP TABLE "org_home_features" CASCADE;
  DROP TABLE "org_home_features_rels" CASCADE;
  DROP TABLE "_org_home_features_v_version_home_section_order" CASCADE;
  DROP TABLE "_org_home_features_v" CASCADE;
  DROP TABLE "_org_home_features_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_org_events_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_org_spotlight_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_org_about_profiles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_org_learning_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_org_sponsors_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_org_home_features_fk";
  
  ALTER TABLE "payload_query_presets" ALTER COLUMN "related_collection" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_query_presets_related_collection";
  CREATE TYPE "public"."enum_payload_query_presets_related_collection" AS ENUM('users', 'media', 'service-items', 'site-pages', 'page-drafts', 'page-presets', 'page-playgrounds', 'reusable-sections', 'redirect-rules', 'blog-posts', 'blog-categories', 'testimonials', 'team-members', 'logos', 'forms');
  ALTER TABLE "payload_query_presets" ALTER COLUMN "related_collection" SET DATA TYPE "public"."enum_payload_query_presets_related_collection" USING "related_collection"::"public"."enum_payload_query_presets_related_collection";
  DROP INDEX "payload_locked_documents_rels_org_events_id_idx";
  DROP INDEX "payload_locked_documents_rels_org_spotlight_id_idx";
  DROP INDEX "payload_locked_documents_rels_org_about_profiles_id_idx";
  DROP INDEX "payload_locked_documents_rels_org_learning_id_idx";
  DROP INDEX "payload_locked_documents_rels_org_sponsors_id_idx";
  DROP INDEX "payload_locked_documents_rels_org_home_features_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "org_events_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "org_spotlight_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "org_about_profiles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "org_learning_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "org_sponsors_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "org_home_features_id";
  DROP TYPE "public"."enum_org_events_event_type";
  DROP TYPE "public"."enum_org_events_event_status";
  DROP TYPE "public"."enum_org_events_workflow_status";
  DROP TYPE "public"."enum_org_events_status";
  DROP TYPE "public"."enum__org_events_v_version_event_type";
  DROP TYPE "public"."enum__org_events_v_version_event_status";
  DROP TYPE "public"."enum__org_events_v_version_workflow_status";
  DROP TYPE "public"."enum__org_events_v_version_status";
  DROP TYPE "public"."enum_org_spotlight_category";
  DROP TYPE "public"."enum_org_spotlight_workflow_status";
  DROP TYPE "public"."enum_org_spotlight_status";
  DROP TYPE "public"."enum__org_spotlight_v_version_category";
  DROP TYPE "public"."enum__org_spotlight_v_version_workflow_status";
  DROP TYPE "public"."enum__org_spotlight_v_version_status";
  DROP TYPE "public"."enum_org_about_profiles_category";
  DROP TYPE "public"."enum_org_about_profiles_workflow_status";
  DROP TYPE "public"."enum_org_about_profiles_status";
  DROP TYPE "public"."enum__org_about_profiles_v_version_category";
  DROP TYPE "public"."enum__org_about_profiles_v_version_workflow_status";
  DROP TYPE "public"."enum__org_about_profiles_v_version_status";
  DROP TYPE "public"."enum_org_learning_category";
  DROP TYPE "public"."enum_org_learning_workflow_status";
  DROP TYPE "public"."enum_org_learning_status";
  DROP TYPE "public"."enum__org_learning_v_version_category";
  DROP TYPE "public"."enum__org_learning_v_version_workflow_status";
  DROP TYPE "public"."enum__org_learning_v_version_status";
  DROP TYPE "public"."enum_org_sponsors_display_order";
  DROP TYPE "public"."enum_org_sponsors_status";
  DROP TYPE "public"."enum__org_sponsors_v_version_display_order";
  DROP TYPE "public"."enum__org_sponsors_v_version_status";
  DROP TYPE "public"."enum_org_home_features_home_section_order";
  DROP TYPE "public"."enum_org_home_features_status";
  DROP TYPE "public"."enum__org_home_features_v_version_home_section_order";
  DROP TYPE "public"."enum__org_home_features_v_version_status";`)
}
