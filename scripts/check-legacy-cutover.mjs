import { evaluateLegacyCutoverReport } from '../src/payload/cms/legacyCutoverGate.ts';
import {
  parseStringOption,
  readJsonFile,
  resolvePathFromCwd,
  runCli,
} from './lib/cli-utils.mjs';

const DEFAULT_REPORT_PATH = '.tmp/legacy-migration-report.json';

async function run() {
  const reportPath = parseStringOption(process.argv, '--report', DEFAULT_REPORT_PATH);
  const absolute = resolvePathFromCwd(reportPath);

  try {
    const report = readJsonFile(reportPath);
    const evaluation = evaluateLegacyCutoverReport(report);

    if (!evaluation.ready) {
      console.error('Legacy cutover gate failed.');
      for (const blocker of evaluation.blockers) {
        console.error(`- ${blocker}`);
      }
      process.exit(2);
    }

    console.log('Legacy cutover gate passed: unresolved parity queue is zero.');
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      throw new Error(
        `Missing migration report at ${absolute}. Run "npm run migrate:legacy-sections" first or pass --report=<path>.`,
      );
    }
    throw new Error(
      `Failed to read migration report at ${absolute}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

runCli(run, 'Legacy cutover gate check failed:');
