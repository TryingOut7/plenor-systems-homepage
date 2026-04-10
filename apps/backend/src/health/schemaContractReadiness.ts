import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { resolveDbConnectionString } from '@/lib/env-validation';

type LoggerLike = {
  error?: (bindings: Record<string, unknown>, message: string) => void;
};

type MissingColumn = {
  table: string;
  column: string;
};

type CmsSchemaManifest = Record<string, Record<string, string>>;

type SchemaManifestModule = {
  SCHEMA_MANIFEST: CmsSchemaManifest;
  REQUIRED_TABLES: string[];
};

export type SchemaContractReadinessResult = {
  checkedAt: string;
  ready: boolean;
  requiredTableCount: number;
  requiredColumnCount: number;
  missingTables: string[];
  missingColumns: MissingColumn[];
  missingFunctions: string[];
  error: string | null;
};

const BACKEND_SCHEMA_COLUMNS: Record<string, string[]> = {
  guide_submissions: ['id', 'name', 'email', 'submitted_at'],
  inquiry_submissions: ['id', 'name', 'email', 'company', 'challenge', 'submitted_at'],
  audit_logs: ['actor_key_id', 'target_id', 'old_status', 'new_status', 'reason'],
  backend_idempotency_keys: [
    'route',
    'key',
    'fingerprint',
    'status',
    'body',
    'headers',
    'created_at',
  ],
  backend_outbox_jobs: [
    'id',
    'submission_id',
    'provider',
    'status',
    'attempts',
    'max_attempts',
    'next_attempt_at',
    'last_error',
    'payload',
    'created_at',
    'updated_at',
  ],
  backend_rate_limit_counters: [
    'bucket_key',
    'window_ms',
    'window_started_at',
    'request_count',
    'reset_at',
    'updated_at',
  ],
};

const REQUIRED_BACKEND_FUNCTIONS = ['consume_backend_rate_limit'];

const DEFAULT_CACHE_TTL_MS = 60_000;
const MAX_LOGGED_MISSING_TABLES = 20;
const MAX_LOGGED_MISSING_COLUMNS = 40;
const MAX_LOGGED_MISSING_FUNCTIONS = 10;

let schemaManifestPromise: Promise<SchemaManifestModule> | null = null;
let cachedResult:
  | {
      expiresAt: number;
      value: SchemaContractReadinessResult;
    }
  | null = null;
let lastFailureFingerprint = '';

function normalizeConnectionString(uri: string): string {
  return uri
    .replace(/[?&]sslmode=[^&]*/gi, (match) => (match.startsWith('?') ? '?' : ''))
    .replace(/\?&/, '?')
    .replace(/\?$/, '');
}

function resolveSsl(connectionString: string): false | { rejectUnauthorized: boolean } {
  try {
    const parsed = new URL(connectionString);
    const sslMode = parsed.searchParams.get('sslmode');
    if (sslMode === 'disable') return false;
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') return false;
  } catch {
    // fall through
  }

  return {
    rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true',
  };
}

async function loadSchemaManifestModule(): Promise<SchemaManifestModule> {
  if (!schemaManifestPromise) {
    const absolutePath = resolve(process.cwd(), 'scripts/db/schema-manifest.mjs');
    const fileUrl = pathToFileURL(absolutePath).href;
    schemaManifestPromise = import(fileUrl) as Promise<SchemaManifestModule>;
  }
  return schemaManifestPromise;
}

function asUniqueSorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function buildRequiredSchema(
  cmsManifest: CmsSchemaManifest,
  cmsRequiredTables: string[],
): Map<string, Set<string>> {
  const required = new Map<string, Set<string>>();

  for (const table of cmsRequiredTables) {
    if (!required.has(table)) required.set(table, new Set());
  }

  for (const [table, columns] of Object.entries(cmsManifest)) {
    if (!required.has(table)) required.set(table, new Set());
    const set = required.get(table) as Set<string>;
    for (const column of Object.keys(columns)) {
      set.add(column);
    }
  }

  for (const [table, columns] of Object.entries(BACKEND_SCHEMA_COLUMNS)) {
    if (!required.has(table)) required.set(table, new Set());
    const set = required.get(table) as Set<string>;
    for (const column of columns) {
      set.add(column);
    }
  }

  return required;
}

