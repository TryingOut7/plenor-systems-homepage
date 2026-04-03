import {
  applyMigration,
  ensureMigrationsTable,
  formatMigrationId,
  listAppliedMigrations,
  listAvailableMigrations,
  listPendingMigrations,
  withDatabaseClient,
} from './migration-lib.mjs';

async function main() {
  const available = await listAvailableMigrations();

  await withDatabaseClient(async (client) => {
    await ensureMigrationsTable(client);
    const applied = await listAppliedMigrations(client);
    const pending = listPendingMigrations(available, applied);

    if (pending.length === 0) {
      console.log('No pending migrations.');
      return;
    }

    for (const migration of pending) {
      const migrationId = formatMigrationId(migration);
      console.log(`Applying migration ${migrationId}...`);
      await applyMigration(client, migration);
      console.log(`Applied migration ${migrationId}.`);
    }
  });
}

main().catch((error) => {
  console.error(
    `Migration run failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
