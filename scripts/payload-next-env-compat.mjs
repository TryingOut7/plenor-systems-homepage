import { createRequire } from 'node:module';

let patched = false;

function patchDefaultExport(moduleValue) {
  if (moduleValue && typeof moduleValue === 'object' && !('default' in moduleValue)) {
    moduleValue.default = moduleValue;
  }
}

export function ensurePayloadNextEnvCompat() {
  if (patched) return;

  const require = createRequire(import.meta.url);
  patchDefaultExport(require('@next/env'));

  // Payload may resolve its own nested @next/env copy when loaded via tsx.
  const payloadEntrypoint = require.resolve('payload');
  const payloadRequire = createRequire(payloadEntrypoint);
  patchDefaultExport(payloadRequire('@next/env'));

  patched = true;
}
