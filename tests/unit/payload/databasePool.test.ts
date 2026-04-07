import { describe, expect, it } from 'vitest';
import { resolveDatabasePoolMax } from '@/payload/databasePool';

describe('resolveDatabasePoolMax', () => {
  it('uses a bounded concurrent pool on Vercel', () => {
    expect(resolveDatabasePoolMax(true)).toBe(5);
  });

  it('uses a wider pool locally', () => {
    expect(resolveDatabasePoolMax(false)).toBe(10);
  });
});
