import { ensurePayloadNextEnvCompat } from '../payload-next-env-compat.mjs';

export async function withPayloadClient(run) {
  ensurePayloadNextEnvCompat();
  const { getPayload } = await import('../../src/payload/client.ts');
  const payload = await getPayload();
  try {
    return await run(payload);
  } finally {
    await payload.destroy();
  }
}
