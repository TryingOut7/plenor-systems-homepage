import type { RequestContext } from '@/application/shared/requestContext';
import { fail, ok, type ServiceResult } from '@/application/shared/serviceResult';
import { readBearerToken } from '@/domain/internal/seedAuth';
import { runSitePageSeed } from '@/infrastructure/cms/seedGateway';
import { verifyRequestOrigin } from '@/infrastructure/security/originVerifier';
import { compareSecret } from '@/infrastructure/security/secretComparator';

export async function seedSitePagesForRequest(
  context: RequestContext,
): Promise<ServiceResult<unknown>> {
  if (process.env.NODE_ENV !== 'development') {
    return fail(404, { error: 'Not found' });
  }

  const originError = verifyRequestOrigin(context);
  if (originError) {
    return originError;
  }

  const expectedSecret = process.env.PAYLOAD_SEED_SECRET || process.env.PAYLOAD_SECRET;
  if (!expectedSecret) {
    return fail(500, { error: 'Server configuration error' });
  }

  const providedToken = readBearerToken(context.authorization);
  if (!providedToken || !compareSecret(providedToken, expectedSecret)) {
    return fail(401, { error: 'Unauthorized' });
  }

  try {
    const result = await runSitePageSeed();
    return ok(result);
  } catch (error) {
    console.error('Seed failed:', error);
    return fail(500, { error: 'Seed failed' });
  }
}
