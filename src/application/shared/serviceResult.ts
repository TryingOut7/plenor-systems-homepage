export interface ServiceResult<T = unknown> {
  status: number;
  body: T;
  headers?: Record<string, string>;
}

export function ok<T>(body: T, status = 200): ServiceResult<T> {
  return { status, body };
}

export function fail<T>(status: number, body: T): ServiceResult<T> {
  return { status, body };
}
