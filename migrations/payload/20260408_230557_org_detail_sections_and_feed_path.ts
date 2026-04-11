import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

const TABLE_PREFIXES = [
  'org_evt_detail',
  'org_evt_reg',
  'org_spot_detail',
  'org_learn_detail',
  'org_about_detail',
  'org_sponsors_sec',
] as const;

const COMMON_ENUM_SUFFIXES = ['theme', 'size', 'heading_size', 'text_align', 'heading_tag'] as const;

const COMMON_ENUM_VALUES: Record<(typeof COMMON_ENUM_SUFFIXES)[number], readonly string[]> = {
  theme: ['navy', 'charcoal', 'black', 'white', 'light'],
  size: ['compact', 'regular', 'spacious'],
  heading_size: ['xs', 'sm', 'md', 'lg', 'xl'],
  text_align: ['left', 'center', 'right'],
  heading_tag: ['h1', 'h2', 'h3', 'h4'],
};

// All 30 enum types across 6 table prefixes × 5 suffixes
const ALL_ENUMS: Array<{ qualifiedTypeName: string; labels: readonly string[] }> =
  TABLE_PREFIXES.flatMap((prefix) =>
    COMMON_ENUM_SUFFIXES.map((suffix) => ({
      qualifiedTypeName: `public.enum_${prefix}_${suffix}`,
      labels: COMMON_ENUM_VALUES[suffix],
    })),
  );

