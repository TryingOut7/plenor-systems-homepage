import type { Where } from 'payload';

type PublicVisibilityOptions = {
  allowMissingWorkflowStatus?: boolean;
};

type PublicVisibilityDoc = {
  _status?: unknown;
  workflowStatus?: unknown;
};

function workflowPublishedWhere(options: PublicVisibilityOptions): Where {
  if (options.allowMissingWorkflowStatus !== true) {
    return { workflowStatus: { equals: 'published' } } as Where;
  }

  return {
    or: [
      { workflowStatus: { equals: 'published' } },
      { workflowStatus: { exists: false } },
    ],
  } as Where;
}

/**
 * Canonical public visibility predicate for draft-enabled collections.
 * A document must be Payload-published, and it must be workflow-published
 * (or legacy data without workflowStatus when explicitly allowed).
 */
export function buildPublicVisibilityWhere(options: PublicVisibilityOptions = {}): Where {
  return {
    and: [
      { _status: { equals: 'published' } },
      workflowPublishedWhere(options),
    ],
  } as Where;
}

export function isPubliclyVisibleDoc(
  doc: PublicVisibilityDoc,
  options: PublicVisibilityOptions = {},
): boolean {
  if (doc._status !== 'published') return false;
  if (doc.workflowStatus === 'published') return true;
  return (
    options.allowMissingWorkflowStatus === true &&
    (doc.workflowStatus === undefined || doc.workflowStatus === null)
  );
}
