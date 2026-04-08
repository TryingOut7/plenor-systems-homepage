import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const OrgEventDetailSection: Block = {
  slug: 'orgEventDetailSection',
  dbName: 'org_evt_detail',
  labels: { singular: 'Org Event Detail', plural: 'Org Event Details' },
  fields: [
    ...sectionCommonFields,
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'org-events',
      required: true,
      admin: {
        description: 'The event to display on this page.',
      },
    },
    {
      name: 'showRegistrationCta',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show the registration module when the event requires registration.',
      },
    },
  ],
};
