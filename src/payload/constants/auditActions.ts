export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export const AUDIT_ACTION_OPTIONS = [
  { label: 'Create', value: AUDIT_ACTIONS.CREATE },
  { label: 'Update', value: AUDIT_ACTIONS.UPDATE },
  { label: 'Delete', value: AUDIT_ACTIONS.DELETE },
] as const;
