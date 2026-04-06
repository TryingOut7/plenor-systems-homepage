import type { Access } from 'payload';

/**
 * Allows admins and editors full access.
 * Authors may only access documents they created (via `createdBy` field).
 */
export const authorScopedUpdate: Access = ({ req }) => {
  if (!req.user) return false;

  const role = (req.user as unknown as Record<string, unknown>).role as string;

  if (['admin', 'editor'].includes(role)) return true;

  if (role === 'author') {
    return {
      createdBy: { equals: (req.user as unknown as Record<string, unknown>).id },
    };
  }

  return false;
};

/**
 * Allows admins and editors full delete access.
 * Authors may only delete documents they created (via `createdBy` field).
 *
 * Identical logic to `authorScopedUpdate` but exported under a semantically
 * correct name so callers using it for `delete` access are self-documenting.
 */
export const authorScopedDelete: Access = ({ req }) => {
  if (!req.user) return false;

  const role = (req.user as unknown as Record<string, unknown>).role as string;

  if (['admin', 'editor'].includes(role)) return true;

  if (role === 'author') {
    return {
      createdBy: { equals: (req.user as unknown as Record<string, unknown>).id },
    };
  }

  return false;
};
