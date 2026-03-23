export interface RequestContext {
  requestId?: string;
  method?: string;
  path: string;
  url: string;
  origin: string | null;
  host: string | null;
  forwardedHost: string | null;
  forwardedProto: string | null;
  realIp: string | null;
  forwardedFor: string | null;
  authorization: string | null;
  apiKey: string | null;
  idempotencyKey: string | null;
}
