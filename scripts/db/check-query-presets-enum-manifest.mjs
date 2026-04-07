import { promises as fs } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { SCHEMA_ENUM_MANIFEST } from './schema-manifest.mjs';

const PAYLOAD_DIR = path.resolve(process.cwd(), 'src/payload');
const PAYLOAD_CONFIG_FILE = path.resolve(process.cwd(), 'src/payload.config.ts');
const MANAGED_ENUM = 'public.enum_payload_query_presets_related_collection';

function isPropertyAssignmentWithName(property, name) {
  if (!ts.isPropertyAssignment(property)) return false;
  const propertyName = property.name;
  if (ts.isIdentifier(propertyName)) return propertyName.text === name;
  if (ts.isStringLiteralLike(propertyName)) return propertyName.text === name;
  return false;
}

function findObjectProperty(objectLiteral, name) {
  return objectLiteral.properties.find((property) =>
    isPropertyAssignmentWithName(property, name),
  );
}

function isBooleanTrueExpression(expression) {
  return expression.kind === ts.SyntaxKind.TrueKeyword;
}

function readStringLiteral(expression) {
  if (ts.isStringLiteralLike(expression)) return expression.text;
  return null;
}

function formatFileLocation(sourceFile, node) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return `${path.relative(process.cwd(), sourceFile.fileName)}:${line + 1}:${character + 1}`;
}

function collectSlugsFromSource(filePath, source) {
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);
  const slugs = [];

  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const enableQueryPresetsProperty = findObjectProperty(node, 'enableQueryPresets');
      if (enableQueryPresetsProperty) {
        const enabled = isBooleanTrueExpression(enableQueryPresetsProperty.initializer);
        if (enabled) {
          const slugProperty = findObjectProperty(node, 'slug');
          if (!slugProperty) {
            throw new Error(
              `Could not find slug in ${formatFileLocation(sourceFile, node)} while enableQueryPresets is true.`,
            );
          }

          const slug = readStringLiteral(slugProperty.initializer);
          if (!slug) {
            throw new Error(
              `Slug must be a string literal in ${formatFileLocation(sourceFile, slugProperty)} when enableQueryPresets is true.`,
            );
          }

          slugs.push(slug);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return slugs;
}

async function listTypeScriptFiles(rootDir) {
  let entries;
  try {
    entries = await fs.readdir(rootDir, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listTypeScriptFiles(fullPath)));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.ts')) continue;
    if (entry.name.endsWith('.d.ts')) continue;

    files.push(fullPath);
  }

  return files;
}

async function listCollectionSlugsWithQueryPresets() {
  const payloadFiles = await listTypeScriptFiles(PAYLOAD_DIR);
  const candidates = new Set([...payloadFiles, PAYLOAD_CONFIG_FILE]);
  const slugs = new Set();

  for (const filePath of candidates) {
    const source = await fs.readFile(filePath, 'utf8');
    const extractedSlugs = collectSlugsFromSource(filePath, source);
    for (const slug of extractedSlugs) {
      slugs.add(slug);
    }
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
      '\nRun payload DB schema + migration workflow and apply migrations before deploy.',
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
