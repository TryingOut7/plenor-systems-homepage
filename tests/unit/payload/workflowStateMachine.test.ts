import { describe, expect, it } from 'vitest';
import {
  getAllowedWorkflowStatusesForDocument,
  getAllowedWorkflowTransitions,
  normalizeWorkflowStatus,
  resolveWorkflowRole,
} from '@/payload/workflow/stateMachine';

describe('workflow state machine', () => {
  it('shows only draft and in_review for authors on draft content', () => {
    expect(
      getAllowedWorkflowStatusesForDocument({
        currentStatus: 'draft',
        role: 'author',
      }),
    ).toEqual(['draft', 'in_review']);
  });

  it('preserves current status and allowed transitions for authors in review', () => {
    expect(
      getAllowedWorkflowStatusesForDocument({
        currentStatus: 'in_review',
        role: 'author',
      }),
    ).toEqual(['in_review', 'draft']);
  });

  it('allows admins to publish directly from draft', () => {
    expect(
      getAllowedWorkflowStatusesForDocument({
        currentStatus: 'draft',
        role: 'admin',
      }),
    ).toEqual(['draft', 'in_review', 'approved', 'published']);
  });

  it('allows editor publish transitions only when editor-publish policy is enabled', () => {
    expect(
      getAllowedWorkflowTransitions({
        fromStatus: 'approved',
        role: 'editor',
      }),
    ).toEqual(['draft']);

    expect(
      getAllowedWorkflowTransitions({
        fromStatus: 'approved',
        role: 'editor',
        allowEditorPublish: true,
      }),
    ).toEqual(['draft', 'published']);
  });

  it('resolves and normalizes role/status values safely', () => {
    expect(resolveWorkflowRole('editor')).toBe('editor');
    expect(resolveWorkflowRole('viewer')).toBeNull();
    expect(normalizeWorkflowStatus('approved')).toBe('approved');
    expect(normalizeWorkflowStatus('invalid', 'draft')).toBe('draft');
  });
});
