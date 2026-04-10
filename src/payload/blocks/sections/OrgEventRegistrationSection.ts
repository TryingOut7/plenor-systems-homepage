import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const OrgEventRegistrationSection: Block = {
  slug: 'orgEventRegistrationSection',
  dbName: 'org_evt_reg',
  labels: { singular: 'Org Event Registration', plural: 'Org Event Registrations' },
  fields: [
    ...sectionCommonFields,
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'org-events',
      required: true,
      admin: {
        description:
          'The event whose configured registration form to render. Set the form on the Org Event record.',
      },
    },
  ],
};
