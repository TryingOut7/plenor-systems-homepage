export interface DisableDraftModeResult {
  redirectTo: string;
}

export function disableDraftModeForRequest(): DisableDraftModeResult {
  return { redirectTo: '/' };
}
