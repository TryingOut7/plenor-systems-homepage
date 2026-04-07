/**
 * Fresh-DB bootstrap: create minimal table stubs for all tables that backend
 * and Payload migrations assume already exist (written against a dev-push DB).
 *
 * On an existing DB all stubs are no-ops (CREATE TABLE IF NOT EXISTS).
 * On a fresh DB this ensures that:
 *   - Backend migrations can ALTER tables without failing on "table does not exist"
 *   - Payload migrations can ALTER tables without failing on fresh Postgres containers
 *   - Payload internal tables (payload_locked_documents_rels, etc.) are present
 *     before backend migration 0013 tries to ALTER them
 *
 * Run this BEFORE migrate.mjs and payload migrate.
 */

import { withDatabaseClient } from './migration-lib.mjs';
import {
  SCHEMA_ENUM_MANIFEST,
} from './schema-manifest.mjs';

const STUBS_SQL = `
-- ─── Payload internal tables ─────────────────────────────────────────────────
-- These must exist before backend migration 0013 ALTERs payload_locked_documents_rels.

CREATE TABLE IF NOT EXISTS public.payload_migrations (
  id          serial      PRIMARY KEY,
  name        varchar,
  batch       integer,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payload_preferences (
  id          serial      PRIMARY KEY,
  key         varchar,
  value       jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payload_locked_documents (
  id           serial      PRIMARY KEY,
  global_slug  varchar,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payload_locked_documents_rels (
  id         serial  PRIMARY KEY,
  "order"    integer,
  parent_id  integer REFERENCES public.payload_locked_documents(id) ON DELETE CASCADE,
  path       varchar NOT NULL
);

-- ─── Auth / core collections ──────────────────────────────────────────────────
-- users must exist first because many tables have FK → users(id).

CREATE TABLE IF NOT EXISTS public.users (
  id          serial      PRIMARY KEY,
  email       varchar     NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON public.users (email);

-- ─── Media ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.media (
  id          serial      PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Content collections ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.site_pages (
  id          serial      PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public._site_pages_v (
  id          serial      PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_items (
  id          serial      PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public._service_items_v (
  id          serial      PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id          serial      PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public._blog_posts_v (
  id          serial      PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id          serial      PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public._testimonials_v (
  id          serial      PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reuse_sec (
  id          serial      PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public._reuse_sec_v (
  id          serial      PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.redirect_rules (
  id          serial      PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          serial      PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Plugin / form collections ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.forms (
  id          serial      PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_templates (
  id          serial      PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Block tables (ALTERed by backend migrations) ────────────────────────────

CREATE TABLE IF NOT EXISTS public.hero (
  id          serial      PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS public.img_sec (
  id          serial      PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS public.img_sec_images (
  id          serial      PRIMARY KEY
);
`;

