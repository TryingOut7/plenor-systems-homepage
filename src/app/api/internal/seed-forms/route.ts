import { seedFormsForRequest } from '@/application/internal/seedFormsService';
import { payloadSeedRepository } from '@/infrastructure/cms/seedGateway';
import { toRequestContext } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const result = await seedFormsForRequest(
    toRequestContext(request),
    payloadSeedRepository,
  );
  return toJsonResponse(result);
}
