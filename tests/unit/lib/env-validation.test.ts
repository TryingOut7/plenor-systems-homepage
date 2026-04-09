import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { validateEnv } from '../../../src/lib/env-validation';

const ORIGINAL_ENV = { ...process.env };

function setEnv(overrides: Record<string, string | undefined>) {
  process.env = { ...ORIGINAL_ENV, ...overrides };
}

describe('validateEnv', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('does not throw in development regardless of missing vars', () => {
    setEnv({ NODE_ENV: 'development', POSTGRES_URL: undefined, PAYLOAD_SECRET: undefined });
    expect(() => validateEnv()).not.toThrow();
  });

  it('does not throw in test regardless of missing vars', () => {
    setEnv({ NODE_ENV: 'test', POSTGRES_URL: undefined, PAYLOAD_SECRET: undefined });
    expect(() => validateEnv()).not.toThrow();
  });

  it('does not throw in production when all required vars are present (POSTGRES_URL)', () => {
    setEnv({
      NODE_ENV: 'production',
      POSTGRES_URL: 'postgres://localhost/db',
      PAYLOAD_SECRET: 'secret',
      NEXT_PUBLIC_SERVER_URL: 'https://example.com',
      BLOB_READ_WRITE_TOKEN: 'blob-token',
      RESEND_API_KEY: 'resend-api-key',
      RESEND_FROM_EMAIL: 'noreply@example.com',
      SUPABASE_URL: 'https://proj.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      CRON_SECRET: 'cron-secret',
    });
    expect(() => validateEnv()).not.toThrow();
  });

  it('does not throw in production when legacy DATABASE_URI is set', () => {
    setEnv({
      NODE_ENV: 'production',
      POSTGRES_URL: undefined,
      DATABASE_URI: 'postgres://localhost/db',
      PAYLOAD_SECRET: 'secret',
      NEXT_PUBLIC_SERVER_URL: 'https://example.com',
      BLOB_READ_WRITE_TOKEN: 'blob-token',
      RESEND_API_KEY: 'resend-api-key',
      RESEND_FROM_EMAIL: 'noreply@example.com',
      SUPABASE_URL: 'https://proj.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      CRON_SECRET: 'cron-secret',
    });
    expect(() => validateEnv()).not.toThrow();
  });

  it('throws in production for non-local runtime when BLOB token is missing', () => {
    setEnv({
      NODE_ENV: 'production',
      POSTGRES_URL: 'postgres://localhost/db',
      PAYLOAD_SECRET: 'secret',
      NEXT_PUBLIC_SERVER_URL: 'https://staging.example.com',
      BLOB_READ_WRITE_TOKEN: undefined,
      RESEND_API_KEY: 'resend-api-key',
      RESEND_FROM_EMAIL: 'noreply@example.com',
      SUPABASE_URL: 'https://proj.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      CRON_SECRET: 'cron-secret',
    });
    expect(() => validateEnv()).toThrow('BLOB_READ_WRITE_TOKEN');
  });

  it('allows non-local runtime without BLOB token when opt-out is explicitly set', () => {
    setEnv({
      NODE_ENV: 'production',
      POSTGRES_URL: 'postgres://localhost/db',
      PAYLOAD_SECRET: 'secret',
      NEXT_PUBLIC_SERVER_URL: 'https://staging.example.com',
      BLOB_READ_WRITE_TOKEN: undefined,
      ALLOW_NON_PERSISTENT_UPLOADS: 'true',
      RESEND_API_KEY: 'resend-api-key',
      RESEND_FROM_EMAIL: 'noreply@example.com',
      SUPABASE_URL: 'https://proj.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      CRON_SECRET: 'cron-secret',
    });
    expect(() => validateEnv()).not.toThrow();
  });

  it('throws in production when no database URL is set', () => {
    setEnv({
      NODE_ENV: 'production',
      POSTGRES_URL: undefined,
      DATABASE_URI: undefined,
      DATABASE_URL: undefined,
      PAYLOAD_SECRET: 'secret',
      NEXT_PUBLIC_SERVER_URL: 'https://example.com',
    });
    expect(() => validateEnv()).toThrow('POSTGRES_URL');
  });

  it('throws in production when PAYLOAD_SECRET is missing', () => {
    setEnv({
      NODE_ENV: 'production',
      POSTGRES_URL: 'postgres://localhost/db',
      PAYLOAD_SECRET: undefined,
      NEXT_PUBLIC_SERVER_URL: 'https://example.com',
    });
    expect(() => validateEnv()).toThrow('PAYLOAD_SECRET');
  });

  it('throws in production when NEXT_PUBLIC_SERVER_URL is missing', () => {
    setEnv({
      NODE_ENV: 'production',
      POSTGRES_URL: 'postgres://localhost/db',
      PAYLOAD_SECRET: 'secret',
      NEXT_PUBLIC_SERVER_URL: undefined,
    });
    expect(() => validateEnv()).toThrow('NEXT_PUBLIC_SERVER_URL');
  });

  it('lists all missing vars in the error message for a non-local runtime', () => {
    setEnv({
      NODE_ENV: 'production',
      POSTGRES_URL: undefined,
      DATABASE_URI: undefined,
      DATABASE_URL: undefined,
      PAYLOAD_SECRET: undefined,
      NEXT_PUBLIC_SERVER_URL: 'https://staging.example.com',
      VERCEL_URL: undefined,
      BLOB_READ_WRITE_TOKEN: undefined,
    });
    expect(() => validateEnv()).toThrow(/POSTGRES_URL/);
    expect(() => validateEnv()).toThrow(/PAYLOAD_SECRET/);
    expect(() => validateEnv()).toThrow(/RESEND_API_KEY/);
    expect(() => validateEnv()).toThrow(/RESEND_FROM_EMAIL/);
    expect(() => validateEnv()).toThrow(/SUPABASE_URL/);
    expect(() => validateEnv()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
    expect(() => validateEnv()).toThrow(/CRON_SECRET/);
    expect(() => validateEnv()).toThrow(/BLOB_READ_WRITE_TOKEN/);
  });

  it('does not include BLOB_READ_WRITE_TOKEN in error when no server URL is configured', () => {
    setEnv({
      NODE_ENV: 'production',
      POSTGRES_URL: undefined,
      DATABASE_URI: undefined,
      DATABASE_URL: undefined,
      PAYLOAD_SECRET: undefined,
      NEXT_PUBLIC_SERVER_URL: undefined,
      VERCEL_URL: undefined,
      VERCEL: undefined,
      BLOB_READ_WRITE_TOKEN: undefined,
    });
    // No effective non-local server URL means BLOB_READ_WRITE_TOKEN is not required.
    const err = (() => { try { validateEnv(); } catch (e) { return e; } })() as Error;
    expect(err.message).toMatch(/NEXT_PUBLIC_SERVER_URL \(or VERCEL_URL\)/);
    expect(err.message).not.toMatch(/BLOB_READ_WRITE_TOKEN/);
  });
});
