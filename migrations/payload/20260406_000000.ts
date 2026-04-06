import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

/**
 * Up: add submission attribution columns (submitted_by_id, submitted_at) to all
 * collections that use workflowApprovalFields.
 *
 * These columns record who submitted content for review (in_review transition)
 * and when, providing a complete audit trail across the editorial workflow.
 *
 * All additions use IF NOT EXISTS so the migration is safe to replay on environments
 * where schema-push already created the columns.
 *
 * Down: drops the two columns from all affected tables.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // blog_categories
  await db.execute(sql`ALTER TABLE blog_categories ADD COLUMN IF NOT EXISTS submitted_by_id integer REFERENCES users(id) ON DELETE SET NULL`);
  await db.execute(sql`ALTER TABLE blog_categories ADD COLUMN IF NOT EXISTS submitted_at timestamptz`);

  // blog_posts
  await db.execute(sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS submitted_by_id integer REFERENCES users(id) ON DELETE SET NULL`);
  await db.execute(sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS submitted_at timestamptz`);

  // logos
  await db.execute(sql`ALTER TABLE logos ADD COLUMN IF NOT EXISTS submitted_by_id integer REFERENCES users(id) ON DELETE SET NULL`);
  await db.execute(sql`ALTER TABLE logos ADD COLUMN IF NOT EXISTS submitted_at timestamptz`);

  // page_drafts
  await db.execute(sql`ALTER TABLE page_drafts ADD COLUMN IF NOT EXISTS submitted_by_id integer REFERENCES users(id) ON DELETE SET NULL`);
  await db.execute(sql`ALTER TABLE page_drafts ADD COLUMN IF NOT EXISTS submitted_at timestamptz`);

  // reuse_sec (reusable-sections)
  await db.execute(sql`ALTER TABLE reuse_sec ADD COLUMN IF NOT EXISTS submitted_by_id integer REFERENCES users(id) ON DELETE SET NULL`);
  await db.execute(sql`ALTER TABLE reuse_sec ADD COLUMN IF NOT EXISTS submitted_at timestamptz`);

  // service_items
  await db.execute(sql`ALTER TABLE service_items ADD COLUMN IF NOT EXISTS submitted_by_id integer REFERENCES users(id) ON DELETE SET NULL`);
  await db.execute(sql`ALTER TABLE service_items ADD COLUMN IF NOT EXISTS submitted_at timestamptz`);

  // site_pages
  await db.execute(sql`ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS submitted_by_id integer REFERENCES users(id) ON DELETE SET NULL`);
  await db.execute(sql`ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS submitted_at timestamptz`);

  // team_members
  await db.execute(sql`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS submitted_by_id integer REFERENCES users(id) ON DELETE SET NULL`);
  await db.execute(sql`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS submitted_at timestamptz`);

  // testimonials
  await db.execute(sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS submitted_by_id integer REFERENCES users(id) ON DELETE SET NULL`);
  await db.execute(sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS submitted_at timestamptz`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE blog_categories DROP COLUMN IF EXISTS submitted_by_id`);
  await db.execute(sql`ALTER TABLE blog_categories DROP COLUMN IF EXISTS submitted_at`);

  await db.execute(sql`ALTER TABLE blog_posts DROP COLUMN IF EXISTS submitted_by_id`);
  await db.execute(sql`ALTER TABLE blog_posts DROP COLUMN IF EXISTS submitted_at`);

  await db.execute(sql`ALTER TABLE logos DROP COLUMN IF EXISTS submitted_by_id`);
  await db.execute(sql`ALTER TABLE logos DROP COLUMN IF EXISTS submitted_at`);

  await db.execute(sql`ALTER TABLE page_drafts DROP COLUMN IF EXISTS submitted_by_id`);
  await db.execute(sql`ALTER TABLE page_drafts DROP COLUMN IF EXISTS submitted_at`);

  await db.execute(sql`ALTER TABLE reuse_sec DROP COLUMN IF EXISTS submitted_by_id`);
  await db.execute(sql`ALTER TABLE reuse_sec DROP COLUMN IF EXISTS submitted_at`);

  await db.execute(sql`ALTER TABLE service_items DROP COLUMN IF EXISTS submitted_by_id`);
  await db.execute(sql`ALTER TABLE service_items DROP COLUMN IF EXISTS submitted_at`);

  await db.execute(sql`ALTER TABLE site_pages DROP COLUMN IF EXISTS submitted_by_id`);
  await db.execute(sql`ALTER TABLE site_pages DROP COLUMN IF EXISTS submitted_at`);

  await db.execute(sql`ALTER TABLE team_members DROP COLUMN IF EXISTS submitted_by_id`);
  await db.execute(sql`ALTER TABLE team_members DROP COLUMN IF EXISTS submitted_at`);

  await db.execute(sql`ALTER TABLE testimonials DROP COLUMN IF EXISTS submitted_by_id`);
  await db.execute(sql`ALTER TABLE testimonials DROP COLUMN IF EXISTS submitted_at`);
}
