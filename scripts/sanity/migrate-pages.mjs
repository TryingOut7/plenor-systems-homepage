#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from 'next-sanity';
import {
  pageMigrations,
  resolveMigrationsById,
  getAvailablePageTypes,
} from './page-migrations.mjs';

const DEFAULT_LIMIT = 500;

function printHelp() {
  console.log(`
Usage:
  node scripts/sanity/migrate-pages.mjs [options]

Options:
  --dry-run                Preview changes without writing (default)
  --apply                  Apply changes
  --type <pageType>        Restrict to one page type (repeatable, comma-separated supported)
  --migration <id>         Restrict to one migration id (repeatable, comma-separated supported)
  --id <documentId>        Restrict to one Sanity document id
  --limit <number>         Max docs to fetch when not using --id (default: ${DEFAULT_LIMIT})
  --project-id <id>        Override NEXT_PUBLIC_SANITY_PROJECT_ID
  --dataset <name>         Override NEXT_PUBLIC_SANITY_DATASET (default: production)
  --token <token>          Override SANITY_API_WRITE_TOKEN / SANITY_API_READ_TOKEN
  --help                   Show this help

Examples:
  npm run migrate:sanity:pages
  npm run migrate:sanity:pages -- --apply
  npm run migrate:sanity:pages -- --type aboutPage --apply
  npm run migrate:sanity:pages -- --migration about-legacy-to-sections-v1 --apply
`.trim());
}

function readList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function readFlagValue(args, index, flagName) {
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${flagName}`);
  }
  return value;
}

function parseArgs(args) {
  const options = {
    apply: false,
    types: [],
    migrations: [],
    documentId: undefined,
    limit: DEFAULT_LIMIT,
    projectId: undefined,
    dataset: undefined,
    token: undefined,
    help: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '--help') {
      options.help = true;
      continue;
    }
    if (arg === '--apply') {
      options.apply = true;
      continue;
    }
    if (arg === '--dry-run') {
      options.apply = false;
      continue;
    }
    if (arg === '--type') {
      const value = readFlagValue(args, i, '--type');
      options.types.push(...readList(value));
      i += 1;
      continue;
    }
    if (arg === '--migration') {
      const value = readFlagValue(args, i, '--migration');
      options.migrations.push(...readList(value));
      i += 1;
      continue;
    }
    if (arg === '--id') {
      options.documentId = readFlagValue(args, i, '--id');
      i += 1;
      continue;
    }
    if (arg === '--limit') {
      const raw = readFlagValue(args, i, '--limit');
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error(`Invalid --limit value: ${raw}`);
      }
      options.limit = parsed;
      i += 1;
      continue;
    }
    if (arg === '--project-id') {
      options.projectId = readFlagValue(args, i, '--project-id');
      i += 1;
      continue;
    }
    if (arg === '--dataset') {
      options.dataset = readFlagValue(args, i, '--dataset');
      i += 1;
      continue;
    }
    if (arg === '--token') {
      options.token = readFlagValue(args, i, '--token');
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function parseEnvFile(filepath) {
  if (!fs.existsSync(filepath)) return;
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function loadLocalEnv() {
  const cwd = process.cwd();
  parseEnvFile(path.join(cwd, '.env.local'));
  parseEnvFile(path.join(cwd, '.env'));
}

function normalizePatchResult(result) {
  const set = result?.set && typeof result.set === 'object' ? result.set : {};
  const unset = Array.isArray(result?.unset) ? result.unset : [];
  return { set, unset };
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  loadLocalEnv();

  const projectId = options.projectId || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = options.dataset || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const token =
    options.token || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;

  if (!projectId) {
    throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID (or pass --project-id)');
  }
  if (!token) {
    throw new Error(
      'Missing SANITY_API_WRITE_TOKEN / SANITY_API_READ_TOKEN (or pass --token).'
    );
  }

  const selectedMigrations = resolveMigrationsById(options.migrations);
  if (selectedMigrations.length === 0) {
    const available = pageMigrations.map((migration) => migration.id).join(', ') || '(none)';
    throw new Error(`No migrations matched. Available migrations: ${available}`);
  }

  const selectedTypes = options.types.length
    ? [...new Set(options.types)]
    : getAvailablePageTypes(selectedMigrations);

  const migrationsByType = new Map();
  for (const migration of selectedMigrations) {
    for (const type of migration.targetTypes) {
      if (selectedTypes.length > 0 && !selectedTypes.includes(type)) continue;
      if (!migrationsByType.has(type)) migrationsByType.set(type, []);
      migrationsByType.get(type).push(migration);
    }
  }

  const targetTypes = [...migrationsByType.keys()];
  if (!options.documentId && targetTypes.length === 0) {
    throw new Error('No target page types found for the selected migration/type filters.');
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: false,
    token,
  });

  const query = options.documentId
    ? '*[_id == $documentId][0...1]{..., _id, _type}'
    : '*[_type in $types][0...$limit]{..., _id, _type}';

  const docs = await client.fetch(query, {
    documentId: options.documentId,
    types: targetTypes,
    limit: options.limit,
  });

  const plans = [];
  for (const doc of docs) {
    const docMigrations = migrationsByType.get(doc._type) || [];
    if (docMigrations.length === 0) continue;

    const matched = docMigrations.filter((migration) => migration.appliesTo(doc));
    if (matched.length === 0) continue;

    const setPayload = {};
    const unsetPayload = new Set();
    for (const migration of matched) {
      const result = normalizePatchResult(migration.migrate(doc));
      Object.assign(setPayload, result.set);
      result.unset.forEach((field) => unsetPayload.add(field));
    }

    const setKeys = Object.keys(setPayload);
    if (setKeys.length === 0 && unsetPayload.size === 0) continue;

    plans.push({
      id: doc._id,
      type: doc._type,
      migrationIds: matched.map((migration) => migration.id),
      setPayload,
      unsetPayload: [...unsetPayload],
    });
  }

  if (plans.length === 0) {
    console.log('No documents required migration for the selected filters.');
    return;
  }

  const modeLabel = options.apply ? 'APPLY' : 'DRY RUN';
  console.log(`[${modeLabel}] Planned document updates: ${plans.length}`);
  for (const plan of plans) {
    const setFields = Object.keys(plan.setPayload);
    console.log(`- ${plan.id} (${plan.type})`);
    console.log(`  migrations: ${plan.migrationIds.join(', ')}`);
    console.log(`  set: ${setFields.length ? setFields.join(', ') : '(none)'}`);
    console.log(`  unset: ${plan.unsetPayload.length ? plan.unsetPayload.join(', ') : '(none)'}`);
  }

  if (!options.apply) {
    console.log('\nDry run only. Re-run with --apply to commit patches.');
    return;
  }

  for (const plan of plans) {
    let patch = client.patch(plan.id);
    if (Object.keys(plan.setPayload).length > 0) {
      patch = patch.set(plan.setPayload);
    }
    if (plan.unsetPayload.length > 0) {
      patch = patch.unset(plan.unsetPayload);
    }
    await patch.commit({ autoGenerateArrayKeys: true });
    console.log(`✔ migrated ${plan.id}`);
  }

  console.log('\nMigration run complete.');
}

run().catch((error) => {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
});
