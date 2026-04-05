import {
  ensureMigrationsTable,
  formatMigrationId,
  listAppliedMigrations,
  listAvailableMigrations,
  listPendingMigrations,
  withDatabaseClient,
} from './migration-lib.mjs';
import { parseFlag } from '../lib/cli-utils.mjs';

async function main() {
  const checkOnly = parseFlag(process.argv, '--check');
  const available = await listAvailableMigrations();

  await withDatabaseClient(async (client) => {
    await ensureMigrationsTable(client);
    const applied = await listAppliedMigrations(client);
    const pending = listPendingMigrations(available, applied);

    console.log(`Available migrations: ${available.length}`);
    console.log(`Applied migrations: ${applied.length}`);
    console.log(`Pending migrations: ${pending.length}`);

    if (pending.length > 0) {
      console.log('Pending migration IDs:');
      for (const migration of pending) {
        console.log(`- ${formatMigrationId(migration)}`);
      }
    }

    if (checkOnly && pending.length > 0) {
      process.exitCode = 1;
    }
  });
}

main().catch((error) => {
  console.error(
    `Migration status failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
