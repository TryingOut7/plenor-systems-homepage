-- Hotfix: Add SitePages preset fields + legacy block tables used by new CMS sections.
-- Safe to run multiple times.

BEGIN;

-- ---------------------------------------------------------------------------
-- SitePages preset fields
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum_site_pages_preset_key'
  ) THEN
    CREATE TYPE enum_site_pages_preset_key AS ENUM (
      'custom',
      'home',
      'services',
      'about',
      'pricing',
      'contact'
    );
  END IF;
END $$;

ALTER TABLE site_pages
  ADD COLUMN IF NOT EXISTS preset_key enum_site_pages_preset_key DEFAULT 'custom',
  ADD COLUMN IF NOT EXISTS preset_content jsonb;

-- ---------------------------------------------------------------------------
-- Shared enum helpers for legacy blocks
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_legacy_hero_theme') THEN
    CREATE TYPE enum_legacy_hero_theme AS ENUM ('navy', 'charcoal', 'black', 'white', 'light');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_legacy_hero_size') THEN
    CREATE TYPE enum_legacy_hero_size AS ENUM ('compact', 'regular', 'spacious');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_legacy_narrative_theme') THEN
    CREATE TYPE enum_legacy_narrative_theme AS ENUM ('navy', 'charcoal', 'black', 'white', 'light');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_legacy_narrative_size') THEN
    CREATE TYPE enum_legacy_narrative_size AS ENUM ('compact', 'regular', 'spacious');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_legacy_stage_theme') THEN
    CREATE TYPE enum_legacy_stage_theme AS ENUM ('navy', 'charcoal', 'black', 'white', 'light');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_legacy_stage_size') THEN
    CREATE TYPE enum_legacy_stage_size AS ENUM ('compact', 'regular', 'spacious');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_legacy_audience_theme') THEN
    CREATE TYPE enum_legacy_audience_theme AS ENUM ('navy', 'charcoal', 'black', 'white', 'light');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_legacy_audience_size') THEN
    CREATE TYPE enum_legacy_audience_size AS ENUM ('compact', 'regular', 'spacious');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_legacy_checklist_theme') THEN
    CREATE TYPE enum_legacy_checklist_theme AS ENUM ('navy', 'charcoal', 'black', 'white', 'light');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_legacy_checklist_size') THEN
    CREATE TYPE enum_legacy_checklist_size AS ENUM ('compact', 'regular', 'spacious');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_legacy_quote_theme') THEN
    CREATE TYPE enum_legacy_quote_theme AS ENUM ('navy', 'charcoal', 'black', 'white', 'light');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_legacy_quote_size') THEN
    CREATE TYPE enum_legacy_quote_size AS ENUM ('compact', 'regular', 'spacious');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_legacy_cta_theme') THEN
    CREATE TYPE enum_legacy_cta_theme AS ENUM ('navy', 'charcoal', 'black', 'white', 'light');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_legacy_cta_size') THEN
    CREATE TYPE enum_legacy_cta_size AS ENUM ('compact', 'regular', 'spacious');
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Legacy block tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS legacy_hero (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id varchar NOT NULL,
  theme enum_legacy_hero_theme DEFAULT 'white',
  size enum_legacy_hero_size DEFAULT 'regular',
  anchor_id varchar,
  custom_class_name varchar,
  eyebrow varchar,
  heading varchar NOT NULL,
  subheading varchar,
  primary_cta_label varchar,
  primary_cta_href varchar,
  secondary_cta_label varchar,
  secondary_cta_href varchar,
  block_name varchar,
  CONSTRAINT legacy_hero_pkey PRIMARY KEY (id),
  CONSTRAINT legacy_hero_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS legacy_hero_order_idx ON legacy_hero (_order);
CREATE INDEX IF NOT EXISTS legacy_hero_parent_id_idx ON legacy_hero (_parent_id);
CREATE INDEX IF NOT EXISTS legacy_hero_path_idx ON legacy_hero (_path);

CREATE TABLE IF NOT EXISTS legacy_narrative (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id varchar NOT NULL,
  theme enum_legacy_narrative_theme DEFAULT 'white',
  size enum_legacy_narrative_size DEFAULT 'regular',
  anchor_id varchar,
  custom_class_name varchar,
  section_label varchar,
  heading varchar,
  link_label varchar,
  link_href varchar,
  block_name varchar,
  CONSTRAINT legacy_narrative_pkey PRIMARY KEY (id),
  CONSTRAINT legacy_narrative_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS legacy_narrative_order_idx ON legacy_narrative (_order);
CREATE INDEX IF NOT EXISTS legacy_narrative_parent_id_idx ON legacy_narrative (_parent_id);
CREATE INDEX IF NOT EXISTS legacy_narrative_path_idx ON legacy_narrative (_path);

CREATE TABLE IF NOT EXISTS lgn_paras (
  _order integer NOT NULL,
  _parent_id varchar NOT NULL,
  id varchar NOT NULL,
  paragraph varchar NOT NULL,
  CONSTRAINT lgn_paras_pkey PRIMARY KEY (id),
  CONSTRAINT lgn_paras_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES legacy_narrative(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS lgn_paras_order_idx ON lgn_paras (_order);
CREATE INDEX IF NOT EXISTS lgn_paras_parent_id_idx ON lgn_paras (_parent_id);

CREATE TABLE IF NOT EXISTS legacy_stage (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id varchar NOT NULL,
  theme enum_legacy_stage_theme DEFAULT 'white',
  size enum_legacy_stage_size DEFAULT 'regular',
  anchor_id varchar,
  custom_class_name varchar,
  stage_number varchar DEFAULT '01',
  stage_label varchar DEFAULT 'Stage',
  heading varchar NOT NULL,
  body varchar,
  who_for_heading varchar DEFAULT 'Who it is for',
  who_for_body varchar,
  block_name varchar,
  CONSTRAINT legacy_stage_pkey PRIMARY KEY (id),
  CONSTRAINT legacy_stage_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS legacy_stage_order_idx ON legacy_stage (_order);
CREATE INDEX IF NOT EXISTS legacy_stage_parent_id_idx ON legacy_stage (_parent_id);
CREATE INDEX IF NOT EXISTS legacy_stage_path_idx ON legacy_stage (_path);

CREATE TABLE IF NOT EXISTS lgs_items (
  _order integer NOT NULL,
  _parent_id varchar NOT NULL,
  id varchar NOT NULL,
  item varchar NOT NULL,
  CONSTRAINT lgs_items_pkey PRIMARY KEY (id),
  CONSTRAINT lgs_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES legacy_stage(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS lgs_items_order_idx ON lgs_items (_order);
CREATE INDEX IF NOT EXISTS lgs_items_parent_id_idx ON lgs_items (_parent_id);

CREATE TABLE IF NOT EXISTS legacy_audience (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id varchar NOT NULL,
  theme enum_legacy_audience_theme DEFAULT 'white',
  size enum_legacy_audience_size DEFAULT 'regular',
  anchor_id varchar,
  custom_class_name varchar,
  section_label varchar,
  heading varchar,
  footer_text varchar,
  block_name varchar,
  CONSTRAINT legacy_audience_pkey PRIMARY KEY (id),
  CONSTRAINT legacy_audience_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS legacy_audience_order_idx ON legacy_audience (_order);
CREATE INDEX IF NOT EXISTS legacy_audience_parent_id_idx ON legacy_audience (_parent_id);
CREATE INDEX IF NOT EXISTS legacy_audience_path_idx ON legacy_audience (_path);

CREATE TABLE IF NOT EXISTS lga_auds (
  _order integer NOT NULL,
  _parent_id varchar NOT NULL,
  id varchar NOT NULL,
  label varchar NOT NULL,
  copy varchar NOT NULL,
  CONSTRAINT lga_auds_pkey PRIMARY KEY (id),
  CONSTRAINT lga_auds_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES legacy_audience(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS lga_auds_order_idx ON lga_auds (_order);
CREATE INDEX IF NOT EXISTS lga_auds_parent_id_idx ON lga_auds (_parent_id);

CREATE TABLE IF NOT EXISTS legacy_checklist (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id varchar NOT NULL,
  theme enum_legacy_checklist_theme DEFAULT 'white',
  size enum_legacy_checklist_size DEFAULT 'regular',
  anchor_id varchar,
  custom_class_name varchar,
  section_label varchar,
  heading varchar,
  footer_body varchar,
  block_name varchar,
  CONSTRAINT legacy_checklist_pkey PRIMARY KEY (id),
  CONSTRAINT legacy_checklist_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS legacy_checklist_order_idx ON legacy_checklist (_order);
CREATE INDEX IF NOT EXISTS legacy_checklist_parent_id_idx ON legacy_checklist (_parent_id);
CREATE INDEX IF NOT EXISTS legacy_checklist_path_idx ON legacy_checklist (_path);

CREATE TABLE IF NOT EXISTS lgc_items (
  _order integer NOT NULL,
  _parent_id varchar NOT NULL,
  id varchar NOT NULL,
  title varchar NOT NULL,
  description varchar NOT NULL,
  CONSTRAINT lgc_items_pkey PRIMARY KEY (id),
  CONSTRAINT lgc_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES legacy_checklist(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS lgc_items_order_idx ON lgc_items (_order);
CREATE INDEX IF NOT EXISTS lgc_items_parent_id_idx ON lgc_items (_parent_id);

CREATE TABLE IF NOT EXISTS legacy_quote (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id varchar NOT NULL,
  theme enum_legacy_quote_theme DEFAULT 'white',
  size enum_legacy_quote_size DEFAULT 'regular',
  anchor_id varchar,
  custom_class_name varchar,
  section_label varchar,
  quote varchar NOT NULL,
  block_name varchar,
  CONSTRAINT legacy_quote_pkey PRIMARY KEY (id),
  CONSTRAINT legacy_quote_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS legacy_quote_order_idx ON legacy_quote (_order);
CREATE INDEX IF NOT EXISTS legacy_quote_parent_id_idx ON legacy_quote (_parent_id);
CREATE INDEX IF NOT EXISTS legacy_quote_path_idx ON legacy_quote (_path);

CREATE TABLE IF NOT EXISTS legacy_cta (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id varchar NOT NULL,
  theme enum_legacy_cta_theme DEFAULT 'white',
  size enum_legacy_cta_size DEFAULT 'regular',
  anchor_id varchar,
  custom_class_name varchar,
  heading varchar NOT NULL,
  body varchar,
  button_label varchar,
  button_href varchar,
  secondary_link_label varchar,
  secondary_link_href varchar,
  block_name varchar,
  CONSTRAINT legacy_cta_pkey PRIMARY KEY (id),
  CONSTRAINT legacy_cta_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES site_pages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS legacy_cta_order_idx ON legacy_cta (_order);
CREATE INDEX IF NOT EXISTS legacy_cta_parent_id_idx ON legacy_cta (_parent_id);
CREATE INDEX IF NOT EXISTS legacy_cta_path_idx ON legacy_cta (_path);

COMMIT;
