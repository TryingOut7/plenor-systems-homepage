import 'server-only';
import { getPayload as getPayloadInstance } from 'payload';
import config from '../payload.config';

export async function getPayload() {
  return getPayloadInstance({ config });
}
