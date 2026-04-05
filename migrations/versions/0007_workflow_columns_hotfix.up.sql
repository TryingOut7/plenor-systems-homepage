-- =============================================================================
-- Hotfix: Backfill missing workflow columns on non-site_pages collections
-- =============================================================================
--
-- Why this exists:
-- - Current schema shows workflow columns on `site_pages` only.
-- - Admin list views for collections that define workflow fields but lack
--   matching DB columns can fail to render (white screen).
--
-- Safe to run multiple times.

-- ─── 1. Main collection tables ───────────────────────────────────────────────

ALTER TABLE IF EXISTS blog_posts
  ADD COLUMN IF NOT EXISTS workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

ALTER TABLE IF EXISTS service_items
  ADD COLUMN IF NOT EXISTS workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

ALTER TABLE IF EXISTS testimonials
  ADD COLUMN IF NOT EXISTS workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

ALTER TABLE IF EXISTS reuse_sec
  ADD COLUMN IF NOT EXISTS workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- ─── 2. Version tables (only if they exist) ─────────────────────────────────

ALTER TABLE IF EXISTS _blog_posts_v
  ADD COLUMN IF NOT EXISTS version_workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS version_approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS version_rejection_reason text;

ALTER TABLE IF EXISTS _service_items_v
  ADD COLUMN IF NOT EXISTS version_workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS version_approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS version_rejection_reason text;

ALTER TABLE IF EXISTS _testimonials_v
  ADD COLUMN IF NOT EXISTS version_workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS version_approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS version_rejection_reason text;

ALTER TABLE IF EXISTS _reuse_sec_v
  ADD COLUMN IF NOT EXISTS version_workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS version_approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS version_rejection_reason text;

-- ─── 3. Indexes ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS blog_posts_workflow_status_idx ON blog_posts (workflow_status);
CREATE INDEX IF NOT EXISTS service_items_workflow_status_idx ON service_items (workflow_status);
CREATE INDEX IF NOT EXISTS testimonials_workflow_status_idx ON testimonials (workflow_status);
CREATE INDEX IF NOT EXISTS reuse_sec_workflow_status_idx ON reuse_sec (workflow_status);
