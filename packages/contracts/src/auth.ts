export type BackendRole = 'internal' | 'admin';

export interface BackendPrincipal {
  keyId: string;
  role: BackendRole;
}

export interface AuthenticatedResponse {
  principal: BackendPrincipal;
}
