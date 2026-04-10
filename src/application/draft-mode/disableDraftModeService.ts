export interface DisableDraftModeResult {
  redirectTo: string;
}

function sanitizeRedirectTarget(target?: string | null): string | null {
  if (!target || !target.startsWith('/') || target.startsWith('//')) {
    return null;
  }

  try {
    const url = new URL(target, 'https://plenor.ai');
    if (url.origin !== 'https://plenor.ai') {
      return null;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function disableDraftModeForRequest(
  returnTo?: string | null,
  referer?: string | null,
): DisableDraftModeResult {
  const explicitReturnTo = sanitizeRedirectTarget(returnTo);
  if (explicitReturnTo) {
    return { redirectTo: explicitReturnTo };
  }

  if (referer) {
    try {
      const url = new URL(referer);
      return { redirectTo: `${url.pathname}${url.search}${url.hash}` };
    } catch {
      // Invalid referer URL, fall through to default
    }
  }
  return { redirectTo: '/' };
}
