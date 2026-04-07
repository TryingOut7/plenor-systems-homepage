/**
 * Deprecated drift entrypoint kept for backward compatibility.
 *
 * Use scripts/db/check-payload-generated-schema-parity.mjs instead.
 * This wrapper delegates to the new generated-schema parity check.
 */

import { spawn } from 'node:child_process';

async function run() {
  await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['scripts/db/check-payload-generated-schema-parity.mjs'],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit',
      },
    );

    child.on('error', (error) => reject(error));
    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`Schema drift check terminated by signal ${signal}.`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`Schema drift check failed with exit code ${code}.`));
        return;
      }
      resolve();
    });
  });
}

run().catch((error) => {
  console.error(
    `Schema drift check failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
