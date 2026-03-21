-- =============================================================================
-- Migration: Tier 4 features — workflow fields
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
-- Note: _site_pages_v does not exist yet; run the follow-up below once it does.

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

-- ─── 3. Indexes for workflow status lookups ─────────────────────────────────

CREATE INDEX IF NOT EXISTS site_pages_workflow_status_idx ON site_pages (workflow_status);
CREATE INDEX IF NOT EXISTS blog_posts_workflow_status_idx ON blog_posts (workflow_status);
CREATE INDEX IF NOT EXISTS service_items_workflow_status_idx ON service_items (workflow_status);
CREATE INDEX IF NOT EXISTS testimonials_workflow_status_idx ON testimonials (workflow_status);

-- ─── Follow-up: run once _site_pages_v exists ───────────────────────────────
-- ALTER TABLE _site_pages_v
--   ADD COLUMN IF NOT EXISTS version_workflow_status varchar DEFAULT 'draft',
--   ADD COLUMN IF NOT EXISTS version_approved_by_id integer REFERENCES users(id) ON DELETE SET NULL,
--   ADD COLUMN IF NOT EXISTS version_approved_at timestamptz,
--   ADD COLUMN IF NOT EXISTS version_rejection_reason text;
