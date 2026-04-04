import type { SeedRepository } from '@/application/ports/seedRepository';
import type { RequestContext } from '@/application/shared/requestContext';
import { fail, ok, type ServiceResult } from '@/application/shared/serviceResult';
import { readBearerToken } from '@/domain/internal/seedAuth';
import {
  authenticateBackendApiKey,
  hasRequiredRole,
} from '@/infrastructure/security/backendApiKeyAuth';
import { verifyRequestOrigin } from '@/infrastructure/security/originVerifier';
import { compareSecret } from '@/infrastructure/security/secretComparator';

function hasAuthorizedCredential(
  context: RequestContext,
  expectedSecret: string | undefined,
): boolean {
  const providedToken = readBearerToken(context.authorization);
  if (providedToken && expectedSecret && compareSecret(providedToken, expectedSecret)) {
    return true;
  }

  const principal = authenticateBackendApiKey(context.apiKey);
  if (!principal) {
    return false;
  }

  return hasRequiredRole(principal, ['internal', 'admin']);
}

export async function seedFormsForRequest(
  context: RequestContext,
  repository: SeedRepository,
): Promise<ServiceResult<unknown>> {
  if (process.env.NODE_ENV !== 'development') {
    return fail(404, { error: 'Not found' });
  }

  const originError = verifyRequestOrigin(context);
  if (originError) {
    return originError;
  }

  const expectedSecret = process.env.PAYLOAD_SEED_SECRET || process.env.PAYLOAD_SECRET;
  if (!hasAuthorizedCredential(context, expectedSecret)) {
    return fail(401, { error: 'Unauthorized' });
  }

  try {
    const result = await repository.runFormSeed();
    return ok(result);
  } catch (error) {
    console.error('Form seed failed:', error);
    return fail(500, { error: 'Form seed failed' });
  }
}
