import { seedPagePresetsForRequest } from '@/application/internal/seedPagePresetsService';
import { runPagePresetSeed } from '@/infrastructure/cms/seedGateway';
import { toRequestContext } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const result = await seedPagePresetsForRequest(
    toRequestContext(request),
    { runPagePresetSeed },
  );
  return toJsonResponse(result);
}
