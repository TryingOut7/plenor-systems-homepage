/**
 * Deploy-time schema safety gate.
 *
 * Default behavior (no flags):
 *   1) Apply backend SQL migrations.
 *   2) Sync Payload relation hotfix table.
 *   3) Apply Payload migrations.
 *   4) Verify no backend migrations remain pending.
 *   5) Verify enum/column/table drift against schema manifest.
 *   6) Verify query-presets enum manifest parity.
 *
 * Check mode:
 *   node scripts/db/schema-ensure.mjs --check-only
 *   - Does not apply migrations.
 *   - Fails when backend/Payload migrations are pending or drift is detected.
 *
 * Optional:
 *   --skip-payload   Skip Payload migrate/status steps.
 */

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { parseFlag } from '../lib/cli-utils.mjs';
import { withDatabaseClient } from './migration-lib.mjs';

const CHECK_ONLY = parseFlag(process.argv, '--check-only');
const SKIP_PAYLOAD = parseFlag(process.argv, '--skip-payload');
const ROOT = process.cwd();

const DB_ENV_KEYS = ['POSTGRES_URL', 'DATABASE_URI', 'DATABASE_URL'];
const PAYLOAD_BOOTSTRAP_CORE_TABLES = [
  'users',
  'media',
  'forms',
  'site_pages',
  'payload_locked_documents_rels',
];

function hasDatabaseConnectionString() {
  return DB_ENV_KEYS.some((key) => {
    const value = process.env[key];
    return typeof value === 'string' && value.trim().length > 0;
  });
}

function formatCommand(command, args) {
  return [command, ...args].join(' ');
}

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
    const raw = await readFile(filePath, 'utf8');
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

async function loadLocalEnvFallback() {
  const cwd = process.cwd();
  await loadEnvFileIfExists(path.resolve(cwd, '.env.local'));
  await loadEnvFileIfExists(path.resolve(cwd, '.env'));
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, '');
}

function assertPayloadStatusHasNoPendingMigrations(output) {
  const clean = stripAnsi(output);
  if (/[|│]\s*No\s*[|│]/i.test(clean)) {
    throw new Error(
      'Payload migrations are still pending. Run "npm run db:migrate:payload" (or db:schema:ensure without --check-only).',
    );
  }
}

