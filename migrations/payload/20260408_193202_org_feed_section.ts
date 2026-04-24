import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

const ORG_FEED_ENUMS = {
  'public.enum_org_feed_theme': ['navy', 'charcoal', 'black', 'white', 'light'],
  'public.enum_org_feed_size': ['compact', 'regular', 'spacious'],
  'public.enum_org_feed_heading_size': ['xs', 'sm', 'md', 'lg', 'xl'],
  'public.enum_org_feed_text_align': ['left', 'center', 'right'],
  'public.enum_org_feed_heading_tag': ['h1', 'h2', 'h3', 'h4'],
  'public.enum_org_feed_feed_type': ['events', 'spotlight', 'learning'],
  'public.enum_org_feed_source_mode': ['featured', 'manual', 'automatic'],
  'public.enum_org_feed_columns': ['1', '2', '3', '4'],
  'public.enum_org_feed_event_status': ['upcoming_planned', 'current_ongoing', 'past_completed'],
  'public.enum_org_feed_spotlight_category': [
    'student',
    'teacher',
    'volunteer',
    'local_organization',
    'local_prominent_artist',
  ],
  'public.enum_org_feed_learning_category': ['knowledge_sharing', 'college_prep', 'mentorship'],
} as const;

const CREATE_TABLE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS public.org_feed (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "structural_key" varchar,
    "theme" public.enum_org_feed_theme DEFAULT 'white',
    "section_label" varchar,
    "background_color" varchar,
    "size" public.enum_org_feed_size DEFAULT 'regular',
    "anchor_id" varchar,
    "custom_class_name" varchar,
    "is_hidden" boolean DEFAULT false,
    "visible_from" timestamp(3) with time zone,
    "visible_until" timestamp(3) with time zone,
    "heading_size" public.enum_org_feed_heading_size,
    "text_align" public.enum_org_feed_text_align,
    "heading_tag" public.enum_org_feed_heading_tag,
    "heading" varchar,
    "subheading" varchar,
    "feed_type" public.enum_org_feed_feed_type DEFAULT 'events',
    "source_mode" public.enum_org_feed_source_mode DEFAULT 'featured',
    "limit" numeric DEFAULT 3,
    "columns" public.enum_org_feed_columns DEFAULT '3',
    "include_cta" boolean DEFAULT true,
    "cta_label" varchar,
    "cta_href" varchar,
    "event_status" public.enum_org_feed_event_status DEFAULT 'upcoming_planned',
    "spotlight_category" public.enum_org_feed_spotlight_category DEFAULT 'student',
    "learning_category" public.enum_org_feed_learning_category DEFAULT 'knowledge_sharing',
    "block_name" varchar
  );`,
] as const;

const TABLE_COLUMNS = {
  org_feed: {
    _order: 'integer NOT NULL',
    _parent_id: 'integer NOT NULL',
    _path: 'text NOT NULL',
    id: 'varchar',
    structural_key: 'varchar',
    theme: `public.enum_org_feed_theme DEFAULT 'white'`,
    section_label: 'varchar',
    background_color: 'varchar',
    size: `public.enum_org_feed_size DEFAULT 'regular'`,
    anchor_id: 'varchar',
    custom_class_name: 'varchar',
    is_hidden: 'boolean DEFAULT false',
    visible_from: 'timestamp(3) with time zone',
    visible_until: 'timestamp(3) with time zone',
    heading_size: 'public.enum_org_feed_heading_size',
    text_align: 'public.enum_org_feed_text_align',
    heading_tag: 'public.enum_org_feed_heading_tag',
    heading: 'varchar',
    subheading: 'varchar',
    feed_type: `public.enum_org_feed_feed_type DEFAULT 'events'`,
    source_mode: `public.enum_org_feed_source_mode DEFAULT 'featured'`,
    limit: 'numeric DEFAULT 3',
    columns: `public.enum_org_feed_columns DEFAULT '3'`,
    include_cta: 'boolean DEFAULT true',
    cta_label: 'varchar',
    cta_href: 'varchar',
    event_status: `public.enum_org_feed_event_status DEFAULT 'upcoming_planned'`,
    spotlight_category: `public.enum_org_feed_spotlight_category DEFAULT 'student'`,
    learning_category: `public.enum_org_feed_learning_category DEFAULT 'knowledge_sharing'`,
    block_name: 'varchar',
  },
  site_pages_rels: {
    org_events_id: 'integer',
    org_spotlight_id: 'integer',
    org_learning_id: 'integer',
  },
} as const;

const CONSTRAINT_STATEMENTS = [
  {
    name: 'org_feed_parent_id_fk',
    tableName: 'org_feed',
    definition:
      'FOREIGN KEY ("_parent_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action',
  },
  {
    name: 'site_pages_rels_org_events_fk',
    tableName: 'site_pages_rels',
    definition:
      'FOREIGN KEY ("org_events_id") REFERENCES "public"."org_events"("id") ON DELETE cascade ON UPDATE no action',
  },
  {
    name: 'site_pages_rels_org_spotlight_fk',
    tableName: 'site_pages_rels',
    definition:
      'FOREIGN KEY ("org_spotlight_id") REFERENCES "public"."org_spotlight"("id") ON DELETE cascade ON UPDATE no action',
  },
  {
    name: 'site_pages_rels_org_learning_fk',
    tableName: 'site_pages_rels',
    definition:
      'FOREIGN KEY ("org_learning_id") REFERENCES "public"."org_learning"("id") ON DELETE cascade ON UPDATE no action',
  },
] as const;

const INDEX_STATEMENTS = [
  'CREATE INDEX IF NOT EXISTS "org_feed_order_idx" ON "public"."org_feed" USING btree ("_order");',
  'CREATE INDEX IF NOT EXISTS "org_feed_parent_id_idx" ON "public"."org_feed" USING btree ("_parent_id");',
  'CREATE INDEX IF NOT EXISTS "org_feed_path_idx" ON "public"."org_feed" USING btree ("_path");',
  'CREATE INDEX IF NOT EXISTS "site_pages_rels_org_events_id_idx" ON "public"."site_pages_rels" USING btree ("org_events_id");',
  'CREATE INDEX IF NOT EXISTS "site_pages_rels_org_spotlight_id_idx" ON "public"."site_pages_rels" USING btree ("org_spotlight_id");',
  'CREATE INDEX IF NOT EXISTS "site_pages_rels_org_learning_id_idx" ON "public"."site_pages_rels" USING btree ("org_learning_id");',
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
  for (const [qualifiedTypeName, labels] of Object.entries(ORG_FEED_ENUMS)) {
    await ensureEnum(db, qualifiedTypeName, labels);
  }

  for (const statement of CREATE_TABLE_STATEMENTS) {
    await db.execute(sql.raw(statement));
  }

  for (const [tableName, columns] of Object.entries(TABLE_COLUMNS)) {
    const addClauses = Object.entries(columns).map(
      ([columnName, columnDefinition]) =>
        `ADD COLUMN IF NOT EXISTS ${quoteIdentifier(columnName)} ${columnDefinition}`,
    );

    if (addClauses.length === 0) {
      continue;
    }

    await db.execute(sql.raw(`
      ALTER TABLE IF EXISTS ${quoteIdentifier('public')}.${quoteIdentifier(tableName)}
        ${addClauses.join(',\n        ')};
    `));
  }

  for (const constraint of CONSTRAINT_STATEMENTS) {
    await ensureConstraint(db, constraint.tableName, constraint.name, constraint.definition);
  }

  for (const statement of INDEX_STATEMENTS) {
    await db.execute(sql.raw(statement));
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
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
