import { getPayload } from 'payload';
import config from '../../src/payload.config.ts';

type NamedSchemaObject = {
  slug?: string;
};

function readMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function run() {
  const resolvedConfig = await config;
  const payload = await getPayload({ config: resolvedConfig });

  const failures: string[] = [];
  const collectionSlugs = (resolvedConfig.collections ?? [])
    .map((collection) => (collection as NamedSchemaObject).slug)
    .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0);

  const globalSlugs = (resolvedConfig.globals ?? [])
    .map((globalConfig) => (globalConfig as NamedSchemaObject).slug)
    .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0);

  for (const slug of collectionSlugs) {
    try {
      await payload.find({
        collection: slug as never,
        limit: 1,
        depth: 1,
        overrideAccess: true,
      });
    } catch (error) {
      failures.push(`collection:${slug} find failed: ${readMessage(error)}`);
    }
  }

  for (const slug of globalSlugs) {
    try {
      await payload.findGlobal({
        slug: slug as never,
        depth: 1,
      });
    } catch (error) {
      failures.push(`global:${slug} findGlobal failed: ${readMessage(error)}`);
    }
  }

  try {
    if ('destroy' in payload.db && typeof payload.db.destroy === 'function') {
      await payload.db.destroy();
    }
  } catch {
    // no-op: cleanup failure should not hide check results
  }

  if (failures.length > 0) {
    console.error('\n❌ Payload runtime schema check failed:');
    for (const failure of failures) {
      console.error(`   - ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    `✅ Payload runtime schema check passed (${collectionSlugs.length} collections, ${globalSlugs.length} globals).`,
  );
}

run().catch((error) => {
  console.error(
    `Payload runtime schema check failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
