import type { Field } from 'payload';
import {
  canEditAdvancedTier,
  canManageSystemFields,
  isAdvancedLane,
} from '../access/editorLanes.ts';

export type CmsFieldTier = 'routine' | 'advanced' | 'system';

type ConditionFn = (...args: unknown[]) => boolean;
type AdminComponents = {
  beforeInput?: unknown;
};

function normalizeComponentList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
      .map((entry) => entry.trim());
  }
  if (typeof value === 'string' && value.trim().length > 0) return [value.trim()];
  return [];
}

function mergeBeforeInputComponents(existing: unknown, tier: CmsFieldTier): string[] | undefined {
  const current = normalizeComponentList(existing);
  if (tier === 'routine') {
    return current.length > 0 ? current : undefined;
  }

  const hintPath = '@/payload/admin/components/CmsFieldTierHint';
  if (!current.includes(hintPath)) {
    current.unshift(hintPath);
  }
  return current;
}

function resolveUserFromConditionArgs(args: unknown[]): unknown {
  if (args.length < 3) return undefined;
  const context = args[2];
  if (!context || typeof context !== 'object') return undefined;
  const user = (context as Record<string, unknown>).user;
  if (user) return user;
  const req = (context as Record<string, unknown>).req;
  if (req && typeof req === 'object') {
    return (req as Record<string, unknown>).user;
  }
  return undefined;
}

function tierVisibilityAllowed(tier: CmsFieldTier, user: unknown): boolean {
  if (tier === 'routine') return true;
  if (!user) return true;
  if (tier === 'advanced') return isAdvancedLane(user);
  return canManageSystemFields(user);
}

function mergeAdminCondition(existing: unknown, tier: CmsFieldTier): ConditionFn {
  const previous = typeof existing === 'function' ? (existing as ConditionFn) : null;
  return (...args: unknown[]) => {
    const previousAllowed = previous ? previous(...args) : true;
    if (!previousAllowed) return false;
    const user = resolveUserFromConditionArgs(args);
    return tierVisibilityAllowed(tier, user);
  };
}

function mergeUpdateAccess(existing: unknown, tier: CmsFieldTier) {
  const previous =
    typeof existing === 'function'
      ? (existing as (args: unknown) => unknown)
      : null;

  return async (args: unknown) => {
    const previousResult = previous ? await previous(args) : true;
    if (previousResult !== true) return false;

    const request =
      args && typeof args === 'object'
        ? ((args as Record<string, unknown>).req as Record<string, unknown> | undefined)
        : undefined;
    const user = request?.user;
    if (tier === 'routine') return true;
    if (tier === 'advanced') return canEditAdvancedTier(user);
    return canManageSystemFields(user);
  };
}

export function withFieldTier(field: Field, tier: CmsFieldTier): Field {
  const input = field as Field & {
    admin?: Record<string, unknown>;
    access?: Record<string, unknown>;
    custom?: Record<string, unknown>;
  };

  const next = {
    ...input,
    custom: {
      ...(input.custom || {}),
      cmsTier: tier,
    },
    admin: {
      ...(input.admin || {}),
      condition: mergeAdminCondition(input.admin?.condition, tier) as unknown,
      components: {
        ...((input.admin?.components as AdminComponents | undefined) || {}),
        beforeInput: mergeBeforeInputComponents(
          (input.admin?.components as AdminComponents | undefined)?.beforeInput,
          tier,
        ),
      },
    },
    access: {
      ...(input.access || {}),
      update: mergeUpdateAccess(input.access?.update, tier),
    },
  };

  return next as unknown as Field;
}