const CREATE_TABLE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS public.org_evt_detail (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "structural_key" varchar,
    "theme" public.enum_org_evt_detail_theme DEFAULT 'white',
    "section_label" varchar,
    "background_color" varchar,
    "size" public.enum_org_evt_detail_size DEFAULT 'regular',
    "anchor_id" varchar,
    "custom_class_name" varchar,
    "is_hidden" boolean DEFAULT false,
    "visible_from" timestamp(3) with time zone,
    "visible_until" timestamp(3) with time zone,
    "heading_size" public.enum_org_evt_detail_heading_size,
    "text_align" public.enum_org_evt_detail_text_align,
    "heading_tag" public.enum_org_evt_detail_heading_tag,
    "event_id" integer,
    "show_registration_cta" boolean DEFAULT true,
    "block_name" varchar
  );`,
  `CREATE TABLE IF NOT EXISTS public.org_evt_reg (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "structural_key" varchar,
    "theme" public.enum_org_evt_reg_theme DEFAULT 'white',
    "section_label" varchar,
    "background_color" varchar,
    "size" public.enum_org_evt_reg_size DEFAULT 'regular',
    "anchor_id" varchar,
    "custom_class_name" varchar,
    "is_hidden" boolean DEFAULT false,
    "visible_from" timestamp(3) with time zone,
    "visible_until" timestamp(3) with time zone,
    "heading_size" public.enum_org_evt_reg_heading_size,
    "text_align" public.enum_org_evt_reg_text_align,
    "heading_tag" public.enum_org_evt_reg_heading_tag,
    "event_id" integer,
    "block_name" varchar
  );`,
  `CREATE TABLE IF NOT EXISTS public.org_spot_detail (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "structural_key" varchar,
    "theme" public.enum_org_spot_detail_theme DEFAULT 'white',
    "section_label" varchar,
    "background_color" varchar,
    "size" public.enum_org_spot_detail_size DEFAULT 'regular',
    "anchor_id" varchar,
    "custom_class_name" varchar,
    "is_hidden" boolean DEFAULT false,
    "visible_from" timestamp(3) with time zone,
    "visible_until" timestamp(3) with time zone,
    "heading_size" public.enum_org_spot_detail_heading_size,
    "text_align" public.enum_org_spot_detail_text_align,
    "heading_tag" public.enum_org_spot_detail_heading_tag,
    "spotlight_entry_id" integer,
    "show_category_nav" boolean DEFAULT true,
    "block_name" varchar
  );`,
  `CREATE TABLE IF NOT EXISTS public.org_learn_detail (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "structural_key" varchar,
    "theme" public.enum_org_learn_detail_theme DEFAULT 'white',
    "section_label" varchar,
    "background_color" varchar,
    "size" public.enum_org_learn_detail_size DEFAULT 'regular',
    "anchor_id" varchar,
    "custom_class_name" varchar,
    "is_hidden" boolean DEFAULT false,
    "visible_from" timestamp(3) with time zone,
    "visible_until" timestamp(3) with time zone,
    "heading_size" public.enum_org_learn_detail_heading_size,
    "text_align" public.enum_org_learn_detail_text_align,
    "heading_tag" public.enum_org_learn_detail_heading_tag,
    "learning_entry_id" integer,
    "show_category_nav" boolean DEFAULT true,
    "block_name" varchar
  );`,
  `CREATE TABLE IF NOT EXISTS public.org_about_detail (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "structural_key" varchar,
    "theme" public.enum_org_about_detail_theme DEFAULT 'white',
    "section_label" varchar,
    "background_color" varchar,
    "size" public.enum_org_about_detail_size DEFAULT 'regular',
    "anchor_id" varchar,
    "custom_class_name" varchar,
    "is_hidden" boolean DEFAULT false,
    "visible_from" timestamp(3) with time zone,
    "visible_until" timestamp(3) with time zone,
    "heading_size" public.enum_org_about_detail_heading_size,
    "text_align" public.enum_org_about_detail_text_align,
    "heading_tag" public.enum_org_about_detail_heading_tag,
    "profile_id" integer,
    "show_category_nav" boolean DEFAULT true,
    "block_name" varchar
  );`,
  `CREATE TABLE IF NOT EXISTS public.org_sponsors_sec (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "structural_key" varchar,
    "theme" public.enum_org_sponsors_sec_theme DEFAULT 'white',
    "section_label" varchar,
    "background_color" varchar,
    "size" public.enum_org_sponsors_sec_size DEFAULT 'regular',
    "anchor_id" varchar,
    "custom_class_name" varchar,
    "is_hidden" boolean DEFAULT false,
    "visible_from" timestamp(3) with time zone,
    "visible_until" timestamp(3) with time zone,
    "heading_size" public.enum_org_sponsors_sec_heading_size,
    "text_align" public.enum_org_sponsors_sec_text_align,
    "heading_tag" public.enum_org_sponsors_sec_heading_tag,
    "block_name" varchar
  );`,
] as const;

const CONSTRAINT_STATEMENTS = [
  {
    name: 'org_evt_detail_event_id_org_events_id_fk',
    tableName: 'org_evt_detail',
    definition:
      'FOREIGN KEY ("event_id") REFERENCES "public"."org_events"("id") ON DELETE set null ON UPDATE no action',
  },
  {
    name: 'org_evt_detail_parent_id_fk',
    tableName: 'org_evt_detail',
    definition:
      'FOREIGN KEY ("_parent_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action',
  },
  {
    name: 'org_evt_reg_event_id_org_events_id_fk',
    tableName: 'org_evt_reg',
    definition:
      'FOREIGN KEY ("event_id") REFERENCES "public"."org_events"("id") ON DELETE set null ON UPDATE no action',
  },
  {
    name: 'org_evt_reg_parent_id_fk',
    tableName: 'org_evt_reg',
    definition:
      'FOREIGN KEY ("_parent_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action',
  },
  {
    name: 'org_spot_detail_spotlight_entry_id_org_spotlight_id_fk',
    tableName: 'org_spot_detail',
    definition:
      'FOREIGN KEY ("spotlight_entry_id") REFERENCES "public"."org_spotlight"("id") ON DELETE set null ON UPDATE no action',
  },
  {
    name: 'org_spot_detail_parent_id_fk',
    tableName: 'org_spot_detail',
    definition:
      'FOREIGN KEY ("_parent_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action',
  },
  {
    name: 'org_learn_detail_learning_entry_id_org_learning_id_fk',
    tableName: 'org_learn_detail',
    definition:
      'FOREIGN KEY ("learning_entry_id") REFERENCES "public"."org_learning"("id") ON DELETE set null ON UPDATE no action',
  },
  {
    name: 'org_learn_detail_parent_id_fk',
    tableName: 'org_learn_detail',
    definition:
      'FOREIGN KEY ("_parent_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action',
  },
  {
    name: 'org_about_detail_profile_id_org_about_profiles_id_fk',
    tableName: 'org_about_detail',
    definition:
      'FOREIGN KEY ("profile_id") REFERENCES "public"."org_about_profiles"("id") ON DELETE set null ON UPDATE no action',
  },
  {
    name: 'org_about_detail_parent_id_fk',
    tableName: 'org_about_detail',
    definition:
      'FOREIGN KEY ("_parent_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action',
  },
  {
    name: 'org_sponsors_sec_parent_id_fk',
    tableName: 'org_sponsors_sec',
    definition:
      'FOREIGN KEY ("_parent_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action',
  },
] as const;

const INDEX_STATEMENTS = [
  'CREATE INDEX IF NOT EXISTS "org_evt_detail_order_idx" ON "public"."org_evt_detail" USING btree ("_order");',
  'CREATE INDEX IF NOT EXISTS "org_evt_detail_parent_id_idx" ON "public"."org_evt_detail" USING btree ("_parent_id");',
  'CREATE INDEX IF NOT EXISTS "org_evt_detail_path_idx" ON "public"."org_evt_detail" USING btree ("_path");',
  'CREATE INDEX IF NOT EXISTS "org_evt_detail_event_idx" ON "public"."org_evt_detail" USING btree ("event_id");',
  'CREATE INDEX IF NOT EXISTS "org_evt_reg_order_idx" ON "public"."org_evt_reg" USING btree ("_order");',
  'CREATE INDEX IF NOT EXISTS "org_evt_reg_parent_id_idx" ON "public"."org_evt_reg" USING btree ("_parent_id");',
  'CREATE INDEX IF NOT EXISTS "org_evt_reg_path_idx" ON "public"."org_evt_reg" USING btree ("_path");',
  'CREATE INDEX IF NOT EXISTS "org_evt_reg_event_idx" ON "public"."org_evt_reg" USING btree ("event_id");',
  'CREATE INDEX IF NOT EXISTS "org_spot_detail_order_idx" ON "public"."org_spot_detail" USING btree ("_order");',
  'CREATE INDEX IF NOT EXISTS "org_spot_detail_parent_id_idx" ON "public"."org_spot_detail" USING btree ("_parent_id");',
  'CREATE INDEX IF NOT EXISTS "org_spot_detail_path_idx" ON "public"."org_spot_detail" USING btree ("_path");',
  'CREATE INDEX IF NOT EXISTS "org_spot_detail_spotlight_entry_idx" ON "public"."org_spot_detail" USING btree ("spotlight_entry_id");',
  'CREATE INDEX IF NOT EXISTS "org_learn_detail_order_idx" ON "public"."org_learn_detail" USING btree ("_order");',
  'CREATE INDEX IF NOT EXISTS "org_learn_detail_parent_id_idx" ON "public"."org_learn_detail" USING btree ("_parent_id");',
  'CREATE INDEX IF NOT EXISTS "org_learn_detail_path_idx" ON "public"."org_learn_detail" USING btree ("_path");',
  'CREATE INDEX IF NOT EXISTS "org_learn_detail_learning_entry_idx" ON "public"."org_learn_detail" USING btree ("learning_entry_id");',
  'CREATE INDEX IF NOT EXISTS "org_about_detail_order_idx" ON "public"."org_about_detail" USING btree ("_order");',
  'CREATE INDEX IF NOT EXISTS "org_about_detail_parent_id_idx" ON "public"."org_about_detail" USING btree ("_parent_id");',
  'CREATE INDEX IF NOT EXISTS "org_about_detail_path_idx" ON "public"."org_about_detail" USING btree ("_path");',
  'CREATE INDEX IF NOT EXISTS "org_about_detail_profile_idx" ON "public"."org_about_detail" USING btree ("profile_id");',
  'CREATE INDEX IF NOT EXISTS "org_sponsors_sec_order_idx" ON "public"."org_sponsors_sec" USING btree ("_order");',
  'CREATE INDEX IF NOT EXISTS "org_sponsors_sec_parent_id_idx" ON "public"."org_sponsors_sec" USING btree ("_parent_id");',
  'CREATE INDEX IF NOT EXISTS "org_sponsors_sec_path_idx" ON "public"."org_sponsors_sec" USING btree ("_path");',
] as const;

function quoteIdentifier(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function quoteLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

async function ensureEnum(
  db: MigrateUpArgs['db'],
  qualifiedTypeName: string,
  labels: readonly string[],
): Promise<void> {
  const [schema, ...rest] = qualifiedTypeName.split('.');
  if (!schema || rest.length === 0) {
    throw new Error(`Invalid enum type name: ${qualifiedTypeName}`);
  }

  const name = rest.join('.');
  const qualifiedTypeIdentifier = `${quoteIdentifier(schema)}.${quoteIdentifier(name)}`;
  const enumValuesSql = labels.map((label) => quoteLiteral(label)).join(', ');

  await db.execute(sql.raw(`
