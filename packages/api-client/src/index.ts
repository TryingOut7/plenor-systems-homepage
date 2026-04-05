import createClient from 'openapi-fetch';
import type { paths } from './generated';

export type BackendPaths = paths;
export type BackendApiClient = ReturnType<typeof createBackendApiClient>;

export function createBackendApiClient(baseUrl: string) {
  return createClient<paths>({ baseUrl });
}
