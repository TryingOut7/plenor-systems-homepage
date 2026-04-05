import {
  ensureMigrationsTable,
  formatMigrationId,
  listAppliedMigrations,
  listAvailableMigrations,
  rollbackMigration,
  withDatabaseClient,
} from './migration-lib.mjs';

async function main() {
  const available = await listAvailableMigrations();
  const byVersion = new Map(available.map((migration) => [migration.version, migration]));

  await withDatabaseClient(async (client) => {
    await ensureMigrationsTable(client);
    const applied = await listAppliedMigrations(client);

    if (applied.length === 0) {
      console.log('No applied migrations to roll back.');
      return;
    }

    const latestApplied = applied[applied.length - 1];
    const migration = byVersion.get(latestApplied.version);

    if (!migration) {
      throw new Error(
        `Applied migration ${latestApplied.version}_${latestApplied.name} does not exist in migrations/versions.`,
      );
    }

    const migrationId = formatMigrationId(migration);
    console.log(`Rolling back migration ${migrationId}...`);
    await rollbackMigration(client, migration);
    console.log(`Rolled back migration ${migrationId}.`);
  });
}

main().catch((error) => {
  console.error(
    `Migration rollback failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
