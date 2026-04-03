import { buildAuditDashboardSummary } from '../src/payload/cms/auditDashboard.ts';
import { parseNumberOption, runCli } from './lib/cli-utils.mjs';
import { withPayloadClient } from './lib/payload-cli.mjs';

function parseArgs(argv) {
  return {
    days: parseNumberOption(argv, '--days', 30),
    limit: parseNumberOption(argv, '--limit', 1000),
  };
}

async function run() {
  const args = parseArgs(process.argv);
  await withPayloadClient(async (payload) => {
    const since = new Date(Date.now() - args.days * 24 * 60 * 60 * 1000).toISOString();
    const logs = await payload.find({
      collection: 'audit-logs',
      where: {
        changedAt: {
          greater_than_equal: since,
        },
      },
      limit: args.limit,
      depth: 1,
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
  });
}

runCli(run, 'Failed to generate audit dashboard summary:');
