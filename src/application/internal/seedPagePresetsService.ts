import type { RequestContext } from '@/application/shared/requestContext';
import { fail, ok, type ServiceResult } from '@/application/shared/serviceResult';
import { readBearerToken } from '@/domain/internal/seedAuth';
import {
  authenticateBackendApiKey,
  hasRequiredRole,
} from '@/infrastructure/security/backendApiKeyAuth';
import { verifyRequestOrigin } from '@/infrastructure/security/originVerifier';
import { compareSecret } from '@/infrastructure/security/secretComparator';

type PagePresetSeedRepository = {
  runPagePresetSeed(): Promise<unknown>;
};

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

export async function seedPagePresetsForRequest(
  context: RequestContext,
  repository: PagePresetSeedRepository,
): Promise<ServiceResult<unknown>> {
  const originError = verifyRequestOrigin(context);
  if (originError) {
    return originError;
  }

  const expectedSecret = process.env.PAYLOAD_SEED_SECRET || process.env.PAYLOAD_SECRET;
  if (!hasAuthorizedCredential(context, expectedSecret)) {
    return fail(401, { error: 'Unauthorized' });
  }

  try {
    const result = await repository.runPagePresetSeed();
    return ok(result);
  } catch (error) {
    console.error('Page preset seed failed:', error);
    return fail(500, { error: 'Page preset seed failed' });
  }
}
