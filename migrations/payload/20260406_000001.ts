import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

/**
 * Up: add email_template_id FK column to the forms table.
 *
 * This links a guide-type form to a specific EmailTemplate document so that
 * FormRenderer can pass the correct email-templates collection ID (not the
 * forms collection ID) when submitting a guide request to /api/guide.
 *
 * Uses IF NOT EXISTS so the migration is safe to replay on environments
 * where schema-push already created the column.
 *
 * Down: drops the column.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE forms ADD COLUMN IF NOT EXISTS email_template_id integer REFERENCES email_templates(id) ON DELETE SET NULL`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE forms DROP COLUMN IF EXISTS email_template_id`);
}
