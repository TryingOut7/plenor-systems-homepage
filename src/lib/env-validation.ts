const REQUIRED_VARS = ['DATABASE_URI', 'PAYLOAD_SECRET', 'NEXT_PUBLIC_SERVER_URL'] as const;

export function validateEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Check your deployment configuration.',
    );
  }
}
