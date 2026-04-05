export interface DisableDraftModeResult {
  redirectTo: string;
}

export function disableDraftModeForRequest(referer?: string | null): DisableDraftModeResult {
  if (referer) {
    try {
      const url = new URL(referer);
      return { redirectTo: url.pathname };
    } catch {
      // Invalid referer URL, fall through to default
    }
  }
  return { redirectTo: '/' };
}
