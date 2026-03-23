export interface RequestContext {
  path: string;
  url: string;
  origin: string | null;
  host: string | null;
  forwardedHost: string | null;
  forwardedProto: string | null;
  realIp: string | null;
  forwardedFor: string | null;
  authorization: string | null;
}
