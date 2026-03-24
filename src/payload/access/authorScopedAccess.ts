import type { Access } from 'payload';

/**
 * Allows admins and editors full access.
 * Authors may only access documents they created (via `createdBy` field).
 */
export const authorScopedUpdate: Access = ({ req }) => {
  if (!req.user) return false;

  const role = (req.user as Record<string, unknown>).role as string;

  if (['admin', 'editor'].includes(role)) return true;

  if (role === 'author') {
    return {
      createdBy: { equals: (req.user as Record<string, unknown>).id },
    };
  }

  return false;
};
