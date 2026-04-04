import { describe, expect, it } from 'vitest';
import { workflowBeforeChange } from '@/payload/hooks/workflow';

describe('workflow review gates', () => {
  it('blocks approval when review summary is missing', async () => {
    await expect(
      workflowBeforeChange({
        operation: 'update',
        data: {
          workflowStatus: 'approved',
          reviewChecklistComplete: true,
          reviewSummary: 'short',
        },
        originalDoc: {
          workflowStatus: 'in_review',
        },
        req: {
          user: { id: 'u1', role: 'editor' },
        },
      } as never),
    ).rejects.toThrow('reviewSummary');
  });

  it('blocks publish when checklist is not complete', async () => {
    await expect(
      workflowBeforeChange({
        operation: 'update',
        data: {
          workflowStatus: 'published',
          reviewChecklistComplete: false,
          reviewSummary: 'Detailed review summary text',
        },
        originalDoc: {
          workflowStatus: 'approved',
        },
        req: {
          user: { id: 'u1', role: 'admin' },
        },
      } as never),
    ).rejects.toThrow('reviewChecklistComplete');
  });

  it('stamps approval metadata when approval is valid', async () => {
    const result = await workflowBeforeChange({
      operation: 'update',
      data: {
        workflowStatus: 'approved',
        reviewChecklistComplete: true,
        reviewSummary: 'Detailed reviewer summary for approval.',
      },
      originalDoc: {
        workflowStatus: 'in_review',
      },
      req: {
        user: { id: 'u1', role: 'editor' },
      },
    } as never) as Record<string, unknown>;

    expect(result.reviewedBy).toBe('u1');
    expect(typeof result.reviewedAt).toBe('string');
    expect(result.approvedBy).toBe('u1');
    expect(typeof result.approvedAt).toBe('string');
  });

  it('blocks editors from publishing directly', async () => {
    await expect(
      workflowBeforeChange({
        operation: 'update',
        data: {
          workflowStatus: 'published',
          reviewChecklistComplete: true,
          reviewSummary: 'Detailed review summary text',
        },
        originalDoc: {
          workflowStatus: 'approved',
        },
        req: {
          user: { id: 'u1', role: 'editor' },
        },
      } as never),
    ).rejects.toThrow('cannot move');
  });
});
