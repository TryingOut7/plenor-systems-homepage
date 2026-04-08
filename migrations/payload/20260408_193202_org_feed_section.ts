import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_org_feed_theme" AS ENUM('navy', 'charcoal', 'black', 'white', 'light');
  CREATE TYPE "public"."enum_org_feed_size" AS ENUM('compact', 'regular', 'spacious');
  CREATE TYPE "public"."enum_org_feed_heading_size" AS ENUM('xs', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_org_feed_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_org_feed_heading_tag" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_org_feed_feed_type" AS ENUM('events', 'spotlight', 'learning');
  CREATE TYPE "public"."enum_org_feed_source_mode" AS ENUM('featured', 'manual', 'automatic');
  CREATE TYPE "public"."enum_org_feed_columns" AS ENUM('1', '2', '3', '4');
  CREATE TYPE "public"."enum_org_feed_event_status" AS ENUM('upcoming_planned', 'current_ongoing', 'past_completed');
  CREATE TYPE "public"."enum_org_feed_spotlight_category" AS ENUM('student', 'teacher', 'volunteer', 'local_organization', 'local_prominent_artist');
  CREATE TYPE "public"."enum_org_feed_learning_category" AS ENUM('knowledge_sharing', 'college_prep', 'mentorship');
  CREATE TABLE "org_feed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"structural_key" varchar,
  	"theme" "enum_org_feed_theme" DEFAULT 'white',
  	"section_label" varchar,
  	"background_color" varchar,
  	"size" "enum_org_feed_size" DEFAULT 'regular',
  	"anchor_id" varchar,
  	"custom_class_name" varchar,
  	"is_hidden" boolean DEFAULT false,
  	"visible_from" timestamp(3) with time zone,
  	"visible_until" timestamp(3) with time zone,
  	"heading_size" "enum_org_feed_heading_size",
  	"text_align" "enum_org_feed_text_align",
  	"heading_tag" "enum_org_feed_heading_tag",
  	"heading" varchar,
  	"subheading" varchar,
  	"feed_type" "enum_org_feed_feed_type" DEFAULT 'events',
  	"source_mode" "enum_org_feed_source_mode" DEFAULT 'featured',
  	"limit" numeric DEFAULT 3,
  	"columns" "enum_org_feed_columns" DEFAULT '3',
  	"include_cta" boolean DEFAULT true,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"event_status" "enum_org_feed_event_status" DEFAULT 'upcoming_planned',
  	"spotlight_category" "enum_org_feed_spotlight_category" DEFAULT 'student',
  	"learning_category" "enum_org_feed_learning_category" DEFAULT 'knowledge_sharing',
  	"block_name" varchar
  );
  
  ALTER TABLE "site_pages_rels" ADD COLUMN "org_events_id" integer;
  ALTER TABLE "site_pages_rels" ADD COLUMN "org_spotlight_id" integer;
  ALTER TABLE "site_pages_rels" ADD COLUMN "org_learning_id" integer;
  ALTER TABLE "org_feed" ADD CONSTRAINT "org_feed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "org_feed_order_idx" ON "org_feed" USING btree ("_order");
  CREATE INDEX "org_feed_parent_id_idx" ON "org_feed" USING btree ("_parent_id");
  CREATE INDEX "org_feed_path_idx" ON "org_feed" USING btree ("_path");
  ALTER TABLE "site_pages_rels" ADD CONSTRAINT "site_pages_rels_org_events_fk" FOREIGN KEY ("org_events_id") REFERENCES "public"."org_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_pages_rels" ADD CONSTRAINT "site_pages_rels_org_spotlight_fk" FOREIGN KEY ("org_spotlight_id") REFERENCES "public"."org_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_pages_rels" ADD CONSTRAINT "site_pages_rels_org_learning_fk" FOREIGN KEY ("org_learning_id") REFERENCES "public"."org_learning"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_pages_rels_org_events_id_idx" ON "site_pages_rels" USING btree ("org_events_id");
  CREATE INDEX "site_pages_rels_org_spotlight_id_idx" ON "site_pages_rels" USING btree ("org_spotlight_id");
  CREATE INDEX "site_pages_rels_org_learning_id_idx" ON "site_pages_rels" USING btree ("org_learning_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "org_feed" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "org_feed" CASCADE;
  ALTER TABLE "site_pages_rels" DROP CONSTRAINT "site_pages_rels_org_events_fk";
  
  ALTER TABLE "site_pages_rels" DROP CONSTRAINT "site_pages_rels_org_spotlight_fk";
  
  ALTER TABLE "site_pages_rels" DROP CONSTRAINT "site_pages_rels_org_learning_fk";
  
  DROP INDEX "site_pages_rels_org_events_id_idx";
  DROP INDEX "site_pages_rels_org_spotlight_id_idx";
  DROP INDEX "site_pages_rels_org_learning_id_idx";
  ALTER TABLE "site_pages_rels" DROP COLUMN "org_events_id";
  ALTER TABLE "site_pages_rels" DROP COLUMN "org_spotlight_id";
  ALTER TABLE "site_pages_rels" DROP COLUMN "org_learning_id";
  DROP TYPE "public"."enum_org_feed_theme";
  DROP TYPE "public"."enum_org_feed_size";
  DROP TYPE "public"."enum_org_feed_heading_size";
  DROP TYPE "public"."enum_org_feed_text_align";
  DROP TYPE "public"."enum_org_feed_heading_tag";
  DROP TYPE "public"."enum_org_feed_feed_type";
  DROP TYPE "public"."enum_org_feed_source_mode";
  DROP TYPE "public"."enum_org_feed_columns";
  DROP TYPE "public"."enum_org_feed_event_status";
  DROP TYPE "public"."enum_org_feed_spotlight_category";
  DROP TYPE "public"."enum_org_feed_learning_category";`)
}
