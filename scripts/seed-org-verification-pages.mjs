import fs from 'node:fs';
import path from 'node:path';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, 'utf8');
  const lines = contents.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const index = trimmed.indexOf('=');
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function ensureEnvLoaded() {
  const cwd = process.cwd();
  loadEnvFile(path.join(cwd, '.env'));
  loadEnvFile(path.join(cwd, '.env.local'));
}

async function run() {
  ensureEnvLoaded();

  const baseUrl = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/+$/, '');
  let origin;
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    console.error(`Invalid NEXT_PUBLIC_SERVER_URL/base URL: "${baseUrl}"`);
    process.exit(1);
  }
  const secret = process.env.PAYLOAD_SEED_SECRET || process.env.PAYLOAD_SECRET;

  if (!secret) {
    console.error('Missing PAYLOAD_SEED_SECRET or PAYLOAD_SECRET. Cannot authorize seed request.');
    process.exit(1);
  }

  const response = await fetch(`${baseUrl}/api/internal/seed-org-verification-pages`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secret}`,
      origin,
    },
  });

  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    console.error(`Seed failed (${response.status}):`, payload);
    process.exit(1);
  }

  console.log('Org verification seed complete:');
  if (Array.isArray(payload?.created)) {
    for (const item of payload.created) {
      console.log(`  created: ${item}`);
    }
  }
  if (Array.isArray(payload?.skipped)) {
    for (const item of payload.skipped) {
      console.log(`  skipped: ${item}`);
    }
  }
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    for (const item of payload.errors) {
      console.error(`  error: ${item}`);
    }
    process.exit(1);
  }
}

run().catch((error) => {
  console.error('Seed command failed:', error);
  process.exit(1);
});
