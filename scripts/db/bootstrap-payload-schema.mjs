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

CREATE TABLE IF NOT EXISTS public.users_sessions (
  _order      integer           NOT NULL DEFAULT 0,
  _parent_id  integer           NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  id          character varying PRIMARY KEY,
  created_at  timestamptz       NOT NULL DEFAULT now(),
  expires_at  timestamptz       NOT NULL
);

CREATE INDEX IF NOT EXISTS users_sessions_parent_order_idx
  ON public.users_sessions (_parent_id, _order);

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

async function main() {
  await withDatabaseClient(async (client) => {
    await client.query(STUBS_SQL);
  });

  console.log('✓ Payload schema bootstrap complete (all core table stubs ensured).');
}

main().catch((error) => {
  console.error(
    `Bootstrap failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
