-- =============================================================================
-- Migration: Tier 4 features — workflow, locale, alternate locales
-- Run this in the Supabase SQL Editor.
-- =============================================================================

-- ─── 1. Workflow fields on main tables ──────────────────────────────────────

ALTER TABLE site_pages
  ADD COLUMN IF NOT EXISTS workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

ALTER TABLE service_items
  ADD COLUMN IF NOT EXISTS workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

ALTER TABLE testimonials
  ADD COLUMN IF NOT EXISTS workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- ─── 2. Workflow fields on version tables ───────────────────────────────────

ALTER TABLE _site_pages_v
  ADD COLUMN IF NOT EXISTS version_workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS version_approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS version_rejection_reason text;

ALTER TABLE _blog_posts_v
  ADD COLUMN IF NOT EXISTS version_workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS version_approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS version_rejection_reason text;

ALTER TABLE _service_items_v
  ADD COLUMN IF NOT EXISTS version_workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS version_approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS version_rejection_reason text;

ALTER TABLE _testimonials_v
  ADD COLUMN IF NOT EXISTS version_workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS version_approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS version_rejection_reason text;

-- ─── 3. Locale fields on site_pages ─────────────────────────────────────────

ALTER TABLE site_pages
  ADD COLUMN IF NOT EXISTS locale varchar DEFAULT 'en';

ALTER TABLE _site_pages_v
  ADD COLUMN IF NOT EXISTS version_locale varchar DEFAULT 'en';

-- ─── 4. Alternate locales array table (site_pages) ─────────────────────────

CREATE TABLE IF NOT EXISTS site_pages_alternate_locales (
  id serial PRIMARY KEY,
  _order integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES site_pages(id) ON DELETE CASCADE,
  locale varchar NOT NULL,
  url varchar NOT NULL
);

CREATE INDEX IF NOT EXISTS site_pages_alternate_locales_order_parent_idx
  ON site_pages_alternate_locales (_order, _parent_id);

-- ─── 5. Alternate locales array table (version) ────────────────────────────

CREATE TABLE IF NOT EXISTS _site_pages_v_version_alternate_locales (
  id serial PRIMARY KEY,
  _order integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES _site_pages_v(id) ON DELETE CASCADE,
  locale varchar NOT NULL,
  url varchar NOT NULL
);

CREATE INDEX IF NOT EXISTS _site_pages_v_version_alternate_locales_order_parent_idx
  ON _site_pages_v_version_alternate_locales (_order, _parent_id);

-- ─── 6. Indexes for workflow status lookups ─────────────────────────────────

CREATE INDEX IF NOT EXISTS site_pages_workflow_status_idx ON site_pages (workflow_status);
CREATE INDEX IF NOT EXISTS blog_posts_workflow_status_idx ON blog_posts (workflow_status);
CREATE INDEX IF NOT EXISTS service_items_workflow_status_idx ON service_items (workflow_status);
CREATE INDEX IF NOT EXISTS testimonials_workflow_status_idx ON testimonials (workflow_status);
