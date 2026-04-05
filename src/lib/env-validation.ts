const REQUIRED_VARS = ['PAYLOAD_SECRET', 'NEXT_PUBLIC_SERVER_URL'] as const;

export function validateEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;

  // Keep backward compatibility with deployments that still set DATABASE_URL.
  if (!process.env.DATABASE_URI && process.env.DATABASE_URL) {
    process.env.DATABASE_URI = process.env.DATABASE_URL;
  }

  const missingDatabase = !process.env.DATABASE_URI && !process.env.DATABASE_URL;
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0 || missingDatabase) {
    const missingKeys = missingDatabase ? ['DATABASE_URI (or DATABASE_URL)', ...missing] : missing;
    throw new Error(
      `Missing required environment variables: ${missingKeys.join(', ')}. ` +
        'Check your deployment configuration.',
    );
  }
}
