import { describe, expect, it } from 'vitest';
import { buildAuditDashboardSummary } from '@/payload/cms/auditDashboard';

describe('audit dashboard summary', () => {
  it('aggregates event counts and breakdowns', () => {
    const summary = buildAuditDashboardSummary([
      {
        riskTier: 'system',
        action: 'update',
        collection: 'site-pages',
        actorRole: 'editor',
        fieldPath: 'customHeadScripts',
      },
      {
        riskTier: 'routine',
        action: 'create',
        collection: 'blog-posts',
        actorRole: 'author',
        fieldPath: '*',
      },
      {
        riskTier: 'system',
        action: 'delete',
        collection: 'redirect-rules',
        actorRole: 'admin',
        fieldPath: 'fromPath',
      },
    ]);

    expect(summary.totalEvents).toBe(3);
    expect(summary.systemRiskEvents).toBe(2);
    expect(summary.routineEvents).toBe(1);
    expect(summary.topCollections[0]?.count).toBeGreaterThan(0);
    expect(summary.systemFieldChanges.some((entry) => entry.fieldPath === 'fromPath')).toBe(true);
  });
});
