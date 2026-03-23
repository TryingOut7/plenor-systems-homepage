import type { ServiceResult } from '@/application/shared/serviceResult';
import { NextResponse } from 'next/server';

export function toJsonResponse<T>(result: ServiceResult<T>): NextResponse {
  return NextResponse.json(result.body, {
    status: result.status,
    headers: result.headers,
  });
}
