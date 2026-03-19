import 'server-only';
import { cache } from 'react';
import { getPayload as getPayloadInstance } from 'payload';
import config from '../payload.config';

let payloadPromise: ReturnType<typeof getPayloadInstance> | null = null;

async function getPayloadUncached() {
  if (!payloadPromise) {
    payloadPromise = getPayloadInstance({ config });
  }

  try {
    return await payloadPromise;
  } catch (error) {
    // Allow retries after transient init/connect failures.
    payloadPromise = null;
    throw error;
  }
}

export const getPayload = cache(getPayloadUncached);