async function withPgClient<T>(run: (client: { query: (sql: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> }) => Promise<T>): Promise<T> {
  const dbUri = resolveDbConnectionString();
  if (!dbUri) {
    throw new Error('Missing DB connection string (POSTGRES_URL / DATABASE_URI / DATABASE_URL).');
  }

  const connectionString = normalizeConnectionString(dbUri);
  const pgModule = await import('pg');
  const PgClient =
    (pgModule as { Client?: new (config: Record<string, unknown>) => { connect: () => Promise<void>; end: () => Promise<void>; query: (sql: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> } }).Client ??
    (pgModule as { default?: { Client?: new (config: Record<string, unknown>) => { connect: () => Promise<void>; end: () => Promise<void>; query: (sql: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> } } }).default?.Client;

  if (!PgClient) {
    throw new Error('Failed to load pg Client.');
  }

  const client = new PgClient({
    connectionString,
    ssl: resolveSsl(connectionString),
  });

  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
}

async function computeReadiness(): Promise<SchemaContractReadinessResult> {
  const { SCHEMA_MANIFEST, REQUIRED_TABLES } = await loadSchemaManifestModule();
  const requiredSchema = buildRequiredSchema(SCHEMA_MANIFEST, REQUIRED_TABLES);
  const requiredTables = [...requiredSchema.keys()];
  const requiredColumnsCount = [...requiredSchema.values()].reduce((sum, cols) => sum + cols.size, 0);
  const requiredFunctions = REQUIRED_BACKEND_FUNCTIONS;

  return withPgClient(async (client) => {
    const [tableResult, columnResult, functionResult] = await Promise.all([
      client.query(
        `
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            AND table_name = ANY($1::text[])
        `,
        [requiredTables],
      ),
      client.query(
        `
          SELECT table_name, column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = ANY($1::text[])
        `,
        [requiredTables],
      ),
      client.query(
        `
          SELECT p.proname AS function_name
          FROM pg_proc p
          JOIN pg_namespace n ON n.oid = p.pronamespace
          WHERE n.nspname = 'public'
            AND p.proname = ANY($1::text[])
        `,
        [requiredFunctions],
      ),
    ]);

    const existingTables = new Set(
      tableResult.rows
        .map((row) => row.table_name)
        .filter((value): value is string => typeof value === 'string'),
    );

    const existingColumnsByTable = new Map<string, Set<string>>();
    for (const row of columnResult.rows) {
      const tableName = row.table_name;
      const columnName = row.column_name;
      if (typeof tableName !== 'string' || typeof columnName !== 'string') continue;
      if (!existingColumnsByTable.has(tableName)) {
        existingColumnsByTable.set(tableName, new Set());
      }
      (existingColumnsByTable.get(tableName) as Set<string>).add(columnName);
    }

    const existingFunctions = new Set(
      functionResult.rows
        .map((row) => row.function_name)
        .filter((value): value is string => typeof value === 'string'),
    );

    const missingTables = asUniqueSorted(
      requiredTables.filter((tableName) => !existingTables.has(tableName)),
    );

    const missingColumns: MissingColumn[] = [];
    for (const [tableName, columns] of requiredSchema) {
      if (!existingTables.has(tableName)) continue;
      const existingColumns = existingColumnsByTable.get(tableName) ?? new Set<string>();
      for (const columnName of columns) {
        if (!existingColumns.has(columnName)) {
          missingColumns.push({ table: tableName, column: columnName });
        }
      }
    }
    missingColumns.sort((a, b) =>
      a.table === b.table
        ? a.column.localeCompare(b.column)
        : a.table.localeCompare(b.table),
    );

    const missingFunctions = asUniqueSorted(
      requiredFunctions.filter((name) => !existingFunctions.has(name)),
    );

    return {
      checkedAt: new Date().toISOString(),
      ready:
        missingTables.length === 0 &&
        missingColumns.length === 0 &&
        missingFunctions.length === 0,
      requiredTableCount: requiredTables.length,
      requiredColumnCount: requiredColumnsCount,
      missingTables,
      missingColumns,
      missingFunctions,
      error: null,
    };
  });
}

function resultFingerprint(result: SchemaContractReadinessResult): string {
  return JSON.stringify({
    missingTables: result.missingTables,
    missingColumns: result.missingColumns,
    missingFunctions: result.missingFunctions,
    error: result.error,
  });
}

function logFailure(logger: LoggerLike | undefined, result: SchemaContractReadinessResult): void {
  const fingerprint = resultFingerprint(result);
  if (!logger?.error || fingerprint === lastFailureFingerprint) return;

  lastFailureFingerprint = fingerprint;
  logger.error(
    {
      missingTableCount: result.missingTables.length,
      missingTables: result.missingTables.slice(0, MAX_LOGGED_MISSING_TABLES),
      missingColumnCount: result.missingColumns.length,
      missingColumns: result.missingColumns.slice(0, MAX_LOGGED_MISSING_COLUMNS),
      missingFunctionCount: result.missingFunctions.length,
      missingFunctions: result.missingFunctions.slice(0, MAX_LOGGED_MISSING_FUNCTIONS),
      schemaContractError: result.error,
      schemaCheckedAt: result.checkedAt,
    },
    'Schema contract readiness failed.',
  );
}

export async function checkSchemaContractReadiness(options?: {
  cacheTtlMs?: number;
  forceRefresh?: boolean;
  logger?: LoggerLike;
}): Promise<SchemaContractReadinessResult> {
  const requestedCacheTtlMs = options?.cacheTtlMs;
  const cacheTtlMs =
    typeof requestedCacheTtlMs === 'number' && Number.isFinite(requestedCacheTtlMs)
      ? Math.max(0, requestedCacheTtlMs)
      : DEFAULT_CACHE_TTL_MS;
  const now = Date.now();

  if (!options?.forceRefresh && cachedResult && cachedResult.expiresAt > now) {
    const cached = cachedResult.value;
    if (!cached.ready) logFailure(options?.logger, cached);
    return cached;
  }

  let result: SchemaContractReadinessResult;
  try {
    result = await computeReadiness();
  } catch (error) {
    result = {
      checkedAt: new Date().toISOString(),
      ready: false,
      requiredTableCount: 0,
      requiredColumnCount: 0,
      missingTables: [],
      missingColumns: [],
      missingFunctions: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }

  cachedResult = {
    expiresAt: now + cacheTtlMs,
    value: result,
  };

  if (result.ready) {
    lastFailureFingerprint = '';
  } else {
    logFailure(options?.logger, result);
  }

  return result;
}
