-- Rollback: remove page workspace columns from payload_locked_documents_rels.

ALTER TABLE payload_locked_documents_rels
  DROP COLUMN IF EXISTS page_drafts_id,
  DROP COLUMN IF EXISTS page_presets_id,
  DROP COLUMN IF EXISTS page_playgrounds_id;
