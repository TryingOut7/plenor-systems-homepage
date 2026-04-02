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
    setEnv({ NODE_ENV: 'development', DATABASE_URI: undefined, PAYLOAD_SECRET: undefined });
    expect(() => validateEnv()).not.toThrow();
  });

  it('does not throw in test regardless of missing vars', () => {
    setEnv({ NODE_ENV: 'test', DATABASE_URI: undefined, PAYLOAD_SECRET: undefined });
    expect(() => validateEnv()).not.toThrow();
  });

  it('does not throw in production when all required vars are present', () => {
    setEnv({
      NODE_ENV: 'production',
      DATABASE_URI: 'postgres://localhost/db',
      PAYLOAD_SECRET: 'secret',
      NEXT_PUBLIC_SERVER_URL: 'https://example.com',
    });
    expect(() => validateEnv()).not.toThrow();
  });

  it('throws in production when DATABASE_URI is missing', () => {
    setEnv({
      NODE_ENV: 'production',
      DATABASE_URI: undefined,
      PAYLOAD_SECRET: 'secret',
      NEXT_PUBLIC_SERVER_URL: 'https://example.com',
    });
    expect(() => validateEnv()).toThrow('DATABASE_URI');
  });

  it('throws in production when PAYLOAD_SECRET is missing', () => {
    setEnv({
      NODE_ENV: 'production',
      DATABASE_URI: 'postgres://localhost/db',
      PAYLOAD_SECRET: undefined,
      NEXT_PUBLIC_SERVER_URL: 'https://example.com',
    });
    expect(() => validateEnv()).toThrow('PAYLOAD_SECRET');
  });

  it('throws in production when NEXT_PUBLIC_SERVER_URL is missing', () => {
    setEnv({
      NODE_ENV: 'production',
      DATABASE_URI: 'postgres://localhost/db',
      PAYLOAD_SECRET: 'secret',
      NEXT_PUBLIC_SERVER_URL: undefined,
    });
    expect(() => validateEnv()).toThrow('NEXT_PUBLIC_SERVER_URL');
  });

  it('lists all missing vars in the error message', () => {
    setEnv({
      NODE_ENV: 'production',
      DATABASE_URI: undefined,
      PAYLOAD_SECRET: undefined,
      NEXT_PUBLIC_SERVER_URL: undefined,
    });
    expect(() => validateEnv()).toThrow(
      'Missing required environment variables: DATABASE_URI, PAYLOAD_SECRET, NEXT_PUBLIC_SERVER_URL',
    );
  });
});