DO $$
BEGIN
  CREATE TYPE ${qualifiedTypeIdentifier} AS ENUM (${enumValuesSql});
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;
  `));

  for (const label of labels) {
    await db.execute(sql.raw(`ALTER TYPE ${qualifiedTypeIdentifier} ADD VALUE IF NOT EXISTS ${quoteLiteral(label)};`));
  }
}

async function ensureConstraint(
  db: MigrateUpArgs['db'],
  tableName: string,
  constraintName: string,
  definition: string,
): Promise<void> {
  await db.execute(sql.raw(`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = ${quoteLiteral(constraintName)}
  ) THEN
    ALTER TABLE ${quoteIdentifier('public')}.${quoteIdentifier(tableName)}
      ADD CONSTRAINT ${quoteIdentifier(constraintName)} ${definition};
  END IF;
END
$$;
  `));
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const { qualifiedTypeName, labels } of ALL_ENUMS) {
    await ensureEnum(db, qualifiedTypeName, labels);
  }

  for (const statement of CREATE_TABLE_STATEMENTS) {
    await db.execute(sql.raw(statement));
  }

  // Add item_base_path column to org_feed if not already present
  await db.execute(sql.raw(`
    ALTER TABLE IF EXISTS "public"."org_feed"
      ADD COLUMN IF NOT EXISTS "item_base_path" varchar;
  `));

  for (const constraint of CONSTRAINT_STATEMENTS) {
    await ensureConstraint(db, constraint.tableName, constraint.name, constraint.definition);
  }

  for (const statement of INDEX_STATEMENTS) {
    await db.execute(sql.raw(statement));
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
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
