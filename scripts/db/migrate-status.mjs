import {
  ensureMigrationsTable,
  formatMigrationId,
  listAppliedMigrations,
  listAvailableMigrations,
  withDatabaseClient,
} from './migration-lib.mjs';

async function main() {
  const checkOnly = process.argv.includes('--check');
  const available = await listAvailableMigrations();

  await withDatabaseClient(async (client) => {
    await ensureMigrationsTable(client);
    const applied = await listAppliedMigrations(client);
    const appliedVersions = new Set(applied.map((migration) => migration.version));

    const pending = available.filter(
      (migration) => !appliedVersions.has(migration.version),
    );

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
