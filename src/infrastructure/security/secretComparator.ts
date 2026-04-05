import { safeCompare } from '@/lib/timing-safe-equal';

export function compareSecret(provided: string, expected: string): boolean {
  return safeCompare(provided, expected);
}
