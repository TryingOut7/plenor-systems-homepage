import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

/**
 * Up: drop orphan columns from testimonials that remain after removing:
 *   - seoFields spread (the `seo` group: meta_title, og_*, canonical_url, noindex, etc.)
 *   - @payloadcms/plugin-seo injection (the `meta` group: title, description, image)
 *   - publishedAt field
 *
 * All drops use IF EXISTS so the migration is safe to replay on environments where
 * schema-push already removed the columns, or where the plugin never created them.
 *
 * Down: this is a pure cleanup — no functional behaviour is lost.
 * Columns are not restored on rollback because they are no longer declared in the
 * collection schema and would cause Payload errors on write.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // published_at — removed from Testimonials collection
  await db.execute(sql`ALTER TABLE testimonials DROP COLUMN IF EXISTS published_at`);

  // seoFields group columns (prefixed `seo_`)
  await db.execute(sql`ALTER TABLE testimonials DROP COLUMN IF EXISTS seo_meta_title`);
  await db.execute(sql`ALTER TABLE testimonials DROP COLUMN IF EXISTS seo_meta_description`);
  await db.execute(sql`ALTER TABLE testimonials DROP COLUMN IF EXISTS seo_og_title`);
  await db.execute(sql`ALTER TABLE testimonials DROP COLUMN IF EXISTS seo_og_description`);
  await db.execute(sql`ALTER TABLE testimonials DROP COLUMN IF EXISTS seo_og_image_id`);
  await db.execute(sql`ALTER TABLE testimonials DROP COLUMN IF EXISTS seo_canonical_url`);
  await db.execute(sql`ALTER TABLE testimonials DROP COLUMN IF EXISTS seo_noindex`);
  await db.execute(sql`ALTER TABLE testimonials DROP COLUMN IF EXISTS seo_nofollow`);
  await db.execute(sql`ALTER TABLE testimonials DROP COLUMN IF EXISTS seo_include_in_sitemap`);

  // @payloadcms/plugin-seo injected columns (prefixed `meta_`)
  await db.execute(sql`ALTER TABLE testimonials DROP COLUMN IF EXISTS meta_title`);
  await db.execute(sql`ALTER TABLE testimonials DROP COLUMN IF EXISTS meta_description`);
  await db.execute(sql`ALTER TABLE testimonials DROP COLUMN IF EXISTS meta_image_id`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS published_at timestamptz`);

  await db.execute(sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS seo_meta_title varchar`);
  await db.execute(sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS seo_meta_description varchar`);
  await db.execute(sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS seo_og_title varchar`);
  await db.execute(sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS seo_og_description varchar`);
  await db.execute(sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS seo_og_image_id integer`);
  await db.execute(sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS seo_canonical_url varchar`);
  await db.execute(sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS seo_noindex boolean`);
  await db.execute(sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS seo_nofollow boolean`);
  await db.execute(sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS seo_include_in_sitemap boolean`);

  await db.execute(sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS meta_title varchar`);
  await db.execute(sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS meta_description varchar`);
  await db.execute(sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS meta_image_id integer`);
}
