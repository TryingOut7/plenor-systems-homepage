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
 *   3. Only sync tables whose id column is already backed by a PRIMARY KEY or
 *      UNIQUE constraint, then add the {table}_id column, index, and FK.
 *
 * Safe to run multiple times. No-ops when already in sync, and safely skips
 * tables that exist only as interim drift-repair stubs.
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

async function hasReferenceableId(client, tableName) {
  const result = await client.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        JOIN unnest(c.conkey) WITH ORDINALITY AS cols(attnum, ordinality) ON TRUE
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = cols.attnum
        WHERE n.nspname = 'public'
          AND t.relname = $1
          AND c.contype IN ('p', 'u')
        GROUP BY c.oid
        HAVING array_agg(a.attname ORDER BY cols.ordinality) = ARRAY['id']::text[]
      ) AS has_referenceable_id;
    `,
    [tableName],
  );

  return result.rows[0]?.has_referenceable_id === true;
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
    const missing = [];
    const skipped = [];

    for (const table of collectionTables) {
      if (existingCols.has(`${table}_id`)) continue;

      if (await hasReferenceableId(client, table)) {
        missing.push(table);
      } else {
        skipped.push(table);
      }
    }

    if (missing.length === 0) {
      if (skipped.length === 0) {
        console.log('payload_locked_documents_rels is already in sync.');
        return;
      }

      console.log(
        `Skipping ${skipped.length} collection(s) until their id columns are key-safe: ${skipped.join(', ')}`,
      );
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

    if (skipped.length > 0) {
      console.log(
        `Skipped ${skipped.length} collection(s) until their id columns are key-safe: ${skipped.join(', ')}`,
      );
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
