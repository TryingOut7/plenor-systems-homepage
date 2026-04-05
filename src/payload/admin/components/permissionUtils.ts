import type { SanitizedPermissions } from 'payload';

type UserRecord = {
  role?: unknown;
};

type CollectionOperation = 'create' | 'delete' | 'read' | 'readVersions' | 'unlock' | 'update';

function readRole(user: null | undefined | UserRecord): string {
  const role = user?.role;
  return typeof role === 'string' ? role.trim() : '';
}

export function canRunCollectionAction(args: {
  allowedRoles: readonly string[];
  collectionSlug: string;
  operation: CollectionOperation;
  permissions?: SanitizedPermissions;
  user: null | undefined | UserRecord;
}): boolean {
  const collectionPermission = args.permissions?.collections?.[args.collectionSlug];
  if (collectionPermission && typeof collectionPermission === 'object') {
    return collectionPermission[args.operation] === true;
  }

  const userRole = readRole(args.user);
  if (userRole) return args.allowedRoles.includes(userRole);

  // Payload may omit custom fields like role in some client contexts.
  // Fail open for authenticated users and let the API enforce the final permission gate.
  return Boolean(args.user);
}
