-- Add page workspace collection columns to payload_locked_documents_rels.
-- PageDrafts, PagePresets, and PagePlaygrounds were registered as Payload collections
-- in commit 4bf1ca9 but the corresponding _rels columns were never patched.
-- Safe to run multiple times.

ALTER TABLE payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS page_drafts_id integer,
  ADD COLUMN IF NOT EXISTS page_presets_id integer,
  ADD COLUMN IF NOT EXISTS page_playgrounds_id integer;

CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_page_drafts_id_idx
  ON payload_locked_documents_rels (page_drafts_id);
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_page_presets_id_idx
  ON payload_locked_documents_rels (page_presets_id);
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_page_playgrounds_id_idx
  ON payload_locked_documents_rels (page_playgrounds_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_page_drafts_fk'
  ) THEN
    ALTER TABLE payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_page_drafts_fk
      FOREIGN KEY (page_drafts_id) REFERENCES page_drafts(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_page_presets_fk'
  ) THEN
    ALTER TABLE payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_page_presets_fk
      FOREIGN KEY (page_presets_id) REFERENCES page_presets(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_page_playgrounds_fk'
  ) THEN
    ALTER TABLE payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_page_playgrounds_fk
      FOREIGN KEY (page_playgrounds_id) REFERENCES page_playgrounds(id) ON DELETE CASCADE;
  END IF;
END $$;
