import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "org_events" ADD COLUMN IF NOT EXISTS "registration_form_id" integer;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'org_events_registration_form_id_forms_id_fk'
   ) THEN
    ALTER TABLE "org_events"
     ADD CONSTRAINT "org_events_registration_form_id_forms_id_fk"
     FOREIGN KEY ("registration_form_id")
     REFERENCES "public"."forms"("id")
     ON DELETE set null
     ON UPDATE no action;
   END IF;
  END $$;
  CREATE INDEX IF NOT EXISTS "org_events_registration_form_idx" ON "org_events" USING btree ("registration_form_id");
  ALTER TABLE "_org_events_v" ADD COLUMN IF NOT EXISTS "version_registration_form_id" integer;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = '_org_events_v_version_registration_form_id_forms_id_fk'
   ) THEN
    ALTER TABLE "_org_events_v"
     ADD CONSTRAINT "_org_events_v_version_registration_form_id_forms_id_fk"
     FOREIGN KEY ("version_registration_form_id")
     REFERENCES "public"."forms"("id")
     ON DELETE set null
     ON UPDATE no action;
   END IF;
  END $$;
  CREATE INDEX IF NOT EXISTS "_org_events_v_version_version_registration_form_idx" ON "_org_events_v" USING btree ("version_registration_form_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "org_events_registration_form_idx";
  ALTER TABLE "org_events" DROP CONSTRAINT IF EXISTS "org_events_registration_form_id_forms_id_fk";
  ALTER TABLE "org_events" DROP COLUMN IF EXISTS "registration_form_id";
  DROP INDEX IF EXISTS "_org_events_v_version_version_registration_form_idx";
  ALTER TABLE "_org_events_v" DROP CONSTRAINT IF EXISTS "_org_events_v_version_registration_form_id_forms_id_fk";
  ALTER TABLE "_org_events_v" DROP COLUMN IF EXISTS "version_registration_form_id";`)
}
