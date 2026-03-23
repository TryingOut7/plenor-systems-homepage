export interface EnableDraftModeRequest {
  secret?: unknown;
  slug?: unknown;
}

export interface EnableDraftModeSuccessResponse {
  ok: true;
  slug: string;
}

export interface DraftModeErrorResponse {
  error: string;
}
