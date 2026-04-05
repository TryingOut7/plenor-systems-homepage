export interface EnableDraftModeInput {
  secret?: unknown;
  slug?: unknown;
}

export interface EnableDraftModeData {
  secret: string;
  slug: string;
}

export type EnableDraftModeValidation =
  | { ok: true; data: EnableDraftModeData }
  | { ok: false; status: number; message: string };

export function validateEnableDraftModeInput(
  input: EnableDraftModeInput,
): EnableDraftModeValidation {
  const slug = typeof input.slug === 'string' ? input.slug : '/';

  if (!slug.startsWith('/') || slug.startsWith('//')) {
    return { ok: false, status: 400, message: 'Invalid slug' };
  }

  return {
    ok: true,
    data: {
      secret: String(input.secret ?? ''),
      slug,
    },
  };
}
