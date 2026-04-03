import { buildAuditDashboardSummary } from '../src/payload/cms/auditDashboard.ts';
import { ensurePayloadNextEnvCompat } from './payload-next-env-compat.mjs';

function parseArgs(argv) {
  const args = {
    days: 30,
    limit: 1000,
  };

  for (const raw of argv.slice(2)) {
    if (raw.startsWith('--days=')) {
      const parsed = Number(raw.slice('--days='.length));
      if (Number.isFinite(parsed) && parsed > 0) args.days = parsed;
      continue;
    }
    if (raw.startsWith('--limit=')) {
      const parsed = Number(raw.slice('--limit='.length));
      if (Number.isFinite(parsed) && parsed > 0) args.limit = parsed;
    }
  }

  return args;
}

async function run() {
  const args = parseArgs(process.argv);
  ensurePayloadNextEnvCompat();
  const { getPayload } = await import('../src/payload/client.ts');
  const payload = await getPayload();
  try {
    const since = new Date(Date.now() - args.days * 24 * 60 * 60 * 1000).toISOString();
    const logs = await payload.find({
      collection: 'audit-logs',
      where: {
        changedAt: {
          greater_than_equal: since,
        },
      },
      limit: args.limit,
      depth: 0,
      overrideAccess: true,
    });

    const summary = buildAuditDashboardSummary(logs.docs);

    console.log(
      JSON.stringify(
        {
          windowDays: args.days,
          since,
          scanned: logs.docs.length,
          summary,
        },
        null,
        2,
      ),
    );
  } finally {
    await payload.destroy();
  }
}

run()
  .then(() => {
    process.exit(process.exitCode ?? 0);
  })
  .catch((error) => {
    console.error('Failed to generate audit dashboard summary:', error);
    process.exit(1);
  });
