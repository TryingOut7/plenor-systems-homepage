import { afterEach, describe, expect, it } from 'vitest';
import {
  authenticateBackendApiKey,
  hasRequiredRole,
} from '@/infrastructure/security/backendApiKeyAuth';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('backend API key auth', () => {
  it('authenticates composite API keys and role checks', () => {
    process.env.BACKEND_API_KEYS =
      'internal-key:internal:int-1,admin-key:admin:adm-1';

    const internal = authenticateBackendApiKey('internal-key');
    const admin = authenticateBackendApiKey('admin-key');

    expect(internal).toEqual({
      keyId: 'int-1',
      role: 'internal',
    });
    expect(admin).toEqual({
      keyId: 'adm-1',
      role: 'admin',
    });

    expect(internal && hasRequiredRole(internal, ['internal'])).toBe(true);
    expect(internal && hasRequiredRole(internal, ['admin'])).toBe(false);
    expect(admin && hasRequiredRole(admin, ['internal', 'admin'])).toBe(true);
  });

  it('supports dedicated env keys and rejects unknown key', () => {
    process.env.BACKEND_INTERNAL_API_KEY = 'dedicated-internal';
    process.env.BACKEND_ADMIN_API_KEY = 'dedicated-admin';

    expect(authenticateBackendApiKey('dedicated-internal')?.role).toBe(
      'internal',
    );
    expect(authenticateBackendApiKey('dedicated-admin')?.role).toBe('admin');
    expect(authenticateBackendApiKey('invalid')).toBeNull();
  });
});
