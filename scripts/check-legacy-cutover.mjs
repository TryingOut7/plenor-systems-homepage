import fs from 'node:fs';
import path from 'node:path';
import { evaluateLegacyCutoverReport } from '../src/payload/cms/legacyCutoverGate.ts';

function parseArgs(argv) {
  const args = {
    reportPath: '',
  };

  for (const raw of argv.slice(2)) {
    if (raw.startsWith('--report=')) {
      args.reportPath = raw.slice('--report='.length).trim();
    }
  }

  if (!args.reportPath) {
    throw new Error('Missing --report=<path> for cutover gate check.');
  }

  return args;
}

async function run() {
  const args = parseArgs(process.argv);
  const absolute = path.isAbsolute(args.reportPath)
    ? args.reportPath
    : path.join(process.cwd(), args.reportPath);

  const raw = fs.readFileSync(absolute, 'utf8');
  const report = JSON.parse(raw);
  const evaluation = evaluateLegacyCutoverReport(report);

  if (!evaluation.ready) {
    console.error('Legacy cutover gate failed.');
    for (const blocker of evaluation.blockers) {
      console.error(`- ${blocker}`);
    }
    process.exit(2);
  }

  console.log('Legacy cutover gate passed: unresolved parity queue is zero.');
}

run().catch((error) => {
  console.error('Legacy cutover gate check failed:', error);
  process.exit(1);
});
