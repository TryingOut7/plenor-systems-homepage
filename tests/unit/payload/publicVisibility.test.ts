import { describe, expect, it } from 'vitest';
import {
  buildPublicVisibilityWhere,
  isPubliclyVisibleDoc,
} from '@/payload/access/publicVisibility';

describe('public visibility helpers', () => {
  it('builds a strict published predicate by default', () => {
    expect(buildPublicVisibilityWhere()).toEqual({
      and: [
        { _status: { equals: 'published' } },
        { workflowStatus: { equals: 'published' } },
      ],
    });
  });

  it('allows legacy documents without workflow status when configured', () => {
    expect(buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true })).toEqual({
      and: [
        { _status: { equals: 'published' } },
        {
          or: [
            { workflowStatus: { equals: 'published' } },
            { workflowStatus: { exists: false } },
          ],
        },
      ],
    });
  });

  it('only treats docs as public when payload status is published', () => {
    expect(
      isPubliclyVisibleDoc({
        _status: 'draft',
        workflowStatus: 'published',
      }),
    ).toBe(false);
  });

  it('supports published legacy docs without workflow when configured', () => {
    expect(
      isPubliclyVisibleDoc(
        {
          _status: 'published',
        },
        { allowMissingWorkflowStatus: true },
      ),
    ).toBe(true);
  });
});
