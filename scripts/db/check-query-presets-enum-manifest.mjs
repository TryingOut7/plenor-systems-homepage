import { promises as fs } from 'node:fs';
import path from 'node:path';
import { SCHEMA_ENUM_MANIFEST } from './schema-manifest.mjs';

const COLLECTIONS_DIR = path.resolve(process.cwd(), 'src/payload/collections');
const MANAGED_ENUM = 'public.enum_payload_query_presets_related_collection';

async function listCollectionSlugsWithQueryPresets() {
  const entries = await fs.readdir(COLLECTIONS_DIR, { withFileTypes: true });
  const slugs = new Set();

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.ts')) continue;

    const filePath = path.join(COLLECTIONS_DIR, entry.name);
    const source = await fs.readFile(filePath, 'utf8');

    if (!/enableQueryPresets\s*:\s*true\b/.test(source)) continue;

    const slugMatch = source.match(/\bslug\s*:\s*['"]([^'"]+)['"]/);
    if (!slugMatch) {
      throw new Error(
        `Could not find slug in ${path.relative(process.cwd(), filePath)} while enableQueryPresets is true.`,
      );
    }

    slugs.add(slugMatch[1]);
  }

  return [...slugs].sort();
}

async function run() {
  const expected = new Set(SCHEMA_ENUM_MANIFEST[MANAGED_ENUM] ?? []);
  if (expected.size === 0) {
    throw new Error(`Missing enum manifest entries for ${MANAGED_ENUM}.`);
  }

  const queryPresetSlugs = await listCollectionSlugsWithQueryPresets();
  const missing = queryPresetSlugs.filter((slug) => !expected.has(slug));

  if (missing.length > 0) {
    console.error(
      `❌ ${MANAGED_ENUM} manifest is missing ${missing.length} query-preset collection slug(s):`,
    );
    for (const slug of missing) {
      console.error(`   - ${slug}`);
    }
    console.error(
      '\nUpdate scripts/db/schema-manifest.mjs (SCHEMA_ENUM_MANIFEST) and add/apply migration(s).',
    );
    process.exit(1);
  }

  console.log(
    `✅ ${MANAGED_ENUM} manifest covers all ${queryPresetSlugs.length} collections with enableQueryPresets.`,
  );
}

run().catch((error) => {
  console.error(
    `Query preset enum manifest check failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
