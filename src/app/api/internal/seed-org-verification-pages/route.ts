import { seedOrgVerificationPagesForRequest } from '@/application/internal/seedOrgVerificationPagesService';
import { payloadSeedRepository } from '@/infrastructure/cms/seedGateway';
import { toRequestContext } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const result = await seedOrgVerificationPagesForRequest(
    toRequestContext(request),
    payloadSeedRepository,
  );
  return toJsonResponse(result);
}
