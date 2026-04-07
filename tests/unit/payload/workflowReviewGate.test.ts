import { describe, expect, it } from 'vitest';
import { workflowBeforeChange } from '@/payload/hooks/workflow';

describe('workflow review gates', () => {
  it('allows authors to create directly into review and stamps submission metadata', async () => {
    const result = await workflowBeforeChange({
      operation: 'create',
      data: {
        workflowStatus: 'in_review',
      },
      req: {
        user: { id: 'author_1', role: 'author' },
      },
    } as never) as Record<string, unknown>;

    expect(result.workflowStatus).toBe('in_review');
    expect(result.submittedBy).toBe('author_1');
    expect(typeof result.submittedAt).toBe('string');
  });

  it('uses existing review metadata for partial publish transitions', async () => {
    const result = await workflowBeforeChange({
      operation: 'update',
      data: {
        workflowStatus: 'published',
      },
      originalDoc: {
        workflowStatus: 'approved',
        reviewChecklistComplete: true,
        reviewSummary: 'Detailed reviewer summary from prior approval.',
      },
      req: {
        user: { id: 'admin_1', role: 'admin' },
      },
    } as never) as Record<string, unknown>;

    expect(result.workflowStatus).toBe('published');
  });

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
    ).rejects.toThrow('workflowStatus');
  });
});
