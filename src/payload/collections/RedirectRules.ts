import type { CollectionConfig } from 'payload';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog.ts';
import { canManageRedirectRules } from '../access/editorLanes.ts';
import { withFieldTier } from '../fields/fieldTier.ts';

export const RedirectRules: CollectionConfig = {
  slug: 'redirect-rules',
  admin: {
    useAsTitle: 'fromPath',
    defaultColumns: ['fromPath', 'toPath', 'isPermanent', 'enabled'],
    group: 'Settings',
    description: 'URL redirects managed as policy-controlled rules.',
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
      admin: {
        description: 'Source path (e.g. /old-page or /old-blog/*)',
      },
    }, 'system'),
    withFieldTier({
      name: 'toPath',
      type: 'text',
      required: true,
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
