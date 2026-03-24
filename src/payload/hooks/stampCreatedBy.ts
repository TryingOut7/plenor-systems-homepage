import type { CollectionBeforeChangeHook } from 'payload';

/**
 * Stamps the `createdBy` field with the current user's ID on document creation.
 * Does nothing on updates so the original author is preserved.
 */
export const stampCreatedByBeforeChange: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  if (operation !== 'create') return data;

  const user = req.user as Record<string, unknown> | undefined;
  if (user?.id) {
    return { ...data, createdBy: user.id };
  }

  return data;
};
