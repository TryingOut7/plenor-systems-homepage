import { seedSitePagesForRequest } from '@/application/internal/seedSitePagesService';
import { toRequestContext } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const result = await seedSitePagesForRequest(toRequestContext(request));
  return toJsonResponse(result);
}
