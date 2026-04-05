import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

/**
 * Up: add sections_locked to page_drafts, drop orphan expires_at from page_playgrounds.
 *
 * sections_locked is set by hydrateSectionsFromPresetBeforeChange when the source
 * preset has structureMode === 'locked'. The validateLockedSectionsBeforeChange hook
 * then rejects saves that structurally modify sections on those drafts.
 *
 * expires_at on page_playgrounds was never enforced and has been removed from the
 * collection definition.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE page_drafts
      ADD COLUMN IF NOT EXISTS sections_locked boolean DEFAULT false
  `);

  await db.execute(sql`
    ALTER TABLE page_playgrounds
      DROP COLUMN IF EXISTS expires_at
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE page_drafts
      DROP COLUMN IF EXISTS sections_locked
  `);

  await db.execute(sql`
    ALTER TABLE page_playgrounds
      ADD COLUMN IF NOT EXISTS expires_at timestamptz
  `);
}
