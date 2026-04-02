const version = process.versions.node;
const major = Number.parseInt(version.split('.')[0] || '', 10);

if (major !== 20) {
  console.error(
    `Unsupported Node runtime: ${version}. This project is pinned to Node 20.x for build determinism.`,
  );
  process.exit(1);
}

console.log(`Node runtime OK: ${version}`);
