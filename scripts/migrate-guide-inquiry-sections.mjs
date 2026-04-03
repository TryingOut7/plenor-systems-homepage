import guideInquiryMigration from '../src/payload/hooks/guideInquirySectionMigration.ts';
import {
  parseFlag,
  parseNumberOption,
  parseStringOption,
  runCli,
  writeJsonFile,
} from './lib/cli-utils.mjs';
import { withPayloadClient } from './lib/payload-cli.mjs';

const TARGET_COLLECTIONS = [
  'site-pages',
  'page-drafts',
  'page-presets',
  'page-playgrounds',
  'reusable-sections',
];

function parseArgs(argv) {
  return {
    apply: parseFlag(argv, '--apply'),
    limit: parseNumberOption(argv, '--limit', 200),
    reportPath: parseStringOption(
      argv,
      '--report',
      '.tmp/guide-inquiry-form-migration-report.json',
    ),
  };
}

function writeReport(reportPath, report) {
  if (!reportPath) return;
  const absolutePath = writeJsonFile(reportPath, report);
  console.log(`Wrote migration report to ${absolutePath}`);
}

async function runCollectionMigration(payload, collection, args) {
  const items = [];
  let scanned = 0;
  let converted = 0;
  let updated = 0;
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const result = await payload.find({
      collection,
      depth: 0,
      limit: args.limit,
      page,
      draft: true,
      overrideAccess: true,
    });

    scanned += result.docs.length;

    for (const doc of result.docs) {
      if (!guideInquiryMigration.hasGuideInquirySections(doc.sections)) continue;

      const migration = await guideInquiryMigration.migrateGuideInquirySectionsWithDefaultForms(
        doc.sections,
      );
      if (migration.convertedCount === 0) continue;

      converted += 1;

      if (args.apply) {
        await payload.update({
          collection,
          id: String(doc.id),
          data: { sections: migration.sections },
          depth: 0,
          overrideAccess: true,
        });
        updated += 1;
      }

      items.push({
        id: String(doc.id),
        slug: typeof doc.slug === 'string' ? doc.slug : null,
        title: typeof doc.title === 'string' ? doc.title : null,
        convertedSections: migration.convertedCount,
        status: args.apply ? 'updated' : 'dry_run_ok',
      });
    }

    hasNextPage = result.hasNextPage;
    page += 1;
  }

  return { collection, scanned, converted, updated, items };
}

async function run() {
  const args = parseArgs(process.argv);

  await withPayloadClient(async (payload) => {
    const collectionReports = [];
    for (const collection of TARGET_COLLECTIONS) {
      const report = await runCollectionMigration(payload, collection, args);
      collectionReports.push(report);
    }

    const summary = collectionReports.reduce(
      (acc, report) => {
        acc.scanned += report.scanned;
        acc.converted += report.converted;
        acc.updated += report.updated;
        return acc;
      },
      { scanned: 0, converted: 0, updated: 0 },
    );

    const finalReport = {
      mode: args.apply ? 'apply' : 'dry-run',
      targetCollections: TARGET_COLLECTIONS,
      ...summary,
      collections: collectionReports,
    };

    writeReport(args.reportPath, finalReport);
    console.log(JSON.stringify(finalReport, null, 2));
  });
}

runCli(run, 'Guide/Inquiry form section migration failed:');