async function runStep(label, command, args, validateOutput) {
  console.log(`\n▶ ${label}`);
  console.log(`   ${formatCommand(command, args)}`);

  await new Promise((resolve, reject) => {
    const captureOutput = typeof validateOutput === 'function';
    const child = spawn(command, args, {
      cwd: ROOT,
      env: process.env,
      stdio: captureOutput ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });

    let output = '';
    if (captureOutput) {
      child.stdout.on('data', (chunk) => {
        const text = chunk.toString();
        output += text;
        process.stdout.write(text);
      });
      child.stderr.on('data', (chunk) => {
        const text = chunk.toString();
        output += text;
        process.stderr.write(text);
      });
    }

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
      try {
        if (captureOutput) validateOutput(output);
      } catch (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function fileExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function hasPayloadDevPushMarker() {
  try {
    return await withDatabaseClient(async (client) => {
      const tableResult = await client.query(
        `SELECT to_regclass('public.payload_migrations') AS regclass`,
      );
      const regclass = tableResult.rows?.[0]?.regclass;
      if (!regclass) return false;

      const markerResult = await client.query(
        `
          SELECT EXISTS(
            SELECT 1
            FROM public.payload_migrations
            WHERE batch = -1
          ) AS has_marker
        `,
      );
      return markerResult.rows?.[0]?.has_marker === true;
    });
  } catch (error) {
    throw new Error(
      `Unable to validate payload_migrations dev-push marker: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

async function getMissingPayloadBootstrapTables() {
  try {
    return await withDatabaseClient(async (client) => {
      const result = await client.query(
        `
          SELECT table_name
          FROM unnest($1::text[]) AS table_name
          WHERE to_regclass(format('public.%s', table_name)) IS NULL
          ORDER BY table_name ASC
        `,
        [PAYLOAD_BOOTSTRAP_CORE_TABLES],
      );
      return result.rows.map((row) => String(row.table_name));
    });
  } catch (error) {
    throw new Error(
      `Unable to detect payload bootstrap table state: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

async function main() {
  await loadLocalEnvFallback();

  if (
    process.env.PAYLOAD_DB_PUSH === 'true' ||
    process.env.PAYLOAD_CONFIRM_SCHEMA_PUSH === 'true'
  ) {
    console.warn(
      '⚠️  PAYLOAD_DB_PUSH/PAYLOAD_CONFIRM_SCHEMA_PUSH were enabled; overriding to false in db:schema:ensure to avoid schema push side effects.',
    );
  }
  process.env.PAYLOAD_DB_PUSH = 'false';
  process.env.PAYLOAD_CONFIRM_SCHEMA_PUSH = 'false';

  if (!hasDatabaseConnectionString()) {
    throw new Error(
      `Missing DB connection string. Set one of: ${DB_ENV_KEYS.join(', ')}.`,
    );
  }

  const node = process.execPath;
  const payloadBin = path.resolve(
    ROOT,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'payload.cmd' : 'payload',
  );

  if (!SKIP_PAYLOAD && (await hasPayloadDevPushMarker())) {
    throw new Error(
      'Detected Payload dev push marker (payload_migrations.batch = -1). This DB mixed push-mode and migrations. ' +
        'Production-safe options: (1) use a fresh DB and run db:schema:ensure, or (2) back up DB, run payload migrate interactively once, then delete batch=-1 rows in payload_migrations before automated deploys.',
    );
  }

  const steps = [];

  if (!CHECK_ONLY && !SKIP_PAYLOAD) {
    const missingCoreTables = await getMissingPayloadBootstrapTables();
    if (missingCoreTables.length > 0) {
      console.warn(
        `⚠️  Missing core Payload tables (${missingCoreTables.join(', ')}). ` +
          'Running one-time schema bootstrap before migrations.',
      );
      steps.push({
        label: 'Bootstrap Payload base schema (fresh DB guard)',
        command: node,
        args: ['--import', 'tsx', 'scripts/db/bootstrap-payload-schema.mjs'],
      });
    }
  }

  if (CHECK_ONLY) {
    steps.push({
      label: 'Backend migration status (must be clean)',
      command: node,
      args: ['scripts/db/migrate-status.mjs', '--check'],
    });

    if (!SKIP_PAYLOAD) {
      if (!(await fileExists(payloadBin))) {
        throw new Error(
          `Payload CLI not found at ${payloadBin}. Run "npm ci" first or pass --skip-payload.`,
        );
      }
      steps.push({
        label: 'Payload migration status',
        command: payloadBin,
        args: ['migrate:status'],
        validateOutput: assertPayloadStatusHasNoPendingMigrations,
      });
    }
  } else {
    steps.push({
      label: 'Apply backend SQL migrations',
      command: node,
      args: ['scripts/db/migrate.mjs'],
    });
    steps.push({
      label: 'Sync payload locked-doc relation columns',
      command: node,
      args: ['scripts/db/sync-payload-locked-docs-rels.mjs'],
    });

    if (!SKIP_PAYLOAD) {
      if (!(await fileExists(payloadBin))) {
        throw new Error(
          `Payload CLI not found at ${payloadBin}. Run "npm ci" first or pass --skip-payload.`,
        );
      }
      steps.push({
        label: 'Apply Payload migrations',
        command: payloadBin,
        args: ['migrate'],
      });
      steps.push({
        label: 'Payload migration status',
        command: payloadBin,
        args: ['migrate:status'],
        validateOutput: assertPayloadStatusHasNoPendingMigrations,
      });
    }

    steps.push({
      label: 'Backend migration status (must be clean)',
      command: node,
      args: ['scripts/db/migrate-status.mjs', '--check'],
    });
  }

  steps.push({
    label: 'Query-presets enum manifest parity',
    command: node,
    args: ['scripts/db/check-query-presets-enum-manifest.mjs'],
  });
  steps.push({
    label: 'Schema drift check',
    command: node,
    args: ['scripts/db/schema-drift.mjs', '--check-only'],
  });

  for (const step of steps) {
    await runStep(step.label, step.command, step.args, step.validateOutput);
  }

  console.log(
    `\n✅ Schema ensure ${CHECK_ONLY ? 'check' : 'apply'} completed with no drift.`,
  );
}

main().catch((error) => {
  console.error(
    `Schema ensure failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
