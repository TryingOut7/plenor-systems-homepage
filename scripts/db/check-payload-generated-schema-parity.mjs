import { access } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { withDatabaseClient } from './migration-lib.mjs';

const ROOT = process.cwd();

function formatCommand(command, args) {
  return [command, ...args].join(' ');
}

async function runCommand(label, command, args) {
  console.log(`\n▶ ${label}`);
  console.log(`   ${formatCommand(command, args)}`);

  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      env: process.env,
      stdio: 'inherit',
    });

    child.on('error', (error) => reject(error));
    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`${label} terminated by signal ${signal}.`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`${label} failed with exit code ${code}.`));
        return;
      }
      resolve();
    });
  });
}

async function ensurePayloadDbSchemaGenerated() {
  const payloadBin = path.resolve(
    ROOT,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'payload.cmd' : 'payload',
  );
  await access(payloadBin);
  await runCommand('Generate Payload DB schema artifact', payloadBin, [
    'generate:db-schema',
  ]);
}

async function getExistingTables(client, tableNames) {
  if (tableNames.length === 0) return new Set();

  const result = await client.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name = ANY($1::text[])
    `,
    [tableNames],
  );

  return new Set(result.rows.map((row) => row.table_name));
}

async function getExistingColumns(client, tableNames) {
  if (tableNames.length === 0) return new Map();

  const result = await client.query(
    `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])
    `,
    [tableNames],
  );

  const columnsByTable = new Map();
  for (const row of result.rows) {
    if (!columnsByTable.has(row.table_name)) {
      columnsByTable.set(row.table_name, new Set());
    }
    columnsByTable.get(row.table_name).add(row.column_name);
  }

  return columnsByTable;
}

async function getExistingEnumLabels(client, enumNames) {
  if (enumNames.length === 0) {
    return { labelsByEnum: new Map(), existingEnums: new Set() };
  }

  const result = await client.query(
    `
      SELECT
        format('%I.%I', n.nspname, t.typname) AS enum_name,
        e.enumlabel AS enum_label
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      LEFT JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE t.typtype = 'e'
        AND format('%I.%I', n.nspname, t.typname) = ANY($1::text[])
      ORDER BY enum_name ASC, e.enumsortorder ASC
    `,
    [enumNames],
  );

  const labelsByEnum = new Map();
  const existingEnums = new Set();

  for (const row of result.rows) {
    const enumName = row.enum_name;
    existingEnums.add(enumName);
    if (!labelsByEnum.has(enumName)) {
      labelsByEnum.set(enumName, new Set());
    }
    if (row.enum_label) {
      labelsByEnum.get(enumName).add(row.enum_label);
    }
  }

  return { labelsByEnum, existingEnums };
}

function printMissingColumns(missingColumnsByTable) {
  const totalMissingColumns = [...missingColumnsByTable.values()].reduce(
    (count, columns) => count + columns.length,
    0,
  );

  console.error(
    `\n❌ Schema drift: ${totalMissingColumns} missing column(s) across ${missingColumnsByTable.size} table(s):`,
  );
  for (const [table, columns] of missingColumnsByTable) {
    console.error(`\n   ${table}:`);
    for (const column of columns) {
      console.error(`     + ${column}`);
    }
  }
}

function printMissingEnums(missingEnumTypes, missingEnumLabelsByType) {
  if (missingEnumTypes.length > 0) {
    console.error('\n⚠️  Missing enum types:');
    for (const enumName of missingEnumTypes) {
      console.error(`   - ${enumName}`);
    }
  }

  if (missingEnumLabelsByType.size > 0) {
    const totalMissingLabels = [...missingEnumLabelsByType.values()].reduce(
      (count, labels) => count + labels.length,
      0,
    );
    console.error(
      `\n❌ Enum drift: ${totalMissingLabels} missing enum label(s) across ${missingEnumLabelsByType.size} type(s):`,
    );
    for (const [enumName, labels] of missingEnumLabelsByType) {
      console.error(`\n   ${enumName}:`);
      for (const label of labels) {
        console.error(`     + ${label}`);
      }
    }
  }
}

async function run() {
  await ensurePayloadDbSchemaGenerated();

  // Import the manifest AFTER generation so it reads the freshly-written file.
  const { SCHEMA_MANIFEST, SCHEMA_ENUM_MANIFEST, REQUIRED_TABLES } =
    await import('./schema-manifest.mjs');

  const expectedTableNames = Object.keys(SCHEMA_MANIFEST);
  const expectedEnumNames = Object.keys(SCHEMA_ENUM_MANIFEST);

  let missingTables = [];
  let missingColumnsByTable = new Map();
  let missingEnumTypes = [];
  let missingEnumLabelsByType = new Map();

  await withDatabaseClient(async (client) => {
    const [existingTables, existingColumnsByTable, { labelsByEnum, existingEnums }] =
      await Promise.all([
        getExistingTables(client, expectedTableNames),
        getExistingColumns(client, expectedTableNames),
        getExistingEnumLabels(client, expectedEnumNames),
      ]);

    const requiredTableSet = new Set([
      ...expectedTableNames,
      ...REQUIRED_TABLES,
    ]);
    missingTables = [...requiredTableSet].filter(
      (tableName) => !existingTables.has(tableName),
    );

    for (const [tableName, columns] of Object.entries(SCHEMA_MANIFEST)) {
      if (!existingTables.has(tableName)) continue;

      const existingColumns = existingColumnsByTable.get(tableName) ?? new Set();
      const missingColumns = Object.keys(columns).filter(
        (columnName) => !existingColumns.has(columnName),
      );

      if (missingColumns.length > 0) {
        missingColumnsByTable.set(tableName, missingColumns);
      }
    }

    missingEnumTypes = expectedEnumNames.filter(
      (enumName) => !existingEnums.has(enumName),
    );

    for (const enumName of expectedEnumNames) {
      if (missingEnumTypes.includes(enumName)) continue;
      const expectedLabels = SCHEMA_ENUM_MANIFEST[enumName] ?? [];
      const actualLabels = labelsByEnum.get(enumName) ?? new Set();
      const missingLabels = expectedLabels.filter(
        (label) => !actualLabels.has(label),
      );
      if (missingLabels.length > 0) {
        missingEnumLabelsByType.set(enumName, missingLabels);
      }
    }
  });

  const hasDrift =
    missingTables.length > 0 ||
    missingColumnsByTable.size > 0 ||
    missingEnumTypes.length > 0 ||
    missingEnumLabelsByType.size > 0;

  if (!hasDrift) {
    console.log(
      `\n✅ Payload generated-schema parity passed (${expectedTableNames.length} tables, ${expectedEnumNames.length} enums).`,
    );
    return;
  }

  if (missingTables.length > 0) {
    console.error('\n⚠️  Missing tables:');
    for (const table of missingTables.sort((a, b) => a.localeCompare(b))) {
      console.error(`   - public.${table}`);
    }
  }

  if (missingColumnsByTable.size > 0) {
    printMissingColumns(missingColumnsByTable);
  }

  printMissingEnums(missingEnumTypes, missingEnumLabelsByType);

  console.error('\nNext steps (migrations-first workflow):');
  console.error(
    '1. Create Payload migration(s) for schema changes: npm run generate:migration -- <name>',
  );
  console.error('2. Apply migrations: npm run db:schema:ensure');
  console.error('3. Re-run check: npm run db:schema:ensure:check');
  process.exit(1);
}

run().catch((error) => {
  console.error(
    `Payload generated-schema parity check failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exit(1);
});
