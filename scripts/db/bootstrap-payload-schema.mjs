/**
 * Fresh-DB Payload bootstrap.
 *
 * Generates SQL from Payload's Drizzle schema snapshot and applies it when
 * core Payload tables are missing. This gives brand-new databases the same
 * base schema that historical dev-push environments already had.
 */

import path from 'node:path';
import { pathToFileURL } from 'node:url';

const CORE_TABLES = [
  'users',
  'media',
  'forms',
  'site_pages',
  'payload_locked_documents_rels',
  'page_drafts',
  'page_playgrounds',
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

function quoteSqlText(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function getMissingCoreTables(adapter) {
  const tableLiterals = CORE_TABLES.map(quoteSqlText).join(', ');
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
  if (!error || typeof error !== 'object') return false;

  const candidates = [error, error.cause].filter(Boolean);
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    const code = typeof candidate.code === 'string' ? candidate.code : '';
    if (code === '42P07' || code === '42710' || code === '42P06') {
      return true;
    }
  }

  const message = candidates
    .map((candidate) => (candidate instanceof Error ? candidate.message : String(candidate)))
    .join('\n');
  return /already exists|duplicate/i.test(message);
}

function chunkStatements(statements, chunkSize) {
  const chunks = [];
  for (let i = 0; i < statements.length; i += chunkSize) {
    chunks.push(statements.slice(i, i + chunkSize));
  }
  return chunks;
}

function normalizeSqlStatement(statement) {
  const trimmed = statement.trim();
  if (!trimmed) return '';
  return trimmed.endsWith(';') ? trimmed : `${trimmed};`;
}

async function applyBatch(adapter, batch) {
  const raw = batch.map(normalizeSqlStatement).filter(Boolean).join('\n');
  if (!raw) return;

  try {
    await adapter.execute({ drizzle: adapter.drizzle, raw });
    return;
  } catch (error) {
    if (!isIgnorableDuplicateDdlError(error)) throw error;
  }

  // If bulk execution hits duplicate-object DDL on partially-initialized DBs,
  // replay one-by-one and ignore duplicate errors.
  for (const statement of batch) {
    const sql = normalizeSqlStatement(statement);
    if (!sql) continue;
    try {
      await adapter.execute({ drizzle: adapter.drizzle, raw: sql });
    } catch (error) {
      if (isIgnorableDuplicateDdlError(error)) continue;
      throw error;
    }
  }
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
    // Ignore when payload_migrations does not exist.
  }
}

async function main() {
  console.log('Preparing Payload base-schema bootstrap...');

  // Never allow push semantics in this script.
  process.env.PAYLOAD_DB_PUSH = 'false';
  process.env.PAYLOAD_CONFIRM_SCHEMA_PUSH = 'false';

  // Keep bootstrap tolerant to prod-only runtime checks in config (email adapters etc).
  process.env.NODE_ENV = 'development';

  const [{ getPayload }, config] = await Promise.all([
    import('payload'),
    loadPayloadConfig(),
  ]);

  const payload = await getPayload({ config });
  try {
    const adapter = payload.db;
    if (
      !adapter ||
      !adapter.schema ||
      !adapter.drizzle ||
      typeof adapter.requireDrizzleKit !== 'function'
    ) {
      throw new Error('Payload DB adapter is not ready for schema bootstrap.');
    }

    const missingBefore = await getMissingCoreTables(adapter);
    if (missingBefore.length === 0) {
      console.log('Core Payload tables already exist. Skipping bootstrap.');
      return;
    }

    console.log(`Missing core tables: ${missingBefore.join(', ')}`);

    const { generateDrizzleJson, generateMigration, upSnapshot } =
      adapter.requireDrizzleKit();

    console.log('Generating schema SQL from Drizzle snapshot...');
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

    const chunks = chunkStatements(sqlStatements, 200);
    for (let index = 0; index < chunks.length; index += 1) {
      await applyBatch(adapter, chunks[index]);
      console.log(`Applied schema chunk ${index + 1}/${chunks.length}`);
    }

    await removeDevPushMarkerIfPresent(adapter);

    const missingAfter = await getMissingCoreTables(adapter);
    if (missingAfter.length > 0) {
      throw new Error(
        `Bootstrap completed but required tables are still missing: ${missingAfter.join(', ')}`,
      );
    }

    console.log('Payload base-schema bootstrap completed.');
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
