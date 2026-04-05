import { describe, expect, it } from 'vitest';
import { evaluateLegacyCutoverReport } from '@/payload/cms/legacyCutoverGate';

describe('legacy cutover gate', () => {
  it('fails when unresolved parity failures exist', () => {
    const evaluation = evaluateLegacyCutoverReport({
      unresolvedParityFailures: 2,
      items: [
        { id: 'a', status: 'needs_manual_review' },
      ],
    });

    expect(evaluation.ready).toBe(false);
    expect(evaluation.blockers.length).toBeGreaterThan(0);
  });

  it('fails when report items still require manual review even if counter is stale', () => {
    const evaluation = evaluateLegacyCutoverReport({
      unresolvedParityFailures: 0,
      items: [
        { id: 'a', status: 'needs_manual_review' },
      ],
    });

    expect(evaluation.ready).toBe(false);
  });

  it('passes when parity queue is fully cleared', () => {
    const evaluation = evaluateLegacyCutoverReport({
      unresolvedParityFailures: 0,
      items: [
        { id: 'a', status: 'updated' },
        { id: 'b', status: 'dry_run_ok' },
      ],
    });

    expect(evaluation.ready).toBe(true);
    expect(evaluation.blockers).toHaveLength(0);
  });
});
