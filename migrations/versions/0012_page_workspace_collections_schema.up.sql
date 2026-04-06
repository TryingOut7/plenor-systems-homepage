-- Page workspace collections schema (live/drafts/presets/playground support).
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS public.page_drafts (
  id serial PRIMARY KEY,
  title varchar NOT NULL,
  target_slug varchar NOT NULL,
  source_type varchar NOT NULL DEFAULT 'blank',
  source_page_id integer,
  source_preset_id integer,
  source_playground_id integer,
  editor_notes text,
  created_by_id integer,
  workflow_status varchar DEFAULT 'draft',
  review_checklist_complete boolean DEFAULT false,
  review_summary text,
  reviewed_by_id integer,
  reviewed_at timestamptz,
  approved_by_id integer,
  approved_at timestamptz,
  rejection_reason text,
  seo_meta_title varchar,
  seo_meta_description varchar,
  seo_og_title varchar,
  seo_og_description varchar,
  seo_og_image_id integer,
  seo_canonical_url varchar,
  seo_noindex boolean DEFAULT false,
  seo_nofollow boolean DEFAULT false,
  seo_include_in_sitemap boolean DEFAULT true,
  meta_title varchar,
  meta_description varchar,
  meta_image_id integer,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.page_presets (
  id serial PRIMARY KEY,
  name varchar NOT NULL,
  category varchar NOT NULL DEFAULT 'custom',
  description text,
  thumbnail_id integer,
  structure_mode varchar NOT NULL DEFAULT 'editable',
  source_type varchar NOT NULL DEFAULT 'manual',
  source_live_page_id integer,
  source_draft_id integer,
  created_from_snapshot_at timestamptz,
  created_by_id integer,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.page_playgrounds (
  id serial PRIMARY KEY,
  name varchar NOT NULL,
  visibility varchar DEFAULT 'private',
  expires_at timestamptz,
  notes text,
  created_by_id integer,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.page_presets_tags (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id varchar NOT NULL,
  tag varchar
);

-- On fresh environments, Payload schema-push can pre-create these tables with
-- slightly different columns. Backfill missing columns so this migration remains
-- safe and repeatable before adding indexes/constraints.
ALTER TABLE IF EXISTS public.page_drafts
  ADD COLUMN IF NOT EXISTS title varchar,
  ADD COLUMN IF NOT EXISTS target_slug varchar,
  ADD COLUMN IF NOT EXISTS source_type varchar DEFAULT 'blank',
  ADD COLUMN IF NOT EXISTS source_page_id integer,
  ADD COLUMN IF NOT EXISTS source_preset_id integer,
  ADD COLUMN IF NOT EXISTS source_playground_id integer,
  ADD COLUMN IF NOT EXISTS editor_notes text,
  ADD COLUMN IF NOT EXISTS created_by_id integer,
  ADD COLUMN IF NOT EXISTS workflow_status varchar DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS review_checklist_complete boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_summary text,
  ADD COLUMN IF NOT EXISTS reviewed_by_id integer,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by_id integer,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS seo_meta_title varchar,
  ADD COLUMN IF NOT EXISTS seo_meta_description varchar,
  ADD COLUMN IF NOT EXISTS seo_og_title varchar,
  ADD COLUMN IF NOT EXISTS seo_og_description varchar,
  ADD COLUMN IF NOT EXISTS seo_og_image_id integer,
  ADD COLUMN IF NOT EXISTS seo_canonical_url varchar,
  ADD COLUMN IF NOT EXISTS seo_noindex boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS seo_nofollow boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS seo_include_in_sitemap boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS meta_title varchar,
  ADD COLUMN IF NOT EXISTS meta_description varchar,
  ADD COLUMN IF NOT EXISTS meta_image_id integer,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE IF EXISTS public.page_presets
  ADD COLUMN IF NOT EXISTS name varchar,
  ADD COLUMN IF NOT EXISTS category varchar DEFAULT 'custom',
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS thumbnail_id integer,
  ADD COLUMN IF NOT EXISTS structure_mode varchar DEFAULT 'editable',
  ADD COLUMN IF NOT EXISTS source_type varchar DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_live_page_id integer,
  ADD COLUMN IF NOT EXISTS source_draft_id integer,
  ADD COLUMN IF NOT EXISTS created_from_snapshot_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_by_id integer,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE IF EXISTS public.page_playgrounds
  ADD COLUMN IF NOT EXISTS name varchar,
  ADD COLUMN IF NOT EXISTS visibility varchar DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS created_by_id integer,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE IF EXISTS public.page_presets_tags
  ADD COLUMN IF NOT EXISTS _order integer,
  ADD COLUMN IF NOT EXISTS _parent_id integer,
  ADD COLUMN IF NOT EXISTS id varchar,
  ADD COLUMN IF NOT EXISTS tag varchar;

CREATE INDEX IF NOT EXISTS page_drafts_created_at_idx ON public.page_drafts(created_at);
CREATE INDEX IF NOT EXISTS page_drafts_updated_at_idx ON public.page_drafts(updated_at);
CREATE INDEX IF NOT EXISTS page_drafts_deleted_at_idx ON public.page_drafts(deleted_at);
CREATE INDEX IF NOT EXISTS page_drafts_workflow_status_idx ON public.page_drafts(workflow_status);
CREATE INDEX IF NOT EXISTS page_drafts_target_slug_idx ON public.page_drafts(target_slug);

CREATE INDEX IF NOT EXISTS page_presets_created_at_idx ON public.page_presets(created_at);
CREATE INDEX IF NOT EXISTS page_presets_updated_at_idx ON public.page_presets(updated_at);
CREATE INDEX IF NOT EXISTS page_presets_deleted_at_idx ON public.page_presets(deleted_at);
CREATE INDEX IF NOT EXISTS page_presets_category_idx ON public.page_presets(category);
CREATE INDEX IF NOT EXISTS page_presets_source_type_idx ON public.page_presets(source_type);

CREATE INDEX IF NOT EXISTS page_playgrounds_created_at_idx ON public.page_playgrounds(created_at);
CREATE INDEX IF NOT EXISTS page_playgrounds_updated_at_idx ON public.page_playgrounds(updated_at);
CREATE INDEX IF NOT EXISTS page_playgrounds_deleted_at_idx ON public.page_playgrounds(deleted_at);
CREATE INDEX IF NOT EXISTS page_playgrounds_visibility_idx ON public.page_playgrounds(visibility);

CREATE INDEX IF NOT EXISTS page_presets_tags_order_idx ON public.page_presets_tags(_order);
CREATE INDEX IF NOT EXISTS page_presets_tags_parent_id_idx ON public.page_presets_tags(_parent_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'page_drafts_created_by_id_fkey') THEN
    ALTER TABLE public.page_drafts
      ADD CONSTRAINT page_drafts_created_by_id_fkey
      FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'page_presets_created_by_id_fkey') THEN
    ALTER TABLE public.page_presets
      ADD CONSTRAINT page_presets_created_by_id_fkey
      FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'page_playgrounds_created_by_id_fkey') THEN
    ALTER TABLE public.page_playgrounds
      ADD CONSTRAINT page_playgrounds_created_by_id_fkey
      FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'page_drafts_reviewed_by_id_users_id_fk') THEN
    ALTER TABLE public.page_drafts
      ADD CONSTRAINT page_drafts_reviewed_by_id_users_id_fk
      FOREIGN KEY (reviewed_by_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'page_drafts_approved_by_id_users_id_fk') THEN
    ALTER TABLE public.page_drafts
      ADD CONSTRAINT page_drafts_approved_by_id_users_id_fk
      FOREIGN KEY (approved_by_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'page_drafts_source_page_id_site_pages_id_fk') THEN
    ALTER TABLE public.page_drafts
      ADD CONSTRAINT page_drafts_source_page_id_site_pages_id_fk
      FOREIGN KEY (source_page_id) REFERENCES public.site_pages(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'page_drafts_source_preset_id_page_presets_id_fk') THEN
    ALTER TABLE public.page_drafts
      ADD CONSTRAINT page_drafts_source_preset_id_page_presets_id_fk
      FOREIGN KEY (source_preset_id) REFERENCES public.page_presets(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'page_drafts_source_playground_id_page_playgrounds_id_fk') THEN
    ALTER TABLE public.page_drafts
      ADD CONSTRAINT page_drafts_source_playground_id_page_playgrounds_id_fk
      FOREIGN KEY (source_playground_id) REFERENCES public.page_playgrounds(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'page_presets_thumbnail_id_media_id_fk') THEN
    ALTER TABLE public.page_presets
      ADD CONSTRAINT page_presets_thumbnail_id_media_id_fk
      FOREIGN KEY (thumbnail_id) REFERENCES public.media(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'page_presets_source_live_page_id_site_pages_id_fk') THEN
    ALTER TABLE public.page_presets
      ADD CONSTRAINT page_presets_source_live_page_id_site_pages_id_fk
      FOREIGN KEY (source_live_page_id) REFERENCES public.site_pages(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'page_presets_source_draft_id_page_drafts_id_fk') THEN
    ALTER TABLE public.page_presets
      ADD CONSTRAINT page_presets_source_draft_id_page_drafts_id_fk
      FOREIGN KEY (source_draft_id) REFERENCES public.page_drafts(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'page_presets_tags_parent_id_fk') THEN
    ALTER TABLE public.page_presets_tags
      ADD CONSTRAINT page_presets_tags_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES public.page_presets(id) ON DELETE CASCADE;
  END IF;
END $$;
