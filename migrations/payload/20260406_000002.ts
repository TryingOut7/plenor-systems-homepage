import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres';
import { sql } from 'drizzle-orm';

/**
 * Drop redundant `reviewed_by` and `reviewed_at` columns from all workflow
 * approval tables.
 *
 * Background (H-02):
 *   These columns were stamped simultaneously with `approved_by`/`approved_at`
 *   during the approval transition, so they always held identical values.
 *   "reviewed" vocabulary belongs at the in_review stage, not the approval stage.
 *   External systems reading `reviewed_by` would infer it was set when content
 *   entered in_review, not when it was approved — a semantic contract violation.
 *
 *   After this migration, only `approved_by`/`approved_at` record who approved
 *   a document and when. The columns below are safe to drop because:
 *     - they were never read by any application code path
 *     - they always duplicated `approved_by`/`approved_at` exactly
 *     - the Payload field definitions no longer declare them
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Drop from every collection that uses workflowApprovalFields.
  // Using IF EXISTS on each column so this migration is safe to run even if
  // the columns were never created (e.g. fresh installs post-fix).
  const tables = [
    'service_items',
    'site_pages',
    'page_drafts',
    'page_playgrounds',
    'reuse_sec',
    'redirect_rules',
    'blog_posts',
    'testimonials',
    'team_members',
    'logos',
  ];

  for (const table of tables) {
    await db.execute(sql.raw(
      `ALTER TABLE ${table}
         DROP COLUMN IF EXISTS reviewed_by_id,
         DROP COLUMN IF EXISTS reviewed_at;`,
    ));
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Re-add the columns as nullable (the original schema had no NOT NULL constraint).
  // We cannot restore the data — but since the columns were always redundant with
  // approved_by/approved_at, data loss is acceptable for a rollback scenario.
  const tables = [
    'service_items',
    'site_pages',
    'page_drafts',
    'page_playgrounds',
    'reuse_sec',
    'redirect_rules',
    'blog_posts',
    'testimonials',
    'team_members',
    'logos',
  ];

  for (const table of tables) {
    await db.execute(sql.raw(
      `ALTER TABLE ${table}
         ADD COLUMN IF NOT EXISTS reviewed_by_id integer REFERENCES users(id),
         ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;`,
    ));
  }
}
