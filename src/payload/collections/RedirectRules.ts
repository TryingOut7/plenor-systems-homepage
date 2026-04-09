import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload';
import { ValidationError } from 'payload';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog.ts';
import { canManageRedirectRules } from '../access/editorLanes.ts';
import { withFieldTier } from '../fields/fieldTier.ts';
import { redirectRulesBeforeChange } from '../hooks/redirectRules.ts';
import { validateRedirectFromPath, validateRedirectToPath } from '../validation/url.ts';

const preventDuplicateEnabledFromPath: CollectionBeforeChangeHook = async ({
  collection,
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation !== 'create' && operation !== 'update') return data;

  const incoming = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const isEnabled = incoming.enabled ?? (originalDoc as Record<string, unknown> | undefined)?.enabled ?? true;
  if (!isEnabled) return data;

  const fromPath = incoming.fromPath ?? (originalDoc as Record<string, unknown> | undefined)?.fromPath;
  if (typeof fromPath !== 'string' || !fromPath.trim()) return data;

  const currentId = operation === 'update'
    ? (originalDoc as Record<string, unknown> | undefined)?.id
    : undefined;

  const existing = await req.payload.find({
    collection: 'redirect-rules',
    where: {
      and: [
        { fromPath: { equals: fromPath.trim() } },
        { enabled: { equals: true } },
      ],
    },
    limit: 5,
    depth: 0,
    overrideAccess: true,
  });

  const conflict = existing.docs.find((doc: unknown) => {
    const docId = (doc as Record<string, unknown>).id;
    if (currentId === undefined) return true;
    return String(docId) !== String(currentId);
  });

  if (!conflict) return data;

  const message = `An enabled redirect rule for "${fromPath.trim()}" already exists. Disable or delete the existing rule before creating a new one.`;
  throw new ValidationError({
    collection: typeof collection?.slug === 'string' ? collection.slug : 'redirect-rules',
    req,
    errors: [{ path: 'fromPath', label: message, message }],
  });
};

export const RedirectRules: CollectionConfig = {
  slug: 'redirect-rules',
  admin: {
    useAsTitle: 'fromPath',
    defaultColumns: ['fromPath', 'toPath', 'isPermanent', 'enabled'],
    group: 'Settings',
    description: 'URL redirects managed as policy-controlled rules.',
    components: {
      beforeList: ['@/payload/admin/components/TrashNotFoundBanner'],
    },
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { enabled: { equals: true } };
    },
    create: ({ req }) => canManageRedirectRules(req.user),
    update: ({ req }) => canManageRedirectRules(req.user),
    delete: ({ req }) => canManageRedirectRules(req.user),
  },
  hooks: {
    beforeChange: [redirectRulesBeforeChange, preventDuplicateEnabledFromPath],
    afterChange: [auditAfterChange],
    afterDelete: [auditAfterDelete],
  },
  trash: true,
  enableQueryPresets: true,
  fields: [
    withFieldTier({
      name: 'fromPath',
      type: 'text',
      required: true,
      validate: validateRedirectFromPath,
      admin: {
        description: 'Source path (e.g. /old-page or /old-blog/*)',
      },
    }, 'system'),
    withFieldTier({
      name: 'toPath',
      type: 'text',
      required: true,
      validate: validateRedirectToPath,
      admin: {
        description: 'Destination path (e.g. /new-page)',
      },
    }, 'system'),
    withFieldTier({
      name: 'isPermanent',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Use 308 permanent redirect (otherwise 307 temporary)',
      },
    }, 'system'),
    withFieldTier({
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
    }, 'system'),
  ],
};
