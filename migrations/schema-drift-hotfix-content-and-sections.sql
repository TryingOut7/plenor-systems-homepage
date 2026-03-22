-- Hotfix: align Supabase schema with current Payload config for
-- new content collections, section blocks, and section-common fields.
-- Safe to run multiple times.

BEGIN;

-- ---------------------------------------------------------------------------
-- New content collections
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blog_categories (
  id serial PRIMARY KEY,
  name varchar NOT NULL,
  slug varchar NOT NULL,
  description varchar,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS blog_categories_slug_idx ON blog_categories (slug);
CREATE INDEX IF NOT EXISTS blog_categories_updated_at_idx ON blog_categories (updated_at);
CREATE INDEX IF NOT EXISTS blog_categories_created_at_idx ON blog_categories (created_at);

CREATE TABLE IF NOT EXISTS team_members (
  id serial PRIMARY KEY,
  name varchar NOT NULL,
  role varchar NOT NULL,
  bio varchar,
  photo_id integer,
  linkedin_href varchar,
  twitter_href varchar,
  "order" numeric DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS team_members_photo_idx ON team_members (photo_id);
CREATE INDEX IF NOT EXISTS team_members_updated_at_idx ON team_members (updated_at);
CREATE INDEX IF NOT EXISTS team_members_created_at_idx ON team_members (created_at);

CREATE TABLE IF NOT EXISTS logos (
  id serial PRIMARY KEY,
  name varchar NOT NULL,
  image_id integer NOT NULL,
  href varchar,
  "order" numeric DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS logos_image_idx ON logos (image_id);
CREATE INDEX IF NOT EXISTS logos_updated_at_idx ON logos (updated_at);
CREATE INDEX IF NOT EXISTS logos_created_at_idx ON logos (created_at);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'team_members_photo_id_media_id_fk'
  ) THEN
    ALTER TABLE team_members
      ADD CONSTRAINT team_members_photo_id_media_id_fk
      FOREIGN KEY (photo_id) REFERENCES media(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'logos_image_id_media_id_fk'
  ) THEN
    ALTER TABLE logos
      ADD CONSTRAINT logos_image_id_media_id_fk
      FOREIGN KEY (image_id) REFERENCES media(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Existing collection drift
-- ---------------------------------------------------------------------------
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS category_id integer;

CREATE INDEX IF NOT EXISTS blog_posts_category_idx ON blog_posts (category_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_category_id_blog_categories_id_fk'
  ) THEN
    ALTER TABLE blog_posts
      ADD CONSTRAINT blog_posts_category_id_blog_categories_id_fk
      FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Payload lock relations need new collection columns
ALTER TABLE payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS blog_categories_id integer,
  ADD COLUMN IF NOT EXISTS team_members_id integer,
  ADD COLUMN IF NOT EXISTS logos_id integer;

CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_blog_categories_id_idx
  ON payload_locked_documents_rels (blog_categories_id);
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_team_members_id_idx
  ON payload_locked_documents_rels (team_members_id);
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_logos_id_idx
  ON payload_locked_documents_rels (logos_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_blog_categories_fk'
  ) THEN
    ALTER TABLE payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_blog_categories_fk
      FOREIGN KEY (blog_categories_id) REFERENCES blog_categories(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_team_members_fk'
  ) THEN
    ALTER TABLE payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_team_members_fk
      FOREIGN KEY (team_members_id) REFERENCES team_members(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_logos_fk'
  ) THEN
    ALTER TABLE payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_logos_fk
      FOREIGN KEY (logos_id) REFERENCES logos(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Enums for section-common fields (all section block tables)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'hero',
    'richtext',
    'cta',
    'guide_form',
    'inquiry_form',
    'privacy_note',
    'img_sec',
    'vid_sec',
    'simple_table',
    'cmp_table',
    'dyn_list',
    'legacy_hero',
    'legacy_narrative',
    'legacy_stage',
    'legacy_audience',
    'legacy_checklist',
    'legacy_quote',
    'legacy_cta',
    'reuse_sec_ref',
    'divider',
    'stats_sec',
    'faq_sec',
    'feat_grid',
    'form_sec',
    'team_sec',
    'logo_band',
    'quote_sec',
    'tabs_sec',
    'split_sec'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_type WHERE typname = format('enum_%s_heading_size', tbl)
    ) THEN
      EXECUTE format(
        'CREATE TYPE %I AS ENUM (''xs'', ''sm'', ''md'', ''lg'', ''xl'')',
        format('enum_%s_heading_size', tbl)
      );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_type WHERE typname = format('enum_%s_text_align', tbl)
    ) THEN
      EXECUTE format(
        'CREATE TYPE %I AS ENUM (''left'', ''center'', ''right'')',
        format('enum_%s_text_align', tbl)
      );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_type WHERE typname = format('enum_%s_heading_tag', tbl)
    ) THEN
      EXECUTE format(
        'CREATE TYPE %I AS ENUM (''h1'', ''h2'', ''h3'', ''h4'')',
        format('enum_%s_heading_tag', tbl)
      );
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Enums for new block tables and newly-added select fields
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'stats_sec',
    'faq_sec',
    'feat_grid',
    'form_sec',
    'team_sec',
    'logo_band',
    'quote_sec',
    'tabs_sec',
    'split_sec'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_type WHERE typname = format('enum_%s_theme', tbl)
    ) THEN
      EXECUTE format(
        'CREATE TYPE %I AS ENUM (''navy'', ''charcoal'', ''black'', ''white'', ''light'')',
        format('enum_%s_theme', tbl)
      );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_type WHERE typname = format('enum_%s_size', tbl)
    ) THEN
      EXECUTE format(
        'CREATE TYPE %I AS ENUM (''compact'', ''regular'', ''spacious'')',
        format('enum_%s_size', tbl)
      );
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_hero_text_alignment') THEN
    CREATE TYPE enum_hero_text_alignment AS ENUM ('left', 'center', 'right');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_img_sec_aspect_ratio') THEN
    CREATE TYPE enum_img_sec_aspect_ratio AS ENUM ('auto', 'square', 'landscape', 'portrait');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_feat_grid_columns') THEN
    CREATE TYPE enum_feat_grid_columns AS ENUM ('2', '3', '4');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_team_sec_columns') THEN
    CREATE TYPE enum_team_sec_columns AS ENUM ('2', '3', '4');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_logo_band_display_mode') THEN
    CREATE TYPE enum_logo_band_display_mode AS ENUM ('static', 'marquee');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_quote_sec_style') THEN
    CREATE TYPE enum_quote_sec_style AS ENUM ('centered', 'left-border', 'pull');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_split_sec_layout') THEN
    CREATE TYPE enum_split_sec_layout AS ENUM ('60-40', '50-50', '40-60');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_split_sec_vertical_align') THEN
    CREATE TYPE enum_split_sec_vertical_align AS ENUM ('top', 'center', 'bottom');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_split_sec_left_type') THEN
    CREATE TYPE enum_split_sec_left_type AS ENUM ('richText', 'image', 'video');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_split_sec_right_type') THEN
    CREATE TYPE enum_split_sec_right_type AS ENUM ('richText', 'image', 'video');
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Existing block table drift
-- ---------------------------------------------------------------------------
ALTER TABLE hero
  ADD COLUMN IF NOT EXISTS secondary_cta_label varchar,
  ADD COLUMN IF NOT EXISTS secondary_cta_href varchar,
  ADD COLUMN IF NOT EXISTS background_image_id integer,
  ADD COLUMN IF NOT EXISTS background_video varchar,
  ADD COLUMN IF NOT EXISTS text_alignment enum_hero_text_alignment DEFAULT 'center',
  ADD COLUMN IF NOT EXISTS min_height numeric;

