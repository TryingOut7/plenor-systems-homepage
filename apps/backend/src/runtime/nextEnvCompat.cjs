const { createRequire } = require('node:module');

function patchMissingDefaultExport(loader, moduleName) {
  const loaded = loader(moduleName);
  if (!loaded || typeof loaded !== 'object') return;

  const hasMissingDefault =
    loaded.__esModule === true &&
    (loaded.default === undefined || loaded.default === null);
  if (!hasMissingDefault) return;

  Object.defineProperty(loaded, 'default', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: loaded,
  });
}

patchMissingDefaultExport(require, '@next/env');

try {
  const payloadEntrypoint = require.resolve('payload');
  const payloadRequire = createRequire(payloadEntrypoint);
  patchMissingDefaultExport(payloadRequire, '@next/env');
} catch {
  // Ignore when payload is not resolvable in the current runtime.
}
