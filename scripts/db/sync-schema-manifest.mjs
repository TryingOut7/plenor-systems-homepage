/**
 * Synchronize enum labels and additive columns from schema-manifest.
 *
 * This runs after backend + Payload migrations to close known historical gaps
 * in environments that were initialized from older schema snapshots.
 */

import { withDatabaseClient } from './migration-lib.mjs';
import { SCHEMA_ENUM_MANIFEST, SCHEMA_MANIFEST } from './schema-manifest.mjs';

function quoteIdentifier(value) {
  return `"${value.replace(/"/g, '""')}"`;
}

function quoteLiteral(value) {
  return `'${value.replace(/'/g, "''")}'`;
}

function parseQualifiedTypeName(typeName) {
  const [schema, ...rest] = typeName.split('.');
  if (!schema || rest.length === 0) {
    throw new Error(`Invalid enum type name in manifest: ${typeName}`);
  }

  return {
    schema,
    name: rest.join('.'),
  };
}

async function ensureEnumTypes(client) {
  for (const [qualifiedTypeName, labels] of Object.entries(SCHEMA_ENUM_MANIFEST)) {
    const { schema, name } = parseQualifiedTypeName(qualifiedTypeName);
    const qualifiedTypeIdentifier = `${quoteIdentifier(schema)}.${quoteIdentifier(name)}`;
    const enumValuesSql = labels.map((label) => quoteLiteral(label)).join(', ');

    await client.query(`
DO $$
BEGIN
  CREATE TYPE ${qualifiedTypeIdentifier} AS ENUM (${enumValuesSql});
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;
    `);

    for (const label of labels) {
      await client.query(
        `ALTER TYPE ${qualifiedTypeIdentifier} ADD VALUE IF NOT EXISTS ${quoteLiteral(label)};`,
      );
    }
  }
}

async function ensureManifestColumns(client) {
  const manifestTableNames = Object.keys(SCHEMA_MANIFEST);

  const existingTablesResult = await client.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])
    `,
    [manifestTableNames],
  );

  const existingTables = new Set(existingTablesResult.rows.map((row) => row.table_name));

  const existingColumnsResult = await client.query(
    `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])
    `,
    [manifestTableNames],
  );

  const existingColumnsByTable = new Map();
  for (const row of existingColumnsResult.rows) {
    if (!existingColumnsByTable.has(row.table_name)) {
      existingColumnsByTable.set(row.table_name, new Set());
    }
    existingColumnsByTable.get(row.table_name).add(row.column_name);
  }

  let changedTableCount = 0;
  let addedColumnCount = 0;

  for (const [tableName, columns] of Object.entries(SCHEMA_MANIFEST)) {
    if (!existingTables.has(tableName)) continue;

    const existingColumns = existingColumnsByTable.get(tableName) ?? new Set();
    const missingColumns = [];

    for (const [columnName, columnDefinition] of Object.entries(columns)) {
      if (!existingColumns.has(columnName)) {
        missingColumns.push({ columnName, columnDefinition });
      }
    }

    if (missingColumns.length === 0) continue;

    const qualifiedTableIdentifier = `${quoteIdentifier('public')}.${quoteIdentifier(tableName)}`;

    const addClauses = missingColumns
      .map(
        ({ columnName, columnDefinition }) =>
          `ADD COLUMN IF NOT EXISTS ${quoteIdentifier(columnName)} ${columnDefinition}`,
      )
      .join(',\n  ');

    await client.query(`
      ALTER TABLE ${qualifiedTableIdentifier}
        ${addClauses};
    `);

    changedTableCount += 1;
    addedColumnCount += missingColumns.length;
  }

  return { changedTableCount, addedColumnCount };
}

async function main() {
  await withDatabaseClient(async (client) => {
    await ensureEnumTypes(client);
    const { changedTableCount, addedColumnCount } = await ensureManifestColumns(client);

    if (changedTableCount > 0) {
      console.log(
        `Schema manifest sync applied ${addedColumnCount} column(s) across ${changedTableCount} table(s).`,
      );
    } else {
      console.log('Schema manifest sync found no missing columns.');
    }
  });

  console.log('✓ Schema manifest sync complete.');
}

main().catch((error) => {
  console.error(
    `Schema manifest sync failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