CREATE INDEX IF NOT EXISTS hero_background_image_idx ON hero (background_image_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'hero_background_image_id_media_id_fk'
  ) THEN
    ALTER TABLE hero
      ADD CONSTRAINT hero_background_image_id_media_id_fk
      FOREIGN KEY (background_image_id) REFERENCES media(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE img_sec
  ADD COLUMN IF NOT EXISTS aspect_ratio enum_img_sec_aspect_ratio DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS grid_columns numeric DEFAULT 3;

ALTER TABLE img_sec_images
  ADD COLUMN IF NOT EXISTS alt_override varchar,
  ADD COLUMN IF NOT EXISTS caption varchar,
  ADD COLUMN IF NOT EXISTS link_href varchar;

-- ---------------------------------------------------------------------------
-- New section block tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stats_sec (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id varchar NOT NULL,
  theme enum_stats_sec_theme DEFAULT 'white',
  size enum_stats_sec_size DEFAULT 'regular',
  anchor_id varchar,
  custom_class_name varchar,
  background_color varchar,
  is_hidden boolean DEFAULT false,
  visible_from timestamptz,
  visible_until timestamptz,
  heading_size enum_stats_sec_heading_size,
  text_align enum_stats_sec_text_align,
  heading_tag enum_stats_sec_heading_tag,
  heading varchar,
  subheading varchar,
  block_name varchar,
  CONSTRAINT stats_sec_pkey PRIMARY KEY (id),
  CONSTRAINT stats_sec_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS stats_sec_order_idx ON stats_sec (_order);
CREATE INDEX IF NOT EXISTS stats_sec_parent_id_idx ON stats_sec (_parent_id);
CREATE INDEX IF NOT EXISTS stats_sec_path_idx ON stats_sec (_path);

CREATE TABLE IF NOT EXISTS stats_items (
  _order integer NOT NULL,
  _parent_id varchar NOT NULL,
  id varchar NOT NULL,
  value varchar NOT NULL,
  label varchar NOT NULL,
  description varchar,
  CONSTRAINT stats_items_pkey PRIMARY KEY (id),
  CONSTRAINT stats_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES stats_sec(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS stats_items_order_idx ON stats_items (_order);
CREATE INDEX IF NOT EXISTS stats_items_parent_id_idx ON stats_items (_parent_id);

CREATE TABLE IF NOT EXISTS faq_sec (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id varchar NOT NULL,
  theme enum_faq_sec_theme DEFAULT 'white',
  size enum_faq_sec_size DEFAULT 'regular',
  anchor_id varchar,
  custom_class_name varchar,
  background_color varchar,
  is_hidden boolean DEFAULT false,
  visible_from timestamptz,
  visible_until timestamptz,
  heading_size enum_faq_sec_heading_size,
  text_align enum_faq_sec_text_align,
  heading_tag enum_faq_sec_heading_tag,
  heading varchar,
  subheading varchar,
  block_name varchar,
  CONSTRAINT faq_sec_pkey PRIMARY KEY (id),
  CONSTRAINT faq_sec_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS faq_sec_order_idx ON faq_sec (_order);
CREATE INDEX IF NOT EXISTS faq_sec_parent_id_idx ON faq_sec (_parent_id);
CREATE INDEX IF NOT EXISTS faq_sec_path_idx ON faq_sec (_path);

CREATE TABLE IF NOT EXISTS faq_items (
  _order integer NOT NULL,
  _parent_id varchar NOT NULL,
  id varchar NOT NULL,
  question varchar NOT NULL,
  answer varchar NOT NULL,
  CONSTRAINT faq_items_pkey PRIMARY KEY (id),
  CONSTRAINT faq_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES faq_sec(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS faq_items_order_idx ON faq_items (_order);
CREATE INDEX IF NOT EXISTS faq_items_parent_id_idx ON faq_items (_parent_id);

CREATE TABLE IF NOT EXISTS feat_grid (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id varchar NOT NULL,
  theme enum_feat_grid_theme DEFAULT 'white',
  size enum_feat_grid_size DEFAULT 'regular',
  anchor_id varchar,
  custom_class_name varchar,
  background_color varchar,
  is_hidden boolean DEFAULT false,
  visible_from timestamptz,
  visible_until timestamptz,
  heading_size enum_feat_grid_heading_size,
  text_align enum_feat_grid_text_align,
  heading_tag enum_feat_grid_heading_tag,
  heading varchar,
  subheading varchar,
  "columns" enum_feat_grid_columns DEFAULT '3',
  block_name varchar,
  CONSTRAINT feat_grid_pkey PRIMARY KEY (id),
  CONSTRAINT feat_grid_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS feat_grid_order_idx ON feat_grid (_order);
CREATE INDEX IF NOT EXISTS feat_grid_parent_id_idx ON feat_grid (_parent_id);
CREATE INDEX IF NOT EXISTS feat_grid_path_idx ON feat_grid (_path);

CREATE TABLE IF NOT EXISTS feat_items (
  _order integer NOT NULL,
  _parent_id varchar NOT NULL,
  id varchar NOT NULL,
  icon varchar,
  title varchar NOT NULL,
  description varchar NOT NULL,
  link_label varchar,
  link_href varchar,
  CONSTRAINT feat_items_pkey PRIMARY KEY (id),
  CONSTRAINT feat_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES feat_grid(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS feat_items_order_idx ON feat_items (_order);
CREATE INDEX IF NOT EXISTS feat_items_parent_id_idx ON feat_items (_parent_id);

CREATE TABLE IF NOT EXISTS form_sec (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id varchar NOT NULL,
  theme enum_form_sec_theme DEFAULT 'white',
  size enum_form_sec_size DEFAULT 'regular',
  anchor_id varchar,
  custom_class_name varchar,
  background_color varchar,
  is_hidden boolean DEFAULT false,
  visible_from timestamptz,
  visible_until timestamptz,
  heading_size enum_form_sec_heading_size,
  text_align enum_form_sec_text_align,
  heading_tag enum_form_sec_heading_tag,
  heading varchar,
  subheading varchar,
  form_id integer,
  success_message varchar,
  block_name varchar,
  CONSTRAINT form_sec_pkey PRIMARY KEY (id),
  CONSTRAINT form_sec_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE,
  CONSTRAINT form_sec_form_id_forms_id_fk FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS form_sec_order_idx ON form_sec (_order);
CREATE INDEX IF NOT EXISTS form_sec_parent_id_idx ON form_sec (_parent_id);
CREATE INDEX IF NOT EXISTS form_sec_path_idx ON form_sec (_path);
CREATE INDEX IF NOT EXISTS form_sec_form_idx ON form_sec (form_id);

CREATE TABLE IF NOT EXISTS team_sec (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id varchar NOT NULL,
  theme enum_team_sec_theme DEFAULT 'white',
  size enum_team_sec_size DEFAULT 'regular',
  anchor_id varchar,
  custom_class_name varchar,
  background_color varchar,
  is_hidden boolean DEFAULT false,
  visible_from timestamptz,
  visible_until timestamptz,
  heading_size enum_team_sec_heading_size,
  text_align enum_team_sec_text_align,
  heading_tag enum_team_sec_heading_tag,
  heading varchar,
  subheading varchar,
  "columns" enum_team_sec_columns DEFAULT '3',
  block_name varchar,
  CONSTRAINT team_sec_pkey PRIMARY KEY (id),
  CONSTRAINT team_sec_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS team_sec_order_idx ON team_sec (_order);
CREATE INDEX IF NOT EXISTS team_sec_parent_id_idx ON team_sec (_parent_id);
CREATE INDEX IF NOT EXISTS team_sec_path_idx ON team_sec (_path);

CREATE TABLE IF NOT EXISTS team_sec_rels (
  id serial PRIMARY KEY,
  "order" integer,
  parent_id varchar NOT NULL,
  path varchar NOT NULL,
  team_members_id integer,
  CONSTRAINT team_sec_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES team_sec(id) ON DELETE CASCADE,
  CONSTRAINT team_sec_rels_team_members_fk FOREIGN KEY (team_members_id) REFERENCES team_members(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS team_sec_rels_order_idx ON team_sec_rels ("order");
CREATE INDEX IF NOT EXISTS team_sec_rels_parent_idx ON team_sec_rels (parent_id);
CREATE INDEX IF NOT EXISTS team_sec_rels_path_idx ON team_sec_rels (path);
CREATE INDEX IF NOT EXISTS team_sec_rels_team_members_id_idx ON team_sec_rels (team_members_id);

CREATE TABLE IF NOT EXISTS logo_band (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id varchar NOT NULL,
  theme enum_logo_band_theme DEFAULT 'white',
  size enum_logo_band_size DEFAULT 'regular',
  anchor_id varchar,
  custom_class_name varchar,
  background_color varchar,
  is_hidden boolean DEFAULT false,
  visible_from timestamptz,
  visible_until timestamptz,
  heading_size enum_logo_band_heading_size,
  text_align enum_logo_band_text_align,
  heading_tag enum_logo_band_heading_tag,
  heading varchar,
  display_mode enum_logo_band_display_mode DEFAULT 'static',
  logo_height numeric DEFAULT 40,
  block_name varchar,
  CONSTRAINT logo_band_pkey PRIMARY KEY (id),
  CONSTRAINT logo_band_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS logo_band_order_idx ON logo_band (_order);
CREATE INDEX IF NOT EXISTS logo_band_parent_id_idx ON logo_band (_parent_id);
CREATE INDEX IF NOT EXISTS logo_band_path_idx ON logo_band (_path);

CREATE TABLE IF NOT EXISTS logo_band_rels (
  id serial PRIMARY KEY,
  "order" integer,
  parent_id varchar NOT NULL,
  path varchar NOT NULL,
  logos_id integer,
  CONSTRAINT logo_band_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES logo_band(id) ON DELETE CASCADE,
  CONSTRAINT logo_band_rels_logos_fk FOREIGN KEY (logos_id) REFERENCES logos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS logo_band_rels_order_idx ON logo_band_rels ("order");
CREATE INDEX IF NOT EXISTS logo_band_rels_parent_idx ON logo_band_rels (parent_id);
CREATE INDEX IF NOT EXISTS logo_band_rels_path_idx ON logo_band_rels (path);
CREATE INDEX IF NOT EXISTS logo_band_rels_logos_id_idx ON logo_band_rels (logos_id);

CREATE TABLE IF NOT EXISTS quote_sec (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id varchar NOT NULL,
  theme enum_quote_sec_theme DEFAULT 'white',
  size enum_quote_sec_size DEFAULT 'regular',
  anchor_id varchar,
  custom_class_name varchar,
  background_color varchar,
  is_hidden boolean DEFAULT false,
  visible_from timestamptz,
  visible_until timestamptz,
  heading_size enum_quote_sec_heading_size,
  text_align enum_quote_sec_text_align,
  heading_tag enum_quote_sec_heading_tag,
  quote varchar NOT NULL,
  attribution varchar,
  attribution_role varchar,
  photo_id integer,
  style enum_quote_sec_style DEFAULT 'centered',
  block_name varchar,
  CONSTRAINT quote_sec_pkey PRIMARY KEY (id),
  CONSTRAINT quote_sec_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE,
  CONSTRAINT quote_sec_photo_id_media_id_fk FOREIGN KEY (photo_id) REFERENCES media(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS quote_sec_order_idx ON quote_sec (_order);
CREATE INDEX IF NOT EXISTS quote_sec_parent_id_idx ON quote_sec (_parent_id);
CREATE INDEX IF NOT EXISTS quote_sec_path_idx ON quote_sec (_path);
CREATE INDEX IF NOT EXISTS quote_sec_photo_idx ON quote_sec (photo_id);

CREATE TABLE IF NOT EXISTS tabs_sec (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id varchar NOT NULL,
  theme enum_tabs_sec_theme DEFAULT 'white',
  size enum_tabs_sec_size DEFAULT 'regular',
  anchor_id varchar,
  custom_class_name varchar,
  background_color varchar,
  is_hidden boolean DEFAULT false,
  visible_from timestamptz,
  visible_until timestamptz,
  heading_size enum_tabs_sec_heading_size,
  text_align enum_tabs_sec_text_align,
  heading_tag enum_tabs_sec_heading_tag,
  heading varchar,
  subheading varchar,
  block_name varchar,
  CONSTRAINT tabs_sec_pkey PRIMARY KEY (id),
  CONSTRAINT tabs_sec_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS tabs_sec_order_idx ON tabs_sec (_order);
CREATE INDEX IF NOT EXISTS tabs_sec_parent_id_idx ON tabs_sec (_parent_id);
CREATE INDEX IF NOT EXISTS tabs_sec_path_idx ON tabs_sec (_path);

CREATE TABLE IF NOT EXISTS tabs_items (
  _order integer NOT NULL,
  _parent_id varchar NOT NULL,
  id varchar NOT NULL,
  label varchar NOT NULL,
  heading varchar,
  body varchar,
  image_id integer,
  link_label varchar,
  link_href varchar,
  CONSTRAINT tabs_items_pkey PRIMARY KEY (id),
  CONSTRAINT tabs_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES tabs_sec(id) ON DELETE CASCADE,
  CONSTRAINT tabs_items_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES media(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS tabs_items_order_idx ON tabs_items (_order);
CREATE INDEX IF NOT EXISTS tabs_items_parent_id_idx ON tabs_items (_parent_id);
CREATE INDEX IF NOT EXISTS tabs_items_image_idx ON tabs_items (image_id);

CREATE TABLE IF NOT EXISTS split_sec (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id varchar NOT NULL,
  theme enum_split_sec_theme DEFAULT 'white',
  size enum_split_sec_size DEFAULT 'regular',
  anchor_id varchar,
  custom_class_name varchar,
  background_color varchar,
  is_hidden boolean DEFAULT false,
  visible_from timestamptz,
  visible_until timestamptz,
  heading_size enum_split_sec_heading_size,
  text_align enum_split_sec_text_align,
  heading_tag enum_split_sec_heading_tag,
  layout enum_split_sec_layout DEFAULT '50-50',
  reverse_on_mobile boolean DEFAULT false,
  vertical_align enum_split_sec_vertical_align DEFAULT 'center',
  left_type enum_split_sec_left_type DEFAULT 'richText',
  left_heading varchar,
  left_content jsonb,
  left_image_id integer,
  left_video_url varchar,
  left_cta_label varchar,
  left_cta_href varchar,
  right_type enum_split_sec_right_type DEFAULT 'image',
  right_heading varchar,
  right_content jsonb,
  right_image_id integer,
  right_video_url varchar,
  right_cta_label varchar,
  right_cta_href varchar,
  block_name varchar,
  CONSTRAINT split_sec_pkey PRIMARY KEY (id),
  CONSTRAINT split_sec_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE,
  CONSTRAINT split_sec_left_image_id_media_id_fk FOREIGN KEY (left_image_id) REFERENCES media(id) ON DELETE SET NULL,
  CONSTRAINT split_sec_right_image_id_media_id_fk FOREIGN KEY (right_image_id) REFERENCES media(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS split_sec_order_idx ON split_sec (_order);
CREATE INDEX IF NOT EXISTS split_sec_parent_id_idx ON split_sec (_parent_id);
CREATE INDEX IF NOT EXISTS split_sec_path_idx ON split_sec (_path);
CREATE INDEX IF NOT EXISTS split_sec_left_image_idx ON split_sec (left_image_id);
CREATE INDEX IF NOT EXISTS split_sec_right_image_idx ON split_sec (right_image_id);

-- ---------------------------------------------------------------------------
-- Ensure section-common columns on all section block tables
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'hero',
    'richtext',
    'cta',
    'guide_form',
    'inquiry_form',
    'privacy_note',
    'img_sec',
    'vid_sec',
    'simple_table',
    'cmp_table',
    'dyn_list',
    'legacy_hero',
    'legacy_narrative',
    'legacy_stage',
    'legacy_audience',
    'legacy_checklist',
    'legacy_quote',
    'legacy_cta',
    'reuse_sec_ref',
    'divider',
    'stats_sec',
    'faq_sec',
    'feat_grid',
    'form_sec',
    'team_sec',
    'logo_band',
    'quote_sec',
    'tabs_sec',
    'split_sec'
  ] LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = tbl
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I
          ADD COLUMN IF NOT EXISTS background_color varchar,
          ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false,
          ADD COLUMN IF NOT EXISTS visible_from timestamptz,
          ADD COLUMN IF NOT EXISTS visible_until timestamptz,
          ADD COLUMN IF NOT EXISTS heading_size %I,
          ADD COLUMN IF NOT EXISTS text_align %I,
          ADD COLUMN IF NOT EXISTS heading_tag %I',
        tbl,
        format('enum_%s_heading_size', tbl),
        format('enum_%s_text_align', tbl),
        format('enum_%s_heading_tag', tbl)
      );
    END IF;
  END LOOP;
END $$;

COMMIT;
