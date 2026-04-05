import type { BackendPrincipal, BackendRole } from '@plenor/contracts/auth';
import * as backendApiKeyAuth from '@/infrastructure/security/backendApiKeyAuth';

const backendApiKeyAuthModule =
  (backendApiKeyAuth as { default?: typeof import('@/infrastructure/security/backendApiKeyAuth') }).default ??
  (backendApiKeyAuth as typeof import('@/infrastructure/security/backendApiKeyAuth'));

const { authenticateBackendApiKey, hasRequiredRole } =
  backendApiKeyAuthModule;

export type RequireRoleResult =
  | {
      ok: true;
      principal: BackendPrincipal;
    }
  | {
      ok: false;
      status: 401 | 403;
      code: 'UNAUTHORIZED' | 'FORBIDDEN';
      message: string;
    };

export function requireApiRole(
  rawApiKey: string | null,
  allowedRoles: BackendRole[],
): RequireRoleResult {
  const principal = authenticateBackendApiKey(rawApiKey);
  if (!principal) {
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Missing or invalid API key.',
    };
  }

  if (!hasRequiredRole(principal, allowedRoles)) {
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      message: 'API key does not have required role.',
    };
  }

  return {
    ok: true,
    principal,
  };
}
