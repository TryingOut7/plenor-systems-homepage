import { promises as fs } from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'migrations/versions');
const MIGRATION_FILE_PATTERN = /^(\d+)_([a-z0-9_]+)\.(up|down)\.sql$/i;
let localEnvLoaded = false;

function parseEnvLine(rawLine) {
  const line = rawLine.trim();
  if (!line || line.startsWith('#')) return null;

  const withoutExport = line.startsWith('export ')
    ? line.slice('export '.length).trim()
    : line;

  const eq = withoutExport.indexOf('=');
  if (eq <= 0) return null;

  const key = withoutExport.slice(0, eq).trim();
  if (!key) return null;

  let value = withoutExport.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

async function loadEnvFileIfExists(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);
      if (!parsed) continue;
      if (!process.env[parsed.key]) {
        process.env[parsed.key] = parsed.value;
      }
    }
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return;
    throw error;
  }
}

async function ensureLocalEnvLoaded() {
  if (localEnvLoaded) return;

  const cwd = process.cwd();
  await loadEnvFileIfExists(path.resolve(cwd, '.env.local'));
  await loadEnvFileIfExists(path.resolve(cwd, '.env'));
  localEnvLoaded = true;
}

function parseMigrationFilename(name) {
  const match = MIGRATION_FILE_PATTERN.exec(name);
  if (!match) return null;
  return {
    version: match[1],
    name: match[2],
    direction: match[3],
    filename: name,
  };
}

/**
 * Strip sslmode from the connection string so that pg honours the ssl object
 * option exclusively. Newer pg versions treat sslmode=require as verify-full,
 * which rejects Supabase's certificate chain even when rejectUnauthorized=false
 * is set on the pool/client config.
 */
function normalizeConnectionString(uri) {
  return uri
    .replace(/[?&]sslmode=[^&]*/gi, (match) => (match.startsWith('?') ? '?' : ''))
    .replace(/\?&/, '?')
    .replace(/\?$/, '');
}

function resolveSsl(connectionString) {
  try {
    const parsed = new URL(connectionString);
    const sslMode = parsed.searchParams.get('sslmode');
    if (sslMode === 'disable') return false;
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') return false;
  } catch {
    // Fall through to env-driven default.
  }

  return {
    rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true',
  };
}

function getDatabaseUri() {
  const raw =
    process.env.POSTGRES_URL?.trim() ||
    process.env.DATABASE_URI?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!raw) {
    throw new Error(
      'Missing POSTGRES_URL environment variable (or legacy DATABASE_URI / DATABASE_URL).',
    );
  }
  return normalizeConnectionString(raw);
}

export async function withDatabaseClient(run) {
  await ensureLocalEnvLoaded();
  const databaseUri = getDatabaseUri();
  const client = new Client({
    connectionString: databaseUri,
    ssl: resolveSsl(databaseUri),
  });
  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
}

export async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      version TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function listAvailableMigrations() {
  let entries;
  try {
    entries = await fs.readdir(MIGRATIONS_DIR, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  const grouped = new Map();
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const parsed = parseMigrationFilename(entry.name);
    if (!parsed) continue;

    const key = `${parsed.version}_${parsed.name}`;
    const existing = grouped.get(key) || {
      version: parsed.version,
      name: parsed.name,
      upFile: null,
      downFile: null,
    };

    if (parsed.direction === 'up') {
      existing.upFile = path.join(MIGRATIONS_DIR, parsed.filename);
    } else {
      existing.downFile = path.join(MIGRATIONS_DIR, parsed.filename);
    }

    grouped.set(key, existing);
  }

  const migrations = [...grouped.values()].sort((a, b) => {
    const left = BigInt(a.version);
    const right = BigInt(b.version);
    if (left < right) return -1;
    if (left > right) return 1;
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });

  const invalid = migrations.find((migration) => !migration.upFile);
  if (invalid) {
    throw new Error(
      `Missing .up.sql file for migration ${invalid.version}_${invalid.name}.`,
    );
  }

  return migrations;
}

async function readMigrationSql(filePath) {
  return fs.readFile(filePath, 'utf8');
}

export async function listAppliedMigrations(client) {
  const result = await client.query(
    `
      SELECT version, name, applied_at
      FROM public.schema_migrations
      ORDER BY version ASC, name ASC;
    `,
  );

  return result.rows.map((row) => ({
    version: String(row.version),
    name: String(row.name),
    appliedAt: String(row.applied_at),
  }));
}

export function listPendingMigrations(available, applied) {
  const appliedVersions = new Set(applied.map((migration) => migration.version));
  return available.filter((migration) => !appliedVersions.has(migration.version));
}

export async function applyMigration(client, migration) {
  const sql = await readMigrationSql(migration.upFile);
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query(
      `
        INSERT INTO public.schema_migrations(version, name)
        VALUES ($1, $2)
        ON CONFLICT (version) DO NOTHING;
      `,
      [migration.version, migration.name],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

export async function rollbackMigration(client, migration) {
  if (!migration.downFile) {
    throw new Error(
      `Missing .down.sql file for migration ${migration.version}_${migration.name}.`,
    );
  }

  const sql = await readMigrationSql(migration.downFile);
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query(
      `
        DELETE FROM public.schema_migrations
        WHERE version = $1;
      `,
      [migration.version],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

export function formatMigrationId(migration) {
  return `${migration.version}_${migration.name}`;
}
