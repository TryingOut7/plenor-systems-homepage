/**
 * One-time Payload schema bootstrap for fresh databases.
 *
 * Why this exists:
 * - `db:schema:ensure` applies backend SQL migrations and Payload migrations.
 * - On an empty database, early backend migrations can reference Payload tables
 *   like `media` before they exist.
 *
 * This script generates SQL from Payload's Drizzle schema snapshots and applies
 * it directly. We intentionally avoid Payload dev push mode (`batch = -1`
 * marker) and avoid drizzle-kit `pushSchema` introspection prompts.
 */

import path from 'node:path';
import { pathToFileURL } from 'node:url';

const PAYLOAD_BOOTSTRAP_CORE_TABLES = [
  'users',
  'media',
  'forms',
  'site_pages',
  'payload_locked_documents_rels',
];

function resolvePayloadConfigPath() {
  return path.resolve(process.cwd(), 'src', 'payload.config.ts');
}

async function loadPayloadConfig() {
  const moduleUrl = pathToFileURL(resolvePayloadConfigPath()).href;
  const loaded = await import(moduleUrl);
  const config = loaded?.default ?? loaded?.config;
  if (!config) {
    throw new Error(
      'Unable to load Payload config from src/payload.config.ts (missing default export).',
    );
  }
  return config;
}

async function removeDevPushMarkerIfPresent(adapter) {
  const migrationsTable = adapter.schemaName
    ? `"${adapter.schemaName}"."payload_migrations"`
    : '"payload_migrations"';

  try {
    await adapter.execute({
      drizzle: adapter.drizzle,
      raw: `DELETE FROM ${migrationsTable} WHERE batch = -1`,
    });
  } catch {
    // Ignore when payload_migrations does not exist yet.
  }
}

function toSqlTextLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function getMissingCoreTables(adapter) {
  const tableLiterals = PAYLOAD_BOOTSTRAP_CORE_TABLES.map(toSqlTextLiteral).join(', ');
  const result = await adapter.execute({
    drizzle: adapter.drizzle,
    raw: `
      SELECT table_name
      FROM unnest(ARRAY[${tableLiterals}]::text[]) AS table_name
      WHERE to_regclass(format('public.%s', table_name)) IS NULL
      ORDER BY table_name ASC
    `,
  });
  return result.rows.map((row) => String(row.table_name));
}

function isIgnorableDuplicateDdlError(error) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidates = [error, error.cause].filter(Boolean);
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    const code = typeof candidate.code === 'string' ? candidate.code : '';
    if (code === '42P07' || code === '42710' || code === '42P06') {
      return true;
    }
  }

  const messageParts = [];
  for (const candidate of candidates) {
    if (candidate instanceof Error && candidate.message) {
      messageParts.push(candidate.message);
    } else {
      messageParts.push(String(candidate));
    }
  }
  const message = messageParts.join('\n');
  return /already exists|duplicate/i.test(message);
}

async function main() {
  console.log('Preparing Payload schema bootstrap...');

  // Ensure this bootstrap never uses Payload dev push mode semantics.
  process.env.PAYLOAD_DB_PUSH = 'false';
  process.env.PAYLOAD_CONFIRM_SCHEMA_PUSH = 'false';

  // Run config in development mode to avoid production-only adapters/guards
  // (email provider hard requirements, etc.) while bootstrapping schema.
  process.env.NODE_ENV = 'development';

  const [{ getPayload }, config] = await Promise.all([
    import('payload'),
    loadPayloadConfig(),
  ]);

  const payload = await getPayload({ config });
  try {
    console.log('Payload initialized. Inspecting DB adapter state...');

    const adapter = payload.db;
    if (
      !adapter ||
      !adapter.schema ||
      !adapter.drizzle ||
      typeof adapter.requireDrizzleKit !== 'function'
    ) {
      throw new Error(
        'Payload DB adapter is not ready for schema bootstrap (missing drizzle schema/runtime fields).',
      );
    }

    const missingBefore = await getMissingCoreTables(adapter);
    if (missingBefore.length === 0) {
      console.log(
        'Core Payload tables already exist. Skipping bootstrap SQL generation.',
      );
      return;
    }
    console.log(`Missing core tables: ${missingBefore.join(', ')}`);

    const { generateDrizzleJson, generateMigration, upSnapshot } =
      adapter.requireDrizzleKit();

    console.log('Generating Drizzle snapshot diff for Payload schema...');
    const generationStart = Date.now();
    const baseSnapshot = upSnapshot
      ? upSnapshot(adapter.defaultDrizzleSnapshot)
      : adapter.defaultDrizzleSnapshot;
    const targetSnapshot = generateDrizzleJson(adapter.schema, baseSnapshot?.id);
    const sqlStatements = await generateMigration(baseSnapshot, targetSnapshot);
    console.log(
      `Generated ${sqlStatements.length} SQL statement(s) in ${
        Date.now() - generationStart
      }ms.`,
    );

    let processedStatements = 0;
    let ignoredDuplicates = 0;
    for (const statement of sqlStatements) {
      if (typeof statement !== 'string' || statement.trim().length === 0) {
        continue;
      }
      try {
        await adapter.execute({ drizzle: adapter.drizzle, raw: statement });
        processedStatements += 1;
        if (processedStatements % 50 === 0) {
          console.log(`Applied ${processedStatements} statement(s)...`);
        }
      } catch (error) {
        if (isIgnorableDuplicateDdlError(error)) {
          ignoredDuplicates += 1;
          continue;
        }
        throw error;
      }
    }

    await removeDevPushMarkerIfPresent(adapter);
    const missingAfter = await getMissingCoreTables(adapter);
    if (missingAfter.length > 0) {
      throw new Error(
        `Bootstrap finished but core tables are still missing: ${missingAfter.join(', ')}`,
      );
    }
    console.log(
      `Payload schema bootstrap completed (applied ${processedStatements}, ignored duplicates ${ignoredDuplicates}).`,
    );
  } finally {
    if (typeof payload.destroy === 'function') {
      await payload.destroy();
    }
  }
}

main().catch((error) => {
  console.error(
    `Payload schema bootstrap failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
