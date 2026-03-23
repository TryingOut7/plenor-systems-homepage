import type { RequestContext } from '@/application/shared/requestContext';
import { fail, ok, type ServiceResult } from '@/application/shared/serviceResult';
import {
  validateEnableDraftModeInput,
  type EnableDraftModeInput,
} from '@/domain/draft-mode/enableDraftMode';
import { checkRateLimit } from '@/infrastructure/security/rateLimiter';
import { compareSecret } from '@/infrastructure/security/secretComparator';
import type {
  DraftModeErrorResponse,
  EnableDraftModeSuccessResponse,
} from '@/shared/contracts/draftMode';

type EnableDraftModeServiceResponse =
  | EnableDraftModeSuccessResponse
  | DraftModeErrorResponse
  | { message: string };

export function enableDraftModeForRequest(
  context: RequestContext,
  body: unknown,
): ServiceResult<EnableDraftModeServiceResponse> {
  const rateLimitError = checkRateLimit(context);
  if (rateLimitError) {
    return rateLimitError;
  }

  const input =
    body && typeof body === 'object'
      ? (body as EnableDraftModeInput)
      : ({} as EnableDraftModeInput);
  const validation = validateEnableDraftModeInput(input);

  if (!validation.ok) {
    return fail(validation.status, { error: validation.message });
  }

  const expectedSecret = process.env.PAYLOAD_SECRET;
  if (!expectedSecret || !compareSecret(validation.data.secret, expectedSecret)) {
    return fail(401, { error: 'Invalid secret' });
  }

  return ok({ ok: true, slug: validation.data.slug });
}
