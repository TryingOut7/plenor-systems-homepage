import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

/**
 * Repair testimonials version-table schema drift.
 *
 * In some environments, `_testimonials_v` still uses legacy columns
 * (`version_person_name`) and is missing newer workflow/localization fields
 * expected by Payload's drafts list query.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Keep legacy rows readable in both the live and versions tables.
  await db.execute(sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS name varchar`);
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'testimonials'
          AND column_name = 'person_name'
      ) THEN
        EXECUTE '
          UPDATE testimonials
          SET name = person_name
          WHERE name IS NULL
            AND person_name IS NOT NULL
        ';
      END IF;
    END $$;
  `);

  await db.execute(sql`ALTER TABLE _testimonials_v ADD COLUMN IF NOT EXISTS version_name varchar`);
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = '_testimonials_v'
          AND column_name = 'version_person_name'
      ) THEN
        EXECUTE '
          UPDATE _testimonials_v
          SET version_name = version_person_name
          WHERE version_name IS NULL
            AND version_person_name IS NOT NULL
        ';
      END IF;
    END $$;
  `);

  await db.execute(sql`ALTER TABLE _testimonials_v ADD COLUMN IF NOT EXISTS version_locale varchar DEFAULT 'en'`);
  await db.execute(sql`ALTER TABLE _testimonials_v ADD COLUMN IF NOT EXISTS version_translation_group_id varchar`);
  await db.execute(sql`ALTER TABLE _testimonials_v ADD COLUMN IF NOT EXISTS version_created_by_id integer REFERENCES users(id) ON DELETE SET NULL`);
  await db.execute(sql`ALTER TABLE _testimonials_v ADD COLUMN IF NOT EXISTS version_submitted_by_id integer REFERENCES users(id) ON DELETE SET NULL`);
  await db.execute(sql`ALTER TABLE _testimonials_v ADD COLUMN IF NOT EXISTS version_submitted_at timestamptz`);
  await db.execute(sql`ALTER TABLE _testimonials_v ADD COLUMN IF NOT EXISTS version_review_checklist_complete boolean DEFAULT false`);
  await db.execute(sql`ALTER TABLE _testimonials_v ADD COLUMN IF NOT EXISTS version_review_summary text`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'testimonials'
          AND column_name = 'name'
      )
      AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'testimonials'
          AND column_name = 'person_name'
      ) THEN
        EXECUTE '
          UPDATE testimonials
          SET person_name = name
          WHERE person_name IS NULL
            AND name IS NOT NULL
        ';
      END IF;
    END $$;
  `);

  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = '_testimonials_v'
          AND column_name = 'version_name'
      )
      AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = '_testimonials_v'
          AND column_name = 'version_person_name'
      ) THEN
        EXECUTE '
          UPDATE _testimonials_v
          SET version_person_name = version_name
          WHERE version_person_name IS NULL
            AND version_name IS NOT NULL
        ';
      END IF;
    END $$;
  `);

  await db.execute(sql`ALTER TABLE _testimonials_v DROP COLUMN IF EXISTS version_review_summary`);
  await db.execute(sql`ALTER TABLE _testimonials_v DROP COLUMN IF EXISTS version_review_checklist_complete`);
  await db.execute(sql`ALTER TABLE _testimonials_v DROP COLUMN IF EXISTS version_submitted_at`);
  await db.execute(sql`ALTER TABLE _testimonials_v DROP COLUMN IF EXISTS version_submitted_by_id`);
  await db.execute(sql`ALTER TABLE _testimonials_v DROP COLUMN IF EXISTS version_created_by_id`);
  await db.execute(sql`ALTER TABLE _testimonials_v DROP COLUMN IF EXISTS version_translation_group_id`);
  await db.execute(sql`ALTER TABLE _testimonials_v DROP COLUMN IF EXISTS version_locale`);
  await db.execute(sql`ALTER TABLE _testimonials_v DROP COLUMN IF EXISTS version_name`);
}
