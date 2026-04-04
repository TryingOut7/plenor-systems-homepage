import { afterEach, describe, expect, it } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('backend API key auth', () => {
  it('authenticates composite API keys and role checks', async () => {
    process.env.BACKEND_API_KEYS =
      'internal-key:internal:int-1,admin-key:admin:adm-1';
    const { authenticateBackendApiKey, hasRequiredRole } = await import(
      '@/infrastructure/security/backendApiKeyAuth'
    );

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

    expect(internal).not.toBeNull();
    expect(admin).not.toBeNull();
    expect(hasRequiredRole(internal!, ['internal'])).toBe(true);
    expect(hasRequiredRole(internal!, ['admin'])).toBe(false);
    expect(hasRequiredRole(admin!, ['internal', 'admin'])).toBe(true);
  });

  it('supports dedicated env keys and rejects unknown key', async () => {
    process.env.BACKEND_INTERNAL_API_KEY = 'dedicated-internal';
    process.env.BACKEND_ADMIN_API_KEY = 'dedicated-admin';
    const { authenticateBackendApiKey } = await import(
      '@/infrastructure/security/backendApiKeyAuth'
    );

    expect(authenticateBackendApiKey('dedicated-internal')?.role).toBe(
      'internal',
    );
    expect(authenticateBackendApiKey('dedicated-admin')?.role).toBe('admin');
    expect(authenticateBackendApiKey('invalid')).toBeNull();
  });
});
