-- Hotfix: add missing relation table expected by Payload for Site Pages blocks.
-- Safe to run multiple times.

BEGIN;

CREATE TABLE IF NOT EXISTS site_pages_rels (
  id serial PRIMARY KEY,
  "order" integer,
  parent_id integer NOT NULL,
  path varchar NOT NULL,
  team_members_id integer,
  logos_id integer
);

CREATE INDEX IF NOT EXISTS site_pages_rels_order_idx ON site_pages_rels ("order");
CREATE INDEX IF NOT EXISTS site_pages_rels_parent_idx ON site_pages_rels (parent_id);
CREATE INDEX IF NOT EXISTS site_pages_rels_path_idx ON site_pages_rels (path);
CREATE INDEX IF NOT EXISTS site_pages_rels_team_members_id_idx ON site_pages_rels (team_members_id);
CREATE INDEX IF NOT EXISTS site_pages_rels_logos_id_idx ON site_pages_rels (logos_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_pages_rels_parent_fk'
  ) THEN
    ALTER TABLE site_pages_rels
      ADD CONSTRAINT site_pages_rels_parent_fk
      FOREIGN KEY (parent_id) REFERENCES site_pages(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_pages_rels_team_members_fk'
  ) THEN
    ALTER TABLE site_pages_rels
      ADD CONSTRAINT site_pages_rels_team_members_fk
      FOREIGN KEY (team_members_id) REFERENCES team_members(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_pages_rels_logos_fk'
  ) THEN
    ALTER TABLE site_pages_rels
      ADD CONSTRAINT site_pages_rels_logos_fk
      FOREIGN KEY (logos_id) REFERENCES logos(id) ON DELETE CASCADE;
  END IF;
END $$;

COMMIT;
