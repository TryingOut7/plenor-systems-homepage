import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "framework_entries" ADD COLUMN IF NOT EXISTS "ordering_value" numeric;
  ALTER TABLE "framework_entries" ADD COLUMN IF NOT EXISTS "cta_path" varchar;
  ALTER TABLE "_framework_entries_v" ADD COLUMN IF NOT EXISTS "version_ordering_value" numeric;
  ALTER TABLE "_framework_entries_v" ADD COLUMN IF NOT EXISTS "version_cta_path" varchar;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum_framework_entries_category'
     AND e.enumlabel = 'what-plenor-is'
   ) THEN
    ALTER TYPE "public"."enum_framework_entries_category" ADD VALUE 'what-plenor-is';
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum_framework_entries_category'
     AND e.enumlabel = 'how-the-approach-works'
   ) THEN
    ALTER TYPE "public"."enum_framework_entries_category" ADD VALUE 'how-the-approach-works';
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum_framework_entries_category'
     AND e.enumlabel = 'cms-driven-website-model'
   ) THEN
    ALTER TYPE "public"."enum_framework_entries_category" ADD VALUE 'cms-driven-website-model';
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum_framework_entries_category'
     AND e.enumlabel = 'why-this-is-different'
   ) THEN
    ALTER TYPE "public"."enum_framework_entries_category" ADD VALUE 'why-this-is-different';
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum__framework_entries_v_version_category'
     AND e.enumlabel = 'what-plenor-is'
   ) THEN
    ALTER TYPE "public"."enum__framework_entries_v_version_category" ADD VALUE 'what-plenor-is';
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum__framework_entries_v_version_category'
     AND e.enumlabel = 'how-the-approach-works'
   ) THEN
    ALTER TYPE "public"."enum__framework_entries_v_version_category" ADD VALUE 'how-the-approach-works';
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum__framework_entries_v_version_category'
     AND e.enumlabel = 'cms-driven-website-model'
   ) THEN
    ALTER TYPE "public"."enum__framework_entries_v_version_category" ADD VALUE 'cms-driven-website-model';
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum__framework_entries_v_version_category'
     AND e.enumlabel = 'why-this-is-different'
   ) THEN
    ALTER TYPE "public"."enum__framework_entries_v_version_category" ADD VALUE 'why-this-is-different';
   END IF;
  END $$;
  CREATE TABLE IF NOT EXISTS "framework_entries_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"solution_entries_id" integer,
  	"insight_entries_id" integer
  );
  CREATE TABLE IF NOT EXISTS "_framework_entries_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"solution_entries_id" integer,
  	"insight_entries_id" integer
  );
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'framework_entries_rels_parent_fk'
   ) THEN
    ALTER TABLE "framework_entries_rels"
     ADD CONSTRAINT "framework_entries_rels_parent_fk"
     FOREIGN KEY ("parent_id")
     REFERENCES "public"."framework_entries"("id")
     ON DELETE cascade
     ON UPDATE no action;
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'framework_entries_rels_solution_entries_fk'
   ) THEN
    ALTER TABLE "framework_entries_rels"
     ADD CONSTRAINT "framework_entries_rels_solution_entries_fk"
     FOREIGN KEY ("solution_entries_id")
     REFERENCES "public"."solution_entries"("id")
     ON DELETE cascade
     ON UPDATE no action;
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'framework_entries_rels_insight_entries_fk'
   ) THEN
    ALTER TABLE "framework_entries_rels"
     ADD CONSTRAINT "framework_entries_rels_insight_entries_fk"
     FOREIGN KEY ("insight_entries_id")
     REFERENCES "public"."insight_entries"("id")
     ON DELETE cascade
     ON UPDATE no action;
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = '_framework_entries_v_rels_parent_fk'
   ) THEN
    ALTER TABLE "_framework_entries_v_rels"
     ADD CONSTRAINT "_framework_entries_v_rels_parent_fk"
     FOREIGN KEY ("parent_id")
     REFERENCES "public"."_framework_entries_v"("id")
     ON DELETE cascade
     ON UPDATE no action;
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = '_framework_entries_v_rels_solution_entries_fk'
   ) THEN
    ALTER TABLE "_framework_entries_v_rels"
     ADD CONSTRAINT "_framework_entries_v_rels_solution_entries_fk"
     FOREIGN KEY ("solution_entries_id")
     REFERENCES "public"."solution_entries"("id")
     ON DELETE cascade
     ON UPDATE no action;
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = '_framework_entries_v_rels_insight_entries_fk'
   ) THEN
    ALTER TABLE "_framework_entries_v_rels"
     ADD CONSTRAINT "_framework_entries_v_rels_insight_entries_fk"
     FOREIGN KEY ("insight_entries_id")
     REFERENCES "public"."insight_entries"("id")
     ON DELETE cascade
     ON UPDATE no action;
   END IF;
  END $$;
  CREATE INDEX IF NOT EXISTS "framework_entries_rels_order_idx" ON "framework_entries_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "framework_entries_rels_parent_idx" ON "framework_entries_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "framework_entries_rels_path_idx" ON "framework_entries_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "framework_entries_rels_solution_entries_id_idx" ON "framework_entries_rels" USING btree ("solution_entries_id");
  CREATE INDEX IF NOT EXISTS "framework_entries_rels_insight_entries_id_idx" ON "framework_entries_rels" USING btree ("insight_entries_id");
  CREATE INDEX IF NOT EXISTS "_framework_entries_v_rels_order_idx" ON "_framework_entries_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_framework_entries_v_rels_parent_idx" ON "_framework_entries_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_framework_entries_v_rels_path_idx" ON "_framework_entries_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_framework_entries_v_rels_solution_entries_id_idx" ON "_framework_entries_v_rels" USING btree ("solution_entries_id");
  CREATE INDEX IF NOT EXISTS "_framework_entries_v_rels_insight_entries_id_idx" ON "_framework_entries_v_rels" USING btree ("insight_entries_id");

  ALTER TABLE "solution_entries" ADD COLUMN IF NOT EXISTS "ordering_value" numeric;
  ALTER TABLE "solution_entries" ADD COLUMN IF NOT EXISTS "cta_path" varchar;
  ALTER TABLE "_solution_entries_v" ADD COLUMN IF NOT EXISTS "version_ordering_value" numeric;
  ALTER TABLE "_solution_entries_v" ADD COLUMN IF NOT EXISTS "version_cta_path" varchar;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum_solution_entries_category'
     AND e.enumlabel = 'strategy-and-definition'
   ) THEN
    ALTER TYPE "public"."enum_solution_entries_category" ADD VALUE 'strategy-and-definition';
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum_solution_entries_category'
     AND e.enumlabel = 'website-and-cms-implementation'
   ) THEN
    ALTER TYPE "public"."enum_solution_entries_category" ADD VALUE 'website-and-cms-implementation';
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum_solution_entries_category'
     AND e.enumlabel = 'framework-led-delivery'
   ) THEN
    ALTER TYPE "public"."enum_solution_entries_category" ADD VALUE 'framework-led-delivery';
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum__solution_entries_v_version_category'
     AND e.enumlabel = 'strategy-and-definition'
   ) THEN
    ALTER TYPE "public"."enum__solution_entries_v_version_category" ADD VALUE 'strategy-and-definition';
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum__solution_entries_v_version_category'
     AND e.enumlabel = 'website-and-cms-implementation'
   ) THEN
    ALTER TYPE "public"."enum__solution_entries_v_version_category" ADD VALUE 'website-and-cms-implementation';
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum__solution_entries_v_version_category'
     AND e.enumlabel = 'framework-led-delivery'
   ) THEN
    ALTER TYPE "public"."enum__solution_entries_v_version_category" ADD VALUE 'framework-led-delivery';
   END IF;
  END $$;
  CREATE TABLE IF NOT EXISTS "solution_entries_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"insight_entries_id" integer
  );
  CREATE TABLE IF NOT EXISTS "_solution_entries_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"insight_entries_id" integer
  );
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'solution_entries_rels_parent_fk'
   ) THEN
    ALTER TABLE "solution_entries_rels"
     ADD CONSTRAINT "solution_entries_rels_parent_fk"
     FOREIGN KEY ("parent_id")
     REFERENCES "public"."solution_entries"("id")
     ON DELETE cascade
     ON UPDATE no action;
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'solution_entries_rels_insight_entries_fk'
   ) THEN
    ALTER TABLE "solution_entries_rels"
     ADD CONSTRAINT "solution_entries_rels_insight_entries_fk"
     FOREIGN KEY ("insight_entries_id")
     REFERENCES "public"."insight_entries"("id")
     ON DELETE cascade
     ON UPDATE no action;
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = '_solution_entries_v_rels_parent_fk'
   ) THEN
    ALTER TABLE "_solution_entries_v_rels"
     ADD CONSTRAINT "_solution_entries_v_rels_parent_fk"
     FOREIGN KEY ("parent_id")
     REFERENCES "public"."_solution_entries_v"("id")
     ON DELETE cascade
     ON UPDATE no action;
   END IF;
  END $$;
  DO $$ BEGIN
   IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = '_solution_entries_v_rels_insight_entries_fk'
   ) THEN
    ALTER TABLE "_solution_entries_v_rels"
     ADD CONSTRAINT "_solution_entries_v_rels_insight_entries_fk"
     FOREIGN KEY ("insight_entries_id")
     REFERENCES "public"."insight_entries"("id")
     ON DELETE cascade
     ON UPDATE no action;
   END IF;
  END $$;
  CREATE INDEX IF NOT EXISTS "solution_entries_rels_order_idx" ON "solution_entries_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "solution_entries_rels_parent_idx" ON "solution_entries_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "solution_entries_rels_path_idx" ON "solution_entries_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "solution_entries_rels_insight_entries_id_idx" ON "solution_entries_rels" USING btree ("insight_entries_id");
  CREATE INDEX IF NOT EXISTS "_solution_entries_v_rels_order_idx" ON "_solution_entries_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_solution_entries_v_rels_parent_idx" ON "_solution_entries_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_solution_entries_v_rels_path_idx" ON "_solution_entries_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_solution_entries_v_rels_insight_entries_id_idx" ON "_solution_entries_v_rels" USING btree ("insight_entries_id");

  DO $$ BEGIN
   IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum_insight_entries_type'
   ) AND NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum_insight_entries_category'
   ) THEN
    ALTER TYPE "public"."enum_insight_entries_type" RENAME TO "enum_insight_entries_category";
   END IF;
  END $$;
  DO $$ BEGIN
   IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum__insight_entries_v_version_type'
   ) AND NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum__insight_entries_v_version_category'
   ) THEN
    ALTER TYPE "public"."enum__insight_entries_v_version_type" RENAME TO "enum__insight_entries_v_version_category";
   END IF;
  END $$;
  DO $$ BEGIN
   IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
     AND table_name = 'insight_entries'
     AND column_name = 'type'
   ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
     AND table_name = 'insight_entries'
     AND column_name = 'category'
   ) THEN
    ALTER TABLE "insight_entries" RENAME COLUMN "type" TO "category";
   END IF;
  END $$;
  DO $$ BEGIN
   IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
     AND table_name = '_insight_entries_v'
     AND column_name = 'version_type'
   ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
     AND table_name = '_insight_entries_v'
     AND column_name = 'version_category'
   ) THEN
    ALTER TABLE "_insight_entries_v" RENAME COLUMN "version_type" TO "version_category";
   END IF;
  END $$;
  DO $$ BEGIN
   IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum_insight_entries_category'
     AND e.enumlabel = 'guide'
   ) AND NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum_insight_entries_category'
     AND e.enumlabel = 'guide-resource'
   ) THEN
    ALTER TYPE "public"."enum_insight_entries_category" RENAME VALUE 'guide' TO 'guide-resource';
   END IF;
  END $$;
  DO $$ BEGIN
   IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum__insight_entries_v_version_category'
     AND e.enumlabel = 'guide'
   ) AND NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum__insight_entries_v_version_category'
     AND e.enumlabel = 'guide-resource'
   ) THEN
    ALTER TYPE "public"."enum__insight_entries_v_version_category" RENAME VALUE 'guide' TO 'guide-resource';
   END IF;
  END $$;
  ALTER TABLE "insight_entries" ADD COLUMN IF NOT EXISTS "author_label" varchar;
  ALTER TABLE "insight_entries" ADD COLUMN IF NOT EXISTS "ordering_value" numeric;
  ALTER TABLE "_insight_entries_v" ADD COLUMN IF NOT EXISTS "version_author_label" varchar;
  ALTER TABLE "_insight_entries_v" ADD COLUMN IF NOT EXISTS "version_ordering_value" numeric;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "framework_entries_rels_order_idx";
  DROP INDEX IF EXISTS "framework_entries_rels_parent_idx";
  DROP INDEX IF EXISTS "framework_entries_rels_path_idx";
  DROP INDEX IF EXISTS "framework_entries_rels_solution_entries_id_idx";
  DROP INDEX IF EXISTS "framework_entries_rels_insight_entries_id_idx";
  DROP INDEX IF EXISTS "_framework_entries_v_rels_order_idx";
  DROP INDEX IF EXISTS "_framework_entries_v_rels_parent_idx";
  DROP INDEX IF EXISTS "_framework_entries_v_rels_path_idx";
  DROP INDEX IF EXISTS "_framework_entries_v_rels_solution_entries_id_idx";
  DROP INDEX IF EXISTS "_framework_entries_v_rels_insight_entries_id_idx";
  ALTER TABLE "framework_entries_rels" DROP CONSTRAINT IF EXISTS "framework_entries_rels_parent_fk";
  ALTER TABLE "framework_entries_rels" DROP CONSTRAINT IF EXISTS "framework_entries_rels_solution_entries_fk";
  ALTER TABLE "framework_entries_rels" DROP CONSTRAINT IF EXISTS "framework_entries_rels_insight_entries_fk";
  ALTER TABLE "_framework_entries_v_rels" DROP CONSTRAINT IF EXISTS "_framework_entries_v_rels_parent_fk";
  ALTER TABLE "_framework_entries_v_rels" DROP CONSTRAINT IF EXISTS "_framework_entries_v_rels_solution_entries_fk";
  ALTER TABLE "_framework_entries_v_rels" DROP CONSTRAINT IF EXISTS "_framework_entries_v_rels_insight_entries_fk";
  DROP TABLE IF EXISTS "framework_entries_rels";
  DROP TABLE IF EXISTS "_framework_entries_v_rels";
  ALTER TABLE "framework_entries" DROP COLUMN IF EXISTS "ordering_value";
  ALTER TABLE "framework_entries" DROP COLUMN IF EXISTS "cta_path";
  ALTER TABLE "_framework_entries_v" DROP COLUMN IF EXISTS "version_ordering_value";
  ALTER TABLE "_framework_entries_v" DROP COLUMN IF EXISTS "version_cta_path";

  DROP INDEX IF EXISTS "solution_entries_rels_order_idx";
  DROP INDEX IF EXISTS "solution_entries_rels_parent_idx";
  DROP INDEX IF EXISTS "solution_entries_rels_path_idx";
  DROP INDEX IF EXISTS "solution_entries_rels_insight_entries_id_idx";
  DROP INDEX IF EXISTS "_solution_entries_v_rels_order_idx";
  DROP INDEX IF EXISTS "_solution_entries_v_rels_parent_idx";
  DROP INDEX IF EXISTS "_solution_entries_v_rels_path_idx";
  DROP INDEX IF EXISTS "_solution_entries_v_rels_insight_entries_id_idx";
  ALTER TABLE "solution_entries_rels" DROP CONSTRAINT IF EXISTS "solution_entries_rels_parent_fk";
  ALTER TABLE "solution_entries_rels" DROP CONSTRAINT IF EXISTS "solution_entries_rels_insight_entries_fk";
  ALTER TABLE "_solution_entries_v_rels" DROP CONSTRAINT IF EXISTS "_solution_entries_v_rels_parent_fk";
  ALTER TABLE "_solution_entries_v_rels" DROP CONSTRAINT IF EXISTS "_solution_entries_v_rels_insight_entries_fk";
  DROP TABLE IF EXISTS "solution_entries_rels";
  DROP TABLE IF EXISTS "_solution_entries_v_rels";
  ALTER TABLE "solution_entries" DROP COLUMN IF EXISTS "ordering_value";
  ALTER TABLE "solution_entries" DROP COLUMN IF EXISTS "cta_path";
  ALTER TABLE "_solution_entries_v" DROP COLUMN IF EXISTS "version_ordering_value";
  ALTER TABLE "_solution_entries_v" DROP COLUMN IF EXISTS "version_cta_path";

  ALTER TABLE "insight_entries" DROP COLUMN IF EXISTS "author_label";
  ALTER TABLE "insight_entries" DROP COLUMN IF EXISTS "ordering_value";
  ALTER TABLE "_insight_entries_v" DROP COLUMN IF EXISTS "version_author_label";
  ALTER TABLE "_insight_entries_v" DROP COLUMN IF EXISTS "version_ordering_value";
  DO $$ BEGIN
   IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
     AND table_name = 'insight_entries'
     AND column_name = 'category'
   ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
     AND table_name = 'insight_entries'
     AND column_name = 'type'
   ) THEN
    ALTER TABLE "insight_entries" RENAME COLUMN "category" TO "type";
   END IF;
  END $$;
  DO $$ BEGIN
   IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
     AND table_name = '_insight_entries_v'
     AND column_name = 'version_category'
   ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
     AND table_name = '_insight_entries_v'
     AND column_name = 'version_type'
   ) THEN
    ALTER TABLE "_insight_entries_v" RENAME COLUMN "version_category" TO "version_type";
   END IF;
  END $$;
  DO $$ BEGIN
   IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum_insight_entries_category'
   ) AND NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum_insight_entries_type'
   ) THEN
    ALTER TYPE "public"."enum_insight_entries_category" RENAME TO "enum_insight_entries_type";
   END IF;
  END $$;
  DO $$ BEGIN
   IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum__insight_entries_v_version_category'
   ) AND NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum__insight_entries_v_version_type'
   ) THEN
    ALTER TYPE "public"."enum__insight_entries_v_version_category" RENAME TO "enum__insight_entries_v_version_type";
   END IF;
  END $$;`)
}
