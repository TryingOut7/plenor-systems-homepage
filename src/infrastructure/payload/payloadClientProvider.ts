import { getPayload } from '@/payload/client';

export type PayloadClient = Awaited<ReturnType<typeof getPayload>>;

export async function getPayloadClient(): Promise<PayloadClient> {
  return getPayload();
}
