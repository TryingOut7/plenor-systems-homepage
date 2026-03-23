import {
  applyMigration,
  ensureMigrationsTable,
  formatMigrationId,
  listAppliedMigrations,
  listAvailableMigrations,
  withDatabaseClient,
} from './migration-lib.mjs';

async function main() {
  const available = await listAvailableMigrations();

  await withDatabaseClient(async (client) => {
    await ensureMigrationsTable(client);
    const applied = await listAppliedMigrations(client);
    const appliedVersions = new Set(applied.map((migration) => migration.version));

    const pending = available.filter(
      (migration) => !appliedVersions.has(migration.version),
    );

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
