import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_org_evt_detail_theme" AS ENUM('navy', 'charcoal', 'black', 'white', 'light');
  CREATE TYPE "public"."enum_org_evt_detail_size" AS ENUM('compact', 'regular', 'spacious');
  CREATE TYPE "public"."enum_org_evt_detail_heading_size" AS ENUM('xs', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_org_evt_detail_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_org_evt_detail_heading_tag" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_org_evt_reg_theme" AS ENUM('navy', 'charcoal', 'black', 'white', 'light');
  CREATE TYPE "public"."enum_org_evt_reg_size" AS ENUM('compact', 'regular', 'spacious');
  CREATE TYPE "public"."enum_org_evt_reg_heading_size" AS ENUM('xs', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_org_evt_reg_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_org_evt_reg_heading_tag" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_org_spot_detail_theme" AS ENUM('navy', 'charcoal', 'black', 'white', 'light');
  CREATE TYPE "public"."enum_org_spot_detail_size" AS ENUM('compact', 'regular', 'spacious');
  CREATE TYPE "public"."enum_org_spot_detail_heading_size" AS ENUM('xs', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_org_spot_detail_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_org_spot_detail_heading_tag" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_org_learn_detail_theme" AS ENUM('navy', 'charcoal', 'black', 'white', 'light');
  CREATE TYPE "public"."enum_org_learn_detail_size" AS ENUM('compact', 'regular', 'spacious');
  CREATE TYPE "public"."enum_org_learn_detail_heading_size" AS ENUM('xs', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_org_learn_detail_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_org_learn_detail_heading_tag" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_org_about_detail_theme" AS ENUM('navy', 'charcoal', 'black', 'white', 'light');
  CREATE TYPE "public"."enum_org_about_detail_size" AS ENUM('compact', 'regular', 'spacious');
  CREATE TYPE "public"."enum_org_about_detail_heading_size" AS ENUM('xs', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_org_about_detail_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_org_about_detail_heading_tag" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_org_sponsors_sec_theme" AS ENUM('navy', 'charcoal', 'black', 'white', 'light');
  CREATE TYPE "public"."enum_org_sponsors_sec_size" AS ENUM('compact', 'regular', 'spacious');
  CREATE TYPE "public"."enum_org_sponsors_sec_heading_size" AS ENUM('xs', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_org_sponsors_sec_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_org_sponsors_sec_heading_tag" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TABLE "org_evt_detail" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"structural_key" varchar,
  	"theme" "enum_org_evt_detail_theme" DEFAULT 'white',
  	"section_label" varchar,
  	"background_color" varchar,
  	"size" "enum_org_evt_detail_size" DEFAULT 'regular',
  	"anchor_id" varchar,
  	"custom_class_name" varchar,
  	"is_hidden" boolean DEFAULT false,
  	"visible_from" timestamp(3) with time zone,
  	"visible_until" timestamp(3) with time zone,
  	"heading_size" "enum_org_evt_detail_heading_size",
  	"text_align" "enum_org_evt_detail_text_align",
  	"heading_tag" "enum_org_evt_detail_heading_tag",
  	"event_id" integer,
  	"show_registration_cta" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "org_evt_reg" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"structural_key" varchar,
  	"theme" "enum_org_evt_reg_theme" DEFAULT 'white',
  	"section_label" varchar,
  	"background_color" varchar,
  	"size" "enum_org_evt_reg_size" DEFAULT 'regular',
  	"anchor_id" varchar,
  	"custom_class_name" varchar,
  	"is_hidden" boolean DEFAULT false,
  	"visible_from" timestamp(3) with time zone,
  	"visible_until" timestamp(3) with time zone,
  	"heading_size" "enum_org_evt_reg_heading_size",
  	"text_align" "enum_org_evt_reg_text_align",
  	"heading_tag" "enum_org_evt_reg_heading_tag",
  	"event_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "org_spot_detail" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"structural_key" varchar,
  	"theme" "enum_org_spot_detail_theme" DEFAULT 'white',
  	"section_label" varchar,
  	"background_color" varchar,
  	"size" "enum_org_spot_detail_size" DEFAULT 'regular',
  	"anchor_id" varchar,
  	"custom_class_name" varchar,
  	"is_hidden" boolean DEFAULT false,
  	"visible_from" timestamp(3) with time zone,
  	"visible_until" timestamp(3) with time zone,
  	"heading_size" "enum_org_spot_detail_heading_size",
  	"text_align" "enum_org_spot_detail_text_align",
  	"heading_tag" "enum_org_spot_detail_heading_tag",
  	"spotlight_entry_id" integer,
  	"show_category_nav" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "org_learn_detail" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"structural_key" varchar,
  	"theme" "enum_org_learn_detail_theme" DEFAULT 'white',
  	"section_label" varchar,
  	"background_color" varchar,
  	"size" "enum_org_learn_detail_size" DEFAULT 'regular',
  	"anchor_id" varchar,
  	"custom_class_name" varchar,
  	"is_hidden" boolean DEFAULT false,
  	"visible_from" timestamp(3) with time zone,
  	"visible_until" timestamp(3) with time zone,
  	"heading_size" "enum_org_learn_detail_heading_size",
  	"text_align" "enum_org_learn_detail_text_align",
  	"heading_tag" "enum_org_learn_detail_heading_tag",
  	"learning_entry_id" integer,
  	"show_category_nav" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "org_about_detail" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"structural_key" varchar,
  	"theme" "enum_org_about_detail_theme" DEFAULT 'white',
  	"section_label" varchar,
  	"background_color" varchar,
  	"size" "enum_org_about_detail_size" DEFAULT 'regular',
  	"anchor_id" varchar,
  	"custom_class_name" varchar,
  	"is_hidden" boolean DEFAULT false,
  	"visible_from" timestamp(3) with time zone,
  	"visible_until" timestamp(3) with time zone,
  	"heading_size" "enum_org_about_detail_heading_size",
  	"text_align" "enum_org_about_detail_text_align",
  	"heading_tag" "enum_org_about_detail_heading_tag",
  	"profile_id" integer,
  	"show_category_nav" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "org_sponsors_sec" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"structural_key" varchar,
  	"theme" "enum_org_sponsors_sec_theme" DEFAULT 'white',
  	"section_label" varchar,
  	"background_color" varchar,
  	"size" "enum_org_sponsors_sec_size" DEFAULT 'regular',
  	"anchor_id" varchar,
  	"custom_class_name" varchar,
  	"is_hidden" boolean DEFAULT false,
  	"visible_from" timestamp(3) with time zone,
  	"visible_until" timestamp(3) with time zone,
  	"heading_size" "enum_org_sponsors_sec_heading_size",
  	"text_align" "enum_org_sponsors_sec_text_align",
  	"heading_tag" "enum_org_sponsors_sec_heading_tag",
  	"block_name" varchar
  );
  
  ALTER TABLE "org_feed" ADD COLUMN "item_base_path" varchar;
  ALTER TABLE "org_evt_detail" ADD CONSTRAINT "org_evt_detail_event_id_org_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."org_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_evt_detail" ADD CONSTRAINT "org_evt_detail_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_evt_reg" ADD CONSTRAINT "org_evt_reg_event_id_org_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."org_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_evt_reg" ADD CONSTRAINT "org_evt_reg_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_spot_detail" ADD CONSTRAINT "org_spot_detail_spotlight_entry_id_org_spotlight_id_fk" FOREIGN KEY ("spotlight_entry_id") REFERENCES "public"."org_spotlight"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_spot_detail" ADD CONSTRAINT "org_spot_detail_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_learn_detail" ADD CONSTRAINT "org_learn_detail_learning_entry_id_org_learning_id_fk" FOREIGN KEY ("learning_entry_id") REFERENCES "public"."org_learning"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_learn_detail" ADD CONSTRAINT "org_learn_detail_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_about_detail" ADD CONSTRAINT "org_about_detail_profile_id_org_about_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."org_about_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "org_about_detail" ADD CONSTRAINT "org_about_detail_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "org_sponsors_sec" ADD CONSTRAINT "org_sponsors_sec_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "org_evt_detail_order_idx" ON "org_evt_detail" USING btree ("_order");
  CREATE INDEX "org_evt_detail_parent_id_idx" ON "org_evt_detail" USING btree ("_parent_id");
  CREATE INDEX "org_evt_detail_path_idx" ON "org_evt_detail" USING btree ("_path");
  CREATE INDEX "org_evt_detail_event_idx" ON "org_evt_detail" USING btree ("event_id");
  CREATE INDEX "org_evt_reg_order_idx" ON "org_evt_reg" USING btree ("_order");
  CREATE INDEX "org_evt_reg_parent_id_idx" ON "org_evt_reg" USING btree ("_parent_id");
  CREATE INDEX "org_evt_reg_path_idx" ON "org_evt_reg" USING btree ("_path");
  CREATE INDEX "org_evt_reg_event_idx" ON "org_evt_reg" USING btree ("event_id");
  CREATE INDEX "org_spot_detail_order_idx" ON "org_spot_detail" USING btree ("_order");
  CREATE INDEX "org_spot_detail_parent_id_idx" ON "org_spot_detail" USING btree ("_parent_id");
  CREATE INDEX "org_spot_detail_path_idx" ON "org_spot_detail" USING btree ("_path");
  CREATE INDEX "org_spot_detail_spotlight_entry_idx" ON "org_spot_detail" USING btree ("spotlight_entry_id");
  CREATE INDEX "org_learn_detail_order_idx" ON "org_learn_detail" USING btree ("_order");
  CREATE INDEX "org_learn_detail_parent_id_idx" ON "org_learn_detail" USING btree ("_parent_id");
  CREATE INDEX "org_learn_detail_path_idx" ON "org_learn_detail" USING btree ("_path");
  CREATE INDEX "org_learn_detail_learning_entry_idx" ON "org_learn_detail" USING btree ("learning_entry_id");
  CREATE INDEX "org_about_detail_order_idx" ON "org_about_detail" USING btree ("_order");
  CREATE INDEX "org_about_detail_parent_id_idx" ON "org_about_detail" USING btree ("_parent_id");
  CREATE INDEX "org_about_detail_path_idx" ON "org_about_detail" USING btree ("_path");
  CREATE INDEX "org_about_detail_profile_idx" ON "org_about_detail" USING btree ("profile_id");
  CREATE INDEX "org_sponsors_sec_order_idx" ON "org_sponsors_sec" USING btree ("_order");
  CREATE INDEX "org_sponsors_sec_parent_id_idx" ON "org_sponsors_sec" USING btree ("_parent_id");
  CREATE INDEX "org_sponsors_sec_path_idx" ON "org_sponsors_sec" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "org_evt_detail" CASCADE;
  DROP TABLE "org_evt_reg" CASCADE;
  DROP TABLE "org_spot_detail" CASCADE;
  DROP TABLE "org_learn_detail" CASCADE;
  DROP TABLE "org_about_detail" CASCADE;
  DROP TABLE "org_sponsors_sec" CASCADE;
  ALTER TABLE "org_feed" DROP COLUMN "item_base_path";
  DROP TYPE "public"."enum_org_evt_detail_theme";
  DROP TYPE "public"."enum_org_evt_detail_size";
  DROP TYPE "public"."enum_org_evt_detail_heading_size";
  DROP TYPE "public"."enum_org_evt_detail_text_align";
  DROP TYPE "public"."enum_org_evt_detail_heading_tag";
  DROP TYPE "public"."enum_org_evt_reg_theme";
  DROP TYPE "public"."enum_org_evt_reg_size";
  DROP TYPE "public"."enum_org_evt_reg_heading_size";
  DROP TYPE "public"."enum_org_evt_reg_text_align";
  DROP TYPE "public"."enum_org_evt_reg_heading_tag";
  DROP TYPE "public"."enum_org_spot_detail_theme";
  DROP TYPE "public"."enum_org_spot_detail_size";
  DROP TYPE "public"."enum_org_spot_detail_heading_size";
  DROP TYPE "public"."enum_org_spot_detail_text_align";
  DROP TYPE "public"."enum_org_spot_detail_heading_tag";
  DROP TYPE "public"."enum_org_learn_detail_theme";
  DROP TYPE "public"."enum_org_learn_detail_size";
  DROP TYPE "public"."enum_org_learn_detail_heading_size";
  DROP TYPE "public"."enum_org_learn_detail_text_align";
  DROP TYPE "public"."enum_org_learn_detail_heading_tag";
  DROP TYPE "public"."enum_org_about_detail_theme";
  DROP TYPE "public"."enum_org_about_detail_size";
  DROP TYPE "public"."enum_org_about_detail_heading_size";
  DROP TYPE "public"."enum_org_about_detail_text_align";
  DROP TYPE "public"."enum_org_about_detail_heading_tag";
  DROP TYPE "public"."enum_org_sponsors_sec_theme";
  DROP TYPE "public"."enum_org_sponsors_sec_size";
  DROP TYPE "public"."enum_org_sponsors_sec_heading_size";
  DROP TYPE "public"."enum_org_sponsors_sec_text_align";
  DROP TYPE "public"."enum_org_sponsors_sec_heading_tag";`)
}
