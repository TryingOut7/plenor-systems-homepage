/**
 * Schema manifest sourced from Payload's generated DB schema.
 *
 * This removes manual table/column bookkeeping drift: expected tables, columns,
 * and enum labels now come directly from src/payload-generated-schema.ts.
 */

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadPayloadGeneratedSchemaManifestSync } from './payload-generated-schema-parser.mjs';

const GENERATED_SCHEMA_PATH = path.resolve(
  process.cwd(),
  'src/payload-generated-schema.ts',
);

if (!existsSync(GENERATED_SCHEMA_PATH)) {
  const payloadBin = path.resolve(
    process.cwd(),
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'payload.cmd' : 'payload',
  );

  if (existsSync(payloadBin)) {
    execFileSync(payloadBin, ['generate:db-schema'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'ignore',
    });
  }
}

if (!existsSync(GENERATED_SCHEMA_PATH)) {
  throw new Error(
    `Missing ${GENERATED_SCHEMA_PATH}. Run \"npm run generate:db-schema\" before schema checks.`,
  );
}

const {
  schemaManifest,
  requiredTables,
  schemaEnumManifest,
} = loadPayloadGeneratedSchemaManifestSync(GENERATED_SCHEMA_PATH);

export const SCHEMA_MANIFEST = schemaManifest;
export const REQUIRED_TABLES = requiredTables;
export const SCHEMA_ENUM_MANIFEST = schemaEnumManifest;