const SUPPLEMENTAL_STUBS_SQL = `
-- Additional stubs for environments that have only partial historical CMS schema.

CREATE TABLE IF NOT EXISTS public.ui_settings (
  id          serial      PRIMARY KEY,
  _status     character varying DEFAULT 'draft',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public._ui_settings_v (
  id              serial      PRIMARY KEY,
  version__status character varying DEFAULT 'draft',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  latest          boolean
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id          serial      PRIMARY KEY,
  _status     character varying DEFAULT 'draft',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public._site_settings_v (
  id              serial      PRIMARY KEY,
  version__status character varying DEFAULT 'draft',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  latest          boolean
);

CREATE TABLE IF NOT EXISTS public.site_settings_navigation_links (
  _order     integer NOT NULL DEFAULT 0,
  _parent_id integer NOT NULL DEFAULT 1,
  id         character varying PRIMARY KEY,
  label      character varying,
  href       character varying,
  is_visible boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public._site_settings_v_version_navigation_links (
  _order     integer NOT NULL DEFAULT 0,
  _parent_id integer NOT NULL DEFAULT 1,
  id         integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  label      character varying,
  href       character varying,
  is_visible boolean DEFAULT true,
  _uuid      character varying
);

CREATE TABLE IF NOT EXISTS public.nav_children (
  _order     integer NOT NULL DEFAULT 0,
  _parent_id character varying NOT NULL DEFAULT '',
  id         character varying PRIMARY KEY,
  label      character varying,
  href       character varying
);

CREATE TABLE IF NOT EXISTS public._nav_children_v (
  _order     integer NOT NULL DEFAULT 0,
  _parent_id integer NOT NULL DEFAULT 1,
  id         integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  label      character varying,
  href       character varying,
  _uuid      character varying
);

CREATE TABLE IF NOT EXISTS public.form_submissions (
  id          serial      PRIMARY KEY,
  form_id     integer,
  form_type   character varying,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.richtext (
  _order     integer NOT NULL DEFAULT 0,
  _parent_id integer NOT NULL DEFAULT 0,
  _path      text NOT NULL DEFAULT '',
  id         character varying PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS public.cta (
  _order     integer NOT NULL DEFAULT 0,
  _parent_id integer NOT NULL DEFAULT 0,
  _path      text NOT NULL DEFAULT '',
  id         character varying PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS public.privacy_note (
  _order     integer NOT NULL DEFAULT 0,
  _parent_id integer NOT NULL DEFAULT 0,
  _path      text NOT NULL DEFAULT '',
  id         character varying PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS public.vid_sec (
  _order     integer NOT NULL DEFAULT 0,
  _parent_id integer NOT NULL DEFAULT 0,
  _path      text NOT NULL DEFAULT '',
  id         character varying PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS public.simple_table (
  _order     integer NOT NULL DEFAULT 0,
  _parent_id integer NOT NULL DEFAULT 0,
  _path      text NOT NULL DEFAULT '',
  id         character varying PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS public.cmp_table (
  _order     integer NOT NULL DEFAULT 0,
  _parent_id integer NOT NULL DEFAULT 0,
  _path      text NOT NULL DEFAULT '',
  id         character varying PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS public.dyn_list (
  _order     integer NOT NULL DEFAULT 0,
  _parent_id integer NOT NULL DEFAULT 0,
  _path      text NOT NULL DEFAULT '',
  id         character varying PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS public.reuse_sec_ref (
  _order     integer NOT NULL DEFAULT 0,
  _parent_id integer NOT NULL DEFAULT 0,
  _path      text NOT NULL DEFAULT '',
  id         character varying PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS public.divider (
  _order     integer NOT NULL DEFAULT 0,
  _parent_id integer NOT NULL DEFAULT 0,
  _path      text NOT NULL DEFAULT '',
  id         character varying PRIMARY KEY
);
`;

function quoteIdentifier(value) {
  return `"${value.replace(/"/g, '""')}"`;
}

function quoteLiteral(value) {
  return `'${value.replace(/'/g, "''")}'`;
}

function parseQualifiedTypeName(typeName) {
  const [schema, ...rest] = typeName.split('.');
  if (!schema || rest.length === 0) {
    throw new Error(`Invalid enum type name in manifest: ${typeName}`);
  }

  return {
    schema,
    name: rest.join('.'),
  };
}

async function ensureEnumTypes(client) {
  for (const [qualifiedTypeName, labels] of Object.entries(SCHEMA_ENUM_MANIFEST)) {
    const { schema, name } = parseQualifiedTypeName(qualifiedTypeName);
    const qualifiedTypeIdentifier = `${quoteIdentifier(schema)}.${quoteIdentifier(name)}`;
    const enumValuesSql = labels.map((label) => quoteLiteral(label)).join(', ');

    await client.query(`
DO $$
BEGIN
  CREATE TYPE ${qualifiedTypeIdentifier} AS ENUM (${enumValuesSql});
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;
    `);

    for (const label of labels) {
      await client.query(
        `ALTER TYPE ${qualifiedTypeIdentifier} ADD VALUE IF NOT EXISTS ${quoteLiteral(label)};`,
      );
    }
  }
}

async function main() {
  await withDatabaseClient(async (client) => {
    await client.query(STUBS_SQL);
    await client.query(SUPPLEMENTAL_STUBS_SQL);
    await ensureEnumTypes(client);
  });

  console.log('✓ Payload schema bootstrap complete (all core table stubs ensured).');
}

main().catch((error) => {
  console.error(
    `Bootstrap failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
