export function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
}

export function isNonLocalRuntime(): boolean {
  if (process.env.VERCEL) return true;
  const configured = process.env.NEXT_PUBLIC_SERVER_URL?.trim();
  const effectiveUrl = configured
    ? /^https?:\/\//i.test(configured)
      ? configured
      : `https://${configured}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined;
  if (!effectiveUrl) return false;
  try {
    return !isLocalHostname(new URL(effectiveUrl).hostname);
  } catch {
    return false;
  }
}
