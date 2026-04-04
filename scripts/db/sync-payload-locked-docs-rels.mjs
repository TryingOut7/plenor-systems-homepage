/**
 * Keeps payload_locked_documents_rels in sync with registered Payload collections.
 *
 * Payload's document-locking system stores one nullable FK column per collection
 * in payload_locked_documents_rels. When a new collection table is added without
 * patching this table, every Payload admin query fails with a "column does not exist"
 * error. This script detects and patches those gaps automatically.
 *
 * Strategy:
 *   1. Find all collection tables: public-schema tables that have id, created_at,
 *      updated_at columns and are not internal/backend/junction tables.
 *   2. Find columns already present in payload_locked_documents_rels.
 *   3. For each collection table missing a {table}_id column, add it with an index
 *      and FK constraint (all idempotent via IF NOT EXISTS / pg_constraint check).
 *
 * Safe to run multiple times. No-ops when already in sync.
 */

import { withDatabaseClient } from './migration-lib.mjs';

// Tables that are NOT Payload collection roots — skip them.
const EXCLUDED_TABLES = new Set([
  // Payload internal / junction tables
  'payload_locked_documents',
  'payload_locked_documents_rels',
  'payload_preferences',
  'payload_preferences_rels',
  'payload_migrations',
  // Backend operational tables
  'schema_migrations',
  'audit_logs',
  'guide_submissions',
  'inquiry_submissions',
  'backend_outbox_jobs',
  'backend_idempotency_keys',
  'backend_rate_limit_counters',
]);

// Table name patterns that are Payload internals, not collection roots.
const EXCLUDED_PATTERNS = [
  /^_/,        // Payload internal tables (_payload_*)
  /_rels$/,    // Relationship junction tables
  /_texts$/,   // Lexical text search tables
  /_locales$/, // Locale tables
];

function isExcluded(tableName) {
  if (EXCLUDED_TABLES.has(tableName)) return true;
  return EXCLUDED_PATTERNS.some((re) => re.test(tableName));
}

async function findCollectionTables(client) {
  const result = await client.query(`
    SELECT t.table_name
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_schema = 'public'
          AND c.table_name = t.table_name
          AND c.column_name = 'id'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_schema = 'public'
          AND c.table_name = t.table_name
          AND c.column_name = 'created_at'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_schema = 'public'
          AND c.table_name = t.table_name
          AND c.column_name = 'updated_at'
      )
    ORDER BY t.table_name;
  `);

  return result.rows
    .map((row) => row.table_name)
    .filter((name) => !isExcluded(name));
}

async function findExistingRelsCols(client) {
  const result = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payload_locked_documents_rels';
  `);
  return new Set(result.rows.map((row) => row.column_name));
}

async function syncTable(client, tableName) {
  const colName = `${tableName}_id`;
  const idxName = `payload_locked_documents_rels_${tableName}_id_idx`;
  const fkName = `payload_locked_documents_rels_${tableName}_fk`;

  await client.query(`
    ALTER TABLE payload_locked_documents_rels
      ADD COLUMN IF NOT EXISTS ${colName} integer;
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS ${idxName}
      ON payload_locked_documents_rels (${colName});
  `);

  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '${fkName}'
      ) THEN
        ALTER TABLE payload_locked_documents_rels
          ADD CONSTRAINT ${fkName}
          FOREIGN KEY (${colName}) REFERENCES ${tableName}(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `);
}

async function main() {
  await withDatabaseClient(async (client) => {
    const collectionTables = await findCollectionTables(client);
    const existingCols = await findExistingRelsCols(client);

    const missing = collectionTables.filter(
      (table) => !existingCols.has(`${table}_id`),
    );

    if (missing.length === 0) {
      console.log('payload_locked_documents_rels is already in sync.');
      return;
    }

    console.log(
      `Syncing ${missing.length} missing collection(s): ${missing.join(', ')}`,
    );

    for (const table of missing) {
      console.log(`  Adding ${table}_id column + index + FK...`);
      await syncTable(client, table);
      console.log(`  Done: ${table}_id`);
    }

    console.log('payload_locked_documents_rels sync complete.');
  });
}

main().catch((error) => {
  console.error(
    `sync-payload-locked-docs-rels failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
