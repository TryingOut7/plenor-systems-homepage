import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const importMapPath = path.resolve(__dirname, '../src/app/(payload)/admin/importMap.js');

try {
  await access(importMapPath);
  console.log(`Payload import map OK: ${importMapPath}`);
} catch {
  console.error(
    [
      `Missing Payload import map at ${importMapPath}.`,
      'Builds rely on this checked-in file for deterministic deploys.',
      'Regenerate it in development and commit the resulting file before deploying.',
    ].join(' '),
  );
  process.exit(1);
}
