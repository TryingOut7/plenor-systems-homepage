import fs from 'node:fs';
import path from 'node:path';
import { getPayload } from '../src/payload/client.ts';
import {
  INTERPRETIVE_LEGACY_BLOCK_TYPES,
  migrateLegacySections,
} from '../src/payload/hooks/legacySectionMigration.ts';

function parseArgs(argv) {
  const args = {
    apply: false,
    limit: 500,
    reportPath: '',
    approvalsPath: '',
  };

  for (const raw of argv.slice(2)) {
    if (raw === '--apply') {
      args.apply = true;
      continue;
    }
    if (raw.startsWith('--limit=')) {
      const parsed = Number(raw.slice('--limit='.length));
      if (Number.isFinite(parsed) && parsed > 0) args.limit = parsed;
      continue;
    }
    if (raw.startsWith('--report=')) {
      args.reportPath = raw.slice('--report='.length).trim();
      continue;
    }
    if (raw.startsWith('--approvals=')) {
      args.approvalsPath = raw.slice('--approvals='.length).trim();
    }
  }

  return args;
}

function readApprovalsMap(approvalsPath) {
  if (!approvalsPath) return {};
  const absolute = path.isAbsolute(approvalsPath)
    ? approvalsPath
    : path.join(process.cwd(), approvalsPath);
  const raw = fs.readFileSync(absolute, 'utf8');
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object') return {};
  if (parsed.docs && typeof parsed.docs === 'object') {
    return parsed.docs;
  }
  return parsed;
}

function writeReport(reportPath, report) {
  if (!reportPath) return;
  const absolute = path.isAbsolute(reportPath)
    ? reportPath
    : path.join(process.cwd(), reportPath);
  fs.writeFileSync(absolute, JSON.stringify(report, null, 2));
  console.log(`Wrote migration report to ${absolute}`);
}

function asSectionArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((entry) => !!entry && typeof entry === 'object');
}

function hasInterpretiveLegacySections(sectionsInput) {
  const sections = asSectionArray(sectionsInput);
  return sections.some((section) => {
    const blockType = typeof section.blockType === 'string' ? section.blockType : '';
    return INTERPRETIVE_LEGACY_BLOCK_TYPES.has(blockType);
  });
}

async function run() {
  const args = parseArgs(process.argv);
  const payload = await getPayload();
  const approvalsByDocId = readApprovalsMap(args.approvalsPath);

  const pages = await payload.find({
    collection: 'site-pages',
    limit: args.limit,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });

  const reportItems = [];
  let convertedDocs = 0;
  let updatedDocs = 0;
  let unresolvedParityFailures = 0;

  for (const doc of pages.docs) {
    const docId = String(doc.id);
    const interpretiveMappingDetected = hasInterpretiveLegacySections(doc.sections);
    const migration = migrateLegacySections(doc.sections);
    if (migration.convertedCount === 0) continue;
    convertedDocs += 1;

    const approvals = approvalsByDocId[docId] && typeof approvalsByDocId[docId] === 'object'
      ? approvalsByDocId[docId]
      : {};

    const domSnapshot = migration.parityFailures.length > 0 ? 'fail' : 'pass';
    const visualRegression = interpretiveMappingDetected
      ? approvals.visualRegression === true
        ? 'pass'
        : 'needs_manual_review'
      : 'not_required';
    const manualQa = interpretiveMappingDetected
      ? approvals.manualQa === true
        ? 'pass'
        : 'needs_manual_review'
      : 'not_required';

    const requiresManualReview =
      domSnapshot !== 'pass' ||
      visualRegression === 'needs_manual_review' ||
      manualQa === 'needs_manual_review';

    if (requiresManualReview) {
      unresolvedParityFailures += 1;
      reportItems.push({
        id: doc.id,
        slug: doc.slug,
        status: 'needs_manual_review',
        convertedCount: migration.convertedCount,
        parityFailures: migration.parityFailures,
        interpretiveMappingDetected,
        gates: {
          domSnapshot,
          visualRegression,
          manualQa,
        },
      });
      continue;
    }

    if (args.apply) {
      await payload.update({
        collection: 'site-pages',
        id: docId,
        data: {
          sections: migration.sections,
        },
        depth: 0,
        overrideAccess: true,
      });
      updatedDocs += 1;
    }

    reportItems.push({
      id: doc.id,
      slug: doc.slug,
      status: args.apply ? 'updated' : 'dry_run_ok',
      convertedCount: migration.convertedCount,
      parityFailures: [],
      interpretiveMappingDetected,
      gates: {
        domSnapshot,
        visualRegression,
        manualQa,
      },
    });
  }

  const report = {
    mode: args.apply ? 'apply' : 'dry-run',
    scannedDocs: pages.docs.length,
    convertedDocs,
    updatedDocs,
    unresolvedParityFailures,
    items: reportItems,
  };

  writeReport(args.reportPath, report);
  console.log(JSON.stringify(report, null, 2));

  if (unresolvedParityFailures > 0) {
    process.exitCode = 2;
  }
}

run().catch((error) => {
  console.error('Legacy migration failed:', error);
  process.exit(1);
});
